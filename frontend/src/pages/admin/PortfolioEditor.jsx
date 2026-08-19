import { useEffect, useState } from "react";
import { api, fileUrl } from "../../api/client";
import LoadingState from "../../components/LoadingState";

export default function PortfolioEditor() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/portfolio").then((p) =>
      setForm({ title: p.title || "", content: p.content || "", cover_image: p.cover_image || null })
    );
  }, []);

  const update = (k) => (e) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.upload("/uploads", file);
      setForm((f) => ({ ...f, cover_image: res.url }));
      setSaved(false);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/portfolio", form);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <LoadingState />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold mb-6">Portfolio</h1>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" className="input" value={form.title} onChange={update("title")} />
        </div>
        <div>
          <label className="label" htmlFor="content">Content</label>
          <textarea id="content" className="input min-h-[280px]" value={form.content} onChange={update("content")} />
        </div>
        <div>
          <label className="label">Cover image</label>
          {form.cover_image && (
            <img src={fileUrl(form.cover_image)} alt="" className="w-full max-h-56 object-cover border border-line mb-2" />
          )}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="font-mono text-xs" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save portfolio"}
          </button>
          {saved && <span className="font-mono text-xs text-olive uppercase tracking-widest">Saved</span>}
        </div>
      </form>
    </div>
  );
}
