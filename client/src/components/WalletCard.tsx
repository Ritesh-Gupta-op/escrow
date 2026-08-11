import type { WalletDetails, NetworkId } from '../types';

interface WalletCardProps {
  walletDetails: WalletDetails | null;
  hasExtension: boolean;
  providerName: string;
  loading: boolean;
  error: string | null;
  network: NetworkId;
  onNetworkChange: (n: NetworkId) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletCard({
  walletDetails,
  hasExtension,
  providerName,
  loading,
  error,
  network,
  onNetworkChange,
  onConnect,
  onDisconnect,
}: WalletCardProps) {
  const connected = Boolean(walletDetails);

  return (
    <div className="card card-gold" id="wallet-section">
      <div className="card-label">Wallet Connection</div>

      <div className="wallet-panel">
        {/* Left: indicator */}
        <div className="wallet-indicator">
          <div className="wallet-orb">
            {connected ? '⬡' : '○'}
            {connected && <div className="wallet-orb-ring" />}
          </div>
          <div>
            <div className="wallet-name">
              {connected ? walletDetails!.name : hasExtension ? providerName : 'No Extension Found'}
            </div>
            <div className="wallet-addr">
              {connected
                ? (walletDetails!.shieldedAddress || walletDetails!.address).slice(0, 24) + '…'
                : 'Install Lace or Midnight Wallet to continue'}
            </div>
          </div>
        </div>

        {/* Right: controls */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <div className="flex items-center gap-8">
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Network</span>
            <select
              className="inline-select"
              value={network}
              onChange={(e) => onNetworkChange(e.target.value as NetworkId)}
              id="network-select"
            >
              <option value="preprod">Preprod</option>
              <option value="preview">Preview</option>
              <option value="undeployed">Local Devnet</option>
            </select>
          </div>

          <button
            className={`btn ${connected ? 'btn-ghost' : 'btn-violet'}`}
            style={{ minWidth: 160 }}
            onClick={connected ? onDisconnect : onConnect}
            disabled={loading}
            id="wallet-action-btn"
          >
            {loading ? 'Connecting…' : connected ? 'Disconnect' : hasExtension ? 'Connect Wallet' : 'Install Extension'}
          </button>
        </div>
      </div>

      {/* Detail rows when connected */}
      {connected && (
        <div className="kv-list mt-20" style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <div className="kv-row">
            <span className="kv-key">Network</span>
            <span className="badge badge--violet">{walletDetails!.network}</span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Shielded Address</span>
            <span className="kv-val kv-mono">{walletDetails!.shieldedAddress || 'N/A'}</span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Unshielded Address</span>
            <span className="kv-val kv-mono">{walletDetails!.unshieldedAddress || 'N/A'}</span>
          </div>
        </div>
      )}

      {error && <div className="notice notice--error" style={{ marginTop: 16 }}>{error}</div>}

      {!connected && (
        <div className="notice notice--info" style={{ marginTop: 16 }}>
          Connect using <code>@midnight-ntwrk/dapp-connector-api</code> (Lace or Midnight Wallet extension).
        </div>
      )}
    </div>
  );
}
