interface ResponsePanelProps {
  response: string;
}

export default function ResponsePanel({ response }: ResponsePanelProps) {
  return (
    <section className="card">
      <h2 className="card-title">Circuit Response</h2>
      <pre className="response-panel">{response || 'Ready.'}</pre>
    </section>
  );
}
