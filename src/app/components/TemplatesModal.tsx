import { X } from 'lucide-react';

interface TemplatesModalProps {
  onClose: () => void;
}

export function TemplatesModal({ onClose }: TemplatesModalProps) {
  const templates = [
    {
      name: 'Minimal Dark',
      description: 'Clean black grid, no borders',
      preview: 'https://images.unsplash.com/photo-1580327332925-a10e6cb11baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'
    },
    {
      name: 'Gold Collection',
      description: 'Gold frames, ornate corners',
      preview: 'https://images.unsplash.com/photo-1754300681803-61eadeb79d10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'
    },
    {
      name: 'Cyberpunk',
      description: 'Neon purple/teal glow tiles',
      preview: 'https://images.unsplash.com/photo-1739184523594-564cb9b61126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'
    },
    {
      name: 'Retro PlayStation',
      description: 'PS1 era aesthetic, grey tones',
      preview: 'https://images.unsplash.com/photo-1644571580854-114d7d8fa383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'
    },
    {
      name: 'Pastel Dream',
      description: 'Soft gradients, rounded tiles',
      preview: 'https://images.unsplash.com/photo-1668119064876-2ac62994e145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'
    },
    {
      name: 'Dark Luxury',
      description: 'Glassmorphism, platinum silver',
      preview: 'https://images.unsplash.com/photo-1580327332925-a10e6cb11baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'
    }
  ];

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
                  <button className="w-full h-9 bg-[#FFD700] text-[#0A0E1A] rounded-lg text-sm font-semibold hover:bg-[#FFE44D] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Apply Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#1E2740] flex justify-center">
          <button className="h-11 px-8 bg-transparent border-2 border-[#FFD700] text-[#FFD700] rounded-lg text-sm font-semibold hover:bg-[#FFD700]/10 transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
            Save Current as Template
          </button>
        </div>
      </div>
    </div>
  );
}