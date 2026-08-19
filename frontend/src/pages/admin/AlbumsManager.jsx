import { useEffect, useState } from "react";
import { api, fileUrl } from "../../api/client";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";

function AlbumPanel({ album, onChanged }) {
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await api.upload("/uploads", file);
      await api.postQuery(`/albums/${album.id}/photos`, { image_url: uploaded.url, caption });
      setCaption("");
      e.target.value = "";
      onChanged();
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (photoId) => {
    if (!window.confirm("Delete this photo?")) return;
    await api.del(`/albums/photos/${photoId}`);
    onChanged();
  };

  return (
    <div className="border border-line bg-paper-raised p-4 mt-3">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex-1 min-w-[160px]">
          <label className="label">Caption (optional)</label>
          <input className="input" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <div>
          <label className="label">Add photo</label>
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="font-mono text-xs" />
        </div>
      </div>
      {uploading && <p className="font-mono text-xs text-ink-soft mb-2">Uploading&hellip;</p>}
      {error && <p className="text-brick text-sm mb-2">{error}</p>}

      {album.photos.length === 0 ? (
        <p className="text-ink-soft text-sm italic">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {album.photos.map((p) => (
            <div key={p.id} className="relative group border border-line">
              <img src={fileUrl(p.image_url)} alt={p.caption || ""} className="w-full aspect-square object-cover" />
              <button
                onClick={() => removePhoto(p.id)}
                className="absolute inset-0 bg-ink/70 text-paper opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xs uppercase"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AlbumsManager() {
  const [albums, setAlbums] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const list = await api.get("/albums");
    setAlbums(list);
  };

  useEffect(() => {
    load();
  }, []);

  const openAlbum = async (id) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    const full = await api.get(`/albums/${id}`);
    setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, photos: full.photos } : a)));
    setOpenId(id);
  };

  const createAlbum = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await api.post("/albums", { title: title.trim(), description });
      setTitle("");
      setDescription("");
      load();
    } finally {
      setCreating(false);
    }
  };

  const deleteAlbum = async (id) => {
    if (!window.confirm("Delete this album and all its photos?")) return;
    await api.del(`/albums/${id}`);
    load();
  };

  const refreshOpen = async () => {
    if (!openId) return;
    const full = await api.get(`/albums/${openId}`);
    setAlbums((prev) => prev.map((a) => (a.id === openId ? { ...a, photos: full.photos } : a)));
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Albums</h1>

      <form onSubmit={createAlbum} className="border border-line bg-paper-raised p-4 mb-8 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="label">New album title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="label">Description</label>
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary" disabled={creating}>
          {creating ? "Creating..." : "Create album"}
        </button>
      </form>

      {albums === null ? (
        <LoadingState />
      ) : albums.length === 0 ? (
        <EmptyState title="No albums yet" />
      ) : (
        <ul className="space-y-2">
          {albums.map((a) => (
            <li key={a.id}>
              <div className="border border-line bg-paper-raised p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="font-mono text-[11px] text-ink-soft uppercase tracking-widest">
                    {a.photo_count} photo{a.photo_count === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openAlbum(a.id)} className="btn-ghost">
                    {openId === a.id ? "Close" : "Manage photos"}
                  </button>
                  <button onClick={() => deleteAlbum(a.id)} className="btn-ghost text-brick">Delete</button>
                </div>
              </div>
              {openId === a.id && a.photos && <AlbumPanel album={a} onChanged={refreshOpen} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
