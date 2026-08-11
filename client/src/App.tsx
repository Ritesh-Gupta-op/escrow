import { useState, useCallback, useRef } from 'react';
import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import WalletCard from './components/WalletCard';
import EscrowStatusCard from './components/EscrowStatusCard';
import CreateEscrowForm from './components/CreateEscrowForm';
import ReleaseEscrowForm from './components/ReleaseEscrowForm';
import RefundEscrowForm from './components/RefundEscrowForm';
import ResponsePanel from './components/ResponsePanel';
import { useWallet } from './hooks/useWallet';
import { useEscrow } from './hooks/useEscrow';
import type { NetworkId } from './types';
import './index.css';

export default function App() {
  const [network, setNetwork] = useState<NetworkId>('preprod');
  const [activeTab, setActiveTab] = useState<'create' | 'release' | 'refund'>('create');
  const appRef = useRef<HTMLDivElement>(null);

  const {
    walletDetails, hasExtension, primaryProvider,
    loading: walletLoading, error: walletError,
    setError: setWalletError, connect, disconnect,
  } = useWallet();

  const {
    escrowState, response, loading: escrowLoading,
    refresh, createEscrow, releaseEscrow, refundEscrow,
  } = useEscrow();

  const handleWalletAction = useCallback(async () => {
    setWalletError(null);
    try {
      if (walletDetails) await disconnect();
      else await connect(network);
    } catch { /* surfaced via hook */ }
  }, [walletDetails, connect, disconnect, network, setWalletError]);

  const scrollToApp = () => appRef.current?.scrollIntoView({ behavior: 'smooth' });

  const busy = walletLoading || escrowLoading;
  const isConnected = Boolean(walletDetails);

  return (
    <>
      {/* ── CINEMATIC HERO ── */}
      <div className="hero-viewport">
        <video autoPlay loop muted playsInline className="video-bg">
          <source src="https://designerstephen.github.io/public-assets/videos/serene-art-hero.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay" />

        <NavBar
          walletDetails={walletDetails}
          walletLoading={walletLoading}
          hasExtension={hasExtension}
          network={network}
          onWalletAction={handleWalletAction}
        />

        <HeroSection onCTAClick={scrollToApp} />

        <div className="scroll-hint" onClick={scrollToApp}>
          <span>Scroll</span>
          <div className="scroll-hint-line" />
        </div>
      </div>

      {/* ── APP SHELL ── */}
      <div className="app-shell" id="app" ref={appRef}>
        <div className="app-inner">

          {/* Section Header */}
          <div className="mb-32" style={{ marginBottom: 40 }}>
            <div className="section-eyebrow">Escrow Protocol</div>
            <h2 className="section-title">Control Center</h2>
            <p className="section-desc">
              Execute zero-knowledge circuit transactions. Your secrets are hashed locally and never transmitted in plaintext.
            </p>
          </div>

          {/* Row 1: Wallet + Status */}
          <div className="grid grid-2" style={{ marginBottom: 20 }}>
            <WalletCard
              walletDetails={walletDetails}
              hasExtension={hasExtension}
              providerName={primaryProvider?.name ?? 'Detecting…'}
              loading={walletLoading}
              error={walletError}
              network={network}
              onNetworkChange={setNetwork}
              onConnect={() => connect(network)}
              onDisconnect={disconnect}
            />
            <EscrowStatusCard state={escrowState} onRefresh={refresh} />
          </div>

          {/* Row 2: Action Panel + Terminal */}
          <div className="grid grid-2">
            {/* Left: Tab-switched Action Panel */}
            <div className="card">
              <div className="flex items-center justify-between mb-20" style={{ marginBottom: 24 }}>
                <div className="card-label">Actions</div>
                {!isConnected && (
                  <span className="badge badge--gray">Wallet required</span>
                )}
              </div>

              {/* Tab switcher */}
              <div className="tabs" style={{ marginBottom: 28 }}>
                {(['create', 'release', 'refund'] as const).map((t) => (
                  <button
                    key={t}
                    className={`tab-btn ${activeTab === t ? 'active' : ''}`}
                    onClick={() => setActiveTab(t)}
                  >
                    {t === 'create' ? '＋ Create' : t === 'release' ? '↑ Release' : '↩ Refund'}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === 'create' && (
                <CreateEscrowForm walletDetails={walletDetails} loading={busy} onSubmit={createEscrow} />
              )}
              {activeTab === 'release' && (
                <ReleaseEscrowForm walletDetails={walletDetails} loading={busy} onSubmit={releaseEscrow} />
              )}
              {activeTab === 'refund' && (
                <RefundEscrowForm walletDetails={walletDetails} loading={busy} onSubmit={refundEscrow} />
              )}
            </div>

            {/* Right: Terminal + How-it-works */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <ResponsePanel response={response} />

              {/* Feature list */}
              <div className="card">
                <div className="card-label">Protocol Properties</div>
                <div className="kv-list" style={{ marginTop: 12 }}>
                  {[
                    { icon: '🔒', t: 'Zero-Knowledge Proofs', d: 'Secrets verified without disclosure' },
                    { icon: '⬡', t: 'Midnight Network', d: 'Privacy-native L1 blockchain' },
                    { icon: '📄', t: 'Compact Circuit', d: 'Formally verified ZK escrow logic' },
                    { icon: '🔑', t: 'Local Key Hashing', d: 'SHA-256 before any network call' },
                  ].map(({ icon, t, d }) => (
                    <div key={t} className="kv-row" style={{ alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{t}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer" style={{ marginTop: 64, padding: '24px 0' }}>
            <span className="footer-brand">Escrow®</span>
            <span>Powered by Midnight Network · Zero-Knowledge Privacy Protocol</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </>
  );
}
