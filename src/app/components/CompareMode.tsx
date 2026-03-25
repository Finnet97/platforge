import { X, Search, Trophy, Star, TrendingUp, Award } from 'lucide-react';
import { usePsnData } from '../context/PsnDataContext';
import { mockTrophies } from '../data/mockData';

interface CompareModeProps {
  onClose: () => void;
}

export function CompareMode({ onClose }: CompareModeProps) {
  const { trophies, profile } = usePsnData();

  const avgRarity1 = trophies.length > 0
    ? trophies.reduce((sum, t) => sum + t.rarity, 0) / trophies.length
    : 0;

  const user1 = {
    username: profile.username,
    totalPlatinums: profile.totalPlatinums,
    rarestPlatinum: profile.rarestPlatinum,
    avgRarity: Math.round(avgRarity1 * 10) / 10,
    trophies: trophies.slice(0, 16)
  };

  const user2 = {
    username: "GamerPro_2024",
    totalPlatinums: 98,
    rarestPlatinum: mockTrophies[12], // Returnal
    avgRarity: 12.3,
    trophies: mockTrophies.slice(3, 19)
  };

  // Find common platinums
  const commonTrophies = user1.trophies.filter(t1 =>
    user2.trophies.some(t2 => t2.gameTitle === t1.gameTitle)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0D1221] border border-[#1E2740] rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#1E2740]">
          <h2 className="text-2xl font-bold text-[#FFD700]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Compare Trophy Collections
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#12172A] transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* User Inputs */}
          <div className="grid grid-cols-2 gap-5 mb-8">
            {/* User 1 Input */}
            <div className="bg-[#12172A] border border-[#1E2740] rounded-xl p-5">
              <label className="text-xs text-[#8A9BB8] mb-2 block font-semibold uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                Player 1 PSN ID
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9BB8]" />
                <input
                  type="text"
                  defaultValue={user1.username}
                  className="w-full h-11 bg-[#0A0E1A] border border-[#1E2740] rounded-lg pl-10 pr-4 text-sm text-white placeholder-[#8A9BB8] focus:outline-none focus:border-[#FFD700] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            {/* User 2 Input */}
            <div className="bg-[#12172A] border border-[#1E2740] rounded-xl p-5">
              <label className="text-xs text-[#8A9BB8] mb-2 block font-semibold uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                Player 2 PSN ID
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9BB8]" />
                <input
                  type="text"
                  defaultValue={user2.username}
                  className="w-full h-11 bg-[#0A0E1A] border border-[#1E2740] rounded-lg pl-10 pr-4 text-sm text-white placeholder-[#8A9BB8] focus:outline-none focus:border-[#FFD700] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>
          </div>

          {/* Mosaics Side by Side */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* User 1 Mosaic */}
            <div className="bg-[#12172A] border border-[#1E2740] rounded-xl p-5">
              <div className="text-center mb-5">
                <h3 className="text-xl font-bold text-white mb-1 leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {user1.username}
                </h3>
                <p className="text-sm text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {user1.totalPlatinums} Platinums
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {user1.trophies.map((trophy) => (
                  <div
                    key={trophy.id}
                    className="aspect-square rounded-lg overflow-hidden border border-[#1E2740] hover:border-[#FFD700] transition-colors"
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

            {/* User 2 Mosaic */}
            <div className="bg-[#12172A] border border-[#1E2740] rounded-xl p-5">
              <div className="text-center mb-5">
                <h3 className="text-xl font-bold text-white mb-1 leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {user2.username}
                </h3>
                <p className="text-sm text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {user2.totalPlatinums} Platinums
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {user2.trophies.map((trophy) => (
                  <div
                    key={trophy.id}
                    className="aspect-square rounded-lg overflow-hidden border border-[#1E2740] hover:border-[#FFD700] transition-colors"
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

          {/* Comparison Stats */}
          <div className="bg-[#12172A] border border-[#1E2740] rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-5" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Stats Comparison
            </h3>
            
            <div className="space-y-5">
              {/* Total Platinums */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-5 items-center">
                <div className="text-right">
                  <span className="text-3xl font-bold text-[#FFD700]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {user1.totalPlatinums}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#8A9BB8] min-w-[140px] justify-center">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Total Platinums
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-3xl font-bold text-[#C0C0C0]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {user2.totalPlatinums}
                  </span>
                </div>
              </div>

              {/* Rarest */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-5 items-center">
                <div className="text-right">
                  <span className="text-3xl font-bold text-[#FFD700]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {user1.rarestPlatinum?.rarity ?? 0}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#8A9BB8] min-w-[140px] justify-center">
                  <Star className="w-4 h-4" />
                  <span className="text-xs whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Rarest Platinum
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-3xl font-bold text-[#C0C0C0]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {user2.rarestPlatinum.rarity}%
                  </span>
                </div>
              </div>

              {/* Average Rarity */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-5 items-center">
                <div className="text-right">
                  <span className="text-3xl font-bold text-[#FFD700]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {user1.avgRarity}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#8A9BB8] min-w-[140px] justify-center">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Average Rarity
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-3xl font-bold text-[#C0C0C0]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {user2.avgRarity}%
                  </span>
                </div>
              </div>

              {/* Common Platinums */}
              <div className="pt-3 border-t border-[#1E2740]">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-[#8A9BB8] mb-2">
                    <Award className="w-4 h-4" />
                    <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Common Platinums
                    </span>
                  </div>
                  <span className="text-4xl font-bold text-[#FFD700]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {commonTrophies.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Common Platinums Section */}
          <div className="bg-[#12172A] border border-[#1E2740] rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-5" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Shared Platinums
            </h3>
            
            <div className="grid grid-cols-6 gap-3">
              {commonTrophies.map((trophy) => (
                <div
                  key={trophy.id}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-[#FFD700]"
                  style={{ boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)' }}
                >
                  <img
                    src={trophy.imageUrl}
                    alt={trophy.gameTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center">
                    <Award className="w-3.5 h-3.5 text-[#0A0E1A]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}