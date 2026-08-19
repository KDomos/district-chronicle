import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/posts/blog", label: "Blog posts" },
  { to: "/admin/posts/gossip", label: "Gossip posts" },
  { to: "/admin/comments", label: "Comments" },
  { to: "/admin/albums", label: "Albums" },
  { to: "/admin/portfolio", label: "Portfolio" },
  { to: "/admin/inbox", label: "Inbox" },
  { to: "/admin/settings", label: "Site settings" },
];

export default function AdminLayout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper">
      <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r-2 border-ink bg-paper-raised">
        <div className="p-5 hr-rule">
          <p className="font-display text-xl font-bold leading-tight">Newsroom</p>
          <p className="font-mono text-[11px] text-ink-soft uppercase tracking-widest mt-0.5">
            {username || "admin"}
          </p>
        </div>
        <nav className="p-3 flex md:flex-col gap-1 flex-wrap">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `no-underline font-mono text-xs uppercase tracking-[0.1em] px-3 py-2 ${
                  isActive ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-dim hover:text-ink"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="mt-2 text-left font-mono text-xs uppercase tracking-[0.1em] px-3 py-2 text-brick hover:bg-paper-dim">
            Log out
          </button>
          <NavLink to="/" className="font-mono text-xs uppercase tracking-[0.1em] px-3 py-2 text-ink-soft hover:bg-paper-dim no-underline">
            &larr; View site
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-8 max-w-4xl">
        <Outlet />
      </main>
    </div>
  );
}
