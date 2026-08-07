import type { WalletDetails, NetworkId } from '../types';

interface NavBarProps {
  walletDetails: WalletDetails | null;
  walletLoading: boolean;
  hasExtension: boolean;
  network: NetworkId;
  onNetworkChange: (n: NetworkId) => void;
  onWalletAction: () => void;
}

export default function NavBar({
  walletDetails,
  walletLoading,
  onWalletAction,
}: NavBarProps) {
  const isConnected = Boolean(walletDetails);

  return (
    <header className="navbar-container">
      {/* Left: Brand Logo */}
      <a href="#" className="nav-logo">
        Escrow<sup>®</sup>
      </a>

      {/* Center: Nav Links */}
      <ul className="nav-links">
        <li><a href="#workspace" className="nav-link">Protocol</a></li>
        <li><a href="#workspace" className="nav-link">Collections</a></li>
        <li><a href="#escrow-status" className="nav-link">Escrow Status</a></li>
        <li><a href="#wallet-section" className="nav-link">Wallet</a></li>
      </ul>

      {/* Right: Pill CTA */}
      <button
        className="pill-btn pill-btn-sm"
        onClick={onWalletAction}
        disabled={walletLoading}
        id="nav-connect-btn"
      >
        {walletLoading ? 'Connecting…' : isConnected ? 'Disconnect' : 'Find my dream'}
      </button>
    </header>
  );
}
