import { Trophy, Heart, ExternalLink, ArrowLeft, Mail } from 'lucide-react';

const LINKS = {
  github: 'https://github.com/Finnet97',
  linkedin: 'https://www.linkedin.com/in/tomas-chipont',
  instagram: 'https://www.instagram.com/tomaschipont_',
};

const CONTACT_EMAIL = 'totochipont@gmail.com';
const MERCADOPAGO_URL = 'https://link.mercadopago.com.ar/platforge';
const PAYPAL_URL = 'https://www.paypal.com/donate?business=totochipont%40gmail.com&currency_code=USD';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
    </svg>
  );
}

export default function SupportPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #070B14 0%, #0A0E1A 30%, #0D1221 60%, #0A0E1A 100%)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Subtle radial glow behind content */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.03) 0%, transparent 70%)',
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-12">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#8A9BB8] hover:text-[#FFD700] active:text-[#FFD700] transition-colors py-2 sm:py-0 mb-6 sm:mb-10 group"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to PlatForge
        </a>

        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <div className="relative">
            <Trophy
              className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFD700]"
              style={{ filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.4))' }}
            />
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#FFD700]"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              textShadow: '0 0 30px rgba(255, 215, 0, 0.15)',
            }}
          >
            Support PlatForge
          </h1>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-6 sm:mb-10"
          style={{
            background: 'linear-gradient(to right, #FFD700, rgba(255, 215, 0, 0.1), transparent)',
          }}
        />

        {/* About */}
        <section className="mb-8 sm:mb-12">
          <h2
            className="text-lg font-semibold text-white mb-4"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            About the Project
          </h2>
          <div
            className="text-[#8A9BB8] leading-relaxed space-y-3 text-sm"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <p>
              PlatForge is a free, open-source trophy gallery visualizer for PlayStation players.
              It connects to the real PSN API to display your platinum collection in customizable
              mosaic grids — with sorting, filtering, drag-to-reorder, visual effects, and
              one-click export to share your achievements.
            </p>
            <p>
              Built as a passion project by a fellow trophy hunter. If you enjoy using PlatForge,
              consider supporting its development so it can keep growing and stay free for everyone.
            </p>
          </div>
        </section>

        {/* Donations */}
        <section className="mb-8 sm:mb-12">
          <h2
            className="text-lg font-semibold text-white mb-4 sm:mb-6"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Support Development
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* MercadoPago Card */}
            <a
              href={MERCADOPAGO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-[#12172A] border border-[#1E2740] rounded-xl p-4 sm:p-6 transition-all duration-300 hover:border-[#00AEEF]/50 hover:shadow-[0_0_30px_rgba(0,174,239,0.08)] active:border-[#00AEEF]/50 active:scale-[0.98] block"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="text-xs font-semibold uppercase tracking-wider text-[#00AEEF]"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  Pesos Argentinos
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#8A9BB8] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
              </div>
              <div
                className="text-xl font-bold text-white mb-1"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                MercadoPago
              </div>
              <p
                className="text-xs text-[#8A9BB8]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Donar en ARS
              </p>
              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(to right, transparent, #00AEEF, transparent)' }}
              />
            </a>

            {/* PayPal Card */}
            <a
              href={PAYPAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-[#12172A] border border-[#1E2740] rounded-xl p-4 sm:p-6 transition-all duration-300 hover:border-[#FFD700]/50 hover:shadow-[0_0_30px_rgba(255,215,0,0.06)] active:border-[#FFD700]/50 active:scale-[0.98] block"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="text-xs font-semibold uppercase tracking-wider text-[#FFD700]"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  US Dollars
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#8A9BB8] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
              </div>
              <div
                className="text-xl font-bold text-white mb-1"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                PayPal
              </div>
              <p
                className="text-xs text-[#8A9BB8]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Donate in USD
              </p>
              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(to right, transparent, #FFD700, transparent)' }}
              />
            </a>
          </div>
        </section>

        {/* Social Links */}
        <section className="mb-10 sm:mb-16">
          <h2
            className="text-lg font-semibold text-white mb-4 sm:mb-6"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Connect
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center bg-[#12172A] border border-[#1E2740] rounded-xl hover:border-[#FFD700] hover:text-[#FFD700] active:border-[#FFD700] active:text-[#FFD700] active:scale-95 text-[#8A9BB8] transition-all duration-300"
              title="GitHub"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
            <a
              href={LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center bg-[#12172A] border border-[#1E2740] rounded-xl hover:border-[#0A66C2] hover:text-[#0A66C2] active:border-[#0A66C2] active:text-[#0A66C2] active:scale-95 text-[#8A9BB8] transition-all duration-300"
              title="LinkedIn"
            >
              <LinkedInIcon className="w-5 h-5" />
            </a>
            <a
              href={LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center bg-[#12172A] border border-[#1E2740] rounded-xl hover:border-[#E4405F] hover:text-[#E4405F] active:border-[#E4405F] active:text-[#E4405F] active:scale-95 text-[#8A9BB8] transition-all duration-300"
              title="Instagram"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="w-12 h-12 flex items-center justify-center bg-[#12172A] border border-[#1E2740] rounded-xl hover:border-[#FFD700] hover:text-[#FFD700] active:border-[#FFD700] active:text-[#FFD700] active:scale-95 text-[#8A9BB8] transition-all duration-300"
              title={CONTACT_EMAIL}
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
          <p
            className="mt-3 text-xs text-[#8A9BB8]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-[#FFD700] active:text-[#FFD700] transition-colors">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#1E2740] pt-6">
          <p
            className="text-xs text-[#8A9BB8] flex items-center gap-1.5"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for the PlayStation community
          </p>
        </footer>
      </div>
    </div>
  );
}
