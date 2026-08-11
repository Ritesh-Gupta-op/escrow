import type { WalletDetails } from '../types';

interface RefundProps {
  walletDetails: WalletDetails | null;
  loading: boolean;
  onSubmit: (data: { buyer: string; walletAddress: string; shieldedAddress: string; unshieldedAddress: string; rdns: string; }) => Promise<void>;
}

export default function RefundEscrowForm({ walletDetails, loading, onSubmit }: RefundProps) {
  const handle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!walletDetails) { alert('Connect your wallet first.'); return; }
    const fd = new FormData(e.currentTarget);
    await onSubmit({
      buyer:            fd.get('buyer') as string,
      walletAddress:    walletDetails.address,
      shieldedAddress:  walletDetails.shieldedAddress,
      unshieldedAddress:walletDetails.unshieldedAddress,
      rdns:             walletDetails.rdns,
    });
    e.currentTarget.reset();
  };

  return (
    <>
      <div className="card-label">Buyer Action</div>
      <div className="card-title" style={{ fontSize: 18, marginBottom: 6 }}>Refund Escrow</div>
      <div className="card-subtitle" style={{ fontSize: 13 }}>Buyer proves knowledge of secret to recover their funds.</div>
      <form onSubmit={handle} className="form-stack" style={{ marginTop: 16 }} id="refund-form">
        <div className="form-group">
          <label className="form-label">Buyer Secret</label>
          <input name="buyer" type="password" autoComplete="current-password" required minLength={12}
            placeholder="Enter buyer secret" className="form-input" />
        </div>
        <button type="submit" className="form-cta" disabled={loading || !walletDetails} id="refund-submit"
          style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}>
          {loading ? '⟳ Processing…' : '↩ Refund Escrow'}
        </button>
      </form>
    </>
  );
}
