import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";

function statusLabel(p) {
  if (p.status === "draft") return "Draft";
  if (p.status === "scheduled") {
    const due = p.scheduled_for ? new Date(p.scheduled_for) : null;
    const isFuture = due && due.getTime() > Date.now();
    if (isFuture) {
      return `Scheduled \u00b7 ${due.toLocaleDateString()} ${due.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    }
    return "Published"; // scheduled time has passed, effectively live
  }
  return "Published";
}

export default function PostsManager() {
  const { postType } = useParams(); // "blog" | "gossip"
  const [posts, setPosts] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setPosts(null);
    api.get("/posts", { post_type: postType, published_only: false, limit: 200 }).then((r) => setPosts(r.items));
  };

  useEffect(load, [postType]);

  const remove = async (id) => {
    if (!window.confirm("Delete this post? This also removes its comments and reactions.")) return;
    setDeletingId(id);
    try {
      await api.del(`/posts/${id}`);
      load();
    } finally {
      setDeletingId(null);
    }
  };

  const label = postType === "gossip" ? "Gossip" : "Blog";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">{label} posts</h1>
        <Link to={`/admin/posts/${postType}/new`} className="btn-primary">+ New post</Link>
      </div>

      {posts === null ? (
        <LoadingState />
      ) : posts.length === 0 ? (
        <EmptyState title={`No ${label.toLowerCase()} posts yet`} action={<Link to={`/admin/posts/${postType}/new`} className="btn-secondary">Write the first one</Link>} />
      ) : (
        <ul className="divide-y divide-line border border-line bg-paper-raised">
          {posts.map((p) => (
            <li key={p.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{p.title}</p>
                <p className="font-mono text-[11px] text-ink-soft uppercase tracking-widest mt-0.5">
                  {statusLabel(p)} &middot; {new Date(p.created_at).toLocaleDateString()} &middot; /{p.slug} &middot; {p.view_count || 0} view{p.view_count === 1 ? "" : "s"}
                </p>
                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="font-mono text-[10px] uppercase tracking-wide bg-paper-dim px-1.5 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/admin/posts/${postType}/${p.id}`} className="btn-ghost">Edit</Link>
                <button onClick={() => remove(p.id)} disabled={deletingId === p.id} className="btn-ghost text-brick">
                  {deletingId === p.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
