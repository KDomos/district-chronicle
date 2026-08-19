import { Link } from "react-router-dom";
import { fileUrl } from "../api/client";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TagChips({ tags, accentClass }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {tags.map((t) => (
        <Link
          key={t}
          to={`/tag/${t}`}
          onClick={(e) => e.stopPropagation()}
          className={`font-mono text-[10px] uppercase tracking-wide no-underline px-1.5 py-0.5 border border-line hover:border-ink ${accentClass}`}
        >
          #{t}
        </Link>
      ))}
    </div>
  );
}

export default function PostCard({ post, index = 0 }) {
  const isGossip = post.post_type === "gossip";
  const tilt = isGossip ? (index % 2 === 0 ? -0.7 : 0.9) : 0;

  if (isGossip) {
    return (
      <Link
        to={`/gossip/${post.slug}`}
        className="card-gossip relative block p-5 no-underline"
        style={{ "--tilt": `${tilt}deg` }}
      >
        <span className="tape" aria-hidden="true" />
        <span className="kicker text-mustard-dark">Overheard &middot; {formatDate(post.created_at)}</span>
        <h3 className="font-display text-2xl font-semibold mt-1.5 mb-2 text-ink leading-snug">
          {post.title}
        </h3>
        {post.excerpt && <p className="text-sm text-ink-soft line-clamp-3">{post.excerpt}</p>}
        <span className="inline-block mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-mustard-dark">
          Read the whisper &rarr;
        </span>
        <TagChips tags={post.tags} accentClass="text-mustard-dark" />
      </Link>
    );
  }

  return (
    <Link to={`/post/${post.slug}`} className="card-blog block no-underline">
      {post.cover_image && (
        <div className="aspect-[16/9] overflow-hidden border-b border-line bg-paper-dim">
          <img
            src={fileUrl(post.cover_image)}
            alt=""
            className="w-full h-full object-cover grayscale-[15%]"
          />
        </div>
      )}
      <div className="p-5">
        <span className="kicker">Chronicle &middot; {formatDate(post.created_at)}</span>
        <h3 className="font-display text-2xl font-semibold mt-1.5 mb-2 text-ink leading-snug">
          {post.title}
        </h3>
        {post.excerpt && <p className="text-sm text-ink-soft line-clamp-3">{post.excerpt}</p>}
        <span className="inline-block mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-brick">
          Continue reading &rarr;
        </span>
        <TagChips tags={post.tags} accentClass="text-brick" />
      </div>
    </Link>
  );
}
