import { useEffect, useState } from "react";
import { api } from "../../api/client";
import LoadingState from "../../components/LoadingState";

export default function SettingsEditor() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/settings").then((s) =>
      setForm({
        site_title: s.site_title || "",
        tagline: s.tagline || "",
        contact_email: s.contact_email || "",
        notify_on_comment: s.notify_on_comment !== false,
        notify_on_message: s.notify_on_message !== false,
        notification_email: s.notification_email || "",
      })
    );
  }, []);

  const update = (k) => (e) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const toggle = (k) => (e) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: e.target.checked }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        contact_email: form.contact_email.trim() || null,
        notification_email: form.notification_email.trim() || null,
      };
      await api.put("/settings", payload);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <LoadingState />;

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl font-bold mb-6">Site settings</h1>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label" htmlFor="site_title">Site title</label>
          <input id="site_title" className="input" value={form.site_title} onChange={update("site_title")} />
        </div>
        <div>
          <label className="label" htmlFor="tagline">Tagline</label>
          <input id="tagline" className="input" value={form.tagline} onChange={update("tagline")} />
        </div>
        <div>
          <label className="label" htmlFor="contact_email">Contact email</label>
          <input id="contact_email" type="email" className="input" value={form.contact_email} onChange={update("contact_email")} />
        </div>

        <div className="hr-rule pt-5">
          <p className="kicker mb-3">Email notifications</p>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.notify_on_comment} onChange={toggle("notify_on_comment")} />
              <span className="font-mono text-xs uppercase tracking-widest">Email me on new comments</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.notify_on_message} onChange={toggle("notify_on_message")} />
              <span className="font-mono text-xs uppercase tracking-widest">Email me on new contact messages</span>
            </label>
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="notification_email">
              Send notifications to (optional &mdash; falls back to the server's configured address)
            </label>
            <input
              id="notification_email"
              type="email"
              className="input"
              value={form.notification_email}
              onChange={update("notification_email")}
              placeholder="you@example.com"
            />
          </div>
          <p className="text-xs text-ink-soft mt-2">
            Outgoing mail itself (SMTP host, login, etc.) is configured on the server via environment
            variables, not here &mdash; these toggles just control whether it fires.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save settings"}
          </button>
          {saved && <span className="font-mono text-xs text-olive uppercase tracking-widest">Saved</span>}
        </div>
      </form>
    </div>
  );
}
