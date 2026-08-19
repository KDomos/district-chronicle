import { useEffect, useState } from "react";
import { api } from "../api/client";
import PostCard from "../components/PostCard";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

export default function Gossip() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    api.get("/posts", { post_type: "gossip", limit: 30 }).then((r) => setPosts(r.items));
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-end justify-between hr-rule pb-3">
        <div>
          <h2 className="font-display text-3xl font-bold text-mustard-dark">The Grapevine</h2>
          <p className="text-sm text-ink-soft italic mt-1">Unverified. Unfiltered. Allegedly true.</p>
        </div>
        <span className="kicker">{posts ? `${posts.length} whisper${posts.length === 1 ? "" : "s"}` : "\u00A0"}</span>
      </div>

      {posts === null ? (
        <LoadingState label="Eavesdropping" />
      ) : posts.length === 0 ? (
        <EmptyState title="Nothing to whisper about" body="The grapevine is quiet for now. That's suspicious in itself." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-10 pt-2">
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
