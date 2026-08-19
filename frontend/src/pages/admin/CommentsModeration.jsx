import { useEffect, useState } from "react";
import { api } from "../../api/client";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";

export default function CommentsModeration() {
  const [comments, setComments] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setComments(null);
    api.get("/comments", { limit: 100 }).then((r) => setComments(r.items));
  };

  useEffect(load, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    setDeletingId(id);
    try {
      await api.del(`/comments/${id}`);
      load();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Comments</h1>

      {comments === null ? (
        <LoadingState />
      ) : comments.length === 0 ? (
        <EmptyState title="No comments yet" />
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="border border-line bg-paper-raised p-4">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="font-semibold text-sm">{c.author_name}</span>
                <span className="font-mono text-[11px] text-ink-soft">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-ink-soft whitespace-pre-wrap mb-3">{c.body}</p>
              <button onClick={() => remove(c.id)} disabled={deletingId === c.id} className="btn-ghost text-brick">
                {deletingId === c.id ? "Deleting..." : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
