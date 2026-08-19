import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, fileUrl } from "../../api/client";
import LoadingState from "../../components/LoadingState";

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  cover_image: null,
  tags: "",
  status: "published",
  scheduled_for: "",
};

// datetime-local input wants "YYYY-MM-DDTHH:mm" in local time, no seconds/zone.
function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PostEditor() {
  const { postType, postId } = useParams(); // postId === "new" for creation
  const isNew = postId === "new";
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [existingId, setExistingId] = useState(null);

  useEffect(() => {
    if (isNew) {
      setForm(emptyForm);
      setLoading(false);
      return;
    }
    // We only have slug-based GET publicly; fetch full list and find by id instead,
    // since admins may edit unpublished/scheduled posts too.
    api.get("/posts", { post_type: postType, published_only: false, limit: 200 }).then((r) => {
      const found = r.items.find((p) => p.id === postId);
      if (found) {
        setForm({
          title: found.title,
          excerpt: found.excerpt || "",
          content: found.content,
          cover_image: found.cover_image,
          tags: (found.tags || []).join(", "),
          status: found.status || "published",
          scheduled_for: toLocalInputValue(found.scheduled_for),
        });
        setExistingId(found.id);
      }
      setLoading(false);
    });
  }, [isNew, postType, postId]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await api.upload("/uploads", file);
      setForm((f) => ({ ...f, cover_image: res.url }));
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.status === "scheduled" && !form.scheduled_for) {
      setError("Pick a date and time to schedule this for.");
      return;
    }

    const payload = {
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      cover_image: form.cover_image,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      status: form.status,
      scheduled_for: form.status === "scheduled" ? new Date(form.scheduled_for).toISOString() : null,
    };

    setSaving(true);
    try {
      if (isNew) {
        await api.post("/posts", { ...payload, post_type: postType });
      } else {
        await api.put(`/posts/${existingId}`, payload);
      }
      navigate(`/admin/posts/${postType}`);
    } catch (err) {
      setError(err.message || "Couldn't save that post.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold mb-6">
        {isNew ? "New" : "Edit"} {postType === "gossip" ? "gossip" : "blog"} post
      </h1>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" className="input" required value={form.title} onChange={update("title")} />
        </div>

        <div>
          <label className="label" htmlFor="excerpt">Excerpt (shown on cards)</label>
          <input id="excerpt" className="input" value={form.excerpt} onChange={update("excerpt")} maxLength={300} />
        </div>

        <div>
          <label className="label" htmlFor="content">Content</label>
          <textarea id="content" className="input min-h-[280px]" required value={form.content} onChange={update("content")} />
        </div>

        <div>
          <label className="label">Cover image</label>
          {form.cover_image && (
            <img src={fileUrl(form.cover_image)} alt="" className="w-full max-h-56 object-cover border border-line mb-2" />
          )}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="font-mono text-xs" />
          {uploading && <p className="font-mono text-xs text-ink-soft mt-1">Uploading&hellip;</p>}
        </div>

        <div>
          <label className="label" htmlFor="tags">Tags (comma separated)</label>
          <input
            id="tags"
            className="input"
            value={form.tags}
            onChange={update("tags")}
            placeholder="council, downtown, budget"
          />
        </div>

        <div>
          <span className="label">Status</span>
          <div className="flex gap-4 font-mono text-xs uppercase tracking-widest">
            {[
              { v: "draft", label: "Draft" },
              { v: "scheduled", label: "Scheduled" },
              { v: "published", label: "Published" },
            ].map((opt) => (
              <label key={opt.v} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={opt.v}
                  checked={form.status === opt.v}
                  onChange={update("status")}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {form.status === "scheduled" && (
          <div>
            <label className="label" htmlFor="scheduled_for">Publish at</label>
            <input
              id="scheduled_for"
              type="datetime-local"
              className="input"
              value={form.scheduled_for}
              onChange={update("scheduled_for")}
            />
            <p className="text-xs text-ink-soft mt-1">
              The post goes live automatically once this time passes &mdash; no need to come back and flip a switch.
            </p>
          </div>
        )}

        {error && <p className="text-brick text-sm">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save post"}
          </button>
        </div>
      </form>
    </div>
  );
}
