import { useRef } from 'react';
import type { WalletDetails } from '../types';

interface CreateEscrowFormProps {
  walletDetails: WalletDetails | null;
  loading: boolean;
  onSubmit: (data: {
    buyer: string; seller: string; amount: string; terms: string;
    walletAddress: string; shieldedAddress: string; unshieldedAddress: string; rdns: string;
  }) => Promise<void>;
}

export default function CreateEscrowForm({ walletDetails, loading, onSubmit }: CreateEscrowFormProps) {
  const ref = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletDetails) { alert('Connect your wallet first.'); return; }
    if (!ref.current) return;
    const fd = new FormData(ref.current);
    await onSubmit({
      buyer:            fd.get('buyer') as string,
      seller:           fd.get('seller') as string,
      amount:           fd.get('amount') as string,
      terms:            fd.get('terms') as string,
      walletAddress:    walletDetails.address,
      shieldedAddress:  walletDetails.shieldedAddress,
      unshieldedAddress:walletDetails.unshieldedAddress,
      rdns:             walletDetails.rdns,
    });
    ref.current?.reset();
  };

  return (
    <>
      <div className="card-title" style={{ fontSize: 20, marginBottom: 4 }}>Create Agreement</div>
      <div className="card-subtitle">Secrets are SHA-256 hashed locally — never sent in plaintext.</div>

      <form ref={ref} onSubmit={handleSubmit} className="form-stack" style={{ marginTop: 16 }} id="create-form">
        <div className="form-group">
          <label className="form-label">Buyer Secret</label>
          <input name="buyer" type="password" autoComplete="new-password" required minLength={12}
            placeholder="Min. 12 characters" className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Seller Secret</label>
          <input name="seller" type="password" autoComplete="new-password" required minLength={12}
            placeholder="Min. 12 characters" className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Amount (tDUST)</label>
          <input name="amount" type="number" min={1} step={1} defaultValue={100}
            required className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Agreement Terms <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-dim)' }}>(private)</span></label>
          <textarea name="terms" placeholder="Describe the private agreement terms…" className="form-input" />
        </div>
        <button type="submit" className="form-cta" disabled={loading || !walletDetails} id="create-submit">
          {loading ? '⟳ Processing…' : '⬡ Create Escrow'}
        </button>
        {!walletDetails && (
          <div className="notice notice--warning">Connect your wallet to create an escrow.</div>
        )}
      </form>
    </>
  );
}
