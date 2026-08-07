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
  const isConnected = Boolean(walletDetails);

  return (
    <section className="card" id="wallet-section">
      <h2 className="card-title">Frontend Wallet Connection</h2>
      <p className="card-subtitle">@midnight-ntwrk/dapp-connector-api</p>

      <div className="status-grid">
        <div className="status-row">
          <span className="status-label">Target Network</span>
          <select
            className="inline-select"
            value={network}
            onChange={(e) => onNetworkChange(e.target.value as NetworkId)}
            id="network-select"
          >
            <option value="preprod">Preprod</option>
            <option value="preview">Preview</option>
            <option value="undeployed">Devnet (Local)</option>
          </select>
        </div>
        <div className="status-row">
          <span className="status-label">Wallet Provider</span>
          <strong className="status-value">
            {hasExtension ? providerName : 'No DApp Connector Found'}
          </strong>
        </div>
        <div className="status-row">
          <span className="status-label">Connection Status</span>
          <span className={`badge ${isConnected ? 'badge-green' : 'badge-gray'}`}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
        {walletDetails && (
          <>
            <div className="status-row">
              <span className="status-label">Connected Address</span>
              <strong className="status-value mono">{walletDetails.address}</strong>
            </div>
            <div className="status-row">
              <span className="status-label">Shielded Address</span>
              <strong className="status-value mono">
                {walletDetails.shieldedAddress || 'N/A'}
              </strong>
            </div>
            <div className="status-row">
              <span className="status-label">Unshielded Address</span>
              <strong className="status-value mono">
                {walletDetails.unshieldedAddress || 'N/A'}
              </strong>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="notice notice-error">{error}</div>
      )}

      <button
        className="form-btn"
        style={{ marginTop: '1.5rem' }}
        onClick={isConnected ? onDisconnect : onConnect}
        disabled={loading}
        id="wallet-action-btn"
      >
        {loading
          ? 'Connecting…'
          : isConnected
          ? 'Disconnect Wallet'
          : hasExtension
          ? 'Connect Wallet'
          : 'Install Lace / Midnight Wallet'}
      </button>

      <p className="notice">
        Connect your browser wallet extension (Lace or Midnight Wallet implementing{' '}
        <code>@midnight-ntwrk/dapp-connector-api</code>) to sign and execute
        escrow transactions.
      </p>
    </section>
  );
}
