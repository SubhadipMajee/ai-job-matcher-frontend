import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "./supabase";
import AuthModal from "./components/AuthModal";
import KanbanTracker from "./components/KanbanTracker";
import DiffViewer from "./components/DiffViewer";
import DigestSettings from "./components/DigestSettings";
import ApplyPackModal from "./components/ApplyPackModal";
import InterviewPrepView from "./components/InterviewPrepView";

const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

let envApi = import.meta.env.VITE_API_URL;
if (envApi && envApi.includes("0oc7")) {
  envApi = null;
}

const API = envApi || (isLocal ? "/api" : "https://ai-job-matcher-api.onrender.com");

async function apiReq(method, path, data = null, customHeaders = {}, retries = 2) {
  const targetUrls = isLocal ? ["/api", "http://127.0.0.1:8000", "https://ai-job-matcher-api.onrender.com"] : [API];

  let lastError;
  for (const baseUrl of targetUrls) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await axios({
          method,
          url: `${baseUrl}${path}`,
          data,
          headers: customHeaders,
          timeout: 120000,
        });
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        const isGatewayError = status === 502 || status === 503 || status === 504;
        if (err.response && !isGatewayError) {
          throw err;
        }
        const isNetworkError = (!err.response || isGatewayError) && (err.code === "ECONNABORTED" || err.message === "Network Error" || isGatewayError);
        if (isNetworkError && attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        break;
      }
    }
  }
  throw lastError;
}

const apiPost = (path, data, customHeaders = {}, method = "POST") => apiReq(method, path, data, customHeaders);

