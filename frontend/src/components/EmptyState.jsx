export default function EmptyState({ title = "Nothing here yet", body, action }) {
  return (
    <div className="py-16 text-center border border-dashed border-line">
      <p className="font-display text-xl mb-1">{title}</p>
      {body && <p className="text-ink-soft text-sm max-w-md mx-auto">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
