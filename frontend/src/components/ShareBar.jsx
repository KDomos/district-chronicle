import { useState } from "react";

const SHARE_TARGETS = [
  {
    key: "twitter",
    label: "X",
    urlFor: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    urlFor: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    urlFor: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
];

export default function ShareBar({ title }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      // user cancelled the share sheet — no error state needed
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — fall back silently, link is still visible in the address bar
    }
  };

  if (canNativeShare) {
    return (
      <button
        onClick={nativeShare}
        className="flex items-center gap-1.5 border border-line bg-paper-raised px-3 py-1.5 hover:border-ink transition-colors font-mono text-xs uppercase tracking-wide"
      >
        Share
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {SHARE_TARGETS.map((t) => (
        
          key={t.key}
          href={t.urlFor(url, title)}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-line bg-paper-raised px-3 py-1.5 hover:border-ink transition-colors font-mono text-xs uppercase tracking-wide no-underline text-ink"
        >
          {t.label}
        </a>
      ))}
      <button
        onClick={copyLink}
        className="border border-line bg-paper-raised px-3 py-1.5 hover:border-ink transition-colors font-mono text-xs uppercase tracking-wide"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
