interface HeroSectionProps {
  onCTAClick: () => void;
}

export default function HeroSection({ onCTAClick }: HeroSectionProps) {
  return (
    <main className="hero-content">
      <h1 className="hero-title animate-fade-rise delay-0">
        Private <em>Escrow</em> Architecture
      </h1>
      <p className="hero-paragraph animate-fade-rise delay-200">
        A minimalist, high-end cryptographic escrow protocol powered by Midnight
        zero-knowledge circuits. Create confidential agreements and authorize
        releases without revealing private preimages on-chain.
      </p>
      <button
        className="pill-btn pill-btn-hero animate-fade-rise delay-400"
        onClick={onCTAClick}
        id="hero-cta-btn"
      >
        Explore Escrow DApp
      </button>
    </main>
  );
}
