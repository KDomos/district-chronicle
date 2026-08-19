export default function LoadingState({ label = "Fetching the latest edition" }) {
  return (
    <div className="py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-soft animate-pulse">
        {label}&hellip;
      </p>
    </div>
  );
}
