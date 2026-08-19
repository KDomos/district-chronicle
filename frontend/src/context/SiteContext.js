import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState({
    site_title: "District Chronicle",
    tagline: "Local news, gossip, and everything in between.",
  });
  const [edition, setEdition] = useState(null);

  useEffect(() => {
    api.get("/settings").then(setSettings).catch(() => {});
    Promise.all([
      api.get("/posts", { post_type: "blog", limit: 1 }).catch(() => ({ total: 0 })),
      api.get("/posts", { post_type: "gossip", limit: 1 }).catch(() => ({ total: 0 })),
    ]).then(([blog, gossip]) => {
      setEdition((blog.total || 0) + (gossip.total || 0));
    });
  }, []);

  return <SiteContext.Provider value={{ settings, edition }}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
