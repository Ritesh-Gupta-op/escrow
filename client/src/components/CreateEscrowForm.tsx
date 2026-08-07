import { useRef } from 'react';
import type { WalletDetails } from '../types';

interface CreateEscrowFormProps {
  walletDetails: WalletDetails | null;
  loading: boolean;
  onSubmit: (data: {
    buyer: string;
    seller: string;
    amount: string;
    terms: string;
    walletAddress: string;
    shieldedAddress: string;
    unshieldedAddress: string;
    rdns: string;
  }) => Promise<void>;
}

export default function CreateEscrowForm({
  walletDetails,
  loading,
  onSubmit,
}: CreateEscrowFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletDetails) {
      alert('Please connect your browser wallet before executing escrow transactions.');
      return;
    }
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    await onSubmit({
      buyer: fd.get('buyer') as string,
      seller: fd.get('seller') as string,
      amount: fd.get('amount') as string,
      terms: fd.get('terms') as string,
      walletAddress: walletDetails.address,
      shieldedAddress: walletDetails.shieldedAddress,
      unshieldedAddress: walletDetails.unshieldedAddress,
      rdns: walletDetails.rdns,
    });
  };

  return (
    <section className="card">
      <h2 className="card-title">Create Escrow</h2>
      <form ref={formRef} onSubmit={handleSubmit} id="create-form">
        <label className="form-label">Buyer authorization secret</label>
        <input
          name="buyer"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          placeholder="At least 12 characters"
          className="form-input"
        />
        <label className="form-label">Seller authorization secret</label>
        <input
          name="seller"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          placeholder="At least 12 characters"
          className="form-input"
        />
        <label className="form-label">Amount</label>
        <input
          name="amount"
          type="number"
          min={1}
          step={1}
          defaultValue={100}
          required
          className="form-input"
        />
        <label className="form-label">Agreement terms</label>
        <textarea
          name="terms"
          placeholder="Describe the agreement terms in private"
          className="form-input"
        />
        <button
          type="submit"
          className="form-btn"
          disabled={loading || !walletDetails}
          id="create-submit-btn"
        >
          {loading ? 'Processing…' : 'Create Escrow Circuit Transaction'}
        </button>
        {!walletDetails && (
          <p className="notice notice-warning">Connect your wallet to create an escrow.</p>
        )}
      </form>
    </section>
  );
}
