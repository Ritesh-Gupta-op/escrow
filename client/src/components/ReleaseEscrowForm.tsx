import type { WalletDetails } from '../types';

interface ReleaseEscrowFormProps {
  walletDetails: WalletDetails | null;
  loading: boolean;
  onSubmit: (data: {
    seller: string;
    walletAddress: string;
    shieldedAddress: string;
    unshieldedAddress: string;
    rdns: string;
  }) => Promise<void>;
}

export default function ReleaseEscrowForm({
  walletDetails,
  loading,
  onSubmit,
}: ReleaseEscrowFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!walletDetails) {
      alert('Please connect your browser wallet before executing escrow transactions.');
      return;
    }
    const fd = new FormData(e.currentTarget);
    await onSubmit({
      seller: fd.get('seller') as string,
      walletAddress: walletDetails.address,
      shieldedAddress: walletDetails.shieldedAddress,
      unshieldedAddress: walletDetails.unshieldedAddress,
      rdns: walletDetails.rdns,
    });
  };

  return (
    <div>
      <h2 className="card-title">Release Escrow</h2>
      <form onSubmit={handleSubmit} id="release-form">
        <label className="form-label">Seller authorization secret</label>
        <input
          name="seller"
          type="password"
          autoComplete="current-password"
          minLength={12}
          required
          placeholder="Enter seller secret"
          className="form-input"
        />
        <button
          type="submit"
          className="form-btn"
          disabled={loading || !walletDetails}
          id="release-submit-btn"
        >
          {loading ? 'Processing…' : 'Release Escrow Circuit Call'}
        </button>
      </form>
    </div>
  );
}
