import { Drawer } from 'vaul';
import { SettingsContent, type SettingsContentProps } from './LeftPanel';

interface MobileSettingsDrawerProps extends SettingsContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSettingsDrawer({ open, onOpenChange, ...settingsProps }: MobileSettingsDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} snapPoints={[0.5, 0.9]} fadeFromIndex={0}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[#0D1221] border-t border-[#1E2740] rounded-t-2xl max-h-[90vh]">
          {/* Drag handle */}
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-[#1E2740] rounded-full" />
          </div>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            <SettingsContent {...settingsProps} />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
