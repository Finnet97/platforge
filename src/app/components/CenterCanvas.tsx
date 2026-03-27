import { useState, useRef, useEffect } from 'react';
import { Trophy as TrophyIcon, ZoomIn, ZoomOut, Maximize2, Gamepad2, Crown, Star, Calendar } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { usePsnData, type Profile } from '../context/PsnDataContext';
import type { Trophy } from '../data/mockData';


interface OverlaySettings {
  showOrder: boolean;
  showGameName: boolean;
  showDate: boolean;
  showRarity: boolean;
  showPlatformIcon: boolean;
  showMilestones: boolean;
  showRarestBadge: boolean;
}

interface CenterCanvasProps {
  gridSize: { rows: number; cols: number };

  spacing: number;
  borderRadius: number;
  showBorders: boolean;
  showGlow: boolean;
  showProfile: boolean;
  profileStat: 'none' | 'rarest' | 'topPlatform' | 'avgRarity';
  overlays: OverlaySettings;
  processedTrophies: Trophy[];
  bgType: 'solid' | 'gradient' | 'pattern' | 'transparent';
  bgColor: string;
  showGlassmorphism: boolean;
  showRarityHeatmap: boolean;
  useTrophyImage: boolean;
  selectedTile: number | null;
  onSelectTile: (index: number) => void;
  onMosaicRef?: (el: HTMLDivElement | null) => void;
}

type ProfileStatType = 'none' | 'rarest' | 'topPlatform' | 'avgRarity';

