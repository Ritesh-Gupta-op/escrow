export default function ResponsePanel({ response }: { response: string }) {
  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="terminal-dot td-red" />
        <span className="terminal-dot td-amber" />
        <span className="terminal-dot td-green" />
        <span className="terminal-title">circuit output</span>
      </div>
      <pre className="terminal-body">{response || '> Ready for instructions…'}</pre>
    </div>
  );
}
