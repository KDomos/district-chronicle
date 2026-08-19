import { useEffect, useState } from "react";
import { api } from "../api/client";

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get(`/comments/post/${postId}`)
      .then(setComments)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !body.trim()) {
      setError("Name and comment can't be empty.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/comments", { post_id: postId, author_name: name.trim(), body: body.trim() });
      setName("");
      setBody("");
      load();
    } catch (err) {
      setError(err.message || "Couldn't post that comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h3 className="font-display text-xl font-semibold mb-4">
        Comments {comments.length > 0 && <span className="text-ink-soft font-body text-base">({comments.length})</span>}
      </h3>

      <form onSubmit={submit} className="mb-8 space-y-3 border border-line bg-paper-raised p-4">
        <div>
          <label className="label" htmlFor="c-name">Name</label>
          <input
            id="c-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="label" htmlFor="c-body">Comment</label>
          <textarea
            id="c-body"
            className="input min-h-[90px]"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            placeholder="Say your piece..."
          />
        </div>
        {error && <p className="text-brick text-sm">{error}</p>}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </form>

      {loading ? (
        <p className="font-mono text-xs text-ink-soft uppercase tracking-widest">Loading comments&hellip;</p>
      ) : comments.length === 0 ? (
        <p className="text-ink-soft text-sm italic">No comments yet. Be the first to weigh in.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="hr-rule pt-4">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="font-semibold text-sm">{c.author_name}</span>
                <span className="font-mono text-[11px] text-ink-soft">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-sm text-ink-soft whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
