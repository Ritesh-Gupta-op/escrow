import type { WalletDetails, NetworkId } from '../types';

interface NavBarProps {
  walletDetails: WalletDetails | null;
  walletLoading: boolean;
  hasExtension: boolean;
  network: NetworkId;
  onWalletAction: () => void;
}

export default function NavBar({ walletDetails, walletLoading, network, onWalletAction }: NavBarProps) {
  const isConnected = Boolean(walletDetails);

  return (
    <nav className="navbar anim-fade d0">
      {/* Left — Logo */}
      <a href="#" className="nav-logo">
        Escrow<sup>®</sup>
      </a>

      {/* Center — Links */}
      <ul className="nav-links">
        {['Protocol', 'Create', 'Release', 'Status'].map((l) => (
          <li key={l}>
            <a href="#app" className="nav-link">{l}</a>
          </li>
        ))}
      </ul>

      {/* Right — Network + Wallet */}
      <div className="nav-right">
        <span className="nav-net-badge">{network}</span>
        <button
          className={`btn ${isConnected ? 'btn-ghost' : 'btn-primary'}`}
          onClick={onWalletAction}
          disabled={walletLoading}
          id="nav-wallet-btn"
        >
          {walletLoading ? '…' : isConnected ? '⬡ Connected' : 'Connect Wallet'}
        </button>
      </div>
    </nav>
  );
}
