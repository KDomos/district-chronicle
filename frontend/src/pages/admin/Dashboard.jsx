import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import LoadingState from "../../components/LoadingState";

function StatCard({ label, value, to }) {
  const content = (
    <div className="border border-line bg-paper-raised p-5 hover:border-ink transition-colors">
      <p className="kicker mb-2">{label}</p>
      <p className="font-display text-4xl font-bold">{value}</p>
    </div>
  );
  return to ? <Link to={to} className="no-underline block">{content}</Link> : content;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then(setStats);
  }, []);

  if (!stats) return <LoadingState label="Pulling the numbers" />;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="Blog posts" value={stats.posts.blog} to="/admin/posts/blog" />
        <StatCard label="Gossip posts" value={stats.posts.gossip} to="/admin/posts/gossip" />
        <StatCard label="Drafts" value={stats.posts.drafts} />
        <StatCard label="Scheduled" value={stats.posts.scheduled} />
        <StatCard label="Comments" value={stats.comments} to="/admin/comments" />
        <StatCard label="Reactions" value={stats.reactions} />
        <StatCard label="Albums" value={stats.albums} to="/admin/albums" />
        <StatCard label="Photos" value={stats.photos} to="/admin/albums" />
        <StatCard label="Messages" value={stats.messages.total} to="/admin/inbox" />
        <StatCard label="Unread messages" value={stats.messages.unread} to="/admin/inbox" />
        <StatCard label="Total views" value={stats.total_views} />
      </div>
            <div className="hr-rule pt-6 mb-10">
        <h2 className="font-display text-xl font-semibold mb-4">Most viewed</h2>
        {stats.most_viewed.length === 0 ? (
          <p className="text-ink-soft text-sm italic">No views recorded yet.</p>
        ) : (
          <ul className="divide-y divide-line border border-line bg-paper-raised">
            {stats.most_viewed.map((p, i) => (
              <li key={p.id} className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-baseline gap-3">
                  <span className="font-mono text-xs text-ink-soft w-4 shrink-0">{i + 1}</span>
                  <Link
                    to={`/admin/posts/${p.post_type}/${p.id}`}
                    className="font-semibold truncate no-underline text-ink hover:underline"
                  >
                    {p.title}
                  </Link>
                </div>
                <span className="font-mono text-xs text-ink-soft shrink-0">
                  {p.view_count} view{p.view_count === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="hr-rule pt-6">
        <h2 className="font-display text-xl font-semibold mb-4">Recent comments</h2>
        {stats.recent_comments.length === 0 ? (
          <p className="text-ink-soft text-sm italic">No comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {stats.recent_comments.map((c) => (
              <li key={c.id} className="border border-line bg-paper-raised p-3">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm">{c.author_name}</span>
                  <span className="font-mono text-[11px] text-ink-soft">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-ink-soft line-clamp-2">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
