import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel';
import { CenterCanvas } from './components/CenterCanvas';
import { RightPanel } from './components/RightPanel';
import type { TemplateSettings } from './components/TemplatesModal';
import { useIsMobile } from './components/ui/use-mobile';
import { MobileSettingsDrawer } from './components/MobileSettingsDrawer';
import { MobileDetailsDrawer } from './components/MobileDetailsDrawer';
import { PsnDataProvider, usePsnData } from './context/PsnDataContext';
import { toPng, toJpeg } from 'html-to-image';

// 1x1 transparent PNG used as fallback when proxy fails — prevents html-to-image from
// attempting (and failing) a cross-origin fetch that would produce a blank image.
const TRANSPARENT_1PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRU5ErkJggg==';

const AuthSettingsModal = lazy(() => import('./components/AuthSettingsModal').then(m => ({ default: m.AuthSettingsModal })));

function parseTimeToPlatinum(time: string): number {
  if (time === '--') return Infinity;
  const hours = time.match(/(\d+)h/);
  const minutes = time.match(/(\d+)m/);
  return (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
}

function AppContent() {
  const { checkAuth, trophies, profile } = usePsnData();
  const isMobile = useIsMobile();
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedTile, setSelectedTile] = useState<number | null>(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [gridSize, setGridSize] = useState({ rows: 5, cols: 5 });

  const [spacing, setSpacing] = useState(8);
  const [borderRadius, setBorderRadius] = useState(12);
  const [showBorders, setShowBorders] = useState(true);
  const [showGlow, setShowGlow] = useState(true);
  const [showProfile, setShowProfile] = useState(true);
  const [overlays, setOverlays] = useState({
    showOrder: true,
    showGameName: false,
    showDate: false,
    showRarity: false,
    showPlatformIcon: true,
    showMilestones: false,
    showRarestBadge: false,
  });
  const [sortBy, setSortBy] = useState<'date' | 'alpha' | 'rarity' | 'platform' | 'speed' | 'custom'>('date');
  const [customOrder, setCustomOrder] = useState<number[]>([]);
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [bgType, setBgType] = useState<'solid' | 'gradient' | 'pattern' | 'transparent'>('solid');
  const [bgColor, setBgColor] = useState('#0A0E1A');
  const [showGlassmorphism, setShowGlassmorphism] = useState(false);
  const [showRarityHeatmap, setShowRarityHeatmap] = useState(false);
  const [fileType, setFileType] = useState<'png' | 'jpeg'>('png');
  const [useTrophyImage, setUseTrophyImage] = useState(false);
  const [profileStat, setProfileStat] = useState<'none' | 'rarest' | 'topPlatform' | 'avgRarity'>('rarest');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const mosaicRef = useRef<HTMLDivElement | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mobileTileSize = useMemo(() => {
    if (!isMobile) return 128;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 375;
    const padding = 32; // p-4 * 2
    const totalGaps = (gridSize.cols - 1) * spacing;
    const available = viewportWidth - padding - totalGaps;
    return Math.max(48, Math.floor(available / gridSize.cols));
  }, [isMobile, gridSize.cols, spacing]);

  const handleTileTap = useCallback((index: number) => {
    if (isMobile) {
      setSelectedTile(index);
      setDetailsDrawerOpen(true);
    }
  }, [isMobile]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  /** Converts a single image to a data URL via the proxy, with retry. */
  const fetchImageAsDataUrl = async (src: string, retries = 2): Promise<string | null> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const resp = await fetch(`/api/image-proxy?url=${encodeURIComponent(src)}`);
        if (!resp.ok) continue;
        const blob = await resp.blob();
        return await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch {
        if (attempt < retries) await new Promise(r => setTimeout(r, 300));
      }
    }
    return null;
  };

  /** Returns capture options that scale mobile mosaic to desktop-equivalent size. */
  const getExportOptions = (el: HTMLElement) => {
    if (!isMobile) return {};
    const ratio = 128 / mobileTileSize;
    return {
      width: Math.ceil(el.scrollWidth * ratio),
      height: Math.ceil(el.scrollHeight * ratio),
      style: {
        transform: `scale(${ratio})`,
        transformOrigin: 'top left',
        borderRadius: `${16 / ratio}px`,
        width: el.scrollWidth + 'px',
      },
    };
  };

  /** Converts images to data URLs in-place, captures, then restores originals. */
  const captureMosaic = useCallback(async (
    renderFn: (el: HTMLElement, opts: object) => Promise<string>,
    extraOpts: object = {},
  ): Promise<string | null> => {
    const el = mosaicRef.current;
    if (!el) return null;

    // Convert cross-origin images to data URLs in-place (batches of 3)
    const imgs = Array.from(el.querySelectorAll('img'));
    const originalSrcs = imgs.map((img) => img.src);

    for (let i = 0; i < imgs.length; i += 3) {
      const batch = imgs.slice(i, i + 3);
      await Promise.all(
        batch.map(async (img) => {
          // Use original PSN URL if available (mobile proxies images in preview)
          const src = img.dataset.originalSrc || img.src;
          if (!src || src.startsWith('data:')) return;
          const dataUrl = await fetchImageAsDataUrl(src);
          img.src = dataUrl ?? TRANSPARENT_1PX;
          await img.decode().catch(() => {});
        })
      );
    }

    try {
      return await renderFn(el, { ...getExportOptions(el), ...extraOpts });
    } finally {
      // Restore original srcs so the live DOM uses CDN URLs again
      imgs.forEach((img, i) => { img.src = originalSrcs[i]; });
    }
  }, [isMobile, mobileTileSize]);

  /** Captures the mosaic as a PNG Blob. */
  const captureMosaicBlob = useCallback(async (): Promise<Blob | null> => {
    const dataUrl = await captureMosaic(
      (el, opts) => toPng(el, { pixelRatio: 2, skipFonts: true, ...opts }),
    );
    if (!dataUrl) return null;
    const res = await fetch(dataUrl);
    return await res.blob();
  }, [captureMosaic]);

  const handleExport = useCallback(async (format?: 'png' | 'jpeg') => {
    try {
      let dataUrl: string | null;
      const filename = `platforge-${Date.now()}`;

      const useJpeg = (format || fileType) === 'jpeg';
      dataUrl = await captureMosaic(
        (el, opts) => useJpeg
          ? toJpeg(el, { quality: 0.95, skipFonts: true, ...opts })
          : toPng(el, { pixelRatio: 2, skipFonts: true, ...opts }),
      );

      if (!dataUrl) {
        showToast('Export failed — please try again');
        return;
      }

      const link = document.createElement('a');
      link.download = `${filename}.${(format || fileType)}`;
      link.href = dataUrl;
      link.click();
      showToast('Image downloaded');
    } catch (err) {
      console.warn('[export] Failed:', err);
      showToast('Export failed — please try again');
    }
  }, [fileType, captureMosaic, showToast]);

  const handleShare = useCallback(async () => {
    try {
      const blob = await captureMosaicBlob();
      if (!blob) {
        showToast('Share failed — please try again');
        return;
      }

      const file = new File([blob], `platforge-${Date.now()}.png`, { type: 'image/png' });

      // Try native Web Share API with file support
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'PlatForge' });
          return;
        } catch (err) {
          // User cancelled share — not an error
          if (err instanceof Error && err.name === 'AbortError') return;
        }
      }

      // Fallback: copy image to clipboard
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        showToast('Image copied to clipboard');
        return;
      } catch (err) {
        console.warn('[share] Clipboard write failed:', err);
      }

      // Final fallback: download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `platforge-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Image downloaded');
    } catch (err) {
      console.warn('[share] Failed:', err);
      showToast('Share failed — please try again');
    }
  }, [captureMosaicBlob, showToast]);

  const handleApplyTemplate = useCallback((settings: TemplateSettings) => {
    setGridSize(settings.gridSize);

    setSpacing(settings.spacing);
    setBorderRadius(settings.borderRadius);
    setShowBorders(settings.showBorders);
    setShowGlow(settings.showGlow);
    setShowGlassmorphism(settings.showGlassmorphism);
    setShowRarityHeatmap(settings.showRarityHeatmap);
    setBgType(settings.bgType);
    setBgColor(settings.bgColor);
    setOverlays(settings.overlays);
  }, []);

  const processedTrophies = useMemo(() => {
    let result = [...trophies];

    if (platformFilter !== 'ALL') {
      result = result.filter(t => t.platform === platformFilter);
    }

    switch (sortBy) {
      case 'date':
        result.sort((a, b) => new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime());
        break;
      case 'alpha':
        result.sort((a, b) => a.gameTitle.localeCompare(b.gameTitle));
        break;
      case 'rarity':
        result.sort((a, b) => a.rarity - b.rarity);
        break;
      case 'platform':
        result.sort((a, b) => a.platform.localeCompare(b.platform));
        break;
      case 'speed':
        result.sort((a, b) => parseTimeToPlatinum(a.timeToPlatinum) - parseTimeToPlatinum(b.timeToPlatinum));
        break;
      case 'custom':
        if (customOrder.length > 0) {
          const orderMap = new Map(customOrder.map((id, idx) => [id, idx]));
          result.sort((a, b) => {
            const posA = orderMap.get(a.id) ?? Infinity;
            const posB = orderMap.get(b.id) ?? Infinity;
            return posA - posB;
          });
        }
        break;
    }

    return result;
  }, [trophies, platformFilter, sortBy, customOrder]);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    const currentIds = processedTrophies.map(t => t.id);
    setSortBy('custom');
    setCustomOrder(() => {
      const updated = [...currentIds];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, [processedTrophies]);

  const handleSetSortBy = useCallback((sort: typeof sortBy) => {
    setSortBy(sort);
    if (sort !== 'custom') {
      setCustomOrder([]);
    }
  }, []);

  // Reset custom order when trophies change (new profile loaded)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setCustomOrder([]);
    if (sortBy === 'custom') {
      setSortBy('date');
    }
  }, [trophies]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#0A0E1A] text-white overflow-hidden">
      <TopBar
        onShowAuth={() => setShowAuthModal(true)}
        onExport={handleExport}
        onShare={handleShare}
        isMobile={isMobile}
        onOpenSettings={() => setSettingsDrawerOpen(true)}
      />

      {isMobile ? (
        // MOBILE LAYOUT: Canvas only + drawers
        <>
          <CenterCanvas
            gridSize={gridSize}
            spacing={spacing}
            borderRadius={borderRadius}
            showBorders={showBorders}
            showGlow={showGlow}
            showProfile={showProfile}
            profileStat={profileStat}
            overlays={overlays}
            processedTrophies={processedTrophies}
            bgType={bgType}
            bgColor={bgColor}
            showGlassmorphism={showGlassmorphism}
            showRarityHeatmap={showRarityHeatmap}
            useTrophyImage={useTrophyImage}
            selectedTile={selectedTile}
            onSelectTile={setSelectedTile}
            onMosaicRef={(el) => { mosaicRef.current = el; }}
            isMobile={true}
            tileSize={mobileTileSize}
            onTileTap={handleTileTap}
          />

          <MobileSettingsDrawer
            open={settingsDrawerOpen}
            onOpenChange={setSettingsDrawerOpen}
            gridSize={gridSize}
            setGridSize={setGridSize}
            spacing={spacing}
            setSpacing={setSpacing}
            borderRadius={borderRadius}
            setBorderRadius={setBorderRadius}
            showBorders={showBorders}
            setShowBorders={setShowBorders}
            showGlow={showGlow}
            setShowGlow={setShowGlow}
            showProfile={showProfile}
            setShowProfile={setShowProfile}
            overlays={overlays}
            setOverlays={setOverlays}
            sortBy={sortBy}
            setSortBy={handleSetSortBy}
            platformFilter={platformFilter}
            setPlatformFilter={setPlatformFilter}
            bgType={bgType}
            setBgType={setBgType}
            bgColor={bgColor}
            setBgColor={setBgColor}
            showGlassmorphism={showGlassmorphism}
            setShowGlassmorphism={setShowGlassmorphism}
            showRarityHeatmap={showRarityHeatmap}
            setShowRarityHeatmap={setShowRarityHeatmap}
            fileType={fileType}
            setFileType={setFileType}
            useTrophyImage={useTrophyImage}
            setUseTrophyImage={setUseTrophyImage}
            trophyCount={processedTrophies.length}
            profileStat={profileStat}
            setProfileStat={setProfileStat}
            onExport={handleExport}
          />

          <MobileDetailsDrawer
            open={detailsDrawerOpen}
            onOpenChange={setDetailsDrawerOpen}
            selectedTrophy={selectedTile !== null ? processedTrophies[selectedTile] : null}
            totalPlatinums={profile.totalPlatinums}
            displayTrophies={processedTrophies.slice(0, gridSize.rows * gridSize.cols)}
            selectedTile={selectedTile}
            onSelectTile={setSelectedTile}
            onReorder={handleReorder}
          />
        </>
      ) : (
        // DESKTOP LAYOUT: existing 3-column layout
        <div className="flex-1 flex overflow-hidden">
          <LeftPanel
            isOpen={leftPanelOpen}
            onToggle={() => setLeftPanelOpen(!leftPanelOpen)}
            gridSize={gridSize}
            setGridSize={setGridSize}
            spacing={spacing}
            setSpacing={setSpacing}
            borderRadius={borderRadius}
            setBorderRadius={setBorderRadius}
            showBorders={showBorders}
            setShowBorders={setShowBorders}
            showGlow={showGlow}
            setShowGlow={setShowGlow}
            showProfile={showProfile}
            setShowProfile={setShowProfile}
            overlays={overlays}
            setOverlays={setOverlays}
            sortBy={sortBy}
            setSortBy={handleSetSortBy}
            platformFilter={platformFilter}
            setPlatformFilter={setPlatformFilter}
            bgType={bgType}
            setBgType={setBgType}
            bgColor={bgColor}
            setBgColor={setBgColor}
            showGlassmorphism={showGlassmorphism}
            setShowGlassmorphism={setShowGlassmorphism}
            showRarityHeatmap={showRarityHeatmap}
            setShowRarityHeatmap={setShowRarityHeatmap}
            fileType={fileType}
            setFileType={setFileType}
            useTrophyImage={useTrophyImage}
            setUseTrophyImage={setUseTrophyImage}
            trophyCount={processedTrophies.length}
            profileStat={profileStat}
            setProfileStat={setProfileStat}
            onExport={handleExport}
          />

          <CenterCanvas
            gridSize={gridSize}
            spacing={spacing}
            borderRadius={borderRadius}
            showBorders={showBorders}
            showGlow={showGlow}
            showProfile={showProfile}
            profileStat={profileStat}
            overlays={overlays}
            processedTrophies={processedTrophies}
            bgType={bgType}
            bgColor={bgColor}
            showGlassmorphism={showGlassmorphism}
            showRarityHeatmap={showRarityHeatmap}
            useTrophyImage={useTrophyImage}
            selectedTile={selectedTile}
            onSelectTile={setSelectedTile}
            onMosaicRef={(el) => { mosaicRef.current = el; }}
          />

          <RightPanel
            isOpen={rightPanelOpen}
            onToggle={() => setRightPanelOpen(!rightPanelOpen)}
            selectedTile={selectedTile}
            onSelectTile={setSelectedTile}
            processedTrophies={processedTrophies}
            tileCount={gridSize.rows * gridSize.cols}
            onReorder={handleReorder}
          />
        </div>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
        {showAuthModal && (
          <AuthSettingsModal onClose={() => setShowAuthModal(false)} />
        )}
      </Suspense>

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#12172A] border border-[#1E2740] rounded-lg shadow-xl animate-fade-in-up">
          <p className="text-sm text-white whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
            {toastMessage}
          </p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <PsnDataProvider>
      <AppContent />
    </PsnDataProvider>
  );
}
