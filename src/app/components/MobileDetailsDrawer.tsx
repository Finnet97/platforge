import { Drawer } from 'vaul';
import { DndProvider } from 'react-dnd';
import { getDndBackend, getDndOptions } from '@/app/utils/dndBackend';
import { TrophyDetailContent, MosaicTileList } from './RightPanel';
import type { Trophy } from '@/app/data/mockData';

interface MobileDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTrophy: Trophy | null;
  totalPlatinums: number;
  displayTrophies: Trophy[];
  selectedTile: number | null;
  onSelectTile: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function MobileDetailsDrawer({
  open,
  onOpenChange,
  selectedTrophy,
  totalPlatinums,
  displayTrophies,
  selectedTile,
  onSelectTile,
  onReorder,
}: MobileDetailsDrawerProps) {
  if (!selectedTrophy) return null;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} snapPoints={[0.4, 0.85]} fadeFromIndex={0}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[#0D1221] border-t border-[#1E2740] rounded-t-2xl max-h-[85vh]">
          {/* Drag handle */}
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-[#1E2740] rounded-full" />
          </div>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide p-5 space-y-6">
            <TrophyDetailContent
              selectedTrophy={selectedTrophy}
              totalPlatinums={totalPlatinums}
            />
            <DndProvider backend={getDndBackend(true)} options={getDndOptions(true)}>
              <MosaicTileList
                displayTrophies={displayTrophies}
                selectedTile={selectedTile}
                onSelectTile={onSelectTile}
                onReorder={onReorder}
              />
            </DndProvider>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
