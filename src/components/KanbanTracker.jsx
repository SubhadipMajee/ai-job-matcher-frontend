import { useState, useEffect } from "react";

const STAGES = [
  { id: "saved", label: "Saved", color: "var(--muted)", icon: "📌" },
  { id: "applied", label: "Applied", color: "#5b8fd4", icon: "📨" },
  { id: "interview", label: "Interview", color: "var(--gold)", icon: "🎙️" },
  { id: "offer", label: "Offer", color: "var(--green)", icon: "🎉" },
  { id: "rejected", label: "Archived", color: "var(--red)", icon: "📁" },
];

export default function KanbanTracker({ token, apiPost }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchApplications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiPost("/tracker", null, {
        headers: { Authorization: `Bearer ${token}` }
      }, "GET");
      setApplications(res?.data?.applications || []);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token]);

  const handleMoveStage = async (id, nextStage) => {
    try {
      await apiPost(`/tracker/${id}`, { stage: nextStage }, {
        headers: { Authorization: `Bearer ${token}` }
      }, "PATCH");
      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, stage: nextStage } : app))
      );
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleSaveNotes = async (id) => {
    try {
      await apiPost(`/tracker/${id}`, { notes: editNotes }, {
        headers: { Authorization: `Bearer ${token}` }
      }, "PATCH");
      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, notes: editNotes } : app))
      );
      setEditingId(null);
    } catch (err) {
      alert("Failed to save notes: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this application from tracker?")) return;
    try {
      await apiPost(`/tracker/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      }, "DELETE");
      setApplications(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      alert("Failed to delete application: " + err.message);
    }
  };

  const handleAddManual = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    try {
      const res = await apiPost("/tracker", {
        job_id: `${newTitle.trim()}|${newCompany.trim()}`.toLowerCase().replace(/\s+/g, "-"),
        title: newTitle.trim(),
        company: newCompany.trim(),
        stage: "saved"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res?.data) {
        setApplications(prev => [res.data, ...prev]);
        setNewTitle("");
        setNewCompany("");
        setShowAddForm(false);
      }
    } catch (err) {
      alert("Failed to create application: " + err.message);
    }
  };

  if (!token) {
    return (
      <div className="panel" style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
        <div className="form-title" style={{ marginBottom: 8 }}>Sign in to use Application Tracker</div>
        <p className="form-desc" style={{ maxWidth: 440, margin: "0 auto 20px" }}>
          Track job applications across columns (Saved, Applied, Interview, Offer) with personal notes and interview dates synced to your Supabase account.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div className="form-title" style={{ margin: 0 }}>Application Kanban Tracker</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            {applications.length} active application{applications.length === 1 ? "" : "s"} tracked
          </div>
        </div>
        <button
          className="act-btn"
          style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "+ Add Application"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddManual} className="panel fade-up" style={{ marginBottom: 20 }}>
          <div className="two-col" style={{ marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Job Role / Title</label>
              <input
                className="input"
                required
                placeholder="e.g. Senior Frontend Engineer"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Company Name</label>
              <input
                className="input"
                required
                placeholder="e.g. Stripe"
                value={newCompany}
                onChange={e => setNewCompany(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="submit-btn" style={{ marginTop: 0, padding: 10 }}>
            Save Application
          </button>
        </form>
      )}

      {loading && <div className="progress"><div className="progress-inner" /></div>}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: 14,
        alignItems: "start"
      }}>
        {STAGES.map(stage => {
          const items = applications.filter(app => (app.stage || "saved") === stage.id);

          return (
            <div
              key={stage.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "14px 12px",
                minHeight: 300
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: "1px solid var(--border)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13, color: stage.color }}>
                  <span>{stage.icon}</span>
                  <span>{stage.label}</span>
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  background: "var(--surface2)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  color: "var(--muted)"
                }}>
                  {items.length}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 8px", color: "var(--muted)", fontSize: 12, fontStyle: "italic" }}>
                    No jobs here
                  </div>
                ) : (
                  items.map(app => (
                    <div
                      key={app.id}
                      style={{
                        background: "var(--surface2)",
                        border: "1px solid var(--border2)",
                        borderRadius: 8,
                        padding: 12,
                        position: "relative"
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--cream)", marginBottom: 2 }}>
                        {app.title}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--gold)", marginBottom: 8 }}>
                        {app.company}
                      </div>

                      {app.link && (
                        <a
                          href={app.link}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-block",
                            fontSize: 11,
                            color: "var(--muted)",
                            marginBottom: 8,
                            textDecoration: "underline"
                          }}
                        >
                          View Posting ↗
                        </a>
                      )}

                      {editingId === app.id ? (
                        <div style={{ marginTop: 8 }}>
                          <textarea
                            className="input"
                            rows={3}
                            value={editNotes}
                            onChange={e => setEditNotes(e.target.value)}
                            placeholder="Add notes, recruiter contacts, or interview dates..."
                            style={{ fontSize: 12, padding: 8 }}
                          />
                          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                            <button
                              className="act-btn"
                              style={{ padding: "4px 8px", fontSize: 11 }}
                              onClick={() => handleSaveNotes(app.id)}
                            >
                              Save
                            </button>
                            <button
                              className="act-btn"
                              style={{ padding: "4px 8px", fontSize: 11 }}
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => { setEditingId(app.id); setEditNotes(app.notes || ""); }}
                          style={{
                            fontSize: 11,
                            color: app.notes ? "var(--text)" : "var(--muted)",
                            fontStyle: app.notes ? "normal" : "italic",
                            cursor: "pointer",
                            background: "var(--bg)",
                            padding: "6px 8px",
                            borderRadius: 4,
                            marginBottom: 8,
                            lineHeight: 1.4
                          }}
                          title="Click to edit notes"
                        >
                          {app.notes || "+ Add notes / interview date"}
                        </div>
                      )}

                      {/* Move Stage Selector */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                        <select
                          className="input"
                          style={{ padding: "4px 6px", fontSize: 11, width: "auto", height: 26 }}
                          value={app.stage}
                          onChange={e => handleMoveStage(app.id, e.target.value)}
                        >
                          {STAGES.map(s => (
                            <option key={s.id} value={s.id}>
                              Move: {s.label}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleDelete(app.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--muted)",
                            cursor: "pointer",
                            fontSize: 13,
                            padding: 2
                          }}
                          title="Delete card"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