function ProfileCard({ profile, profileStat, processedTrophies }: {
  profile: Profile;
  profileStat: ProfileStatType;
  processedTrophies: Trophy[];
}) {
  const extraStat = (() => {
    if (profileStat === 'none') return null;
    if (profileStat === 'rarest' && profile.rarestPlatinum) {
      return { value: `${profile.rarestPlatinum.rarity}%`, label: 'Rarest' };
    }
    if (profileStat === 'topPlatform' && processedTrophies.length > 0) {
      const counts: Record<string, number> = {};
      processedTrophies.forEach(t => { counts[t.platform] = (counts[t.platform] || 0) + 1; });
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      return { value: top[0], label: 'Top Platform' };
    }
    if (profileStat === 'avgRarity' && processedTrophies.length > 0) {
      const avg = processedTrophies.reduce((sum, t) => sum + t.rarity, 0) / processedTrophies.length;
      return { value: `${avg.toFixed(1)}%`, label: 'Avg Rarity' };
    }
    return null;
  })();

  return (
    <div className="mt-8 self-center bg-[#12172A] border border-[#1E2740] rounded-xl p-5 flex items-stretch gap-6">
      {/* Avatar + Username */}
      <div className="flex items-center gap-3">
        <img
          src={profile.avatar}
          alt={profile.username}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          style={{
            border: '2px solid #FFD700',
            boxShadow: '0 0 16px rgba(255, 215, 0, 0.3)'
          }}
        />
        <div className="flex flex-col justify-center">
          <p className="text-lg font-bold text-white leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {profile.username}
          </p>
          <p className="text-xs text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Lv <span className="text-[#FFD700]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{profile.psnLevel}</span>
          </p>
        </div>
      </div>

      <div className="w-px bg-[#1E2740]" />

      {/* Platinums */}
      <div className="flex flex-col items-center justify-between py-1.5" style={{ minWidth: '64px' }}>
        <TrophyIcon className="w-4 h-4 text-[#FFD700]" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.4))' }} />
        <p className="text-lg font-bold text-white leading-none" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          {profile.totalPlatinums}
        </p>
        <p className="text-[10px] text-[#8A9BB8] leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
          Platinums
        </p>
      </div>

      {/* Extra stat configurable */}
      {extraStat && (
        <>
          <div className="w-px bg-[#1E2740]" />
          <div className="flex flex-col items-center justify-between py-1.5" style={{ minWidth: '64px' }}>
            <Star className="w-4 h-4 text-[#FFD700]" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.4))' }} />
            <p className="text-lg font-bold text-white leading-none" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {extraStat.value}
            </p>
            <p className="text-[10px] text-[#8A9BB8] leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
              {extraStat.label}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export function CenterCanvas({
  gridSize,
  spacing,
  borderRadius,
  showBorders,
  showGlow,
  showProfile,
  profileStat,
  overlays,
  processedTrophies,
  bgType,
  bgColor,
  showGlassmorphism,
  showRarityHeatmap,
  useTrophyImage,
  selectedTile,
  onSelectTile,
  onMosaicRef
}: CenterCanvasProps) {
  const { profile } = usePsnData();
  const [zoom, setZoom] = useState(100);
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);
  const mosaicRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onMosaicRef?.(mosaicRef.current);
  }, [onMosaicRef]);

  const totalTiles = gridSize.rows * gridSize.cols;
  const displayTrophies = processedTrophies.slice(0, totalTiles);

  const getRarityColor = (rarity: number) => {
    if (rarity < 1) return '#FF4444';
    if (rarity < 5) return '#FF8844';
    if (rarity < 15) return '#FFD700';
    if (rarity < 30) return '#88DD88';
    return '#8A9BB8';
  };

  const tileRadius = `${borderRadius}%`;

  function renderTile(trophy: Trophy, index: number, heightOverride?: number) {
    return (
      <Tooltip.Root key={trophy.id} delayDuration={300}>
        <Tooltip.Trigger asChild>
          <div
            onClick={() => onSelectTile(index)}
            onMouseEnter={() => setHoveredTile(index)}
            onMouseLeave={() => setHoveredTile(null)}
            className="relative cursor-pointer transition-all duration-300 group"
            style={{
              width: '128px',
              height: heightOverride ? `${heightOverride}px` : '128px',
              borderRadius: tileRadius,
              transform: hoveredTile === index ? 'scale(1.05) translateY(-4px)' : selectedTile === index ? 'scale(1.02)' : 'scale(1)',
              filter: showGlow && (hoveredTile === index || selectedTile === index)
                ? 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))'
                : 'none'
            }}
          >
            {/* Trophy Image */}
            <img
              src={useTrophyImage && trophy.trophyImageUrl ? trophy.trophyImageUrl : trophy.imageUrl}
              alt={trophy.gameTitle}
              className="w-full h-full object-cover"
              style={{
                borderRadius: tileRadius,
                border: showRarityHeatmap
                  ? `2px solid ${getRarityColor(trophy.rarity)}`
                  : showBorders ? '2px solid #FFD700' : 'none',
                opacity: showGlassmorphism ? 0.8 : 1,
                ...(showRarityHeatmap && {
                  boxShadow: `0 0 15px ${getRarityColor(trophy.rarity)}60`
                })
              }}
            />

            {/* Glassmorphism Overlay */}
            {showGlassmorphism && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderRadius: tileRadius,
                  backdropFilter: 'blur(2px)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.12)'
                }}
              />
            )}

            {/* Order Number Badge */}
            {overlays.showOrder && (
              <div
                className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-[#FFD700] border border-[#FFD700]/30"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                #{trophy.order}
              </div>
            )}

            {/* Rarity Badge */}
            {overlays.showRarity && (
              <div
                className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-[#FFD700] border border-[#FFD700]/30"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                {trophy.rarity}%
              </div>
            )}

            {/* Platform Badge */}
            {overlays.showPlatformIcon && (
              <div
                className="absolute bottom-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#FFD700]/30"
              >
                <Gamepad2 className="w-4 h-4 text-[#FFD700]" />
              </div>
            )}

            {/* Game Name Overlay */}
            {overlays.showGameName && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2"
                style={{ borderRadius: `0 0 ${tileRadius} ${tileRadius}` }}
              >
                <p className="text-[10px] text-white truncate font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {trophy.gameTitle}
                </p>
              </div>
            )}

            {/* Date Overlay */}
            {overlays.showDate && (
              <div
                className={`absolute ${overlays.showOrder ? 'top-8' : 'top-2'} left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-[9px] text-[#8A9BB8] border border-[#1E2740] flex items-center gap-1`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Calendar className="w-2.5 h-2.5" />
                {trophy.dateEarned.split(',')[0]}
              </div>
            )}

            {/* Milestone Badge */}
            {overlays.showMilestones && (trophy.order % 25 === 0 || trophy.order % 10 === 0) && (
              <div className={`absolute ${overlays.showRarity ? 'top-8' : 'top-2'} right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                trophy.order % 25 === 0
                  ? 'bg-[#FFD700] text-black'
                  : 'bg-black/60 backdrop-blur-sm text-[#FFD700] border border-[#FFD700]/30'
              }`}>
                <Star className="w-3.5 h-3.5" />
              </div>
            )}

            {/* Rarest Platinum Badge */}
            {overlays.showRarestBadge && profile.rarestPlatinum && trophy.id === profile.rarestPlatinum.id && (
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#FFD700] rounded-full flex items-center justify-center shadow-lg z-10"
                style={{ boxShadow: '0 0 12px rgba(255, 215, 0, 0.6)' }}
              >
                <Crown className="w-4 h-4 text-black" />
              </div>
            )}

            {/* Selected Border */}
            {selectedTile === index && (
              <div
                className="absolute inset-0 border-2 border-[#FFD700] pointer-events-none"
                style={{
                  borderRadius: tileRadius,
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
    );
  }

  function renderGridLayout() {
    const cols = gridSize.cols;
    const lastRowCount = displayTrophies.length % cols;
    const hasIncompleteRow = lastRowCount > 0;
    const fullRowTrophies = hasIncompleteRow ? displayTrophies.slice(0, -lastRowCount) : displayTrophies;
    const lastRowTrophies = hasIncompleteRow ? displayTrophies.slice(-lastRowCount) : [];

    return (
      <div className="flex flex-col items-center">
        {fullRowTrophies.length > 0 && (
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, 128px)`,
              gap: `${spacing}px`
            }}
          >
            {fullRowTrophies.map((trophy, index) => renderTile(trophy, index))}
          </div>
        )}
        {lastRowTrophies.length > 0 && (
          <div
            className="flex justify-center"
            style={{ gap: `${spacing}px`, marginTop: fullRowTrophies.length > 0 ? `${spacing}px` : 0 }}
          >
            {lastRowTrophies.map((trophy, index) => renderTile(trophy, fullRowTrophies.length + index))}
          </div>
        )}
      </div>
    );
  }



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
            ref={mosaicRef}
            className="inline-flex flex-col rounded-2xl p-8 transition-all duration-300"
            style={{
              transform: `scale(${zoom / 100})`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              ...(bgType === 'solid' && { backgroundColor: bgColor }),
              ...(bgType === 'gradient' && { background: `linear-gradient(135deg, ${bgColor}, ${bgColor}00)` }),
              ...(bgType === 'pattern' && {
                backgroundColor: bgColor,
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }),
              ...(bgType === 'transparent' && {
                backgroundColor: 'transparent',
                backgroundImage: 'repeating-conic-gradient(#1E2740 0% 25%, #12172A 0% 50%)',
                backgroundSize: '16px 16px'
              })
            }}
          >
            {/* Layout Rendering */}
            {renderGridLayout()}

            {/* Profile Header */}
            {showProfile && (
              <ProfileCard
                profile={profile}
                profileStat={profileStat}
                processedTrophies={processedTrophies}
              />
            )}
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}
