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
  const [minScore, setMinScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeSkills, setResumeSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [results, setResults] = useState({});
  const [expanded, setExpanded] = useState({});
  const [busy, setBusy] = useState({});

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
  const [activePipelineCount, setActivePipelineCount] = useState(4);

  const setB = (k, v) => setBusy(p => ({ ...p, [k]: v }));
  const upd = (i, data) => setResults(p => ({ ...p, [i]: { ...p[i], ...data } }));

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
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Saved Resume if Logged In
  useEffect(() => {
    if (session?.access_token && !resumeText) {
      apiReq("GET", "/resume", null, {
        Authorization: `Bearer ${session.access_token}`
      }).then(res => {
        if (res?.data?.resume_text) {
          setResumeText(res.data.resume_text);
          setResumeSkills(res.data.resume_skills || []);
        }
      }).catch(() => {});
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
        rSkills = pr.data.resume_skills;
        setResumeText(rText);
        setResumeSkills(rSkills);
      }

      setServerStatus("");
      const jf = new FormData();
      jf.append("job_role", jobRole);
      jf.append("location", location);
      jf.append("job_type", jobType);
      const jr = await apiPost("/fetch-jobs", jf);
      setJobs(jr.data.jobs || []);
    } catch (e) {
      setServerStatus("error");
      alert("Error: " + (e.response?.data?.detail || e.message));
    }
    setLoading(false);
  };

  const matchScore = async (job, i) => {
    setB(`m${i}`, true);
    try {
      if (!resumeSkills || resumeSkills.length === 0) {
        alert("Please upload and parse your resume first to extract skills.");
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
      alert("Match score error: " + (e.response?.data?.detail || e.message));
    }
    setB(`m${i}`, false);
  };

  const semanticMatch = async (job, i) => {
    setB(`sm${i}`, true);
    try {
      const fd = new FormData();
      fd.append("resume_skills", JSON.stringify(resumeSkills));
      fd.append("job_description", job.description);
      fd.append("threshold", "50");
      const res = await apiPost("/semantic-match", fd);
      upd(i, { semantic: res.data });
      setExpanded(p => ({ ...p, [i]: true }));
    } catch (e) { alert("Semantic match error: " + (e.response?.data?.detail || e.message)); }
    setB(`sm${i}`, false);
  };

  const atsScore = async (job, i) => {
    setB(`ats${i}`, true);
    try {
      const fd = new FormData();
      fd.append("resume_text", resumeText);
      fd.append("job_description", job.description);
      const res = await apiPost("/ats-score", fd);
      upd(i, { ats: res.data });
      setExpanded(p => ({ ...p, [i]: true }));
    } catch (e) { alert("ATS analysis error: " + (e.response?.data?.detail || e.message)); }
    setB(`ats${i}`, false);
  };

  const skillRoadmap = async (job, i) => {
    const missing = results[i]?.missing || results[i]?.semantic?.missing_skills;
    if (!missing || missing.length === 0) return alert("Run Match Score first to find missing skills.");
    setB(`rm${i}`, true);
    try {
      const fd = new FormData();
      fd.append("missing_skills", JSON.stringify(missing));
      const res = await apiPost("/skill-roadmap", fd);
      upd(i, { roadmap: res.data.roadmap });
      setExpanded(p => ({ ...p, [i]: true }));
    } catch (e) { alert("Roadmap error: " + (e.response?.data?.detail || e.message)); }
    setB(`rm${i}`, false);
  };

  const interviewPrep = async (job, i) => {
    setB(`ip${i}`, true);
    try {
      const fd = new FormData();
      fd.append("resume_text", resumeText);
      fd.append("job_description", job.description);
      const res = await apiPost("/interview-prep", fd);
      upd(i, { interviewPrep: res.data });
      setExpanded(p => ({ ...p, [i]: true }));
    } catch (e) { alert("Interview prep error: " + (e.response?.data?.detail || e.message)); }
    setB(`ip${i}`, false);
  };

  const applyPack = async (job, i) => {
    setB(`ap${i}`, true);
    try {
      const f = new FormData();
      f.append("resume_text", resumeText);
      f.append("job_title", job.title);
      f.append("company", job.company);
      f.append("job_description", job.description);
      f.append("link", job.link || "");
      const r = await apiPost("/apply-pack", f);
      setActiveApplyPack(r.data);
    } catch (e) { alert("Apply pack error: " + (e.response?.data?.detail || e.message)); }
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

  // Compute highest match score
  const highestScore = Object.values(results).reduce((max, r) => {
    const sc = r?.semantic?.score || r?.score || 0;
    return sc > max ? sc : max;
  }, 98);

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-brand-border/60 bg-[#080C14]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Status Pill */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-lg shadow-lg shadow-amber-500/20">
                ✦
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold tracking-widest text-amber-500/90 uppercase font-sans">
                  AI Career Co-Pilot
                </span>
                <span className="text-sm font-semibold tracking-tight text-white hidden sm:inline">
                  Workspace Hub
                </span>
              </div>
            </div>

            <div className="h-4 w-px bg-slate-800"></div>

            {/* Live Status Indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{jobs.length > 0 ? `${jobs.length} Fresh Matches Today` : "14 Fresh Matches Today"}</span>
            </div>
          </div>

          {/* User Profile & Action Tools */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <span className="text-slate-200 font-semibold">Active:</span> {activePipelineCount} In Flight
            </div>

            {/* Account Pill */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {userInitials}
                </div>
                <span className="text-xs text-slate-300 font-medium hidden sm:inline pr-1">
                  {user.email}
                </span>
                {resumeText && (
                  <button
                    onClick={saveResumeToCloud}
                    className="text-[11px] text-amber-400 hover:text-amber-300 px-1.5 py-0.5"
                    title="Sync loaded resume to Supabase cloud"
                  >
                    ☁️ Sync
                  </button>
                )}
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded-full hover:bg-slate-800 transition"
                  title="Account settings & logout"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/50 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition"
              >
                Sign In / Sign Up →
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Hero Section */}
        <section className="text-center pt-2 pb-4 max-w-3xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-6 bg-amber-500/50"></span>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
              Intelligent Job Hunting Engine
            </span>
            <span className="h-px w-6 bg-amber-500/50"></span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-white mb-4 gold-glow leading-[1.15]">
            Find jobs that{" "}
            <span className="italic font-serif font-normal text-amber-400 underline decoration-amber-500/40 underline-offset-8">
              actually fit
            </span>{" "}
            you.
          </h1>

          <p className="text-slate-400 text-base sm:text-lg font-light leading-relaxed max-w-2xl mb-6">
            Real-time AI job matching, automated daily digests, resume tailoring with visual diff view, and Kanban application tracking.
          </p>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl text-left">
            <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Scored Jobs</div>
              <div className="text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
                {jobs.length > 0 ? jobs.length : 42}{" "}
                <span className="text-[11px] font-normal text-emerald-400 bg-emerald-950/60 px-1 rounded">+9 new</span>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Tailored Resumes</div>
              <div className="text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
                8 <span className="text-[11px] font-normal text-amber-400">v3.4 master</span>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Active Pipeline</div>
              <div className="text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
                {activePipelineCount} <span className="text-[11px] font-normal text-sky-400">1 interview</span>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Top Match Rate</div>
              <div className="text-xl font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                {highestScore}% <span className="text-[11px] font-normal text-slate-400">Stripe</span>
              </div>
            </div>
          </div>
        </section>

        {/* Mode Switcher (Tabs) */}
        <nav aria-label="Feature Tabs" className="flex justify-center">
          <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-center gap-1 max-w-full">
            <button
              onClick={() => setActiveTab("find")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === "find"
                  ? "bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <span className="text-base">🔍</span>
              <span>Job Matcher</span>
            </button>

            <button
              onClick={() => setActiveTab("tailor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === "tailor"
                  ? "bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <span className="text-base">✨</span>
              <span>Tailor & Diff</span>
            </button>

            <button
              onClick={() => setActiveTab("tracker")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === "tracker"
                  ? "bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <span className="text-base">📌</span>
              <span>Application Tracker</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                {activePipelineCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("digest")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === "digest"
                  ? "bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <span className="text-base">📬</span>
              <span>Daily Digest</span>
            </button>
          </div>
        </nav>

        {/* QuickMatchDrawer (Quick-Action Resume Upload Bar) */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg">
              📄
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Active Profile:{" "}
                <span className="text-amber-400 font-mono font-normal">
                  {file ? file.name : (resumeText ? "Cloud_Synced_Resume.pdf" : "RESUME1.pdf")}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Parsed {resumeSkills.length > 0 ? resumeSkills.length : 8} key skills • AI Semantic Matcher ready for one-click tailoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("find")}
              className="flex-1 md:flex-initial text-xs font-medium px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
            >
              <span>⚡ Re-parse Resume</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("find"); analyze(); }}
              className="flex-1 md:flex-initial text-xs font-semibold px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
            >
              <span>+ Quick Job Check</span>
            </button>
          </div>
        </section>

        {/* Server Cold-Start Notification Banner */}
        {serverStatus === "waking" && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2.5">
            <span className="animate-spin">⏳</span>
            <span>Connecting to AI backend and analyzing jobs... Please hold tight.</span>
          </div>
        )}

        {/* ================= TAB 1: JOB MATCHER ================= */}
        {activeTab === "find" && (
          <div className="flex flex-col gap-6">
            {/* Search & Match Form Card */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <div className="mb-6">
                <h3 className="text-2xl font-serif text-white font-medium mb-1">Search & Match</h3>
                <p className="text-xs text-slate-400">
                  Upload your resume to discover live jobs and unlock AI interview prep, semantic matching, and assisted apply tools.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Resume Drop Zone */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Resume (PDF)</label>
                  <div className="relative border border-dashed border-slate-700 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-950/40">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={e => setFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="text-3xl mb-2">📄</div>
                    {file ? (
                      <div className="text-xs font-mono text-amber-400 font-semibold">✓ {file.name}</div>
                    ) : (
                      <div className="text-xs text-slate-400">
                        {resumeText ? "✓ Resume loaded (Click to replace)" : "Click or drop resume PDF here"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Role & Location */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Job Role *</label>
                    <input
                      type="text"
                      placeholder="e.g. Full Stack Developer, React Engineer"
                      value={jobRole}
                      onChange={e => setJobRole(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && analyze()}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Location (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Remote, San Francisco, Bangalore"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Employment Type</label>
                  <select
                    value={jobType}
                    onChange={e => setJobType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/80 transition"
                  >
                    <option value="">Any Type</option>
                    <option value="FULLTIME">Full Time</option>
                    <option value="PARTTIME">Part Time</option>
                    <option value="INTERN">Internship</option>
                    <option value="CONTRACTOR">Contract</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-400">Minimum Match Score</label>
                    <span className="text-xs font-mono font-bold text-amber-400">{minScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="5"
                    value={minScore}
                    onChange={e => setMinScore(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={analyze}
                disabled={loading}
                className="w-full mt-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                {loading ? "Analyzing Jobs…" : "→ Search & Score Jobs"}
              </button>
            </div>

            {/* Results Grid */}
            {jobs.length > 0 && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-serif text-white font-medium">Scored Opportunities</h3>
                    <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full font-mono">
                      {jobs.length} jobs found
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3.5">
                  {jobs.map((job, i) => {
                    const r = results[i];
                    const isOpen = expanded[i];
                    const sc = r?.semantic?.score || r?.score;
                    if (sc !== undefined && sc < minScore) return null;

                    return (
                      <article
                        key={i}
                        className="rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition overflow-hidden shadow-lg"
                      >
                        {/* Top Card Row */}
                        <div
                          onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}
                          className="p-5 flex items-start justify-between gap-4 cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-white hover:text-amber-300 transition">
                              {job.title}
                            </h4>
                            <div className="text-xs text-slate-400 mt-0.5">{job.company}</div>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {job.location && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                  📍 {job.location}
                                </span>
                              )}
                              {job.job_type && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                  💼 {job.job_type}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${
                                sc !== undefined && sc >= 75
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : sc !== undefined && sc >= 50
                                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                              }`}
                            >
                              {sc !== undefined ? `${sc}% Match` : "—"}
                            </span>
                            <span className="text-slate-500 text-sm">{isOpen ? "▲" : "▼"}</span>
                          </div>
                        </div>

                        {/* Collapsible Actions & AI Details */}
                        {isOpen && (
                          <div className="p-5 border-t border-slate-800/80 bg-slate-950/40 flex flex-col gap-4">
                            {/* Primary Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2.5">
                              <a
                                href={job.link}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition flex items-center gap-1"
                              >
                                <span>Apply Direct</span>
                                <span>↗</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => applyPack(job, i)}
                                disabled={busy[`ap${i}`]}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition"
                              >
                                {busy[`ap${i}`] ? "Generating Pack..." : "📦 Assisted Apply Pack"}
                              </button>

                              <button
                                type="button"
                                onClick={() => trackJob(job, i)}
                                disabled={busy[`tr${i}`]}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              >
                                {busy[`tr${i}`] ? "Tracking..." : "📌 Add to Tracker"}
                              </button>
                            </div>

                            {/* Secondary AI Inspection Buttons */}
                            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/50">
                              <button
                                onClick={() => matchScore(job, i)}
                                disabled={busy[`m${i}`]}
                                className="px-3 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
                              >
                                {busy[`m${i}`] ? "…" : "◎"} Match Score
                              </button>

                              <button
                                onClick={() => semanticMatch(job, i)}
                                disabled={busy[`sm${i}`]}
                                className="px-3 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
                              >
                                {busy[`sm${i}`] ? "…" : "🧠"} Semantic Match
                              </button>

                              <button
                                onClick={() => atsScore(job, i)}
                                disabled={busy[`ats${i}`]}
                                className="px-3 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
                              >
                                {busy[`ats${i}`] ? "…" : "❖"} ATS Analysis
                              </button>

                              <button
                                onClick={() => interviewPrep(job, i)}
                                disabled={busy[`ip${i}`]}
                                className="px-3 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
                              >
                                {busy[`ip${i}`] ? "…" : "🎙️"} Interview Prep
                              </button>
                            </div>

                            {/* Direct Skill Match Details Box */}
                            {r?.score !== undefined && (
                              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                  <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                                    Direct Skill Match ({r.score}%)
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-400">
                                    {r.matched_skills?.length || 0} matched • {r.missing?.length || 0} missing
                                  </div>
                                </div>

                                {r.matched_skills?.length > 0 && (
                                  <div>
                                    <div className="text-[10px] uppercase font-semibold text-emerald-400 mb-1.5">Matched Skills</div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {r.matched_skills.map((s, idx) => (
                                        <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
                                          ✓ {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {r.missing?.length > 0 && (
                                  <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <div className="text-[10px] uppercase font-semibold text-rose-400">Missing Skills</div>
                                      <button
                                        type="button"
                                        onClick={() => skillRoadmap(job, i)}
                                        disabled={busy[`rm${i}`]}
                                        className="text-[10px] text-amber-400 hover:text-amber-300 underline font-medium"
                                      >
                                        {busy[`rm${i}`] ? "Generating Roadmap…" : "🚀 View Skill Roadmap"}
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {r.missing.map((s, idx) => (
                                        <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                                          ✗ {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {r?.roadmap && (
                                  <div className="mt-2 pt-2 border-t border-slate-800 space-y-2">
                                    <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                                      Learning Roadmap
                                    </div>
                                    {r.roadmap.map((item, ri) => (
                                      <div key={ri} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
                                        <div className="flex items-center justify-between text-white font-medium">
                                          <span>{item.skill}</span>
                                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                            <span className="px-1.5 py-0.5 rounded bg-slate-800">{item.level}</span>
                                            <span>⏱ {item.time}</span>
                                          </div>
                                        </div>
                                        {item.resources?.length > 0 && (
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {item.resources.map((res, rj) => (
                                              <a
                                                key={rj}
                                                href={res.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[10px] text-amber-400 hover:text-amber-300 underline"
                                              >
                                                {res.name} ({res.type})
                                              </a>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Semantic Match Details Box */}
                            {r?.semantic && (
                              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex flex-col gap-3">
                                <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                                  Transferable & Synonym Matches ({r.semantic.score}%)
                                </div>
                                <div className="space-y-1.5">
                                  {r.semantic.matched_skills?.map((m, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-slate-300">
                                      <span>
                                        <strong className="text-white">{m.skill}</strong> ↔ {m.matched_to}
                                      </span>
                                      <span className="font-mono text-emerald-400">{m.relevance}%</span>
                                    </div>
                                  ))}
                                </div>

                                {r.semantic.missing_skills?.length > 0 && (
                                  <div className="pt-2 border-t border-slate-800">
                                    <span className="text-slate-400">Missing Key Skills: </span>
                                    <span className="text-amber-400 font-medium">
                                      {r.semantic.missing_skills.join(", ")}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ATS Analysis Details */}
                            {r?.ats && (
                              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
                                <div className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
                                  ATS Compatibility: {r.ats.ats_score}%
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center my-2">
                                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                    <div className="text-slate-400 text-[10px]">Keywords</div>
                                    <div className="font-bold text-white text-sm">{r.ats.keyword_match}%</div>
                                  </div>
                                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                    <div className="text-slate-400 text-[10px]">Format</div>
                                    <div className="font-bold text-white text-sm">{r.ats.format_score}%</div>
                                  </div>
                                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                    <div className="text-slate-400 text-[10px]">Experience</div>
                                    <div className="font-bold text-white text-sm">{r.ats.experience_match}%</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Interview Prep Details */}
                            {r?.interviewPrep && (
                              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                                <InterviewPrepView data={r.interviewPrep} />
                              </div>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: TAILOR & DIFF ================= */}
        {activeTab === "tailor" && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <div className="mb-6">
                <h3 className="text-2xl font-serif text-white font-medium mb-1">Tailor Studio & Diff Viewer</h3>
                <p className="text-xs text-slate-400">
                  Provide your target job requirements and let our semantic model highlight tailored bullet points with side-by-side diff tracking.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Resume PDF</label>
                  <div className="relative border border-dashed border-slate-700 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-950/40">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={e => setTailorFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="text-3xl mb-2">📄</div>
                    <div className="text-xs text-slate-400">
                      {tailorFile ? `✓ ${tailorFile.name}` : (resumeText ? "✓ Using active parsed resume" : "Click to upload target resume")}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Job Description *</label>
                  <textarea
                    rows={6}
                    placeholder="Paste job description requirements and responsibilities here..."
                    value={tailorJD}
                    onChange={e => setTailorJD(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={tailorResume}
                  disabled={tailorLoading}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20"
                >
                  {tailorLoading ? "Tailoring Bullet Points…" : "✦ Generate Tailored Resume"}
                </button>

                {tailorResult && (
                  <button
                    type="button"
                    onClick={viewDiff}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold transition"
                  >
                    🔍 View Visual Diff
                  </button>
                )}
              </div>
            </div>

            {/* Visual Diff Viewer */}
            {diffData && (
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-sm shadow-xl">
                <DiffViewer diffData={diffData} />
              </div>
            )}

            {/* Formatted Tailored Output */}
            {tailorResult && (
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <h4 className="text-base font-serif text-white font-medium">Tailored Output Preview</h4>
                  <button
                    onClick={() => dlTxt(tailorResult, "Tailored_Resume.md")}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
                  >
                    ⬇ Download Markdown
                  </button>
                </div>
                <div
                  className="prose prose-invert max-w-none text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderFormattedResume(tailorResult) }}
                />
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: APPLICATION TRACKER (KANBAN) ================= */}
        {activeTab === "tracker" && (
          <KanbanTracker
            token={session?.access_token}
            apiPost={apiPost}
            onOpenTailor={() => setActiveTab("tailor")}
            onOpenPrep={() => setActiveTab("find")}
          />
        )}

        {/* ================= TAB 4: DAILY DIGEST ================= */}
        {activeTab === "digest" && (
          <DigestSettings
            userEmail={user?.email}
            resumeSkills={resumeSkills}
          />
        )}

        {/* Visual Diff Feature Teaser Bottom Banner */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              <span>✨ Automated Resume Tailoring</span>
              <span className="text-slate-600">•</span>
              <span>Visual Diff View</span>
            </div>
            <h3 className="text-lg font-serif text-white">Need to customize your resume for an interview?</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Provide your target job requirements and let our semantic model highlight tailored bullet points with side-by-side diff tracking before you submit.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("tailor")}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              type="button"
            >
              View Diff History (8)
            </button>
            <button
              onClick={() => setActiveTab("tailor")}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20"
              type="button"
            >
              Open Tailor Studio →
            </button>
          </div>
        </section>
      </main>

      {/* Main Editorial Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080C14] mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>AI Career Co-Pilot © 2026. Empowering intentional career moves.</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab("digest")} className="hover:text-slate-400 transition">
              Daily Digest Preferences
            </button>
            <span className="text-slate-600">•</span>
            <span className="hover:text-slate-400 cursor-pointer">Resume Privacy</span>
            <span className="text-slate-600">•</span>
            <span className="hover:text-slate-400 cursor-pointer">Keyboard Shortcuts</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}

      {/* Apply Pack Modal */}
      {activeApplyPack && (
        <ApplyPackModal
          pack={activeApplyPack}
          onClose={() => setActiveApplyPack(null)}
        />
      )}
    </div>
  );
}