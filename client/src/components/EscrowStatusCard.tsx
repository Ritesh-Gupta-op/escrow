import type { EscrowState } from '../types';

interface EscrowStatusCardProps {
  state: EscrowState;
}

function formatBytes(value: string | null): string {
  if (!value) return '—';
  return value.slice(0, 8) + '…' + value.slice(-8);
}

export default function EscrowStatusCard({ state }: EscrowStatusCardProps) {
  return (
    <section className="card" id="escrow-status">
      <h2 className="card-title">Escrow Ledger Status</h2>
      <div className="status-grid">
        <div className="status-row">
          <span className="status-label">Contract Address</span>
          <strong className="status-value mono">
            {state.contractAddress ? formatBytes(state.contractAddress) : 'Loading…'}
          </strong>
        </div>
        <div className="status-row">
          <span className="status-label">Status</span>
          <strong className="status-value">
            {state.statusName || state.status || 'Loading…'}
          </strong>
        </div>
        <div className="status-row">
          <span className="status-label">Agreement Commitment</span>
          <strong className="status-value mono">
            {formatBytes(state.agreementCommitment)}
          </strong>
        </div>
        <div className="status-row">
          <span className="status-label">Buyer Authority</span>
          <strong className="status-value mono">
            {formatBytes(state.buyerAuthority)}
          </strong>
        </div>
        <div className="status-row">
          <span className="status-label">Seller Authority</span>
          <strong className="status-value mono">
            {formatBytes(state.sellerAuthority)}
          </strong>
        </div>
        {state.network && (
          <div className="status-row">
            <span className="status-label">Network</span>
            <span className="badge badge-blue">{state.network}</span>
          </div>
        )}
      </div>
      {state.message && (
        <div className="notice">{state.message}</div>
      )}
    </section>
  );
}
