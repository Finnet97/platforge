import { X, Trophy, Calendar, Zap, Star, Gamepad2 } from 'lucide-react';
import { usePsnData } from '../context/PsnDataContext';

interface YearInReviewCardProps {
  onClose: () => void;
}

function getMostActiveMonth(trophies: { dateEarned: string }[]): string {
  if (trophies.length === 0) return '--';
  const months: Record<string, number> = {};
  for (const t of trophies) {
    const month = t.dateEarned.split(' ')[0];
    months[month] = (months[month] || 0) + 1;
  }
  return Object.entries(months).sort((a, b) => b[1] - a[1])[0][0];
}

function getFastestPlatinum(trophies: { timeToPlatinum: string }[]): string {
  let fastest = Infinity;
  let fastestStr = '--';
  for (const t of trophies) {
    if (t.timeToPlatinum === '--') continue;
    const hours = t.timeToPlatinum.match(/(\d+)h/);
    const minutes = t.timeToPlatinum.match(/(\d+)m/);
    const total = (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
    if (total < fastest) {
      fastest = total;
      fastestStr = t.timeToPlatinum;
    }
  }
  return fastestStr;
}

function getTopPlatform(trophies: { platform: string }[]): string {
  if (trophies.length === 0) return '--';
  const platforms: Record<string, number> = {};
  for (const t of trophies) {
    platforms[t.platform] = (platforms[t.platform] || 0) + 1;
  }
  return Object.entries(platforms).sort((a, b) => b[1] - a[1])[0][0];
}

export function YearInReviewCard({ onClose }: YearInReviewCardProps) {
  const { trophies, profile } = usePsnData();
  const currentYear = new Date().getFullYear().toString();
  const yearTrophies = trophies.filter(t => t.dateEarned.includes(currentYear));

  const mostActiveMonth = getMostActiveMonth(yearTrophies);
  const fastestPlatinum = getFastestPlatinum(yearTrophies);
  const rarestTrophy = yearTrophies.length > 0
    ? Math.min(...yearTrophies.map(t => t.rarity))
    : 0;
  const topPlatform = getTopPlatform(yearTrophies);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-[540px] h-[960px] bg-gradient-to-br from-[#0A0E1A] via-[#1A1047] to-[#0A0E1A] rounded-3xl overflow-hidden shadow-2xl border border-[#1E2740]">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #FFD700 2px, transparent 2px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors border border-[#1E2740]"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-between p-10">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-block px-4 py-1.5 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full">
              <span className="text-xs text-[#FFD700] uppercase tracking-widest font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                Your Trophy Journey
              </span>
            </div>
            <h1 className="text-6xl font-bold text-[#FFD700] leading-none" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}>
              {currentYear}
            </h1>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              PLATINUM WRAPPED
            </h2>
          </div>

          {/* Main Stats */}
          <div className="w-full space-y-6">
            {/* Total Platinums */}
            <div className="text-center">
              <Trophy className="w-14 h-14 text-[#FFD700] mx-auto mb-3" style={{ filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))' }} />
              <div className="text-7xl font-bold text-white mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {yearTrophies.length}
              </div>
              <div className="text-lg text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Platinum Trophies
              </div>
            </div>

            {/* Trophy Mosaic Strip */}
            <div className="relative">
              <div className="flex gap-2.5 overflow-x-auto pb-3 px-2 scrollbar-hide">
                <div className="flex gap-2.5">
                  {yearTrophies.map((trophy) => (
                    <div
                      key={trophy.id}
                      className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-[#FFD700]/30"
                      style={{ boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)' }}
                    >
                      <img
                        src={trophy.imageUrl}
                        alt={trophy.gameTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#12172A]/80 backdrop-blur-sm border border-[#1E2740] rounded-xl p-5">
                <Calendar className="w-7 h-7 text-[#FFD700] mb-2" />
                <div className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {mostActiveMonth}
                </div>
                <div className="text-xs text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Most Active Month
                </div>
              </div>

              <div className="bg-[#12172A]/80 backdrop-blur-sm border border-[#1E2740] rounded-xl p-5">
                <Zap className="w-7 h-7 text-[#FFD700] mb-2" />
                <div className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {fastestPlatinum}
                </div>
                <div className="text-xs text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Fastest Platinum
                </div>
              </div>

              <div className="bg-[#12172A]/80 backdrop-blur-sm border border-[#1E2740] rounded-xl p-5">
                <Star className="w-7 h-7 text-[#FFD700] mb-2" />
                <div className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {rarestTrophy}%
                </div>
                <div className="text-xs text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Rarest Trophy
                </div>
              </div>

              <div className="bg-[#12172A]/80 backdrop-blur-sm border border-[#1E2740] rounded-xl p-5">
                <Gamepad2 className="w-7 h-7 text-[#FFD700] mb-2" />
                <div className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {topPlatform}
                </div>
                <div className="text-xs text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Top Platform
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-[#FFD700]" />
              <span className="text-lg font-bold text-[#FFD700]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                PlatForge
              </span>
            </div>
            <div className="text-sm text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {profile.username}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}