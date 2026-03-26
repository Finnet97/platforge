import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel';
import { CenterCanvas } from './components/CenterCanvas';
import { RightPanel } from './components/RightPanel';
import { TemplatesModal, type TemplateSettings } from './components/TemplatesModal';
import { YearInReviewCard } from './components/YearInReviewCard';
import { CompareMode } from './components/CompareMode';
import { AuthSettingsModal } from './components/AuthSettingsModal';
import { PsnDataProvider, usePsnData } from './context/PsnDataContext';
import { toPng, toJpeg } from 'html-to-image';

function parseTimeToPlatinum(time: string): number {
  if (time === '--') return Infinity;
  const hours = time.match(/(\d+)h/);
  const minutes = time.match(/(\d+)m/);
  return (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
}

function AppContent() {
  const { checkAuth, trophies } = usePsnData();
  const [selectedTile, setSelectedTile] = useState<number | null>(0);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showYearInReview, setShowYearInReview] = useState(false);
  const [showCompareMode, setShowCompareMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [gridSize, setGridSize] = useState({ rows: 5, cols: 5 });
  const [layoutStyle, setLayoutStyle] = useState('grid');
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
  const [sortBy, setSortBy] = useState<'date' | 'alpha' | 'rarity' | 'platform' | 'speed'>('date');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [bgType, setBgType] = useState<'solid' | 'gradient' | 'pattern' | 'transparent'>('solid');
  const [bgColor, setBgColor] = useState('#0A0E1A');
  const [showGlassmorphism, setShowGlassmorphism] = useState(false);
  const [showRarityHeatmap, setShowRarityHeatmap] = useState(false);
  const [fileType, setFileType] = useState<'png' | 'jpeg'>('png');
  const [useTrophyImage, setUseTrophyImage] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const mosaicRef = useRef<HTMLDivElement | null>(null);

  const handleExport = useCallback(async (format?: 'png' | 'jpeg') => {
    const el = mosaicRef.current;
    if (!el) return;
    const exportFormat = format || fileType;
    const originalTransform = el.style.transform;
    el.style.transform = 'scale(1)';

    // Convert cross-origin images to data URLs via proxy
    const imgs = el.querySelectorAll('img');
    const originals: { img: HTMLImageElement; src: string }[] = [];
    await Promise.all(
      Array.from(imgs).map(async (img) => {
        try {
          const src = img.src;
          if (!src || src.startsWith('data:')) return;
          originals.push({ img, src });
          const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}`;
          const resp = await fetch(proxyUrl);
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          img.src = dataUrl;
        } catch {
          // Keep original src if proxy fails
        }
      })
    );

    try {
      const dataUrl = exportFormat === 'png'
        ? await toPng(el, { pixelRatio: 2 })
        : await toJpeg(el, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = `platforge-${Date.now()}.${exportFormat}`;
      link.href = dataUrl;
      link.click();
    } finally {
      el.style.transform = originalTransform;
      // Restore original image sources
      originals.forEach(({ img, src }) => { img.src = src; });
    }
  }, [fileType]);

  const handleApplyTemplate = useCallback((settings: TemplateSettings) => {
    setGridSize(settings.gridSize);
    setLayoutStyle(settings.layoutStyle);
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
    }

    return result;
  }, [trophies, platformFilter, sortBy]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0A0E1A] text-white overflow-hidden">
      <TopBar
        onShowTemplates={() => setShowTemplatesModal(true)}
        onShowYearInReview={() => setShowYearInReview(true)}
        onShowCompare={() => setShowCompareMode(true)}
        onShowAuth={() => setShowAuthModal(true)}
        onExport={handleExport}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel
          isOpen={leftPanelOpen}
          onToggle={() => setLeftPanelOpen(!leftPanelOpen)}
          gridSize={gridSize}
          setGridSize={setGridSize}
          layoutStyle={layoutStyle}
          setLayoutStyle={setLayoutStyle}
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
          setSortBy={setSortBy}
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
          onExport={handleExport}
        />
        
        <CenterCanvas 
          gridSize={gridSize}
          layoutStyle={layoutStyle}
          spacing={spacing}
          borderRadius={borderRadius}
          showBorders={showBorders}
          showGlow={showGlow}
          showProfile={showProfile}
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
          processedTrophies={processedTrophies}
        />
      </div>

      {showTemplatesModal && (
        <TemplatesModal onClose={() => setShowTemplatesModal(false)} onApply={handleApplyTemplate} />
      )}

      {showYearInReview && (
        <YearInReviewCard onClose={() => setShowYearInReview(false)} />
      )}

      {showCompareMode && (
        <CompareMode onClose={() => setShowCompareMode(false)} />
      )}

      {showAuthModal && (
        <AuthSettingsModal onClose={() => setShowAuthModal(false)} />
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
