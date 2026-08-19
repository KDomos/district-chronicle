import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, fileUrl } from "../api/client";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

export default function AlbumDetail() {
  const { albumId } = useParams();
  const [album, setAlbum] = useState(undefined);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api
      .get(`/albums/${albumId}`)
      .then(setAlbum)
      .catch(() => setAlbum(null));
  }, [albumId]);

  if (album === undefined) return <LoadingState />;
  if (album === null) {
    return (
      <EmptyState
        title="Album not found"
        action={<Link to="/gallery" className="btn-secondary">Back to Gallery</Link>}
      />
    );
  }

  return (
    <div>
      <Link to="/gallery" className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft no-underline hover:text-ink">
        &larr; All albums
      </Link>

      <div className="mt-4 mb-8 hr-rule pb-3">
        <h2 className="font-display text-3xl font-bold">{album.title}</h2>
        {album.description && <p className="text-ink-soft mt-1">{album.description}</p>}
      </div>

      {album.photos.length === 0 ? (
        <EmptyState title="No photos in this album yet" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {album.photos.map((p) => (
            <button
              key={p.id}
              onClick={() => setLightbox(p)}
              className="aspect-square border border-line overflow-hidden bg-paper-dim"
            >
              <img src={fileUrl(p.image_url)} alt={p.caption || ""} className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 bg-ink/90 flex items-center justify-center p-6 z-50"
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-3xl w-full">
            <img src={fileUrl(lightbox.image_url)} alt={lightbox.caption || ""} className="w-full max-h-[80vh] object-contain" />
            {lightbox.caption && <p className="text-paper text-center font-mono text-sm mt-3">{lightbox.caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
