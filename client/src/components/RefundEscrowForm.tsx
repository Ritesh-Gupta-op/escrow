import type { WalletDetails } from '../types';

interface RefundEscrowFormProps {
  walletDetails: WalletDetails | null;
  loading: boolean;
  onSubmit: (data: {
    buyer: string;
    walletAddress: string;
    shieldedAddress: string;
    unshieldedAddress: string;
    rdns: string;
  }) => Promise<void>;
}

export default function RefundEscrowForm({
  walletDetails,
  loading,
  onSubmit,
}: RefundEscrowFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!walletDetails) {
      alert('Please connect your browser wallet before executing escrow transactions.');
      return;
    }
    const fd = new FormData(e.currentTarget);
    await onSubmit({
      buyer: fd.get('buyer') as string,
      walletAddress: walletDetails.address,
      shieldedAddress: walletDetails.shieldedAddress,
      unshieldedAddress: walletDetails.unshieldedAddress,
      rdns: walletDetails.rdns,
    });
  };

  return (
    <div>
      <h2 className="card-title">Refund Escrow</h2>
      <form onSubmit={handleSubmit} id="refund-form">
        <label className="form-label">Buyer authorization secret</label>
        <input
          name="buyer"
          type="password"
          autoComplete="current-password"
          minLength={12}
          required
          placeholder="Enter buyer secret"
          className="form-input"
        />
        <button
          type="submit"
          className="form-btn"
          disabled={loading || !walletDetails}
          id="refund-submit-btn"
        >
          {loading ? 'Processing…' : 'Refund Escrow Circuit Call'}
        </button>
      </form>
    </div>
  );
}
