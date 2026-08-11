import type { WalletDetails } from '../types';

interface ReleaseProps {
  walletDetails: WalletDetails | null;
  loading: boolean;
  onSubmit: (data: { seller: string; walletAddress: string; shieldedAddress: string; unshieldedAddress: string; rdns: string; }) => Promise<void>;
}

export default function ReleaseEscrowForm({ walletDetails, loading, onSubmit }: ReleaseProps) {
  const handle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!walletDetails) { alert('Connect your wallet first.'); return; }
    const fd = new FormData(e.currentTarget);
    await onSubmit({
      seller:           fd.get('seller') as string,
      walletAddress:    walletDetails.address,
      shieldedAddress:  walletDetails.shieldedAddress,
      unshieldedAddress:walletDetails.unshieldedAddress,
      rdns:             walletDetails.rdns,
    });
    e.currentTarget.reset();
  };

  return (
    <>
      <div className="card-label">Seller Action</div>
      <div className="card-title" style={{ fontSize: 18, marginBottom: 6 }}>Release Funds</div>
      <div className="card-subtitle" style={{ fontSize: 13 }}>Seller proves knowledge of secret to release escrow to seller.</div>
      <form onSubmit={handle} className="form-stack" style={{ marginTop: 16 }} id="release-form">
        <div className="form-group">
          <label className="form-label">Seller Secret</label>
          <input name="seller" type="password" autoComplete="current-password" required minLength={12}
            placeholder="Enter seller secret" className="form-input" />
        </div>
        <button type="submit" className="form-cta" disabled={loading || !walletDetails} id="release-submit"
          style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
          {loading ? '⟳ Processing…' : '↑ Release Escrow'}
        </button>
      </form>
    </>
  );
}
