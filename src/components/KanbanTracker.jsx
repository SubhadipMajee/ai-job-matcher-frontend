import { useState, useEffect } from "react";

const STAGES = [
  { id: "saved", label: "Saved", dotColor: "bg-slate-400 ring-slate-400/20", countBg: "bg-slate-800 text-slate-400", border: "border-slate-800/80" },
  { id: "applied", label: "Applied", dotColor: "bg-sky-400 ring-sky-400/20", countBg: "bg-slate-800 text-slate-400", border: "border-slate-800/80" },
  { id: "interview", label: "Interviewing", dotColor: "bg-amber-400 ring-amber-400/20 animate-pulse", countBg: "bg-amber-500/10 text-amber-300 border border-amber-500/20", border: "border-amber-500/30 ring-1 ring-amber-500/20" },
  { id: "offer", label: "Offer Received", dotColor: "bg-emerald-400 ring-emerald-400/20", countBg: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20", border: "border-emerald-500/30 ring-1 ring-emerald-500/20" },
];

export default function KanbanTracker({ token, apiPost, onOpenTailor, onOpenPrep }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesText, setNotesText] = useState("");

  // New Application Form
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newStage, setNewStage] = useState("saved");
  const [newNotes, setNewNotes] = useState("");

  const fetchApplications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiPost("/tracker", null, {
        Authorization: `Bearer ${token}`
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

  const handleMoveStage = async (id, currentStage) => {
    const stageOrder = ["saved", "applied", "interview", "offer"];
    const currentIndex = stageOrder.indexOf(currentStage);
    const nextStage = stageOrder[(currentIndex + 1) % stageOrder.length];

    try {
      await apiPost(`/tracker/${id}`, { stage: nextStage }, {
        Authorization: `Bearer ${token}`
      }, "PATCH");
      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, stage: nextStage } : app))
      );
    } catch (err) {
      alert("Failed to advance stage: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleSaveNotes = async (id) => {
    try {
      await apiPost(`/tracker/${id}`, { notes: notesText }, {
        Authorization: `Bearer ${token}`
      }, "PATCH");
      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, notes: notesText } : app))
      );
      setEditingNotesId(null);
    } catch (err) {
      alert("Failed to save notes: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this opportunity from your tracker?")) return;
    try {
      await apiPost(`/tracker/${id}`, null, {
        Authorization: `Bearer ${token}`
      }, "DELETE");
      setApplications(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      alert("Failed to delete application: " + err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    try {
      const notePayload = newSalary.trim() ? `[Salary: ${newSalary.trim()}] ${newNotes.trim()}` : newNotes.trim();
      const res = await apiPost("/tracker", {
        job_id: `${newTitle.trim()}|${newCompany.trim()}`.toLowerCase().replace(/\s+/g, "-"),
        title: newTitle.trim(),
        company: newCompany.trim(),
        link: newLink.trim(),
        stage: newStage,
        notes: notePayload
      }, {
        Authorization: `Bearer ${token}`
      });

      if (res?.data) {
        setApplications(prev => [res.data, ...prev]);
        setNewTitle("");
        setNewCompany("");
        setNewLink("");
        setNewSalary("");
        setNewNotes("");
        setShowAddModal(false);
      }
    } catch (err) {
      alert("Failed to add application: " + err.message);
    }
  };

  const filteredApps = applications.filter(app => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (app.title || "").toLowerCase().includes(q) ||
      (app.company || "").toLowerCase().includes(q) ||
      (app.notes || "").toLowerCase().includes(q)
    );
  });

  return (
    <section className="flex flex-col gap-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-serif text-white font-medium">Application Pipeline</h2>
            <span className="text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 px-2.5 py-0.5 rounded-full">
              {applications.length} Active Application{applications.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Drag cards across stages to automatically update AI interview reminders & prep sheets.
          </p>
        </div>

        {/* Filter & Add Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Search role, company..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-48 sm:w-56 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 border border-amber-500/50 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition shadow-sm"
          >
            <span>+</span>
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="h-0.5 w-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-amber-500 animate-pulse w-1/3"></div>
        </div>
      )}

      {/* 4 Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {STAGES.map(stage => {
          const items = filteredApps.filter(a => (a.stage || "saved") === stage.id);

          return (
            <div
              key={stage.id}
              className="flex flex-col rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3 min-h-[580px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ring-4 ${stage.dotColor}`}></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">{stage.label}</h3>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${stage.countBg}`}>
                  {items.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex flex-col gap-3 flex-1">
                {items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-900 rounded-xl">
                    <span className="text-xs text-slate-600 font-light italic">No opportunities</span>
                  </div>
                ) : (
                  items.map(app => {
                    const companyInitial = (app.company || "C").charAt(0).toUpperCase();

                    return (
                      <article
                        key={app.id}
                        className="kanban-card p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer group flex flex-col gap-2.5"
                      >
                        {/* Card Header: Company Logo initial & Title */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-xs text-amber-300">
                              {companyInitial}
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-white group-hover:text-amber-300 transition">
                                {app.title}
                              </h4>
                              <span className="text-[11px] text-slate-400">
                                {app.company}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDelete(app.id)}
                            className="text-slate-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition p-0.5"
                            title="Delete card"
                          >
                            ×
                          </button>
                        </div>

                        {/* Interview or Offer Details banner if notes present */}
                        {stage.id === "interview" && (
                          <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs">
                            <div className="flex items-center justify-between text-amber-300 font-semibold mb-0.5 text-[11px]">
                              <span>Interview Round</span>
                              <span className="text-amber-400/80">Active</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-snug">
                              {app.notes || "Prepare technical talking points and company background."}
                            </p>
                          </div>
                        )}

                        {stage.id === "offer" && (
                          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
                            <div className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                              Compensation & Terms
                            </div>
                            <div className="text-xs font-bold text-white mt-0.5">
                              {app.notes || "Review offer package & decision deadline."}
                            </div>
                          </div>
                        )}

                        {stage.id !== "interview" && stage.id !== "offer" && app.notes && (
                          <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800">
                            {app.notes}
                          </div>
                        )}

                        {/* Card Footer: Metadata & Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                          {app.link ? (
                            <a
                              href={app.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                            >
                              <span>Posting ↗</span>
                            </a>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Tracked</span>
                          )}

                          <div className="flex items-center gap-2">
                            {stage.id === "interview" && (
                              <button
                                onClick={() => onOpenPrep && onOpenPrep(app)}
                                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                              >
                                🧠 AI Prep
                              </button>
                            )}

                            <button
                              onClick={() => handleMoveStage(app.id, stage.id)}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1"
                              title="Advance to next column"
                            >
                              <span>➔</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}

                {/* Quick Add Placeholder */}
                <button
                  type="button"
                  onClick={() => { setNewStage(stage.id); setShowAddModal(true); }}
                  className="w-full py-2.5 border border-dashed border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition flex items-center justify-center gap-1.5 mt-auto"
                >
                  <span>+ Save another opportunity</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
            >
              ×
            </button>
            <h3 className="text-lg font-serif text-white font-semibold mb-1">Add Job Opportunity</h3>
            <p className="text-xs text-slate-400 mb-4">Track a new job posting on your personal Kanban board.</p>

            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Job Role / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Linear"
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $160k - $190k"
                    value={newSalary}
                    onChange={e => setNewSalary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Starting Column</label>
                  <select
                    value={newStage}
                    onChange={e => setNewStage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interviewing</option>
                    <option value="offer">Offer Received</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Job Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://company.com/jobs/..."
                  value={newLink}
                  onChange={e => setNewLink(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Notes / Interview Date</label>
                <textarea
                  rows={2}
                  placeholder="Interview notes, recruiter contacts, or deadlines..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
                >
                  Save to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
