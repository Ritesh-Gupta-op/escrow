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
  const workspaceRef = useRef<HTMLElement>(null);

  const {
    walletDetails,
    hasExtension,
    primaryProvider,
    loading: walletLoading,
    error: walletError,
    setError: setWalletError,
    connect,
    disconnect,
  } = useWallet();

  const {
    escrowState,
    response,
    loading: escrowLoading,
    createEscrow,
    releaseEscrow,
    refundEscrow,
  } = useEscrow();

  const handleWalletAction = useCallback(async () => {
    setWalletError(null);
    try {
      if (walletDetails) {
        await disconnect();
      } else {
        await connect(network);
      }
    } catch { /* errors surfaced via hook */ }
  }, [walletDetails, connect, disconnect, network, setWalletError]);

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isLoading = walletLoading || escrowLoading;

  return (
    <>
      {/* ── Hero Viewport ─────────────────────── */}
      <div className="hero-viewport">
        <video autoPlay loop muted playsInline className="video-bg">
          <source
            src="https://designerstephen.github.io/public-assets/videos/serene-art-hero.mp4"
            type="video/mp4"
          />
        </video>
        <div className="video-overlay" />

        <NavBar
          walletDetails={walletDetails}
          walletLoading={walletLoading}
          hasExtension={hasExtension}
          network={network}
          onNetworkChange={setNetwork}
          onWalletAction={handleWalletAction}
        />

        <HeroSection onCTAClick={scrollToWorkspace} />
      </div>

      {/* ── Escrow DApp Workspace ─────────────── */}
      <section className="dapp-workspace" id="workspace" ref={workspaceRef}>
        <div className="workspace-inner">
          <h2 className="section-heading">Escrow Control Center</h2>
          <p className="section-subhead">
            Connect your browser wallet via{' '}
            <code style={{ fontFamily: 'monospace', color: '#a78bfa' }}>
              @midnight-ntwrk/dapp-connector-api
            </code>{' '}
            to execute zero-knowledge circuit transactions.
          </p>

          {/* Row 1: Status + Response */}
          <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
            <EscrowStatusCard state={escrowState} />
            <ResponsePanel response={response} />
          </div>

          {/* Row 2: Wallet Connection (full width) */}
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

          {/* Row 3: Create Form + Release & Refund */}
          <div
            className="grid grid-2"
            style={{ marginTop: '1.5rem' }}
          >
            <CreateEscrowForm
              walletDetails={walletDetails}
              loading={isLoading}
              onSubmit={createEscrow}
            />

            <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <ReleaseEscrowForm
                walletDetails={walletDetails}
                loading={isLoading}
                onSubmit={releaseEscrow}
              />
              <hr style={{ borderColor: 'rgba(255,255,255,0.07)', borderTop: 'none' }} />
              <RefundEscrowForm
                walletDetails={walletDetails}
                loading={isLoading}
                onSubmit={refundEscrow}
              />
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
