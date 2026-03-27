import { useState, useEffect } from 'react';
import { Search, Download, Share2, Trophy, Settings, Loader2, MoreVertical } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Progress from '@radix-ui/react-progress';
import { usePsnData } from '../context/PsnDataContext';

interface TopBarProps {
  onShowAuth: () => void;
  onExport: (format: 'png' | 'jpeg') => void;
  onShare: () => void;
  isMobile?: boolean;
  onOpenSettings?: () => void;
}

export function TopBar({ onShowAuth, onExport, onShare, isMobile, onOpenSettings }: TopBarProps) {
  const { isAuthenticated, canSearch, isLoading, loadingProgress, loadProfile, profile, error } = usePsnData();
  const [psnInput, setPsnInput] = useState(profile.username);

  useEffect(() => {
    setPsnInput(profile.username);
  }, [profile.username]);

  const handleLoadProfile = () => {
    const username = psnInput.trim();
    if (username) {
      loadProfile(username);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoadProfile();
    }
  };

  const progressPercent = loadingProgress.total > 0
    ? (loadingProgress.loaded / loadingProgress.total) * 100
    : 0;

  if (isMobile) {
    return (
      <div className="bg-[#0D1221] border-b border-[#1E2740]">
        {/* Row 1: Logo + Action Icons */}
        <div className="px-4 py-2 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Trophy className="w-5 h-5 text-[#FFD700]" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))' }} />
            <h1 className="text-lg font-bold text-[#FFD700]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              PlatForge
            </h1>
          </div>

          {/* Right action icons */}
          <div className="flex items-center gap-1.5">
            {/* Share button — icon only */}
            <button
              onClick={onShare}
              className="w-10 h-10 flex items-center justify-center bg-[#12172A] border border-[#1E2740] rounded-lg hover:border-[#FFD700] transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>

            {/* Settings button — opens left panel / settings */}
            <button
              onClick={onOpenSettings}
              className="w-10 h-10 flex items-center justify-center bg-[#12172A] border border-[#1E2740] rounded-lg hover:border-[#FFD700] transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-[#8A9BB8]" />
            </button>

            {/* Overflow menu */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-[#12172A] border border-[#1E2740] rounded-lg hover:border-[#FFD700] transition-colors"
                  title="More options"
                >
                  <MoreVertical className="w-4 h-4 text-white" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[180px] bg-[#12172A] border border-[#1E2740] rounded-lg p-1.5 shadow-xl z-50"
                  sideOffset={5}
                  align="end"
                >
                  <DropdownMenu.Item
                    className="px-3 py-2 text-sm text-white rounded hover:bg-[#1E2740] cursor-pointer outline-none flex items-center gap-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    onSelect={() => onExport('png')}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export as PNG
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="px-3 py-2 text-sm text-white rounded hover:bg-[#1E2740] cursor-pointer outline-none flex items-center gap-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    onSelect={() => onExport('jpeg')}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export as JPEG
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-[#1E2740]" />
                  <DropdownMenu.Item
                    className={`px-3 py-2 text-sm rounded hover:bg-[#1E2740] cursor-pointer outline-none flex items-center gap-2 ${
                      isAuthenticated ? 'text-green-400' : 'text-[#8A9BB8]'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    onSelect={onShowAuth}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    {isAuthenticated ? 'PSN: Connected' : 'PSN Auth'}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Row 2: Search input + GO button */}
        <div className="px-4 pb-2 flex items-center gap-2 relative">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9BB8]" />
            <input
              type="text"
              placeholder="Enter PSN ID..."
              value={psnInput}
              onChange={(e) => setPsnInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full h-10 bg-[#12172A] border rounded-lg pl-9 pr-3 text-sm text-white placeholder-[#8A9BB8] focus:outline-none focus:border-[#FFD700] transition-colors ${
                error ? 'border-red-500/50' : 'border-[#1E2740]'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <button
            onClick={handleLoadProfile}
            disabled={isLoading || !canSearch}
            className="h-10 px-4 bg-[#FFD700] text-[#0A0E1A] rounded-lg text-sm font-bold hover:bg-[#FFE44D] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 flex-shrink-0"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'GO'}
          </button>
          {error && (
            <div className="absolute top-full left-4 right-4 mt-1 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg z-20">
              <p className="text-xs text-red-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isLoading && loadingProgress.total > 0 && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Loading trophies...
              </span>
              <span className="text-xs text-[#FFD700] font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {loadingProgress.loaded}/{loadingProgress.total}
              </span>
            </div>
            <Progress.Root className="relative h-1 bg-[#1E2740] rounded-full overflow-hidden">
              <Progress.Indicator
                className="h-full bg-[#FFD700] transition-transform duration-300"
                style={{
                  transform: `translateX(-${100 - progressPercent}%)`,
                  filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))'
                }}
              />
            </Progress.Root>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="bg-[#0D1221] border-b border-[#1E2740]">
      <div className="h-16 px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <Trophy className="w-6 h-6 text-[#FFD700]" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))' }} />
          </div>
          <h1 className="text-xl font-bold text-[#FFD700]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            PlatForge
          </h1>
        </div>

        {/* Center - PSN ID Input */}
        <div className="relative flex items-center justify-center gap-2 flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9BB8]" />
            <input
              type="text"
              placeholder="Enter PSN ID..."
              value={psnInput}
              onChange={(e) => setPsnInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-64 h-9 bg-[#12172A] border rounded-lg pl-9 pr-3 text-sm text-white placeholder-[#8A9BB8] focus:outline-none focus:border-[#FFD700] transition-colors ${
                error ? 'border-red-500/50' : 'border-[#1E2740]'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <button
            onClick={handleLoadProfile}
            disabled={isLoading || !canSearch}
            className="h-9 px-5 bg-[#FFD700] text-[#0A0E1A] rounded-lg text-sm font-semibold hover:bg-[#FFE44D] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Load Profile
          </button>
          {error && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg max-w-md z-20">
              <p className="text-xs text-red-400 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Right - Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Auth settings */}
          <button
            onClick={onShowAuth}
            className={`h-9 px-3 border text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
              isAuthenticated
                ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:border-green-400'
                : 'bg-[#12172A] border-[#1E2740] text-[#8A9BB8] hover:border-[#FFD700]'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
            title={isAuthenticated ? 'Connected to PSN' : 'PSN account settings'}
          >
            <Settings className="w-3.5 h-3.5" />
            {isAuthenticated ? 'Connected' : 'PSN'}
          </button>

          {/* Templates, Year Review, and Compare buttons hidden for now */}

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="h-9 px-3 bg-[#12172A] border border-[#1E2740] text-white text-sm rounded-lg hover:border-[#FFD700] transition-colors flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[180px] bg-[#12172A] border border-[#1E2740] rounded-lg p-1.5 shadow-xl z-50"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  className="px-3 py-2 text-sm text-white rounded hover:bg-[#1E2740] cursor-pointer outline-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  onSelect={() => onExport('png')}
                >
                  Export as PNG
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="px-3 py-2 text-sm text-white rounded hover:bg-[#1E2740] cursor-pointer outline-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  onSelect={() => onExport('jpeg')}
                >
                  Export as JPEG
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <button
            onClick={onShare}
            className="h-9 px-3 bg-[#12172A] border border-[#1E2740] text-white text-sm rounded-lg hover:border-[#FFD700] transition-colors flex items-center gap-1.5"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>

          {/* Save button hidden for now */}
        </div>
      </div>

      {/* Progress Bar — only visible while loading */}
      {isLoading && loadingProgress.total > 0 && (
        <div className="px-6 pb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#8A9BB8]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Loading trophies...
            </span>
            <span className="text-xs text-[#FFD700] font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {loadingProgress.loaded}/{loadingProgress.total}
            </span>
          </div>
          <Progress.Root className="relative h-1 bg-[#1E2740] rounded-full overflow-hidden">
            <Progress.Indicator
              className="h-full bg-[#FFD700] transition-transform duration-300"
              style={{
                transform: `translateX(-${100 - progressPercent}%)`,
                filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))'
              }}
            />
          </Progress.Root>
        </div>
      )}
    </div>
  );
}
