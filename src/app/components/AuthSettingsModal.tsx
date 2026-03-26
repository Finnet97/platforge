import { useState } from 'react';
import { X, Gamepad2, CheckCircle2, AlertCircle, Loader2, LogOut, Key, ExternalLink, Copy, ArrowRight } from 'lucide-react';
import { usePsnData } from '../context/PsnDataContext';

interface AuthSettingsModalProps {
  onClose: () => void;
}

type Step = 'intro' | 'token';

const SONY_LOGIN_URL = 'https://store.playstation.com/';
const NPSSO_URL = 'https://ca.account.sony.com/api/v1/ssocookie';

export function AuthSettingsModal({ onClose }: AuthSettingsModalProps) {
  const {
    isAuthenticated,
    submitNpsso,
    logout,
    error: contextError,
  } = usePsnData();

  const [step, setStep] = useState<Step>('intro');
  const [npssoInput, setNpssoInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError || contextError;

  const handleNpssoSubmit = async () => {
    // Try to extract npsso value if user pasted the full JSON
    let token = npssoInput.trim();
    const jsonMatch = token.match(/"npsso"\s*:\s*"([^"]+)"/);
    if (jsonMatch) {
      token = jsonMatch[1];
    }

    if (!token) return;

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await submitNpsso(token);
      setNpssoInput('');
    } catch (err: any) {
      setLocalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocalError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting && npssoInput.trim()) handleNpssoSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#0D1221] border border-[#1E2740] rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2740]">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-5 h-5 text-[#FFD700]" />
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              PlayStation Network
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#12172A] transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Connected State */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 p-4 rounded-xl border bg-green-500/5 border-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Connected to PlayStation Network
                </p>
                <p className="text-xs text-[#8A9BB8] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  You can now load any PSN profile
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <LogOut className="w-3 h-3" />
                Disconnect
              </button>
            </div>
          )}

          {/* Step 1: Intro — Instructions */}
          {!isAuthenticated && step === 'intro' && (
            <div className="space-y-4">
              {/* Explanation */}
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-[#12172A] border-[#1E2740]">
                <Key className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Connect via NPSSO Token
                  </p>
                  <p className="text-xs text-[#8A9BB8] mt-1 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    PlatForge works without login for public profiles. Connect your own PSN account only if you need to access private profiles. This is a one-time process that takes about 30 seconds.
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FFD700] text-[#0A0E1A] flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <p className="text-sm text-white flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Sign in to your PlayStation account
                  </p>
                  <a
                    href={SONY_LOGIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#FFD700] border border-[#FFD700]/30 rounded-lg hover:bg-[#FFD700]/10 transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Open
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FFD700] text-[#0A0E1A] flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <p className="text-sm text-white flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Open the token page and copy the value
                  </p>
                  <a
                    href={NPSSO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#FFD700] border border-[#FFD700]/30 rounded-lg hover:bg-[#FFD700]/10 transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Open
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FFD700] text-[#0A0E1A] flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <p className="text-sm text-white flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Paste the token below
                  </p>
                </div>
              </div>

              {/* Continue button */}
              <button
                onClick={() => { setStep('token'); setLocalError(null); }}
                className="w-full h-11 bg-[#FFD700] text-[#0A0E1A] rounded-lg text-sm font-semibold hover:bg-[#FFE44D] transition-colors flex items-center justify-center gap-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                I have my token
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Info */}
              <p className="text-[10px] text-[#8A9BB8] text-center leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                The token page will show something like {"{"}"npsso":"abc123..."{"}"}.<br />
                You can paste the full JSON or just the token value.
              </p>
            </div>
          )}

          {/* Step 2: Token Input */}
          {!isAuthenticated && step === 'token' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-[#12172A] border-[#1E2740]">
                <Copy className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Paste your NPSSO token
                  </p>
                  <p className="text-xs text-[#8A9BB8] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    From{' '}
                    <a
                      href={NPSSO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FFD700] hover:underline"
                    >
                      ca.account.sony.com/api/v1/ssocookie
                    </a>
                  </p>
                </div>
              </div>

              <textarea
                value={npssoInput}
                onChange={(e) => setNpssoInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='{"npsso":"paste_your_token_here"}'
                rows={3}
                autoFocus
                className="w-full bg-[#0A0E1A] border border-[#1E2740] rounded-lg p-3 text-sm text-white placeholder-[#8A9BB8] focus:outline-none focus:border-[#FFD700] transition-colors resize-none font-mono"
              />

              {/* Error */}
              {displayError && (
                <div className="flex items-center gap-2 text-red-400 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {displayError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('intro'); setLocalError(null); }}
                  className="flex-1 h-11 bg-[#12172A] border border-[#1E2740] text-white rounded-lg text-sm hover:border-[#FFD700] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Back
                </button>
                <button
                  onClick={handleNpssoSubmit}
                  disabled={isSubmitting || !npssoInput.trim()}
                  className="flex-1 h-11 bg-[#FFD700] text-[#0A0E1A] rounded-lg text-sm font-semibold hover:bg-[#FFE44D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Security note */}
          <p className="text-[10px] text-[#8A9BB8] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            Your token is used only to authenticate and is never stored permanently. Connecting is optional — public profiles can be viewed without it.
          </p>
        </div>
      </div>
    </div>
  );
}
