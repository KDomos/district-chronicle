import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fileUrl } from "../api/client";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

export default function Gallery() {
  const [albums, setAlbums] = useState(null);

  useEffect(() => {
    api.get("/albums").then(setAlbums);
  }, []);

  return (
    <div>
      <div className="mb-8 hr-rule pb-3">
        <h2 className="font-display text-3xl font-bold">Photo Albums</h2>
      </div>

      {albums === null ? (
        <LoadingState label="Developing film" />
      ) : albums.length === 0 ? (
        <EmptyState title="No albums yet" body="Photo galleries will appear here once published." />
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {albums.map((a) => (
            <Link key={a.id} to={`/gallery/${a.id}`} className="card-blog block no-underline group">
              <div className="aspect-square bg-paper-dim border-b border-line overflow-hidden flex items-center justify-center">
                {a.cover ? (
                  <img src={fileUrl(a.cover)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono text-xs text-ink-soft uppercase tracking-widest">
                    {a.photo_count} photo{a.photo_count === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display font-semibold text-lg">{a.title}</h3>
                {a.description && <p className="text-sm text-ink-soft mt-1 line-clamp-2">{a.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
