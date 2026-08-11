interface HeroSectionProps {
  onCTAClick: () => void;
}

export default function HeroSection({ onCTAClick }: HeroSectionProps) {
  return (
    <div className="hero-body">
      {/* Tag */}
      <div className="hero-tag anim-rise d0">
        Zero-Knowledge Escrow Protocol
      </div>

      {/* Headline */}
      <h1 className="hero-h1 anim-rise d1">
        Private <em>agreements</em>,<br />
        on-chain trust.
      </h1>

      {/* Sub */}
      <p className="hero-sub anim-rise d2">
        Create, fund, and settle escrow agreements using Midnight's
        zero-knowledge circuits — secrets never touch the chain.
      </p>

      {/* CTA */}
      <button className="btn btn-hero anim-rise d3" onClick={onCTAClick} id="hero-cta">
        Enter Application ↓
      </button>

      {/* Stats Row */}
      <div className="hero-stats anim-fade d4">
        {[
          { v: '100%', l: 'Privacy Preserved' },
          { v: 'ZK', l: 'Proof Generation' },
          { v: '0', l: 'Secrets On-Chain' },
        ].map(({ v, l }) => (
          <div className="stat-item" key={l}>
            <div className="stat-value">{v}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