function renderFormattedResume(text) {
  if (!text) return "";
  const lines = text.split("\n");
  let html = "";
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h2 class="text-xl font-bold text-amber-400 mt-4 mb-1">${line.slice(3).trim()}</h2>`;
      if (i + 1 < lines.length && !lines[i + 1].startsWith("#") && !lines[i + 1].startsWith("-") && lines[i + 1].trim()) {
        i++;
        html += `<div class="text-xs text-slate-400 mb-4">${lines[i].trim()}</div>`;
      }
      continue;
    }
    if (line.startsWith("### ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h3 class="text-sm font-semibold text-white uppercase tracking-wider mt-4 mb-2 border-b border-slate-800 pb-1">${line.slice(4).trim()}</h3>`;
      continue;
    }
    if (line.match(/^\s*[-•*]\s/)) {
      if (!inList) { html += "<ul class='list-disc pl-5 space-y-1 text-xs text-slate-300 my-2'>"; inList = true; }
      let content = line.replace(/^\s*[-•*]\s+/, "");
      content = content.replace(/\*\*(.+?)\*\*/g, "<strong class='text-white font-medium'>$1</strong>");
      content = content.replace(/\*(.+?)\*/g, "<em>$1</em>");
      html += `<li>${content}</li>`;
      continue;
    }
    if (inList) { html += "</ul>"; inList = false; }
    if (!line.trim()) continue;
    let processed = line.replace(/\*\*(.+?)\*\*/g, "<strong class='text-white font-medium'>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
    html += `<p class="text-xs text-slate-300 my-1">${processed}</p>`;
  }
  if (inList) html += "</ul>";
  return html;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("find");

  // User Auth State
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Job Search State
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState("full stack developer");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [minScore, setMinScore] = useState(40);
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeSkills, setResumeSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [results, setResults] = useState({});
  const [expanded, setExpanded] = useState({});
  const [busy, setBusy] = useState({});
  const [actionErrors, setActionErrors] = useState({});
  const [cardTab, setCardTab] = useState({});

  // Tailor & Diff State
  const [tailorFile, setTailorFile] = useState(null);
  const [tailorJD, setTailorJD] = useState("");
  const [tailorResumeText, setTailorResumeText] = useState("");
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailorResult, setTailorResult] = useState("");
  const [diffData, setDiffData] = useState(null);

  // Modals & Application Tracking
  const [activeApplyPack, setActiveApplyPack] = useState(null);
  const [serverStatus, setServerStatus] = useState("");
  const [activePipelineCount, setActivePipelineCount] = useState(0);

  const setB = (k, v) => setBusy(p => ({ ...p, [k]: v }));
  const upd = (i, data) => setResults(p => ({ ...p, [i]: { ...p[i], ...data } }));
  const setErr = (k, msg) => setActionErrors(p => ({ ...p, [k]: msg }));
  const clearErr = (k) => setActionErrors(p => { const next = { ...p }; delete next[k]; return next; });

  // Load Auth Session
  useEffect(() => {
    if (window.location.hash.includes("otp_expired")) {
      window.history.replaceState(null, "", window.location.pathname);
      setShowAuthModal(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        setShowAuthModal(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Saved Resume & Active Pipeline Count if Logged In
  useEffect(() => {
    if (session?.access_token) {
      if (!resumeText) {
        apiReq("GET", "/resume", null, {
          Authorization: `Bearer ${session.access_token}`
        }).then(res => {
          if (res?.data?.resume_text) {
            setResumeText(res.data.resume_text);
            setResumeSkills(res.data.resume_skills || []);
          }
        }).catch(() => {});
      }

      // Sync user's real Kanban pipeline count
      apiReq("GET", "/tracker", null, {
        Authorization: `Bearer ${session.access_token}`
      }).then(res => {
        const apps = res?.data?.applications || [];
        setActivePipelineCount(apps.length);
      }).catch(() => {});
    } else {
      setActivePipelineCount(0);
    }
  }, [session]);

  const saveResumeToCloud = async () => {
    if (!session?.access_token) {
      setShowAuthModal(true);
      return;
    }
    if (!resumeText) return alert("Upload and parse a resume first.");

    try {
      const fd = new FormData();
      fd.append("resume_text", resumeText);
      fd.append("resume_skills", JSON.stringify(resumeSkills));
      await apiPost("/resume/save", fd, {
        Authorization: `Bearer ${session.access_token}`
      });
      alert("✓ Resume successfully synced to your cloud account!");
    } catch (e) {
      alert("Failed to sync resume: " + e.message);
    }
  };

  const analyze = async () => {
    if (!file && !resumeText) return alert("Upload a resume PDF");
    if (!jobRole) return alert("Enter target job role");
    setLoading(true); setJobs([]); setResults({}); setServerStatus("waking");
    try {
      let rText = resumeText;
      let rSkills = resumeSkills;

      if (file) {
        const fd = new FormData(); fd.append("file", file);
        const pr = await apiPost("/parse-resume", fd);
        rText = pr.data.resume_text;
        rSkills = pr.data.resume_skills || [];
        setResumeText(rText);
        setResumeSkills(rSkills);
      }

      setServerStatus("");
      const jf = new FormData();
      jf.append("job_role", jobRole);
      jf.append("location", location);
      jf.append("job_type", jobType);
      jf.append("experience_level", experienceLevel);
      jf.append("resume_skills", JSON.stringify(rSkills || []));
      const jr = await apiPost("/fetch-jobs", jf);
      const rawJobs = jr.data.jobs || [];

      // P0 #3: Sort results by score descending
      const sortedJobs = [...rawJobs].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      setJobs(sortedJobs);

      // P0 #1: Immediately populate score and skill overlap for every job
      const initResults = {};
      sortedJobs.forEach((j, i) => {
        initResults[i] = {
          score: j.score,
          matched_skills: j.matched_skills || [],
          missing: j.missing_skills || [],
          missing_skills: j.missing_skills || [],
        };
      });
      setResults(initResults);
    } catch (e) {
      setServerStatus("error");
      alert("Error: " + (e.response?.data?.detail || e.message));
    }
    setLoading(false);
  };

  const matchScore = async (job, i) => {
    setB(`m${i}`, true);
    clearErr(`m${i}`);
    try {
      if (!resumeSkills || resumeSkills.length === 0) {
        setErr(`m${i}`, "Upload and parse your resume first to extract skills.");
        setB(`m${i}`, false);
        return;
      }

      let jSkills = results[i]?.job_skills;
      if (!jSkills || jSkills.length === 0) {
        const sf = new FormData();
        sf.append("job_description", job.description || "");
        const sr = await apiPost("/job-skills", sf);
        jSkills = sr.data.job_skills || [];
      }

      const fd = new FormData();
      fd.append("resume_skills", JSON.stringify(resumeSkills));
      fd.append("job_skills", JSON.stringify(jSkills));
      fd.append("job_description", job.description || "");
      const res = await apiPost("/match", fd);
      const score = res.data.score ?? res.data.match_score ?? 0;
      upd(i, {
        score,
        matched_skills: res.data.matched_skills || [],
        missing: res.data.missing_skills || [],
        missing_skills: res.data.missing_skills || [],
        job_skills: jSkills,
      });
      setExpanded(p => ({ ...p, [i]: true }));
    } catch (e) {
      setErr(`m${i}`, e.response?.data?.detail || e.message);
    }
    setB(`m${i}`, false);
  };

  const semanticMatch = async (job, i) => {
    setB(`sm${i}`, true);
    clearErr(`sm${i}`);
    try {
      const fd = new FormData();
      fd.append("resume_skills", JSON.stringify(resumeSkills));
      fd.append("job_description", job.description);
      fd.append("threshold", "50");
      const res = await apiPost("/semantic-match", fd);
      upd(i, { semantic: res.data });
      setExpanded(p => ({ ...p, [i]: true }));
    } catch (e) {
      setErr(`sm${i}`, e.response?.data?.detail || e.message);
    }
    setB(`sm${i}`, false);
  };

  const atsScore = async (job, i) => {
    setB(`ats${i}`, true);
    clearErr(`ats${i}`);
    try {
      const fd = new FormData();
      fd.append("resume_text", resumeText);
      fd.append("job_description", job.description);
      const res = await apiPost("/ats-score", fd);
      upd(i, { ats: res.data });
      setExpanded(p => ({ ...p, [i]: true }));
    } catch (e) {
      setErr(`ats${i}`, e.response?.data?.detail || e.message);
    }
    setB(`ats${i}`, false);
  };

  const skillRoadmap = async (job, i) => {
    const missing = results[i]?.missing || results[i]?.semantic?.missing_skills;
    if (!missing || missing.length === 0) {
      setErr(`rm${i}`, "No missing skills identified to build a roadmap.");
      return;
    }
    setB(`rm${i}`, true);
    clearErr(`rm${i}`);
    try {
      const fd = new FormData();
      fd.append("missing_skills", JSON.stringify(missing));
      const res = await apiPost("/skill-roadmap", fd);
      upd(i, { roadmap: res.data.roadmap });
      setExpanded(p => ({ ...p, [i]: true }));
    } catch (e) {
      setErr(`rm${i}`, e.response?.data?.detail || e.message);
    }
    setB(`rm${i}`, false);
  };

  const interviewPrep = async (job, i) => {
    setB(`ip${i}`, true);
    clearErr(`ip${i}`);
    try {
      const fd = new FormData();
      fd.append("resume_text", resumeText);
      fd.append("job_description", job.description);
      const res = await apiPost("/interview-prep", fd);
      upd(i, { interviewPrep: res.data });
      setExpanded(p => ({ ...p, [i]: true }));
    } catch (e) {
      setErr(`ip${i}`, e.response?.data?.detail || e.message);
    }
    setB(`ip${i}`, false);
  };

  const applyPack = async (job, i) => {
    setB(`ap${i}`, true);
    clearErr(`ap${i}`);
    try {
      const f = new FormData();
      f.append("resume_text", resumeText);
      f.append("job_title", job.title);
      f.append("company", job.company);
      f.append("job_description", job.description);
      f.append("link", job.link || "");
      const r = await apiPost("/apply-pack", f);
      setActiveApplyPack(r.data);
    } catch (e) {
      setErr(`ap${i}`, e.response?.data?.detail || e.message);
    }
    setB(`ap${i}`, false);
  };

  const trackJob = async (job, i) => {
    if (!session?.access_token) {
      setShowAuthModal(true);
      return;
    }
    setB(`tr${i}`, true);
    try {
      await apiPost("/tracker", {
        job_id: `${job.title}|${job.company}`.toLowerCase().replace(/\s+/g, "-"),
        title: job.title,
        company: job.company,
        link: job.link || "",
        stage: "saved"
      }, {
        Authorization: `Bearer ${session.access_token}`
      });
      alert(`✓ "${job.title} @ ${job.company}" added to your Kanban tracker!`);
      setActivePipelineCount(p => p + 1);
    } catch (e) {
      if (e.response?.status === 401) {
        alert("Your login session has expired. Please sign in again.");
        setShowAuthModal(true);
      } else {
        alert("Failed to track job: " + (e.response?.data?.detail || e.message));
      }
    }
    setB(`tr${i}`, false);
  };

  const tailorResume = async () => {
    if (!tailorFile && !resumeText) return alert("Upload your resume PDF");
    if (!tailorJD) return alert("Paste a job description");
    setTailorLoading(true);
    setTailorResult("");
    setDiffData(null);
    setServerStatus("waking");
    try {
      let rText = tailorResumeText || resumeText;
      if (!rText && tailorFile) {
        const fd = new FormData(); fd.append("file", tailorFile);
        const pr = await apiPost("/parse-resume", fd);
        rText = pr.data.resume_text;
        setTailorResumeText(rText);
      }
      setServerStatus("");
      const td = new FormData();
      td.append("resume_text", rText);
      td.append("job_description", tailorJD);
      const tr = await apiPost("/tailor-resume", td);
      setTailorResult(tr.data.tailored_resume);
    } catch (e) {
      setServerStatus("error");
      alert("Tailoring error: " + (e.response?.data?.detail || e.message));
    }
    setTailorLoading(false);
  };

  const viewDiff = async () => {
    const orig = tailorResumeText || resumeText;
    if (!orig || !tailorResult) return alert("Generate a tailored resume first to compare.");
    try {
      const fd = new FormData();
      fd.append("original_text", orig);
      fd.append("tailored_text", tailorResult);
      const r = await apiPost("/diff-resume", fd);
      setDiffData(r.data);
    } catch (e) {
      alert("Diff error: " + e.message);
    }
  };

  const dlTxt = (text, name) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = name; a.click();
  };

  // User initials
  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "SM";

  // Compute highest match score dynamically from results
  const validScores = Object.values(results)
    .map(r => r?.semantic?.score ?? r?.score)
    .filter(s => typeof s === "number" && !isNaN(s) && s > 0);
  const highestScore = validScores.length > 0 ? Math.max(...validScores) : 0;

  return (
    <div className="app-shell text-slate-200">

      {/* ════ TOP BAR ════ */}
      <header className="app-topbar sticky top-0 z-50 border-b border-brand-border bg-brand-panel/95 backdrop-blur-md flex items-center justify-between px-4 lg:px-6" style={{height:"56px"}}>
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20 flex-shrink-0">
            ✦
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-[10px] font-semibold tracking-widest text-amber-500/80 uppercase">AI Career Co-Pilot</span>
            <span className="text-sm font-semibold text-white tracking-tight">Job Search OS</span>
          </div>
          <span className="sm:hidden text-sm font-bold text-white">Co-Pilot</span>
          <div className="hidden lg:block h-5 w-px bg-brand-border mx-1" />
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            {jobs.length > 0 ? `${jobs.length} matches` : "Live"}
          </div>
        </div>


        {/* Right */}
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-surface border border-brand-border text-[11px]">
              <span className="text-slate-400">Pipeline</span>
              <span className="text-white font-bold">{activePipelineCount}</span>
              <span className="text-sky-400 font-medium">{user ? "in flight" : "demo"}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-surface border border-brand-border text-[11px]">
              <span className="text-slate-400">Top</span>
              <span className="text-emerald-400 font-bold">{highestScore > 0 ? `${highestScore}%` : "—"}</span>
            </div>
          </div>
          <div className="h-5 w-px bg-brand-border" />
          {user ? (
            <div className="flex items-center gap-2">
              {resumeText && (
                <button onClick={saveResumeToCloud} className="hidden sm:flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 px-2 py-1 rounded-md hover:bg-amber-500/10 transition" title="Sync resume">
                  ☁️ Sync
                </button>
              )}
              <div className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-full bg-brand-surface border border-brand-border hover:border-slate-600 transition cursor-pointer">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">{userInitials}</div>
                )}
                <span className="hidden md:inline text-[11px] text-slate-300 font-medium max-w-[120px] truncate">{user.user_metadata?.full_name || user.email}</span>
              </div>
              <button onClick={() => supabase.auth.signOut()} className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-brand-surface transition">Out</button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition">
              Sign In →
            </button>
          )}
        </div>
      </header>

      {/* ════ SIDEBAR ════ */}
      <nav className="app-sidebar" aria-label="Main Navigation">
        {/* Resume chip */}
        <div className="mb-4 p-3 rounded-xl bg-brand-surface border border-brand-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm flex-shrink-0">📄</div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-white truncate">{file ? file.name : resumeText ? "Cloud Resume" : "No Resume"}</div>
              <div className="text-[10px] text-slate-400">{resumeSkills.length > 0 ? `${resumeSkills.length} skills parsed` : "Upload to start"}</div>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-1.5">Workspace</div>

        {[
          { id: "find",    icon: "🔍", label: "Job Matcher",    badge: jobs.length > 0 ? jobs.length : null },
          { id: "tailor",  icon: "✨", label: "Tailor & Diff",  badge: null },
          { id: "tracker", icon: "📌", label: "Kanban Tracker", badge: activePipelineCount },
          { id: "digest",  icon: "📬", label: "Daily Digest",   badge: null },
        ].map(({ id, icon, label, badge }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`nav-item w-full text-left ${activeTab === id ? "active" : ""}`}>
            <span className="nav-icon">{icon}</span>
            <span className="flex-1">{label}</span>
            {badge != null && badge > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-amber-500 text-slate-950" : "bg-brand-border text-slate-300"}`}>{badge}</span>
            )}
          </button>
        ))}

        <div className="flex-1" />
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-1.5">Stats</div>
        <div className="p-3 rounded-xl bg-brand-surface border border-brand-border space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Jobs Scored</span>
            <span className="text-white font-bold">{validScores.length}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Top Match</span>
            <span className="text-emerald-400 font-bold">{highestScore > 0 ? `${highestScore}%` : "—"}</span>
          </div>
          <div className="h-px bg-brand-border" />
          <button
            type="button"
            onClick={() => { setActiveTab("find"); analyze(); }}
            disabled={loading || (!file && !resumeText)}
            className="w-full text-[11px] font-semibold py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 transition flex items-center justify-center gap-1"
          >
            {loading ? "Scanning…" : "⚡ Quick Scan"}
          </button>
        </div>
      </nav>

      {/* ════ MAIN CONTENT ════ */}
      <main className="app-content">
        <div className="px-4 lg:px-8 xl:px-10 py-6 flex flex-col gap-6 max-w-screen-2xl">

          {serverStatus === "waking" && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/8 border border-amber-500/25 text-xs text-amber-300">
              <span className="animate-spin text-base">⏳</span>
              <span>Connecting to AI backend — server waking (~20s on free tier)…</span>
            </div>
          )}

          {/* ── TAB 1: JOB MATCHER ── */}
          {activeTab === "find" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-xl font-serif text-white font-medium tracking-tight">Job Matcher</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Upload your resume — AI scores live openings against your skills in real time.</p>
                </div>
                {jobs.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-brand-surface border border-brand-border px-3 py-1.5 rounded-full font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{jobs.length} opportunities found
                  </div>
                )}
              </div>

              {/* ── Command bar form ── */}
              <div className="surface-card p-5 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Resume (PDF)</label>
                    <div className="relative border border-dashed border-brand-border hover:border-amber-500/60 rounded-xl p-4 text-center cursor-pointer transition bg-brand-panel group">
                      <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">📄</div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        {file ? <span className="text-amber-400 font-semibold">✓ {file.name.slice(0,18)}{file.name.length>18?"…":""}</span>
                          : resumeText ? <span className="text-emerald-400">✓ Loaded</span>
                          : "Drop PDF"}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-3 lg:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Role *</label>
                    <input type="text" placeholder="e.g. Full Stack Developer" value={jobRole} onChange={e => setJobRole(e.target.value)} onKeyDown={e => e.key === "Enter" && analyze()} className="w-full bg-brand-panel border border-brand-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 transition" />
                  </div>
                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Experience</label>
                    <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className="w-full bg-brand-panel border border-brand-border rounded-xl px-3 py-2.5 text-xs text-white transition">
                      <option value="">Any Experience</option>
                      <option value="ENTRY_LEVEL">Entry Level (0-2 yrs)</option>
                      <option value="MID_LEVEL">Mid Level (3-5 yrs)</option>
                      <option value="SENIOR">Senior (5-8 yrs)</option>
                      <option value="LEAD">Lead / Staff (8+ yrs)</option>
                      <option value="EXECUTIVE">Executive / Dir</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                    <input type="text" placeholder="Remote, Bangalore, Kolkata…" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-brand-panel border border-brand-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition" />
                  </div>
                  <div className="md:col-span-1 lg:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                    <select value={jobType} onChange={e => setJobType(e.target.value)} className="w-full bg-brand-panel border border-brand-border rounded-xl px-2 py-2.5 text-xs text-white transition">
                      <option value="">Any</option>
                      <option value="FULLTIME">Full Time</option>
                      <option value="PARTTIME">Part Time</option>
                      <option value="INTERN">Intern</option>
                      <option value="CONTRACTOR">Contract</option>
                    </select>
                  </div>
                  <div className="md:col-span-1 lg:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Min Score</label>
                      <span className="text-[11px] font-mono font-bold text-amber-400">{minScore}%</span>
                    </div>
                    <input type="range" min="0" max="80" step="5" value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
                  </div>
                  <div className="md:col-span-1 lg:col-span-1">
                    <button type="button" onClick={analyze} disabled={loading} className="w-full py-2.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 whitespace-nowrap">
                      {loading ? (
                        <>
                          <span className="animate-spin text-sm">⟳</span>
                          <span>Scanning…</span>
                        </>
                      ) : (
                        <>
                          <span>Find Matches</span>
                          <span className="text-sm font-bold">→</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Results grid ── */}
              {jobs.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-white">Scored Opportunities</h2>
                      {experienceLevel && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 capitalize">
                          {experienceLevel.replace("_", " ").toLowerCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {jobs.filter((_, i) => { const sc = results[i]?.semantic?.score ?? results[i]?.score; return sc === undefined || sc >= minScore; }).length} / {jobs.length} visible
                    </span>
                  </div>

                  {/* P1 #4 Fix: items-start prevents neighboring cards from stretching */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                    {jobs.map((job, i) => {
                      const r = results[i];
                      const isOpen = expanded[i];
                      const sc = r?.semantic?.score ?? r?.score;
                      if (sc !== undefined && sc < minScore) return null;
                      const activeSubTab = cardTab[i] || "skills";
                      const scoreColor = sc === undefined
                        ? "bg-brand-surface text-slate-500 border-brand-border"
                        : sc >= 75 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : sc >= 50 ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        : "bg-brand-surface text-slate-400 border-brand-border";

                      return (
                        <article key={i} className={`job-card ${isOpen ? "is-open" : ""} overflow-hidden rounded-xl border border-brand-border bg-brand-surface transition-all duration-200`}>
                          {/* P1 #7 Fix: Entire card header clickable with interactive hover state */}
                          <div
                            onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}
                            className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition-colors select-none group"
                          >
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition leading-snug">
                                {job.title}
                              </h3>
                              <div className="text-xs text-slate-400 mt-0.5 font-medium">{job.company}</div>

                              {/* P1 #5 Badges: salary, date posted, experience, location */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {job.location && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                                    📍 {job.location}
                                  </span>
                                )}
                                {job.job_type && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                                    💼 {job.job_type}
                                  </span>
                                )}
                                {job.experience && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 font-medium font-mono">
                                    ⏳ {job.experience}
                                  </span>
                                )}
                                {job.salary && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-medium font-mono">
                                    💰 {job.salary}
                                  </span>
                                )}
                                {job.date_posted && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                                    📅 {job.date_posted}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* P0 #1 Score Badge */}
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <span className={`text-[11px] font-bold font-mono px-2.5 py-1 rounded-full border ${scoreColor}`}>
                                {sc !== undefined ? `${sc}% Match` : "—"}
                              </span>
                              <span className="text-slate-400 text-xs group-hover:text-white transition">
                                {isOpen ? "▲" : "▼"}
                              </span>
                            </div>
                          </div>

                          {/* P1 #5 & #6 Expanded card details */}
                          {isOpen && (
                            <div className="border-t border-brand-border bg-brand-panel/70 p-4 flex flex-col gap-4">

                              {/* Short Description */}
                              {job.description && (
                                <div className="text-xs text-slate-300 leading-relaxed bg-brand-surface/70 border border-brand-border/60 rounded-xl p-3">
                                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    Role Summary
                                  </div>
                                  <p className="line-clamp-3">
                                    {job.description}
                                  </p>
                                </div>
                              )}

                              {/* Key Qualifications */}
                              {job.qualifications?.length > 0 && (
                                <div className="text-xs text-slate-300 bg-brand-surface/70 border border-brand-border/60 rounded-xl p-3">
                                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                    Key Requirements
                                  </div>
                                  <ul className="space-y-1 text-[11px]">
                                    {job.qualifications.map((q, qi) => (
                                      <li key={qi} className="flex items-start gap-1.5">
                                        <span className="text-amber-400">•</span>
                                        <span>{q}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* P1 #6 Primary Action Bar */}
                              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => applyPack(job, i)}
                                  disabled={busy[`ap${i}`]}
                                  className="flex-1 min-w-[170px] py-2 px-3.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-md shadow-amber-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  {busy[`ap${i}`] ? (
                                    <>
                                      <span className="animate-spin text-sm">⟳</span>
                                      <span>Generating Pack…</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>📦 Generate Apply Pack</span>
                                      <span className="text-[10px] font-normal opacity-80">(Resume + Cover)</span>
                                    </>
                                  )}
                                </button>

                                <a
                                  href={job.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-brand-surface hover:bg-slate-700 text-white border border-brand-border transition flex items-center gap-1.5"
                                >
                                  <span>Apply Direct</span>
                                  <span>↗</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => trackJob(job, i)}
                                  disabled={busy[`tr${i}`]}
                                  className="py-2 px-3 rounded-xl text-xs font-medium bg-brand-surface hover:bg-slate-700 text-slate-300 border border-brand-border transition flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {busy[`tr${i}`] ? "Saving…" : "📌 Track"}
                                </button>
                              </div>

                              {/* P1 #9 Async Error Alert with Retry */}
                              {actionErrors[`ap${i}`] && (
                                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
                                  <span>⚠️ {actionErrors[`ap${i}`]}</span>
                                  <button
                                    type="button"
                                    onClick={() => applyPack(job, i)}
                                    className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[10px] font-bold"
                                  >
                                    ↺ Retry
                                  </button>
                                </div>
                              )}

                              {/* P1 #6 Unified Deep AI Analysis Panel with Tabs */}
                              <div className="rounded-xl border border-brand-border bg-brand-surface/80 overflow-hidden">
                                {/* Tab Bar */}
                                <div className="flex border-b border-brand-border bg-brand-panel/80 p-1 gap-1 overflow-x-auto">
                                  {[
                                    { id: "skills", label: "Skills & Roadmap", icon: "◎" },
                                    { id: "semantic", label: "Semantic AI", icon: "🧠" },
                                    { id: "ats", label: "ATS Check", icon: "❖" },
                                    { id: "prep", label: "Interview Prep", icon: "🎙️" },
                                  ].map(tab => (
                                    <button
                                      key={tab.id}
                                      type="button"
                                      onClick={() => setCardTab(p => ({ ...p, [i]: tab.id }))}
                                      className={`flex-1 min-w-[90px] py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                                        activeSubTab === tab.id
                                          ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                                      }`}
                                    >
                                      <span>{tab.icon}</span>
                                      <span>{tab.label}</span>
                                    </button>
                                  ))}
                                </div>

                                {/* Tab Contents */}
                                <div className="p-3.5">
                                  {/* TAB 1: Skills & Roadmap */}
                                  {activeSubTab === "skills" && (
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                          Skill Match Breakdown — {sc ?? 0}%
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-400">
                                          {r?.matched_skills?.length || 0} matched · {r?.missing?.length || 0} missing
                                        </div>
                                      </div>

                                      {/* Match bar */}
                                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all duration-300 ${
                                            (sc ?? 0) >= 75 ? "bg-emerald-500" : (sc ?? 0) >= 50 ? "bg-amber-500" : "bg-slate-500"
                                          }`}
                                          style={{ width: `${sc ?? 0}%` }}
                                        />
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <div>
                                          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                                            ✓ Matched Skills
                                          </div>
                                          {r?.matched_skills?.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                              {r.matched_skills.map((s, idx) => (
                                                <span key={idx} className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px]">
                                                  ✓ {s}
                                                </span>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="text-[11px] text-slate-500 italic">No direct keyword overlap found</div>
                                          )}
                                        </div>

                                        <div>
                                          <div className="flex items-center justify-between mb-1.5">
                                            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                                              ✗ Missing Skills
                                            </div>
                                            {r?.missing?.length > 0 && !r?.roadmap && (
                                              <button
                                                type="button"
                                                onClick={() => skillRoadmap(job, i)}
                                                disabled={busy[`rm${i}`]}
                                                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-medium"
                                              >
                                                {busy[`rm${i}`] ? "Loading…" : "Get Roadmap →"}
                                              </button>
                                            )}
                                          </div>
                                          {r?.missing?.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                              {r.missing.map((s, idx) => (
                                                <span key={idx} className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px]">
                                                  ✗ {s}
                                                </span>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="text-[11px] text-slate-500 italic">All key skills matched</div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Roadmap display */}
                                      {r?.roadmap && (
                                        <div className="pt-2 border-t border-brand-border space-y-2 mt-2">
                                          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                            Tailored Learning Roadmap
                                          </div>
                                          {r.roadmap.map((item, ri) => (
                                            <div key={ri} className="p-2 rounded-lg bg-brand-panel border border-brand-border/60">
                                              <div className="flex items-center justify-between text-white text-[11px] font-medium mb-1">
                                                <span>{item.skill}</span>
                                                <div className="flex gap-1.5 text-[9px] text-slate-400">
                                                  <span className="px-1 py-0.5 rounded bg-brand-border">{item.level}</span>
                                                  <span>⏱ {item.time}</span>
                                                </div>
                                              </div>
                                              {item.resources?.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                  {item.resources.map((res, rj) => (
                                                    <a key={rj} href={res.url} target="_blank" rel="noreferrer" className="text-[10px] text-amber-400 hover:text-amber-300 underline">
                                                      {res.name} ({res.type})
                                                    </a>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {actionErrors[`rm${i}`] && (
                                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                                          <span>{actionErrors[`rm${i}`]}</span>
                                          <button type="button" onClick={() => skillRoadmap(job, i)} className="text-[10px] font-bold text-rose-200 underline">↺ Retry</button>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* TAB 2: Semantic AI */}
                                  {activeSubTab === "semantic" && (
                                    <div className="space-y-3">
                                      {r?.semantic ? (
                                        <div>
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                                              Semantic Alignment Score
                                            </span>
                                            <span className="font-mono font-bold text-emerald-400 text-xs">
                                              {r.semantic.score}%
                                            </span>
                                          </div>
                                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                            {r.semantic.matched_skills?.map((m, idx) => (
                                              <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300 py-1 border-b border-brand-border/40">
                                                <span><strong className="text-white">{m.skill}</strong> ↔ {m.matched_to}</span>
                                                <span className="font-mono text-emerald-400">{m.relevance}%</span>
                                              </div>
                                            ))}
                                          </div>
                                          {r.semantic.missing_skills?.length > 0 && (
                                            <div className="pt-2 text-[11px]">
                                              <span className="text-slate-400">Missing Concepts: </span>
                                              <span className="text-amber-400 font-medium">{r.semantic.missing_skills.join(", ")}</span>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-center py-4 space-y-2">
                                          <p className="text-xs text-slate-400">
                                            Run deep LLM analysis to evaluate how your resume's experience conceptually maps to this specific job description.
                                          </p>
                                          <button
                                            type="button"
                                            onClick={() => semanticMatch(job, i)}
                                            disabled={busy[`sm${i}`]}
                                            className="px-3.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold transition"
                                          >
                                            {busy[`sm${i}`] ? "Evaluating Semantic Fit…" : "🧠 Run Semantic Analysis"}
                                          </button>
                                        </div>
                                      )}
                                      {actionErrors[`sm${i}`] && (
                                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                                          <span>{actionErrors[`sm${i}`]}</span>
                                          <button type="button" onClick={() => semanticMatch(job, i)} className="text-[10px] font-bold text-rose-200 underline">↺ Retry</button>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* TAB 3: ATS Check */}
                                  {activeSubTab === "ats" && (
                                    <div className="space-y-3">
                                      {r?.ats ? (
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">ATS Pass Score</span>
                                            <span className="text-emerald-400 font-bold font-mono">{r.ats.ats_score}%</span>
                                          </div>
                                          <div className="grid grid-cols-3 gap-2 text-center my-2">
                                            {[{l:"Keywords",v:r.ats.keyword_match},{l:"Format",v:r.ats.format_score},{l:"Experience",v:r.ats.experience_match}].map(m => (
                                              <div key={m.l} className="p-2 rounded-lg bg-brand-panel border border-brand-border">
                                                <div className="text-slate-400 text-[10px] uppercase font-semibold">{m.l}</div>
                                                <div className="font-bold text-white text-sm mt-0.5">{m.v}%</div>
                                              </div>
                                            ))}
                                          </div>
                                          {r.ats.strengths?.length > 0 && (
                                            <div className="text-[11px] text-slate-300">
                                              <span className="text-emerald-400 font-semibold">Strengths: </span>
                                              <span>{r.ats.strengths.join(" • ")}</span>
                                            </div>
                                          )}
                                          {r.ats.improvements?.length > 0 && (
                                            <div className="text-[11px] text-slate-300">
                                              <span className="text-amber-400 font-semibold">Recommended Fixes: </span>
                                              <span>{r.ats.improvements.join(" • ")}</span>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-center py-4 space-y-2">
                                          <p className="text-xs text-slate-400">
                                            Simulate enterprise ATS screening to score keyword density, format compatibility, and experience alignment.
                                          </p>
                                          <button
                                            type="button"
                                            onClick={() => atsScore(job, i)}
                                            disabled={busy[`ats${i}`]}
                                            className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 text-xs font-semibold transition"
                                          >
                                            {busy[`ats${i}`] ? "Screening Resume…" : "❖ Run ATS Check"}
                                          </button>
                                        </div>
                                      )}
                                      {actionErrors[`ats${i}`] && (
                                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                                          <span>{actionErrors[`ats${i}`]}</span>
                                          <button type="button" onClick={() => atsScore(job, i)} className="text-[10px] font-bold text-rose-200 underline">↺ Retry</button>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* TAB 4: Interview Prep */}
                                  {activeSubTab === "prep" && (
                                    <div className="space-y-3">
                                      {r?.interviewPrep ? (
                                        <InterviewPrepView data={r.interviewPrep} />
                                      ) : (
                                        <div className="text-center py-4 space-y-2">
                                          <p className="text-xs text-slate-400">
                                            Generate custom interview coaching questions, gap handling strategies, and company-specific STAR talking points.
                                          </p>
                                          <button
                                            type="button"
                                            onClick={() => interviewPrep(job, i)}
                                            disabled={busy[`ip${i}`]}
                                            className="px-3.5 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500 hover:text-white text-xs font-semibold transition"
                                          >
                                            {busy[`ip${i}`] ? "Generating Guide…" : "🎙️ Generate Interview Prep"}
                                          </button>
                                        </div>
                                      )}
                                      {actionErrors[`ip${i}`] && (
                                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                                          <span>{actionErrors[`ip${i}`]}</span>
                                          <button type="button" onClick={() => interviewPrep(job, i)} className="text-[10px] font-bold text-rose-200 underline">↺ Retry</button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {jobs.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="text-6xl mb-5">🔍</div>
                  <h3 className="text-lg font-serif text-white mb-2">Ready to find your next role</h3>
                  <p className="text-sm text-slate-400 max-w-md">Upload your resume PDF and enter a target role above, then hit → to score live openings against your profile.</p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="text-5xl mb-5 animate-spin">⟳</div>
                  <p className="text-slate-400 text-sm">Scanning live job listings and scoring against your skills…</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: TAILOR & DIFF ── */}
          {activeTab === "tailor" && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="text-xl font-serif text-white font-medium tracking-tight">Tailor Studio</h1>
                <p className="text-xs text-slate-400 mt-0.5">Generate a job-specific resume version with visual diff tracking.</p>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div className="surface-card p-5 shadow-xl">
                  <h2 className="text-sm font-semibold text-white mb-4">Input</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Resume PDF</label>
                      <div className="relative border border-dashed border-brand-border hover:border-amber-500/60 rounded-xl p-5 text-center cursor-pointer transition bg-brand-panel">
                        <input type="file" accept=".pdf" onChange={e => setTailorFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        <div className="text-2xl mb-1">📄</div>
                        <div className="text-[11px] text-slate-400">{tailorFile ? `✓ ${tailorFile.name}` : resumeText ? "✓ Using active resume" : "Click to upload"}</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Description *</label>
                      <textarea rows={8} placeholder="Paste job description here..." value={tailorJD} onChange={e => setTailorJD(e.target.value)} className="w-full bg-brand-panel border border-brand-border rounded-xl p-3 text-xs text-white placeholder-slate-600 transition resize-none" />
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={tailorResume} disabled={tailorLoading} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20">
                        {tailorLoading ? "Tailoring…" : "✦ Generate Tailored Resume"}
                      </button>
                      {tailorResult && (
                        <button type="button" onClick={viewDiff} className="px-4 py-2.5 rounded-xl bg-brand-surface hover:bg-slate-700 text-amber-300 border border-brand-border text-xs font-semibold transition">🔍 Diff</button>
                      )}
                    </div>
                  </div>
                </div>

                {tailorResult ? (
                  <div className="surface-card p-5 shadow-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-white">Tailored Output</h2>
                      <button onClick={() => dlTxt(tailorResult, "Tailored_Resume.md")} className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition">⬇ Download</button>
                    </div>
                    <div className="prose prose-invert max-w-none text-xs leading-relaxed overflow-y-auto" style={{maxHeight:"520px"}} dangerouslySetInnerHTML={{ __html: renderFormattedResume(tailorResult) }} />
                  </div>
                ) : (
                  <div className="surface-card p-5 flex flex-col items-center justify-center text-center gap-3 min-h-[300px]">
                    <div className="text-4xl">✨</div>
                    <p className="text-slate-400 text-sm">Your tailored resume preview will appear here</p>
                  </div>
                )}
              </div>
              {diffData && <div className="surface-card p-5 shadow-xl"><DiffViewer diffData={diffData} /></div>}
            </div>
          )}

          {/* ── TAB 3: KANBAN ── */}
          {activeTab === "tracker" && (
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl font-serif text-white font-medium tracking-tight">Application Tracker</h1>
                <p className="text-xs text-slate-400 mt-0.5">Drag-and-drop Kanban board across your hiring pipeline stages.</p>
              </div>
              <KanbanTracker
                token={session?.access_token}
                apiPost={apiPost}
                onOpenTailor={() => setActiveTab("tailor")}
                onOpenPrep={() => setActiveTab("find")}
                onRequireAuth={() => setShowAuthModal(true)}
                onCountChange={setActivePipelineCount}
              />
            </div>
          )}

          {/* ── TAB 4: DIGEST ── */}
          {activeTab === "digest" && (
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl font-serif text-white font-medium tracking-tight">Daily Digest</h1>
                <p className="text-xs text-slate-400 mt-0.5">Configure automated daily job alerts delivered to your inbox.</p>
              </div>
              <DigestSettings userEmail={user?.email} resumeSkills={resumeSkills} />
            </div>
          )}

          <div className="h-20 md:h-4" />
        </div>
      </main>

      {/* ════ MOBILE BOTTOM TAB BAR ════ */}
      <div className="mobile-tab-bar">
        {[
          { id: "find",    icon: "🔍", label: "Match"  },
          { id: "tailor",  icon: "✨", label: "Tailor" },
          { id: "tracker", icon: "📌", label: "Track"  },
          { id: "digest",  icon: "📬", label: "Digest" },
        ].map(({ id, icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`flex-1 flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${activeTab === id ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}>
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
          onAuthSuccess={(s) => {
            setSession(s);
            setUser(s?.user);
            setShowAuthModal(false);
          }}
        />
      )}

      {/* Apply Pack Modal */}
      {activeApplyPack && <ApplyPackModal pack={activeApplyPack} onClose={() => setActiveApplyPack(null)} />}
    </div>
  );
}
