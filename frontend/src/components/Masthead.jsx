import { NavLink } from "react-router-dom";
import { useSite } from "../context/SiteContext";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `no-underline font-mono text-xs uppercase tracking-[0.14em] pb-1 border-b-2 ${
          isActive ? "border-brick text-brick" : "border-transparent text-ink hover:border-ink"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Masthead() {
  const { settings, edition } = useSite();

  return (
    <header className="border-b-4 border-double border-ink bg-paper-raised">
      {/* Ticker strip */}
      <div className="hr-rule bg-ink text-paper">
        <div className="max-w-5xl mx-auto px-5 py-1.5 flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.1em] uppercase">
          <span>{today}</span>
          <span className="hidden sm:inline">
            {edition !== null ? `No. ${String(edition).padStart(3, "0")}` : "\u00A0"} &middot; Est. by one person, for the neighborhood
          </span>
          <NavLink to="/admin/login" className="text-paper/70 hover:text-paper no-underline">
            Staff
          </NavLink>
        </div>
      </div>

      {/* Masthead */}
      <div className="max-w-5xl mx-auto px-5 pt-8 pb-5 text-center">
        <NavLink to="/" className="no-underline">
          <h1 className="font-display font-black text-5xl sm:text-6xl tracking-tight text-ink">
            {settings.site_title || "District Chronicle"}
          </h1>
        </NavLink>
        {settings.tagline && (
          <p className="mt-2 font-body italic text-ink-soft text-sm sm:text-base">{settings.tagline}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="hr-rule-thick">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-center gap-6 flex-wrap">
          <NavItem to="/" end>Chronicle</NavItem>
          <NavItem to="/gossip">Gossip</NavItem>
          <NavItem to="/gallery">Gallery</NavItem>
          <NavItem to="/portfolio">Portfolio</NavItem>
          <NavItem to="/contact">Contact</NavItem>
        </div>
      </nav>
    </header>
  );
}
