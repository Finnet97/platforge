import { useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GripVertical, Clock, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePsnData } from '../context/PsnDataContext';
import type { Trophy } from '../data/mockData';

const TILE_DND_TYPE = 'TILE';

interface DraggableTileProps {
  trophy: Trophy;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

function DraggableTile({ trophy, index, isSelected, onSelect, onMove }: DraggableTileProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: TILE_DND_TYPE,
    item: () => ({ index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: TILE_DND_TYPE,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only move when the cursor has crossed half of the item height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(ref);

  return (
    <div
      ref={ref}
      onClick={() => onSelect(index)}
      className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-[#FFD700]/10 border-2 border-[#FFD700]'
          : 'bg-[#12172A] border-2 border-transparent hover:border-[#1E2740]'
      }`}
      style={{
        opacity: isDragging ? 0.4 : 1,
        borderTopColor: isOver && !isSelected ? '#FFD700' : undefined,
        borderTopWidth: isOver && !isSelected ? '2px' : undefined,
      }}
    >
      <div ref={(node) => { drag(node); }} className="cursor-grab active:cursor-grabbing flex-shrink-0">
        <GripVertical className="w-3.5 h-3.5 text-[#8A9BB8] hover:text-[#FFD700] transition-colors" />
      </div>
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
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-[10px] text-[#FFD700]" style={{ fontFamily: 'Inter, sans-serif' }}>
          {trophy.platform}
        </span>
      </div>
    </div>
  );
}

interface RightPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedTile: number | null;
  onSelectTile: (index: number) => void;
  processedTrophies: Trophy[];
  tileCount: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function RightPanel({ isOpen, onToggle, selectedTile, onSelectTile, processedTrophies, tileCount, onReorder }: RightPanelProps) {
  const { profile } = usePsnData();
  const selectedTrophy = selectedTile !== null ? processedTrophies[selectedTile] : processedTrophies[0];
  if (!selectedTrophy) return null;

  const displayTrophies = processedTrophies.slice(0, tileCount);

  const getRarityColor = (rarity: number) => {
    if (rarity < 1) return '#FF4444';
    if (rarity < 5) return '#FF8844';
    if (rarity < 15) return '#FFD700';
    if (rarity < 30) return '#88DD88';
    return '#8A9BB8';
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
        <div
          className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide"
          style={{ minWidth: '320px' }}
        >
          <DndProvider backend={HTML5Backend}>
            <div className="p-5 space-y-6">
              {/* Selected Tile Details */}
              <div>
                <h3 className="text-[10px] font-semibold text-[#8A9BB8] uppercase tracking-widest mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Selected Tile
                </h3>

                <div className="bg-[#12172A] border border-[#1E2740] rounded-xl overflow-hidden">
                  {/* Game Cover */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={selectedTrophy.imageUrl}
                      alt={selectedTrophy.gameTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12172A] via-transparent to-transparent" />
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-3">
                    <div className="min-w-0">
                      <h4 className="text-base font-semibold text-white mb-1.5 leading-tight truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {selectedTrophy.gameTitle}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded text-xs text-[#FFD700]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {selectedTrophy.platform}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center gap-2 text-[#8A9BB8] flex-shrink-0">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Date Earned</span>
                        </div>
                        <span className="text-xs text-white truncate ml-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {selectedTrophy.dateEarned}
                        </span>
                      </div>

                      <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center gap-2 text-[#8A9BB8] flex-shrink-0">
                          <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Rarity</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate ml-2">
                          <span
                            className="text-sm font-semibold flex-shrink-0"
                            style={{
                              fontFamily: 'Rajdhani, sans-serif',
                              color: getRarityColor(selectedTrophy.rarity)
                            }}
                          >
                            {selectedTrophy.rarity}%
                          </span>
                          <span className="text-xs text-[#8A9BB8] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
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
                        <div className="flex items-center gap-2 text-[#8A9BB8] flex-shrink-0">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
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

              {/* Mosaic Tiles - Drag to reorder */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-semibold text-[#8A9BB8] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Mosaic Tiles
                  </h3>
                  <span className="text-[10px] text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Drag to reorder
                  </span>
                </div>

                <div className="space-y-1.5">
                  {displayTrophies.map((trophy, index) => (
                    <DraggableTile
                      key={trophy.id}
                      trophy={trophy}
                      index={index}
                      isSelected={selectedTile === index}
                      onSelect={onSelectTile}
                      onMove={onReorder}
                    />
                  ))}
                </div>
              </div>
            </div>
          </DndProvider>
        </div>
      </div>
    </div>
  );
}
