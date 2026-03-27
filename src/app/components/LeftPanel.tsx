import { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Slider from '@radix-ui/react-slider';
import * as Switch from '@radix-ui/react-switch';
import * as Select from '@radix-ui/react-select';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { ChevronDown, ChevronLeft, ChevronRight, Sparkles, Clock } from 'lucide-react';

interface LeftPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  gridSize: { rows: number; cols: number };
  setGridSize: (size: { rows: number; cols: number }) => void;

  spacing: number;
  setSpacing: (spacing: number) => void;
  borderRadius: number;
  setBorderRadius: (radius: number) => void;
  showBorders: boolean;
  setShowBorders: (show: boolean) => void;
  showGlow: boolean;
  setShowGlow: (show: boolean) => void;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  overlays: {
    showOrder: boolean;
    showGameName: boolean;
    showDate: boolean;
    showRarity: boolean;
    showPlatformIcon: boolean;
    showMilestones: boolean;
    showRarestBadge: boolean;
  };
  setOverlays: (overlays: LeftPanelProps['overlays']) => void;
  sortBy: 'date' | 'alpha' | 'rarity' | 'platform' | 'speed' | 'custom';
  setSortBy: (sort: LeftPanelProps['sortBy']) => void;
  platformFilter: string;
  setPlatformFilter: (filter: string) => void;
  bgType: 'solid' | 'gradient' | 'pattern' | 'transparent';
  setBgType: (type: LeftPanelProps['bgType']) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  showGlassmorphism: boolean;
  setShowGlassmorphism: (show: boolean) => void;
  showRarityHeatmap: boolean;
  setShowRarityHeatmap: (show: boolean) => void;
  fileType: 'png' | 'jpeg';
  setFileType: (type: 'png' | 'jpeg') => void;
  useTrophyImage: boolean;
  setUseTrophyImage: (use: boolean) => void;
  trophyCount: number;
  profileStat: 'none' | 'rarest' | 'topPlatform' | 'avgRarity';
  setProfileStat: (stat: LeftPanelProps['profileStat']) => void;
  onExport: (format: 'png' | 'jpeg') => void;
}

function ControlSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} className="border-b border-[#1E2740]">
      <Collapsible.Trigger className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[#12172A] transition-colors">
        <span className="text-[10px] font-semibold text-[#8A9BB8] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>
          {title}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#8A9BB8] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Collapsible.Trigger>
      <Collapsible.Content className="px-5 pb-5">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export function LeftPanel({
  isOpen,
  onToggle,
  gridSize,
  setGridSize,

  spacing,
  setSpacing,
  borderRadius,
  setBorderRadius,
  showBorders,
  setShowBorders,
  showGlow,
  setShowGlow,
  showProfile,
  setShowProfile,
  overlays,
  setOverlays,
  sortBy,
  setSortBy,
  platformFilter,
  setPlatformFilter,
  bgType,
  setBgType,
  bgColor,
  setBgColor,
  showGlassmorphism,
  setShowGlassmorphism,
  showRarityHeatmap,
  setShowRarityHeatmap,
  fileType,
  setFileType,
  useTrophyImage,
  setUseTrophyImage,
  trophyCount,
  profileStat,
  setProfileStat,
  onExport
}: LeftPanelProps) {
  return (
    <div className="relative flex-shrink-0 flex" style={{ zIndex: 10 }}>
      <div
        className={`bg-[#0D1221] border-r border-[#1E2740] flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'w-80' : 'w-0 border-r-0'
        }`}
      >
        <ScrollArea.Root className="flex-1 overflow-hidden">
          <ScrollArea.Viewport className="w-full h-full" style={{ minWidth: '320px' }}>
          {/* LAYOUT Section */}
          <ControlSection title="Layout">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white mb-3 block" style={{ fontFamily: 'Inter, sans-serif' }}>Grid Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 4, 5, 6, 7, 8, 10].map(size => (
                    <button
                      key={size}
                      onClick={() => setGridSize({ rows: size, cols: size })}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        gridSize.rows === size && gridSize.cols === size
                          ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                          : 'border-[#1E2740] bg-[#12172A] text-white hover:border-[#FFD700]/50'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {size}×{size}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const auto = Math.max(3, Math.ceil(Math.sqrt(trophyCount)));
                      setGridSize({ rows: auto, cols: auto });
                    }}
                    className={`h-12 rounded-lg border-2 transition-all ${
                      gridSize.rows === gridSize.cols && ![3, 4, 5, 6, 7, 8, 10].includes(gridSize.rows)
                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                        : 'border-[#1E2740] bg-[#12172A] text-white hover:border-[#FFD700]/50'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Auto
                  </button>
                </div>
              </div>


              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Spacing</label>
                  <span className="text-sm text-[#FFD700]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{spacing}px</span>
                </div>
                <Slider.Root
                  value={[spacing]}
                  onValueChange={([value]) => setSpacing(value)}
                  min={0}
                  max={20}
                  step={1}
                  className="relative flex items-center w-full h-5"
                >
                  <Slider.Track className="relative h-1 flex-1 bg-[#1E2740] rounded-full">
                    <Slider.Range className="absolute h-full bg-[#FFD700] rounded-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-[#FFD700] rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))' }} />
                </Slider.Root>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Border Radius</label>
                  <span className="text-sm text-[#FFD700]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{borderRadius}%</span>
                </div>
                <Slider.Root
                  value={[borderRadius]}
                  onValueChange={([value]) => setBorderRadius(value)}
                  min={0}
                  max={50}
                  step={1}
                  className="relative flex items-center w-full h-5"
                >
                  <Slider.Track className="relative h-1 flex-1 bg-[#1E2740] rounded-full">
                    <Slider.Range className="absolute h-full bg-[#FFD700] rounded-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-[#FFD700] rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))' }} />
                </Slider.Root>
              </div>
            </div>
          </ControlSection>

          {/* TILES Section */}
          <ControlSection title="Tiles">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Tile Border</label>
                <Switch.Root
                  checked={showBorders}
                  onCheckedChange={setShowBorders}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    showBorders ? 'bg-[#FFD700]' : 'bg-[#1E2740]'
                  }`}
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Tile Glow</label>
                <Switch.Root
                  checked={showGlow}
                  onCheckedChange={setShowGlow}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    showGlow ? 'bg-[#FFD700]' : 'bg-[#1E2740]'
                  }`}
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Glassmorphism</label>
                <Switch.Root
                  checked={showGlassmorphism}
                  onCheckedChange={setShowGlassmorphism}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    showGlassmorphism ? 'bg-[#FFD700]' : 'bg-[#1E2740]'
                  }`}
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Rarity Heatmap</label>
                <Switch.Root
                  checked={showRarityHeatmap}
                  onCheckedChange={setShowRarityHeatmap}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    showRarityHeatmap ? 'bg-[#FFD700]' : 'bg-[#1E2740]'
                  }`}
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Platinum Trophy Icon</label>
                <Switch.Root
                  checked={useTrophyImage}
                  onCheckedChange={setUseTrophyImage}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    useTrophyImage ? 'bg-[#FFD700]' : 'bg-[#1E2740]'
                  }`}
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
              </div>
            </div>
          </ControlSection>

          {/* BACKGROUND Section */}
          <ControlSection title="Background" defaultOpen={false}>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white mb-3 block" style={{ fontFamily: 'Inter, sans-serif' }}>Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['solid', 'gradient', 'pattern', 'transparent'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setBgType(type)}
                      className={`h-10 rounded-lg border transition-colors text-sm capitalize ${
                        bgType === type
                          ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                          : 'border-[#1E2740] bg-[#12172A] text-white hover:border-[#FFD700]/50'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-white mb-2 block" style={{ fontFamily: 'Inter, sans-serif' }}>Color</label>
                <div className="h-10 rounded-lg bg-[#12172A] border border-[#1E2740] flex items-center px-3 gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-6 h-6 rounded border-none cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-[#8A9BB8] focus:text-white focus:outline-none uppercase"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  />
                </div>
              </div>
            </div>
          </ControlSection>

          {/* OVERLAYS Section */}
          <ControlSection title="Overlays" defaultOpen={false}>
            <div className="space-y-3">
              {([
                { label: 'Show platinum order number', key: 'showOrder' as const },
                { label: 'Show game name', key: 'showGameName' as const },
                { label: 'Show platinum date', key: 'showDate' as const },
                { label: 'Show rarity %', key: 'showRarity' as const },
                { label: 'Show platform icon', key: 'showPlatformIcon' as const },
                { label: 'Milestone badges', key: 'showMilestones' as const },
                { label: 'Rarest platinum badge', key: 'showRarestBadge' as const },
              ]).map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-white" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</label>
                  <Switch.Root
                    checked={overlays[key]}
                    onCheckedChange={(checked) => setOverlays({ ...overlays, [key]: checked })}
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      overlays[key] ? 'bg-[#FFD700]' : 'bg-[#1E2740]'
                    }`}
                  >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                  </Switch.Root>
                </div>
              ))}
            </div>
          </ControlSection>

          {/* PROFILE HEADER Section */}
          <ControlSection title="Profile Header" defaultOpen={false}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Show Header</label>
                <Switch.Root
                  checked={showProfile}
                  onCheckedChange={setShowProfile}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    showProfile ? 'bg-[#FFD700]' : 'bg-[#1E2740]'
                  }`}
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
              </div>

              {showProfile && (
                <div>
                  <label className="text-sm text-white mb-2 block" style={{ fontFamily: 'Inter, sans-serif' }}>Extra Stat</label>
                  <select
                    value={profileStat}
                    onChange={(e) => setProfileStat(e.target.value as LeftPanelProps['profileStat'])}
                    className="w-full h-10 rounded-lg border-2 border-[#1E2740] bg-[#12172A] text-white px-3 text-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="none">None</option>
                    <option value="rarest">Rarest %</option>
                    <option value="topPlatform">Top Platform</option>
                    <option value="avgRarity">Avg Rarity</option>
                  </select>
                </div>
              )}
            </div>
          </ControlSection>

          {/* SORTING & FILTER Section */}
          <ControlSection title="Sorting & Filter" defaultOpen={false}>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white mb-2 block" style={{ fontFamily: 'Inter, sans-serif' }}>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as LeftPanelProps['sortBy'])}
                  className="w-full h-10 bg-[#12172A] border border-[#1E2740] rounded-lg px-3 text-white text-sm focus:outline-none focus:border-[#FFD700]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="date">Date Earned</option>
                  <option value="alpha">Alphabetical</option>
                  <option value="rarity">Rarity</option>
                  <option value="platform">Platform</option>
                  <option value="speed">Speed</option>
                  <option value="custom">Custom (Drag)</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-white mb-2 block" style={{ fontFamily: 'Inter, sans-serif' }}>Platform Filter</label>
                <div className="flex flex-wrap gap-2">
                  {['ALL', 'PS3', 'PS4', 'PS5', 'Vita'].map(platform => (
                    <button
                      key={platform}
                      onClick={() => setPlatformFilter(platform)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        platformFilter === platform
                          ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                          : 'border-[#1E2740] bg-[#12172A] text-white hover:border-[#FFD700]/50'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ControlSection>

          {/* EXPORT FORMAT Section */}
          <ControlSection title="Export Format Presets" defaultOpen={false}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {([
                  { label: 'Custom', rows: gridSize.rows, cols: gridSize.cols },
                  { label: 'Twitter Card', rows: 3, cols: 5 },
                  { label: 'Instagram Post', rows: 4, cols: 4 },
                  { label: 'Instagram Story', rows: 6, cols: 3 },
                  { label: 'Discord Banner', rows: 2, cols: 5 },
                  { label: '4K Wallpaper', rows: 4, cols: 6 },
                ] as const).map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      if (preset.label !== 'Custom') {
                        setGridSize({ rows: preset.rows, cols: preset.cols });
                      }
                    }}
                    className={`h-10 rounded-lg border transition-colors text-xs ${
                      gridSize.rows === preset.rows && gridSize.cols === preset.cols
                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                        : 'border-[#1E2740] bg-[#12172A] text-white hover:border-[#FFD700]/50'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm text-white mb-2 block" style={{ fontFamily: 'Inter, sans-serif' }}>File Type</label>
                <div className="flex gap-2">
                  {(['png', 'jpeg'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setFileType(type)}
                      className={`flex-1 h-9 rounded-lg border transition-colors text-sm uppercase ${
                        fileType === type
                          ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                          : 'border-[#1E2740] bg-[#12172A] text-white hover:border-[#FFD700]/50'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onExport(fileType)}
                className="w-full h-10 bg-[#FFD700] text-[#0A0E1A] rounded-lg text-sm font-semibold hover:bg-[#FFE44D] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Export Image
              </button>
            </div>
          </ControlSection>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="hidden"
          orientation="vertical"
        >
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
      </div>
      <button
        onClick={onToggle}
        className="absolute top-1/2 -translate-y-1/2 -right-4 w-4 h-12 bg-[#0D1221] border border-[#1E2740] border-l-0 rounded-r-md flex items-center justify-center hover:bg-[#12172A] transition-colors cursor-pointer"
        style={{ zIndex: 11 }}
        title={isOpen ? 'Collapse left panel' : 'Expand left panel'}
      >
        {isOpen ? (
          <ChevronLeft className="w-3.5 h-3.5 text-[#8A9BB8]" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-[#8A9BB8]" />
        )}
      </button>
    </div>
  );
}