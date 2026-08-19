import { useEffect, useState } from "react";
import { api, fileUrl } from "../api/client";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(undefined);

  useEffect(() => {
    api.get("/portfolio").then(setPortfolio);
  }, []);

  if (portfolio === undefined) return <LoadingState />;

  const hasContent = portfolio.content && portfolio.content.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 hr-rule pb-3">
        <h2 className="font-display text-3xl font-bold">{portfolio.title || "Portfolio"}</h2>
      </div>

      {portfolio.cover_image && (
        <img
          src={fileUrl(portfolio.cover_image)}
          alt=""
          className="w-full aspect-[16/9] object-cover border border-line mb-8"
        />
      )}

      {hasContent ? (
        <div className="text-[1.05rem] leading-relaxed whitespace-pre-wrap">{portfolio.content}</div>
      ) : (
        <EmptyState title="Portfolio coming soon" body="The editor's body of work is being assembled." />
      )}
    </div>
  );
}
