import { useEffect, useState } from "react";
import { api } from "../../api/client";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";

export default function Inbox() {
  const [data, setData] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setData(null);
    api.get("/contact", { limit: 100 }).then(setData);
  };

  useEffect(load, []);

  const markRead = async (id) => {
    setBusyId(id);
    try {
      await api.put(`/contact/${id}/read`);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    setBusyId(id);
    try {
      await api.del(`/contact/${id}`);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Inbox</h1>
        {data && (
          <span className="kicker">{data.unread} unread of {data.total}</span>
        )}
      </div>

      {data === null ? (
        <LoadingState />
      ) : data.items.length === 0 ? (
        <EmptyState title="No messages yet" />
      ) : (
        <ul className="space-y-3">
          {data.items.map((m) => (
            <li key={m.id} className={`border p-4 ${m.read ? "border-line bg-paper-raised" : "border-denim bg-paper-raised"}`}>
              <div className="flex items-baseline justify-between gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-sm">
                  {m.name} <span className="font-normal text-ink-soft">&lt;{m.email}&gt;</span>
                </span>
                <span className="font-mono text-[11px] text-ink-soft">
                  {new Date(m.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-ink-soft whitespace-pre-wrap mb-3">{m.message}</p>
              <div className="flex gap-2">
                {!m.read && (
                  <button onClick={() => markRead(m.id)} disabled={busyId === m.id} className="btn-ghost text-denim">
                    Mark read
                  </button>
                )}
                <button onClick={() => remove(m.id)} disabled={busyId === m.id} className="btn-ghost text-brick">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
