import { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Slider from '@radix-ui/react-slider';
import * as Switch from '@radix-ui/react-switch';
import * as Select from '@radix-ui/react-select';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { ChevronDown, Grid3x3, Hexagon, LayoutGrid, Sparkles, Clock } from 'lucide-react';

interface LeftPanelProps {
  gridSize: { rows: number; cols: number };
  setGridSize: (size: { rows: number; cols: number }) => void;
  layoutStyle: string;
  setLayoutStyle: (style: string) => void;
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
  gridSize,
  setGridSize,
  layoutStyle,
  setLayoutStyle,
  spacing,
  setSpacing,
  borderRadius,
  setBorderRadius,
  showBorders,
  setShowBorders,
  showGlow,
  setShowGlow,
  showProfile,
  setShowProfile
}: LeftPanelProps) {
  return (
    <div className="w-80 bg-[#0D1221] border-r border-[#1E2740] flex flex-col">
      <ScrollArea.Root className="flex-1">
        <ScrollArea.Viewport className="w-full h-full">
          {/* LAYOUT Section */}
          <ControlSection title="Layout">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white mb-3 block" style={{ fontFamily: 'Inter, sans-serif' }}>Grid Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 4, 5, 6].map(size => (
                    <button
                      key={size}
                      onClick={() => setGridSize({ rows: size, cols: size })}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        gridSize.rows === size
                          ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                          : 'border-[#1E2740] bg-[#12172A] text-white hover:border-[#FFD700]/50'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {size}×{size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-white mb-3 block" style={{ fontFamily: 'Inter, sans-serif' }}>Layout Style</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setLayoutStyle('grid')}
                    className={`h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      layoutStyle === 'grid'
                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                        : 'border-[#1E2740] bg-[#12172A] text-white hover:border-[#FFD700]/50'
                    }`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                    <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Grid</span>
                  </button>
                  <button
                    onClick={() => setLayoutStyle('hexagonal')}
                    className={`h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      layoutStyle === 'hexagonal'
                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                        : 'border-[#1E2740] bg-[#12172A] text-white hover:border-[#FFD700]/50'
                    }`}
                  >
                    <Hexagon className="w-5 h-5" />
                    <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Hex</span>
                  </button>
                  <button
                    onClick={() => setLayoutStyle('masonry')}
                    className={`h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      layoutStyle === 'masonry'
                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                        : 'border-[#1E2740] bg-[#12172A] text-white hover:border-[#FFD700]/50'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Masonry</span>
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
                  className="w-11 h-6 rounded-full relative bg-[#1E2740]"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Rarity Heatmap</label>
                <Switch.Root
                  className="w-11 h-6 rounded-full relative bg-[#1E2740]"
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
                  {['Solid', 'Gradient', 'Pattern', 'Transparent'].map(type => (
                    <button
                      key={type}
                      className="h-10 rounded-lg border border-[#1E2740] bg-[#12172A] text-white hover:border-[#FFD700]/50 transition-colors text-sm"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-white mb-2 block" style={{ fontFamily: 'Inter, sans-serif' }}>Color</label>
                <div className="h-10 rounded-lg bg-[#0A0E1A] border border-[#1E2740] flex items-center px-3">
                  <div className="w-6 h-6 rounded bg-[#0A0E1A] border border-[#FFD700]"></div>
                  <span className="ml-3 text-sm text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>#0A0E1A</span>
                </div>
              </div>
            </div>
          </ControlSection>

          {/* OVERLAYS Section */}
          <ControlSection title="Overlays" defaultOpen={false}>
            <div className="space-y-3">
              {[
                'Show platinum order number',
                'Show game name',
                'Show platinum date',
                'Show rarity %',
                'Show platform icon',
                'Milestone badges',
                'Rarest platinum badge'
              ].map(label => (
                <div key={label} className="flex items-center justify-between">
                  <label className="text-sm text-white" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</label>
                  <Switch.Root
                    defaultChecked={label.includes('order') || label.includes('platform')}
                    className="w-11 h-6 rounded-full relative bg-[#1E2740] data-[state=checked]:bg-[#FFD700]"
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
            </div>
          </ControlSection>

          {/* SORTING & FILTER Section */}
          <ControlSection title="Sorting & Filter" defaultOpen={false}>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white mb-2 block" style={{ fontFamily: 'Inter, sans-serif' }}>Sort By</label>
                <select className="w-full h-10 bg-[#12172A] border border-[#1E2740] rounded-lg px-3 text-white text-sm focus:outline-none focus:border-[#FFD700]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <option>Date Earned</option>
                  <option>Alphabetical</option>
                  <option>Rarity</option>
                  <option>Platform</option>
                  <option>Speed</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-white mb-2 block" style={{ fontFamily: 'Inter, sans-serif' }}>Platform Filter</label>
                <div className="flex flex-wrap gap-2">
                  {['ALL', 'PS3', 'PS4', 'PS5', 'Vita'].map(platform => (
                    <button
                      key={platform}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        platform === 'ALL'
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
                {['Custom', 'Twitter Card', 'Instagram Post', 'Instagram Story', 'Discord Banner', '4K Wallpaper'].map(preset => (
                  <button
                    key={preset}
                    className="h-10 rounded-lg border border-[#1E2740] bg-[#12172A] text-white hover:border-[#FFD700]/50 transition-colors text-xs"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm text-white mb-2 block" style={{ fontFamily: 'Inter, sans-serif' }}>File Type</label>
                <div className="flex gap-2">
                  {['PNG', 'JPEG', 'GIF'].map(type => (
                    <button
                      key={type}
                      className={`flex-1 h-9 rounded-lg border transition-colors text-sm ${
                        type === 'PNG'
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
            </div>
          </ControlSection>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex touch-none select-none p-0.5 bg-transparent transition-colors duration-150 ease-out hover:bg-[#1E2740] data-[orientation=vertical]:w-2.5"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="flex-1 bg-[#FFD700]/40 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}