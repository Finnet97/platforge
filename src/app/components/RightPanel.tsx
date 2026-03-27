import * as ScrollArea from '@radix-ui/react-scroll-area';
import { GripVertical, Gamepad2, Clock, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePsnData } from '../context/PsnDataContext';
import type { Trophy } from '../data/mockData';

interface RightPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedTile: number | null;
  processedTrophies: Trophy[];
}

export function RightPanel({ isOpen, onToggle, selectedTile, processedTrophies }: RightPanelProps) {
  const { profile } = usePsnData();
  const selectedTrophy = selectedTile !== null ? processedTrophies[selectedTile] : processedTrophies[0];
  if (!selectedTrophy) return null;

  const getRarityColor = (rarity: number) => {
    if (rarity < 1) return '#FF4444'; // Ultra rare - red
    if (rarity < 5) return '#FF8844'; // Very rare - orange
    if (rarity < 15) return '#FFD700'; // Rare - gold
    if (rarity < 30) return '#88DD88'; // Uncommon - green
    return '#8A9BB8'; // Common - gray
  };

  const getRarityLabel = (rarity: number) => {
    if (rarity < 1) return 'Ultra Rare';
    if (rarity < 5) return 'Very Rare';
    if (rarity < 15) return 'Rare';
    if (rarity < 30) return 'Uncommon';
    return 'Common';
  };

  return (
    <div className="relative flex-shrink-0 flex" style={{ zIndex: 10 }}>
      <button
        onClick={onToggle}
        className="absolute top-1/2 -translate-y-1/2 -left-4 w-4 h-12 bg-[#0D1221] border border-[#1E2740] border-r-0 rounded-l-md flex items-center justify-center hover:bg-[#12172A] transition-colors cursor-pointer"
        style={{ zIndex: 11 }}
        title={isOpen ? 'Collapse right panel' : 'Expand right panel'}
      >
        {isOpen ? (
          <ChevronRight className="w-3.5 h-3.5 text-[#8A9BB8]" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-[#8A9BB8]" />
        )}
      </button>
      <div
        className={`h-full bg-[#0D1221] border-l border-[#1E2740] flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'w-80' : 'w-0 border-l-0'
        }`}
      >
        <ScrollArea.Root className="flex-1 overflow-hidden">
          <ScrollArea.Viewport className="w-full h-full" style={{ minWidth: '320px' }}>
          <div className="p-5 space-y-6">
            {/* Selected Tile Details */}
            <div>
              <h3 className="text-[10px] font-semibold text-[#8A9BB8] uppercase tracking-widest mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Selected Tile
              </h3>
              
              <div className="bg-[#12172A] border border-[#1E2740] rounded-xl overflow-hidden">
                {/* Game Cover */}
                <div className="relative h-40">
                  <img
                    src={selectedTrophy.imageUrl}
                    alt={selectedTrophy.gameTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12172A] via-transparent to-transparent" />
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="text-base font-semibold text-white mb-1.5 leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {selectedTrophy.gameTitle}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded text-xs text-[#FFD700]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {selectedTrophy.platform}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#8A9BB8]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Date Earned</span>
                      </div>
                      <span className="text-xs text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {selectedTrophy.dateEarned}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#8A9BB8]">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Rarity</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="text-sm font-semibold"
                          style={{ 
                            fontFamily: 'Rajdhani, sans-serif',
                            color: getRarityColor(selectedTrophy.rarity)
                          }}
                        >
                          {selectedTrophy.rarity}%
                        </span>
                        <span className="text-xs text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          ({getRarityLabel(selectedTrophy.rarity)})
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Completion Rate
                        </span>
                        <span className="text-xs text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          {selectedTrophy.rarity}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#1E2740] rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500 rounded-full"
                          style={{ 
                            width: `${Math.min(100, selectedTrophy.rarity * 2)}%`,
                            backgroundColor: getRarityColor(selectedTrophy.rarity),
                            boxShadow: `0 0 10px ${getRarityColor(selectedTrophy.rarity)}40`
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#8A9BB8]">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Time to Platinum</span>
                      </div>
                      <span className="text-xs text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        {selectedTrophy.timeToPlatinum}
                      </span>
                    </div>

                    <div className="pt-2.5 border-t border-[#1E2740]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>My Platinum Order</span>
                        <span className="text-lg font-bold text-[#FFD700]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                          #{selectedTrophy.order} <span className="text-xs text-[#8A9BB8]">of {profile.totalPlatinums}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* All Tiles List */}
            <div>
              <h3 className="text-[10px] font-semibold text-[#8A9BB8] uppercase tracking-widest mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                All Tiles
              </h3>
              
              <div className="space-y-2">
                {processedTrophies.slice(0, 25).map((trophy, index) => (
                  <div
                    key={trophy.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all ${
                      selectedTile === index
                        ? 'bg-[#FFD700]/10 border-2 border-[#FFD700]'
                        : 'bg-[#12172A] border-2 border-transparent hover:border-[#1E2740]'
                    }`}
                  >
                    <GripVertical className="w-3.5 h-3.5 text-[#8A9BB8] flex-shrink-0" />
                    <img
                      src={trophy.imageUrl}
                      alt={trophy.gameTitle}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-[#1E2740]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {trophy.gameTitle}
                      </p>
                      <p className="text-[10px] text-[#8A9BB8] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {trophy.dateEarned}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-[#FFD700]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {trophy.platform}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Series Grouping */}
            <div>
              <h3 className="text-xs font-semibold text-[#8A9BB8] uppercase tracking-wider mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Series Grouping
              </h3>
              
              <div className="bg-[#12172A] border border-[#1E2740] rounded-lg p-4">
                <p className="text-sm text-[#8A9BB8] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Enable series grouping to color-code tiles by franchise
                </p>
                <button className="w-full mt-3 h-9 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] rounded-lg hover:bg-[#FFD700]/20 transition-colors text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Enable Grouping
                </button>
              </div>
            </div>
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="hidden"
          orientation="vertical"
        >
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
      </div>
    </div>
  );
}