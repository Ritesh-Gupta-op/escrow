import type { EscrowState } from '../types';

interface EscrowStatusCardProps {
  state: EscrowState;
  onRefresh: () => void;
}

function fmt(v: string | null): string {
  if (!v || v === '—') return '—';
  if (v.length > 20) return v.slice(0, 10) + '…' + v.slice(-8);
  return v;
}

function statusBadge(s: string | null) {
  const map: Record<string, string> = {
    UNFUNDED: 'badge--gray',
    FUNDED:   'badge--gold',
    RELEASED: 'badge--green',
    REFUNDED: 'badge--violet',
    UNDEPLOYED: 'badge--gray',
    UNKNOWN:    'badge--gray',
  };
  const cls = map[s ?? ''] ?? 'badge--gray';
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {s ?? '—'}
    </span>
  );
}

export default function EscrowStatusCard({ state, onRefresh }: EscrowStatusCardProps) {
  const rows = [
    { k: 'Contract Address', v: fmt(state.contractAddress), mono: true },
    { k: 'Network',          v: state.network ?? '—' },
    { k: 'Agreement Hash',   v: fmt(state.agreementCommitment), mono: true },
    { k: 'Buyer Authority',  v: fmt(state.buyerAuthority), mono: true },
    { k: 'Seller Authority', v: fmt(state.sellerAuthority), mono: true },
  ];

  return (
    <div className="card card-accent">
      <div className="flex items-center justify-between mb-20">
        <div className="card-label">Live Contract State</div>
        <button className="icon-btn" onClick={onRefresh} title="Refresh">↻</button>
      </div>

      <div className="flex items-center gap-12 mb-20" style={{ paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Status</div>
          {statusBadge(state.statusName || state.status)}
        </div>
      </div>

      <div className="kv-list">
        {rows.map(({ k, v, mono }) => (
          <div className="kv-row" key={k}>
            <span className="kv-key">{k}</span>
            <span className={`kv-val ${mono ? 'kv-mono' : ''}`}>{v}</span>
          </div>
        ))}
      </div>

      {state.message && (
        <div className="notice notice--info mt-12" style={{ marginTop: 16 }}>
          {state.message}
        </div>
      )}
    </div>
  );
}
