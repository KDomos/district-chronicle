import { useEffect, useState } from "react";
import { api } from "../api/client";
import PostCard from "../components/PostCard";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

export default function Home() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    api.get("/posts", { post_type: "blog", limit: 30 }).then((r) => setPosts(r.items));
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-end justify-between hr-rule pb-3">
        <h2 className="font-display text-3xl font-bold">Front Page</h2>
        <span className="kicker">{posts ? `${posts.length} stor${posts.length === 1 ? "y" : "ies"}` : "\u00A0"}</span>
      </div>

      {posts === null ? (
        <LoadingState />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No stories filed yet"
          body="The editor is still at the typewriter. Check back soon for the first dispatch."
        />
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
