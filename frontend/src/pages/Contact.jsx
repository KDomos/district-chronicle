import { useState } from "react";
import { api } from "../api/client";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | done | error
  const [error, setError] = useState(null);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      await api.post("/contact", form);
      setStatus("done");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err.message || "Something went wrong sending that.");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8 hr-rule pb-3">
        <h2 className="font-display text-3xl font-bold">Get in Touch</h2>
        <p className="text-ink-soft text-sm mt-1">Tips, corrections, compliments, or complaints — all welcome.</p>
      </div>

      {status === "done" ? (
        <div className="border border-line bg-paper-raised p-6 text-center">
          <p className="font-display text-xl mb-1">Message sent</p>
          <p className="text-ink-soft text-sm">The editor will read it. Reply times vary with newsroom chaos.</p>
          <button className="btn-secondary mt-4" onClick={() => setStatus("idle")}>Send another</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" className="input" required value={form.name} onChange={update("name")} maxLength={100} />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" required value={form.email} onChange={update("email")} />
          </div>
          <div>
            <label className="label" htmlFor="message">Message</label>
            <textarea id="message" className="input min-h-[140px]" required value={form.message} onChange={update("message")} maxLength={3000} />
          </div>
          {error && <p className="text-brick text-sm">{error}</p>}
          <button type="submit" className="btn-primary" disabled={status === "submitting"}>
            {status === "submitting" ? "Sending..." : "Send message"}
          </button>
        </form>
      )}
    </div>
  );
}
