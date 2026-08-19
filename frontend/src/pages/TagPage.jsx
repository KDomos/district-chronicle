import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import PostCard from "../components/PostCard";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

export default function TagPage() {
  const { tag } = useParams();
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    setPosts(null);
    api.get("/posts", { tag, limit: 50 }).then((r) => setPosts(r.items));
  }, [tag]);

  return (
    <div>
      <Link to="/" className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft no-underline hover:text-ink">
        &larr; Back to the front page
      </Link>

      <div className="mt-4 mb-8 hr-rule pb-3">
        <span className="kicker">Tagged</span>
        <h2 className="font-display text-3xl font-bold mt-1">#{tag}</h2>
      </div>

      {posts === null ? (
        <LoadingState />
      ) : posts.length === 0 ? (
        <EmptyState title="Nothing filed under this tag" action={<Link to="/" className="btn-secondary">Back to the front page</Link>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
