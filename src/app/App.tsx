import { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel';
import { CenterCanvas } from './components/CenterCanvas';
import { RightPanel } from './components/RightPanel';
import { TemplatesModal } from './components/TemplatesModal';
import { YearInReviewCard } from './components/YearInReviewCard';
import { CompareMode } from './components/CompareMode';
import { AuthSettingsModal } from './components/AuthSettingsModal';
import { PsnDataProvider, usePsnData } from './context/PsnDataContext';

function AppContent() {
  const { checkAuth } = usePsnData();
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
      />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel 
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
        />
        
        <CenterCanvas 
          gridSize={gridSize}
          layoutStyle={layoutStyle}
          spacing={spacing}
          borderRadius={borderRadius}
          showBorders={showBorders}
          showGlow={showGlow}
          showProfile={showProfile}
          selectedTile={selectedTile}
          onSelectTile={setSelectedTile}
        />
        
        <RightPanel 
          selectedTile={selectedTile}
        />
      </div>

      {showTemplatesModal && (
        <TemplatesModal onClose={() => setShowTemplatesModal(false)} />
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
