import { useEffect, useState } from "react";
import { api } from "../api/client";

const REACTIONS = [
  { type: "like", emoji: "\u{1F44D}", label: "Like" },
  { type: "love", emoji: "\u{2764}\u{FE0F}", label: "Love" },
  { type: "laugh", emoji: "\u{1F602}", label: "Laugh" },
  { type: "wow", emoji: "\u{1F62E}", label: "Wow" },
  { type: "sad", emoji: "\u{1F622}", label: "Sad" },
  { type: "angry", emoji: "\u{1F620}", label: "Angry" },
];

export default function ReactionBar({ postId }) {
  const [counts, setCounts] = useState({});
  const [busy, setBusy] = useState(null);

  const load = () => {
    api.get(`/posts/${postId}/reaction-counts`).then(setCounts).catch(() => {});
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const react = async (type) => {
    setBusy(type);
    try {
      await api.post("/reactions", { post_id: postId, reaction_type: type });
      await load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTIONS.map((r) => (
        <button
          key={r.type}
          onClick={() => react(r.type)}
          disabled={busy === r.type}
          className="flex items-center gap-1.5 border border-line bg-paper-raised px-3 py-1.5 hover:border-ink transition-colors disabled:opacity-50"
          aria-label={r.label}
        >
          <span aria-hidden="true">{r.emoji}</span>
          <span className="font-mono text-xs text-ink-soft">{counts[r.type] || 0}</span>
        </button>
      ))}
    </div>
  );
}
