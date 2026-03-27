import { X } from 'lucide-react';

export interface TemplateSettings {
  gridSize: { rows: number; cols: number };

  spacing: number;
  borderRadius: number;
  showBorders: boolean;
  showGlow: boolean;
  showGlassmorphism: boolean;
  showRarityHeatmap: boolean;
  bgType: 'solid' | 'gradient' | 'pattern' | 'transparent';
  bgColor: string;
  overlays: {
    showOrder: boolean;
    showGameName: boolean;
    showDate: boolean;
    showRarity: boolean;
    showPlatformIcon: boolean;
    showMilestones: boolean;
    showRarestBadge: boolean;
  };
}

interface TemplatesModalProps {
  onClose: () => void;
  onApply: (settings: TemplateSettings) => void;
}

const templates: Array<{
  name: string;
  description: string;
  preview: string;
  settings: TemplateSettings;
}> = [
  {
    name: 'Minimal Dark',
    description: 'Clean black grid, no borders',
    preview: 'https://images.unsplash.com/photo-1580327332925-a10e6cb11baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    settings: {
      gridSize: { rows: 5, cols: 5 },

      spacing: 4,
      borderRadius: 0,
      showBorders: false,
      showGlow: false,
      showGlassmorphism: false,
      showRarityHeatmap: false,
      bgType: 'solid',
      bgColor: '#000000',
      overlays: { showOrder: true, showGameName: false, showDate: false, showRarity: false, showPlatformIcon: false, showMilestones: false, showRarestBadge: false },
    },
  },
  {
    name: 'Gold Collection',
    description: 'Gold frames, ornate corners',
    preview: 'https://images.unsplash.com/photo-1754300681803-61eadeb79d10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    settings: {
      gridSize: { rows: 4, cols: 4 },

      spacing: 8,
      borderRadius: 12,
      showBorders: true,
      showGlow: true,
      showGlassmorphism: false,
      showRarityHeatmap: false,
      bgType: 'solid',
      bgColor: '#0A0E1A',
      overlays: { showOrder: true, showGameName: true, showDate: false, showRarity: true, showPlatformIcon: true, showMilestones: true, showRarestBadge: true },
    },
  },
  {
    name: 'Cyberpunk',
    description: 'Neon glow, rarity heatmap',
    preview: 'https://images.unsplash.com/photo-1739184523594-564cb9b61126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    settings: {
      gridSize: { rows: 5, cols: 5 },

      spacing: 6,
      borderRadius: 8,
      showBorders: true,
      showGlow: true,
      showGlassmorphism: false,
      showRarityHeatmap: true,
      bgType: 'gradient',
      bgColor: '#1a0533',
      overlays: { showOrder: true, showGameName: false, showDate: false, showRarity: true, showPlatformIcon: true, showMilestones: false, showRarestBadge: false },
    },
  },
  {
    name: 'Retro PlayStation',
    description: 'PS1 era aesthetic, grey tones',
    preview: 'https://images.unsplash.com/photo-1644571580854-114d7d8fa383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    settings: {
      gridSize: { rows: 4, cols: 4 },

      spacing: 2,
      borderRadius: 0,
      showBorders: true,
      showGlow: false,
      showGlassmorphism: false,
      showRarityHeatmap: false,
      bgType: 'solid',
      bgColor: '#2a2a2a',
      overlays: { showOrder: true, showGameName: true, showDate: true, showRarity: false, showPlatformIcon: true, showMilestones: false, showRarestBadge: false },
    },
  },
  {
    name: 'Pastel Dream',
    description: 'Soft gradients, rounded tiles',
    preview: 'https://images.unsplash.com/photo-1668119064876-2ac62994e145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    settings: {
      gridSize: { rows: 4, cols: 4 },

      spacing: 12,
      borderRadius: 50,
      showBorders: false,
      showGlow: true,
      showGlassmorphism: false,
      showRarityHeatmap: false,
      bgType: 'gradient',
      bgColor: '#2d1b69',
      overlays: { showOrder: false, showGameName: false, showDate: false, showRarity: false, showPlatformIcon: false, showMilestones: false, showRarestBadge: true },
    },
  },
  {
    name: 'Dark Luxury',
    description: 'Glassmorphism, platinum silver',
    preview: 'https://images.unsplash.com/photo-1580327332925-a10e6cb11baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    settings: {
      gridSize: { rows: 5, cols: 5 },

      spacing: 8,
      borderRadius: 16,
      showBorders: true,
      showGlow: true,
      showGlassmorphism: true,
      showRarityHeatmap: false,
      bgType: 'solid',
      bgColor: '#0D1221',
      overlays: { showOrder: true, showGameName: false, showDate: false, showRarity: false, showPlatformIcon: true, showMilestones: false, showRarestBadge: true },
    },
  },
];

export function TemplatesModal({ onClose, onApply }: TemplatesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0D1221] border border-[#1E2740] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#1E2740]">
          <h2 className="text-2xl font-bold text-[#FFD700]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Choose a Template
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#12172A] transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Template Grid */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="grid grid-cols-3 gap-5">
            {templates.map((template) => (
              <div
                key={template.name}
                className="group bg-[#12172A] border-2 border-[#1E2740] rounded-xl overflow-hidden hover:border-[#FFD700] transition-all cursor-pointer"
              >
                {/* Preview Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12172A] via-transparent to-transparent" />
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-white mb-1 leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {template.name}
                  </h3>
                  <p className="text-xs text-[#8A9BB8] mb-3 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {template.description}
                  </p>
                  <button
                    onClick={() => {
                      onApply(template.settings);
                      onClose();
                    }}
                    className="w-full h-9 bg-[#FFD700] text-[#0A0E1A] rounded-lg text-sm font-semibold hover:bg-[#FFE44D] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Apply Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
