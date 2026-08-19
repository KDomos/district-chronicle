import { useSite } from "../context/SiteContext";
import { API_URL } from "../api/client";

export default function Footer() {
  const { settings } = useSite();
  const year = new Date().getFullYear();

  return (
    <footer className="hr-rule-thick mt-16">
      <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          &copy; {year} {settings.site_title || "District Chronicle"}. All rights reserved by one very busy editor.
        </p>
        <div className="flex items-center gap-4">
          <a
            href={`${API_URL}/rss.xml`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft hover:text-brick"
          >
            RSS
          </a>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            Printed daily on the internet
          </p>
        </div>
      </div>
    </footer>
  );
}
