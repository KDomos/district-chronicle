import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, fileUrl } from "../api/client";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ReactionBar from "../components/ReactionBar";
import ShareBar from "../components/ShareBar";
import CommentSection from "../components/CommentSection";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined);

  useEffect(() => {
    setPost(undefined);
    api
      .get(`/posts/${slug}`)
      .then(setPost)
      .catch(() => setPost(null));
  }, [slug]);

  if (post === undefined) return <LoadingState />;
  if (post === null) {
    return (
      <EmptyState
        title="Story not found"
        body="That article may have been retracted, or the link is off."
        action={
          <Link to="/" className="btn-secondary">Back to the front page</Link>
        }
      />
    );
  }

  const isGossip = post.post_type === "gossip";

  return (
    <article className="max-w-2xl mx-auto">
      <Link
        to={isGossip ? "/gossip" : "/"}
        className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft no-underline hover:text-ink"
      >
        &larr; {isGossip ? "Back to the grapevine" : "Back to the front page"}
      </Link>

      <header className="mt-6 mb-6">
        <span className={`kicker ${isGossip ? "text-mustard-dark" : ""}`}>
          {isGossip ? "Overheard" : "Chronicle"} &middot; {formatDate(post.created_at)}
        </span>
        <h1 className="font-display text-4xl font-bold mt-2 leading-tight">{post.title}</h1>
        {post.excerpt && <p className="mt-3 text-lg text-ink-soft italic">{post.excerpt}</p>}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.map((t) => (
              <Link
                key={t}
                to={`/tag/${t}`}
                className={`font-mono text-[11px] uppercase tracking-wide no-underline px-2 py-1 border border-line hover:border-ink ${
                  isGossip ? "text-mustard-dark" : "text-brick"
                }`}
              >
                #{t}
              </Link>
            ))}
          </div>
        )}
      </header>

      {post.cover_image && (
        <img
          src={fileUrl(post.cover_image)}
          alt=""
          className="w-full aspect-[16/9] object-cover border border-line mb-8"
        />
      )}

      <div className="prose-chronicle text-[1.05rem] leading-relaxed whitespace-pre-wrap mb-10">
        {post.content}
      </div>

      <div className="hr-rule pt-6 mb-10">
        <span className="kicker block mb-3">React</span>
        <ReactionBar postId={post.id} />
      </div>
      <div className="hr-rule pt-6 mb-10">
        <span className="kicker block mb-3">Share</span>
        <ShareBar title={post.title} />
      </div>

      <div className="hr-rule pt-8">
        <CommentSection postId={post.id} />
      </div>
    </article>
  );
}
