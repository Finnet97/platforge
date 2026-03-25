import { useState } from 'react';
import { Trophy, ZoomIn, ZoomOut, Maximize2, Gamepad2 } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { usePsnData } from '../context/PsnDataContext';

interface CenterCanvasProps {
  gridSize: { rows: number; cols: number };
  layoutStyle: string;
  spacing: number;
  borderRadius: number;
  showBorders: boolean;
  showGlow: boolean;
  showProfile: boolean;
  selectedTile: number | null;
  onSelectTile: (index: number) => void;
}

export function CenterCanvas({
  gridSize,
  spacing,
  borderRadius,
  showBorders,
  showGlow,
  showProfile,
  selectedTile,
  onSelectTile
}: CenterCanvasProps) {
  const { trophies, profile } = usePsnData();
  const [zoom, setZoom] = useState(100);
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);

  const totalTiles = gridSize.rows * gridSize.cols;
  const displayTrophies = trophies.slice(0, totalTiles);

  return (
    <Tooltip.Provider>
      <div className="flex-1 bg-[#0A0E1A] relative overflow-hidden">
        {/* Canvas Background Pattern */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle, #1E2740 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.3
          }}
        />

        {/* Canvas Controls */}
        <div className="absolute top-4 right-4 z-10 bg-[#12172A]/90 backdrop-blur-md border border-[#1E2740] rounded-lg px-3 py-2 flex items-center gap-3 shadow-lg">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              className="w-7 h-7 flex items-center justify-center text-white hover:text-[#FFD700] transition-colors rounded"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm text-white min-w-[50px] text-center font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {zoom}%
            </span>
            <button 
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="w-7 h-7 flex items-center justify-center text-white hover:text-[#FFD700] transition-colors rounded"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-px h-5 bg-[#1E2740]" />
          <button className="w-7 h-7 flex items-center justify-center text-white hover:text-[#FFD700] transition-colors rounded">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mosaic Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <div 
            className="bg-[#0A0E1A] rounded-2xl p-8 transition-all duration-300"
            style={{ 
              transform: `scale(${zoom / 100})`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Mosaic Grid */}
            <div 
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
                gap: `${spacing}px`
              }}
            >
              {displayTrophies.map((trophy, index) => (
                <Tooltip.Root key={trophy.id} delayDuration={300}>
                  <Tooltip.Trigger asChild>
                    <div
                      onClick={() => onSelectTile(index)}
                      onMouseEnter={() => setHoveredTile(index)}
                      onMouseLeave={() => setHoveredTile(null)}
                      className="relative w-32 h-32 cursor-pointer transition-all duration-300 group"
                      style={{
                        borderRadius: `${borderRadius}%`,
                        transform: hoveredTile === index ? 'scale(1.05) translateY(-4px)' : selectedTile === index ? 'scale(1.02)' : 'scale(1)',
                        filter: showGlow && (hoveredTile === index || selectedTile === index)
                          ? 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))'
                          : 'none'
                      }}
                    >
                      {/* Trophy Image */}
                      <img
                        src={trophy.imageUrl}
                        alt={trophy.gameTitle}
                        className="w-full h-full object-cover"
                        style={{
                          borderRadius: `${borderRadius}%`,
                          border: showBorders ? '2px solid #FFD700' : 'none'
                        }}
                      />

                      {/* Order Number Badge */}
                      <div 
                        className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-[#FFD700] border border-[#FFD700]/30"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        #{trophy.order}
                      </div>

                      {/* Platform Badge */}
                      <div 
                        className="absolute bottom-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#FFD700]/30"
                      >
                        <Gamepad2 className="w-4 h-4 text-[#FFD700]" />
                      </div>

                      {/* Selected Border */}
                      {selectedTile === index && (
                        <div 
                          className="absolute inset-0 border-2 border-[#FFD700] pointer-events-none"
                          style={{
                            borderRadius: `${borderRadius}%`,
                            boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)'
                          }}
                        />
                      )}
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-[#12172A]/95 backdrop-blur-md border border-[#1E2740] rounded-lg px-4 py-3 shadow-xl z-50"
                      sideOffset={5}
                    >
                      <div className="space-y-1">
                        <p className="text-white font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {trophy.gameTitle}
                        </p>
                        <p className="text-sm text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Rarity: <span className="text-[#FFD700]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{trophy.rarity}%</span>
                        </p>
                      </div>
                      <Tooltip.Arrow className="fill-[#1E2740]" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ))}
            </div>

            {/* Profile Header */}
            {showProfile && (
              <div className="mt-8 bg-[#12172A] border border-[#1E2740] rounded-xl p-6 flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-20 h-20 rounded-full object-cover"
                    style={{
                      border: '3px solid #FFD700',
                      boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                    }}
                  />
                </div>

                {/* Stats */}
                <div className="flex-1 flex items-center gap-8">
                  <div>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      {profile.username}
                    </p>
                    <p className="text-sm text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      PSN Level <span className="text-[#FFD700]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{profile.psnLevel}</span>
                    </p>
                  </div>

                  <div className="h-12 w-px bg-[#1E2740]" />

                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-[#FFD700]" style={{ filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.4))' }} />
                    <div>
                      <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        {profile.totalPlatinums}
                      </p>
                      <p className="text-xs text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Platinums
                      </p>
                    </div>
                  </div>

                  <div className="h-12 w-px bg-[#1E2740]" />

                  {profile.rarestPlatinum && (
                    <div className="flex items-center gap-3">
                      <img
                        src={profile.rarestPlatinum.imageUrl}
                        alt="Rarest"
                        className="w-12 h-12 rounded-lg object-cover border border-[#FFD700]/30"
                      />
                      <div>
                        <p className="text-xs text-[#8A9BB8] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Rarest Platinum
                        </p>
                        <p className="text-sm font-medium text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {profile.rarestPlatinum.gameTitle}
                        </p>
                        <p className="text-xs text-[#FFD700]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          {profile.rarestPlatinum.rarity}% of players
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}