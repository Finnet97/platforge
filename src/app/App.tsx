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
import { imageCache } from './services/imageCache';

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

  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const showToast = useCallback((message: string, persistent = false) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    if (!persistent) {
      toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
    }
  }, []);
  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(null);
  }, []);

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

  /**
   * Clone-based capture — never modifies the live DOM so React re-renders
   * cannot cause missing images. Images are converted to data URLs on the
   * clone, using the imageCache populated during preview.
   */
  const captureMosaic = useCallback(async (
    renderFn: (el: HTMLElement, opts: object) => Promise<string>,
    extraOpts: object = {},
  ): Promise<string | null> => {
    const el = mosaicRef.current;
    if (!el) return null;

    // 1. Synchronous deep clone — immune to React re-renders
    const clone = el.cloneNode(true) as HTMLElement;

    // 2. Position off-screen but in-document (needed for getComputedStyle)
    clone.style.position = 'fixed';
    clone.style.left = '-99999px';
    clone.style.top = '0';
    clone.style.zIndex = '-1';
    document.body.appendChild(clone);

    try {
      // 3. Convert images to data URLs on the clone (batches of 5)
      const imgs = Array.from(clone.querySelectorAll('img'));
      for (let i = 0; i < imgs.length; i += 5) {
        const batch = imgs.slice(i, i + 5);
        await Promise.all(
          batch.map(async (img) => {
            const originalSrc = img.dataset.originalSrc || img.src;
            if (!originalSrc || originalSrc.startsWith('data:')) return;

            // Use cache (populated during preview) or fetch via proxy
            const cached = imageCache.get(originalSrc);
            const dataUrl = cached ?? await imageCache.preload(originalSrc, 3);
            img.src = dataUrl ?? TRANSPARENT_1PX;
            await img.decode().catch(() => {});
          })
        );
      }

      // 4. Fix avatar boxShadow stain (html-to-image renders it as yellow artifact)
      const avatarImg = clone.querySelector('[data-avatar-img]') as HTMLElement | null;
      if (avatarImg) avatarImg.style.boxShadow = 'none';

      // 5. Remove off-screen positioning before capture — html-to-image clones
      //    the element internally and copies inline styles, so leaving these
      //    would render the content at -99999px (producing a black image).
      clone.style.position = '';
      clone.style.left = '';
      clone.style.top = '';
      clone.style.zIndex = '';

      // 6. Capture the clone
      return await renderFn(clone, { ...getExportOptions(el), ...extraOpts });
    } finally {
      // 6. Remove clone from document
      document.body.removeChild(clone);
    }
  }, [isMobile, mobileTileSize]);

  /** Captures the mosaic as a PNG Blob. */
  const captureMosaicBlob = useCallback(async (): Promise<Blob | null> => {
    const dataUrl = await captureMosaic(
      (el, opts) => toPng(el, { pixelRatio: 2, skipFonts: true, ...opts }),
    );
    if (!dataUrl) return null;
    // Convert data URL to Blob without fetch() — mobile browsers can fail
    // on large data URL fetches, producing incomplete/corrupt images.
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }, [captureMosaic]);

  /** Collect all image URLs from the live mosaic DOM (before cloning). */
  const collectMosaicImageUrls = useCallback((): string[] => {
    const el = mosaicRef.current;
    if (!el) return [];
    const urls: string[] = [];
    el.querySelectorAll('img').forEach((img) => {
      const src = img.dataset.originalSrc || img.src;
      if (src && !src.startsWith('data:')) urls.push(src);
    });
    return urls;
  }, []);

  /** Pre-cache all mosaic images via proxy before export/share. */
  const preCacheImages = useCallback(async (): Promise<void> => {
    const urls = collectMosaicImageUrls();
    if (urls.length === 0) return;

    showToast(`Preparing export... (0/${urls.length})`, true);

    const result = await imageCache.ensureAllCached(urls, (done, total) => {
      setToastMessage(`Preparing export... (${done}/${total})`);
    });

    dismissToast();

    if (result.failed.length > 0) {
      showToast(`${result.failed.length} image${result.failed.length > 1 ? 's' : ''} may be missing`);
      await new Promise(r => setTimeout(r, 1200));
    }
  }, [collectMosaicImageUrls, showToast, dismissToast]);

  const handleExport = useCallback(async (format?: 'png' | 'jpeg') => {
    try {
      await preCacheImages();

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
  }, [fileType, captureMosaic, showToast, preCacheImages]);

  const handleShare = useCallback(async () => {
    try {
      await preCacheImages();

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
  }, [captureMosaicBlob, showToast, preCacheImages]);

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
