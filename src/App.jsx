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
  envApi = null; // discard stale render url if present in .env
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
        const isNetworkError = !err.response && (err.code === "ECONNABORTED" || err.message === "Network Error");
        if (isNetworkError && attempt < retries) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        break; // try next candidate URL
      }
    }
  }
  throw lastError;
}

const apiPost = (path, data, customHeaders = {}) => apiReq("POST", path, data, customHeaders);

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0f0e0c;
    --surface: #1a1916;
    --surface2: #222019;
    --border: #2e2b24;
    --border2: #3d3930;
    --gold: #e8b84b;
    --gold2: #f5d07a;
    --cream: #f0e6d3;
    --text: #ddd5c4;
    --muted: #7a7060;
    --green: #5dba7e;
    --red: #d95f5f;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', sans-serif;
    --font-mono: 'DM Mono', monospace;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; background-image: radial-gradient(ellipse 60% 40% at 20% 0%, rgba(232,184,75,0.04) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 80% 100%, rgba(91,143,212,0.03) 0%, transparent 60%); }

  .app { max-width: 820px; margin: 0 auto; padding: 40px 20px 80px; }

  .top-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
  .auth-pill { display: flex; align-items: center; gap: 10px; background: var(--surface2); border: 1px solid var(--border); padding: 6px 14px; border-radius: 20px; font-size: 12px; }

  .header { margin-bottom: 34px; }
  .header-eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .eyebrow-line { height: 1px; width: 32px; background: var(--gold); opacity: 0.6; }
  .eyebrow-text { font-family: var(--font-mono); font-size: 11px; letter-spacing: 2px; color: var(--gold); text-transform: uppercase; opacity: 0.8; }
  .header h1 { font-family: var(--font-display); font-size: clamp(2.2rem, 6.5vw, 3.8rem); font-weight: 900; line-height: 1.08; color: var(--cream); letter-spacing: -1px; margin-bottom: 12px; }
  .header h1 em { font-style: italic; color: var(--gold); }
  .header-sub { font-size: 15px; color: var(--muted); font-weight: 300; line-height: 1.6; max-width: 520px; }

  .divider { height: 1px; background: linear-gradient(90deg, var(--border2), transparent); margin: 28px 0; }

  .tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 6px; margin-bottom: 24px; flex-wrap: wrap; }
  .tab { flex: 1; min-width: 140px; padding: 11px 14px; border-radius: 8px; border: none; background: transparent; color: var(--muted); font-family: var(--font-body); font-size: 13.5px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 7px; text-align: center; }
  .tab:hover { color: var(--text); }
  .tab.active { background: var(--surface2); color: var(--gold); border: 1px solid var(--border2); }

  .form-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 28px; margin-bottom: 24px; }
  .form-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--cream); margin-bottom: 6px; }
  .form-desc { font-size: 13px; color: var(--muted); margin-bottom: 24px; line-height: 1.5; }

  .field { margin-bottom: 18px; }
  .field label { display: block; font-size: 12px; font-weight: 500; color: var(--muted); margin-bottom: 8px; }

  .file-drop { border: 1px dashed var(--border2); border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; position: relative; transition: all 0.2s; background: var(--surface2); }
  .file-drop:hover { border-color: var(--gold); }
  .file-drop input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
  .file-drop-icon { font-size: 28px; margin-bottom: 8px; opacity: 0.7; }
  .file-drop-text { font-size: 13px; color: var(--muted); }
  .file-drop-name { font-size: 13px; color: var(--gold); margin-top: 4px; font-family: var(--font-mono); }

  .input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; color: var(--cream); font-family: var(--font-body); font-size: 14px; outline: none; transition: border-color 0.2s; }
  .input:focus { border-color: var(--gold); }
  .input::placeholder { color: var(--muted); opacity: 0.6; }
  select.input { cursor: pointer; }
  textarea.input { resize: vertical; line-height: 1.6; }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 500px) { .two-col { grid-template-columns: 1fr; } }

  .slider-row { display: flex; align-items: center; gap: 12px; }
  .slider-val { font-family: var(--font-mono); font-size: 13px; color: var(--gold); min-width: 36px; text-align: right; }
  input[type=range] { flex: 1; accent-color: var(--gold); cursor: pointer; }

  .submit-btn { width: 100%; padding: 14px 24px; background: var(--gold); border: none; border-radius: 8px; color: #0f0e0c; font-family: var(--font-body); font-weight: 600; font-size: 14.5px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; }
  .submit-btn:hover { background: var(--gold2); transform: translateY(-1px); }
  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .progress { height: 2px; background: var(--border); border-radius: 2px; overflow: hidden; margin-top: 16px; }
  .progress-inner { height: 100%; background: var(--gold); animation: prog 1.4s ease-in-out infinite; width: 35%; }
  @keyframes prog { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }

  .results-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px; }
  .results-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--cream); }
  .results-count { font-family: var(--font-mono); font-size: 12px; color: var(--muted); }

  .job-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 14px; overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
  .job-card:hover { border-color: var(--border2); box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
  .job-top { padding: 20px 22px; cursor: pointer; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  .job-left { flex: 1; min-width: 0; }
  .job-title { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--cream); margin-bottom: 5px; line-height: 1.3; }
  .job-company { font-size: 13px; color: var(--muted); margin-bottom: 8px; }
  .job-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .job-tag { font-family: var(--font-mono); font-size: 11px; padding: 3px 8px; border-radius: 4px; background: var(--surface2); border: 1px solid var(--border2); color: var(--muted); }
  .job-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .score-ring { width: 48px; height: 48px; border-radius: 50%; border: 2px solid; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 12px; font-weight: 500; flex-shrink: 0; }
  .score-ring.high { border-color: var(--green); color: var(--green); }
  .score-ring.mid { border-color: var(--gold); color: var(--gold); }
  .score-ring.low { border-color: var(--red); color: var(--red); }
  .score-ring.none { border-color: var(--border2); color: var(--muted); }
  .chevron { color: var(--muted); font-size: 16px; transition: transform 0.2s; }
  .chevron.open { transform: rotate(180deg); }
  .job-body { border-top: 1px solid var(--border); padding: 22px; }
  .apply-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; background: rgba(232,184,75,0.08); border: 1px solid rgba(232,184,75,0.25); border-radius: 6px; color: var(--gold); font-size: 12.5px; font-weight: 500; text-decoration: none; margin-bottom: 18px; transition: all 0.2s; }
  .apply-btn:hover { background: rgba(232,184,75,0.14); }

  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
  .act-btn { padding: 7px 13px; border: 1px solid var(--border2); border-radius: 6px; background: var(--surface2); color: var(--text); font-family: var(--font-body); font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
  .act-btn:hover { border-color: var(--gold); color: var(--gold); }
  .act-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .panel { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; margin-top: 14px; }
  .panel-title { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .panel-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .match-bar-wrap { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 16px; }
  .match-bar-fill { height: 100%; border-radius: 3px; transition: width 0.9s cubic-bezier(0.16,1,0.3,1); }

  .skills-label { font-size: 11px; font-weight: 600; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
  .chip { font-family: var(--font-mono); font-size: 11px; padding: 4px 10px; border-radius: 4px; border: 1px solid; }
  .chip.matched { border-color: rgba(93,186,126,0.35); color: var(--green); background: rgba(93,186,126,0.06); }
  .chip.missing { border-color: rgba(217,95,95,0.35); color: var(--red); background: rgba(217,95,95,0.06); }

  .ats-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-bottom: 14px; }
  .ats-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; }
  .ats-card-label { font-size: 10px; color: var(--muted); letter-spacing: 0.5px; margin-bottom: 4px; }
  .ats-card-val { font-family: var(--font-mono); font-size: 22px; font-weight: 500; }

  .feedback-list { list-style: none; }
  .feedback-item { font-size: 13px; color: var(--muted); padding: 7px 0; border-bottom: 1px solid var(--border); display: flex; gap: 10px; line-height: 1.5; }
  .feedback-item:last-child { border-bottom: none; }

  .text-out { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 14px; color: var(--text); font-family: var(--font-mono); font-size: 12px; line-height: 1.8; resize: vertical; outline: none; min-height: 160px; }

  .resume-view { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 28px 24px; color: var(--text); font-family: var(--font-body); font-size: 13px; line-height: 1.7; max-height: 600px; overflow-y: auto; }
  .resume-view h2 { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--cream); margin-bottom: 2px; }
  .resume-view .contact-line { font-size: 12px; color: var(--muted); margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
  .resume-view h3 { font-size: 13px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: var(--gold); margin: 20px 0 10px; padding-bottom: 4px; border-bottom: 1px solid var(--border); }
  .resume-view .role-line { font-size: 13.5px; color: var(--cream); margin: 12px 0 4px; }
  .resume-view ul { margin: 4px 0 12px 18px; padding: 0; }
  .resume-view li { color: var(--text); font-size: 13px; line-height: 1.65; margin-bottom: 3px; }

  .dl-row { display: flex; gap: 8px; margin-top: 10px; }
  .dl-btn { flex: 1; padding: 9px 14px; border: 1px solid var(--border2); border-radius: 6px; background: var(--surface); color: var(--muted); font-family: var(--font-body); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; text-align: center; }
  .dl-btn:hover { border-color: var(--gold); color: var(--gold); }

  .server-banner { background: rgba(232,184,75,0.08); border: 1px solid rgba(232,184,75,0.25); border-radius: 10px; padding: 14px 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
  .server-banner-icon { font-size: 20px; flex-shrink: 0; }
  .server-banner-text { font-size: 13px; color: var(--text); line-height: 1.5; }
  .server-banner-text strong { color: var(--gold); font-weight: 600; }
  @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  .pulse-dot { display: inline-block; animation: pulse-dot 1.4s ease-in-out infinite; }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
`;

function scoreClass(s) {
  if (s === undefined) return "none";
  if (s >= 60) return "high";
  if (s >= 30) return "mid";
  return "low";
}
function scoreColor(s) {
  if (s >= 60) return "#5dba7e";
  if (s >= 30) return "#e8b84b";
  return "#d95f5f";
}

function parseResumeMarkdown(text) {
  if (!text) return "";
  const lines = text.split("\n");
  let html = "";
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.startsWith("## ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h2>${line.slice(3).trim()}</h2>`;
      if (i + 1 < lines.length && !lines[i + 1].startsWith("#") && !lines[i + 1].startsWith("-") && lines[i + 1].trim()) {
        i++;
        html += `<div class="contact-line">${lines[i].trim()}</div>`;
      }
      continue;
    }
    if (line.startsWith("### ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h3>${line.slice(4).trim()}</h3>`;
      continue;
    }
    if (line.match(/^\s*[-•*]\s/)) {
      if (!inList) { html += "<ul>"; inList = true; }
      let content = line.replace(/^\s*[-•*]\s+/, "");
      content = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      content = content.replace(/\*(.+?)\*/g, "<em>$1</em>");
      html += `<li>${content}</li>`;
      continue;
    }
    if (inList) { html += "</ul>"; inList = false; }
    if (!line.trim()) continue;
    let processed = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
    if (processed.includes("<strong>") || processed.includes("<em>")) {
      html += `<div class="role-line">${processed}</div>`;
    } else {
      html += `<p>${processed}</p>`;
    }
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
  const [jobRole, setJobRole] = useState("");
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

  // Tailor State
  const [tailorFile, setTailorFile] = useState(null);
  const [tailorJD, setTailorJD] = useState("");
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailorResult, setTailorResult] = useState("");
  const [tailorResumeText, setTailorResumeText] = useState("");
  const [diffData, setDiffData] = useState(null);
  const [diffSummaryData, setDiffSummaryData] = useState(null);
  const [showDiff, setShowDiff] = useState(false);

  // Modal State
  const [activeApplyPack, setActiveApplyPack] = useState(null);
  const [serverStatus, setServerStatus] = useState("");

  const setB = (k, v) => setBusy(p => ({ ...p, [k]: v }));
  const upd = (i, data) => setResults(p => ({ ...p, [i]: { ...p[i], ...data } }));

  // Load Auth Session
  useEffect(() => {
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
      const sf = new FormData(); sf.append("job_description", job.description);
      const sr = await apiPost("/job-skills", sf);
      const mf = new FormData();
      mf.append("resume_skills", JSON.stringify(resumeSkills));
      mf.append("job_skills", JSON.stringify(sr.data.job_skills));
      const mr = await apiPost("/match", mf);
      upd(i, { ...mr.data });
    } catch (e) { alert(e.message); }
    setB(`m${i}`, false);
  };

  const semanticMatch = async (job, i) => {
    setB(`sem${i}`, true);
    try {
      const sf = new FormData();
      sf.append("resume_skills", JSON.stringify(resumeSkills));
      sf.append("job_description", job.description);
      const res = await apiPost("/semantic-match", sf);
      upd(i, { semantic: res.data });
    } catch (e) { alert("Semantic match error: " + e.message); }
    setB(`sem${i}`, false);
  };

  const atsScore = async (job, i) => {
    setB(`a${i}`, true);
    try {
      const f = new FormData();
      f.append("resume_text", resumeText);
      f.append("job_description", job.description);
      const r = await apiPost("/ats-score", f);
      upd(i, { ats: r.data });
    } catch (e) { alert(e.message); }
    setB(`a${i}`, false);
  };

  const interviewPrep = async (job, i) => {
    setB(`ip${i}`, true);
    try {
      const f = new FormData();
      f.append("resume_text", resumeText);
      f.append("job_description", job.description);
      const r = await apiPost("/interview-prep", f);
      upd(i, { prep: r.data });
    } catch (e) { alert("Interview prep error: " + e.message); }
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
    } catch (e) { alert("Apply pack error: " + e.message); }
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
    } catch (e) {
      alert("Failed to track job: " + e.message);
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
      const f = new FormData();
      f.append("resume_text", rText);
      f.append("job_description", tailorJD);
      const r = await apiPost("/tailor-resume", f);
      setTailorResult(r.data.tailored_resume);
    } catch (e) {
      setServerStatus("error");
      alert(e.message);
    }
    setTailorLoading(false);
  };

  const loadDiff = async () => {
    const orig = tailorResumeText || resumeText;
    if (!orig || !tailorResult) return;
    try {
      const f = new FormData();
      f.append("original_text", orig);
      f.append("tailored_text", tailorResult);
      const r = await apiPost("/diff-resume", f);
      setDiffData(r.data.diff);
      setDiffSummaryData(r.data.summary);
      setShowDiff(true);
    } catch (e) {
      alert("Diff error: " + e.message);
    }
  };

  const dlTxt = (text, name) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = name; a.click();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* Top Bar with Auth State */}
        <div className="top-nav">
          <div className="header-eyebrow" style={{ margin: 0 }}>
            <div className="eyebrow-line" />
            <span className="eyebrow-text">AI Career Co-Pilot</span>
          </div>

          <div className="auth-pill">
            {user ? (
              <>
                <span style={{ color: "var(--cream)" }}>👤 {user.email}</span>
                {resumeText && (
                  <button
                    onClick={saveResumeToCloud}
                    style={{ background: "transparent", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: 11 }}
                  >
                    ☁️ Sync Resume
                  </button>
                )}
                <button
                  onClick={() => supabase.auth.signOut()}
                  style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 11 }}
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                style={{ background: "transparent", border: "none", color: "var(--gold)", cursor: "pointer", fontWeight: 600, fontSize: 12 }}
              >
                Sign In / Sign Up →
              </button>
            )}
          </div>
        </div>

        {/* Header */}
        <header className="header">
          <h1>Find jobs that<br /><em>actually fit</em> you.</h1>
          <p className="header-sub">
            Real-time job matching, automated daily digests, resume tailoring with diff view, and Kanban application tracking.
          </p>
        </header>

        <div className="divider" />

        {/* Navigation Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === "find" ? "active" : ""}`} onClick={() => setActiveTab("find")}>
            🔍 Job Matcher
          </button>
          <button className={`tab ${activeTab === "tailor" ? "active" : ""}`} onClick={() => setActiveTab("tailor")}>
            ✦ Tailor & Diff
          </button>
          <button className={`tab ${activeTab === "tracker" ? "active" : ""}`} onClick={() => setActiveTab("tracker")}>
            📌 Application Tracker
          </button>
          <button className={`tab ${activeTab === "digest" ? "active" : ""}`} onClick={() => setActiveTab("digest")}>
            ✉️ Daily Digest
          </button>
        </div>

        {/* Server Cold Start Notice */}
        {serverStatus === "waking" && (
          <div className="server-banner">
            <span className="server-banner-icon pulse-dot">☁️</span>
            <div className="server-banner-text">
              <strong>Connecting to server…</strong> Please hold tight while the AI backend boots up.
            </div>
          </div>
        )}

        {/* TAB 1: FIND JOBS */}
        {activeTab === "find" && (
          <div className="fade-up">
            <div className="form-card">
              <div className="form-title">Search & Match</div>
              <p className="form-desc">Upload your resume to discover live jobs and unlock AI prep, semantic matching, and assisted apply tools.</p>

              <div className="two-col">
                <div className="field">
                  <label>Resume (PDF)</label>
                  <div className="file-drop">
                    <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
                    <div className="file-drop-icon">📄</div>
                    {file ? <div className="file-drop-name">✓ {file.name}</div> : <div className="file-drop-text">{resumeText ? "✓ Resume already loaded (Click to replace)" : "Click to upload"}</div>}
                  </div>
                </div>
                <div>
                  <div className="field">
                    <label>Job Role</label>
                    <input className="input" type="text" placeholder="e.g. React Developer"
                      value={jobRole} onChange={e => setJobRole(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && analyze()} />
                  </div>
                  <div className="field">
                    <label>Location (optional)</label>
                    <input className="input" type="text" placeholder="e.g. Remote, Bangalore"
                      value={location} onChange={e => setLocation(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="two-col">
                <div className="field">
                  <label>Job Type</label>
                  <select className="input" value={jobType} onChange={e => setJobType(e.target.value)}>
                    <option value="">Any Type</option>
                    <option value="FULLTIME">Full Time</option>
                    <option value="PARTTIME">Part Time</option>
                    <option value="INTERN">Internship</option>
                    <option value="CONTRACTOR">Contract</option>
                  </select>
                </div>
                <div className="field">
                  <label>Min Match Score</label>
                  <div className="slider-row" style={{ marginTop: 10 }}>
                    <input type="range" min="0" max="80" step="5" value={minScore} onChange={e => setMinScore(Number(e.target.value))} />
                    <span className="slider-val">{minScore}%</span>
                  </div>
                </div>
              </div>

              <button className="submit-btn" onClick={analyze} disabled={loading}>
                {loading ? "Analyzing Jobs…" : "→ Search & Score Jobs"}
              </button>
              {loading && <div className="progress"><div className="progress-inner" /></div>}
            </div>

            {jobs.length > 0 && (
              <div className="fade-up">
                <div className="results-header">
                  <span className="results-title">Results</span>
                  <span className="results-count">{jobs.length} jobs found</span>
                </div>

                {jobs.map((job, i) => {
                  const r = results[i];
                  const isOpen = expanded[i];
                  const sc = r?.score;
                  if (sc !== undefined && sc < minScore) return null;

                  return (
                    <div className="job-card fade-up" key={i}>
                      <div className="job-top" onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}>
                        <div className="job-left">
                          <div className="job-title">{job.title}</div>
                          <div className="job-company">{job.company}</div>
                          <div className="job-tags">
                            {job.location && <span className="job-tag">📍 {job.location}</span>}
                            {job.job_type && <span className="job-tag">💼 {job.job_type}</span>}
                          </div>
                        </div>
                        <div className="job-right">
                          <div className={`score-ring ${scoreClass(sc)}`}>{sc !== undefined ? `${sc}%` : "—"}</div>
                          <span className={`chevron ${isOpen ? "open" : ""}`}>⌄</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="job-body">
                          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
                            <a className="apply-btn" style={{ margin: 0 }} href={job.link} target="_blank" rel="noreferrer">Apply Direct ↗</a>
                            <button
                              className="act-btn"
                              style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
                              onClick={() => applyPack(job, i)}
                              disabled={busy[`ap${i}`]}
                            >
                              {busy[`ap${i}`] ? "Generating Pack..." : "📦 Assisted Apply Pack"}
                            </button>
                            <button
                              className="act-btn"
                              onClick={() => trackJob(job, i)}
                              disabled={busy[`tr${i}`]}
                            >
                              {busy[`tr${i}`] ? "Tracking..." : "📌 Add to Tracker"}
                            </button>
                          </div>

                          <div className="actions">
                            <button className="act-btn" onClick={() => matchScore(job, i)} disabled={busy[`m${i}`]}>
                              {busy[`m${i}`] ? "…" : "◎"} Match Score
                            </button>
                            <button className="act-btn" onClick={() => semanticMatch(job, i)} disabled={busy[`sem${i}`]}>
                              {busy[`sem${i}`] ? "…" : "🧠"} Semantic Match
                            </button>
                            <button className="act-btn" onClick={() => atsScore(job, i)} disabled={busy[`a${i}`]}>
                              {busy[`a${i}`] ? "…" : "◈"} ATS Analysis
                            </button>
                            <button className="act-btn" onClick={() => interviewPrep(job, i)} disabled={busy[`ip${i}`]}>
                              {busy[`ip${i}`] ? "…" : "🎙️"} Interview Prep
                            </button>
                          </div>

                          {/* Exact Match Panel */}
                          {r?.score !== undefined && (
                            <div className="panel">
                              <div className="panel-title">Skill Match ({r.score}%)</div>
                              <div className="match-bar-wrap"><div className="match-bar-fill" style={{ width: `${r.score}%`, background: scoreColor(r.score) }} /></div>
                              {r.matched_skills?.length > 0 && <><div className="skills-label">Matched</div><div className="chips">{r.matched_skills.map(s => <span key={s} className="chip matched">{s}</span>)}</div></>}
                              {r.missing_skills?.length > 0 && <><div className="skills-label">Missing</div><div className="chips">{r.missing_skills.map(s => <span key={s} className="chip missing">{s}</span>)}</div></>}
                            </div>
                          )}

                          {/* Semantic Match Panel */}
                          {r?.semantic && (
                            <div className="panel">
                              <div className="panel-title">Semantic Relevance ({r.semantic.score}%)</div>
                              {r.semantic.matched_skills?.length > 0 && (
                                <div style={{ marginBottom: 10 }}>
                                  <div className="skills-label">Transferable & Synonym Matches</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {r.semantic.matched_skills.map((m, mi) => (
                                      <div key={mi} style={{ fontSize: 12, display: "flex", justifyContent: "space-between", background: "var(--surface)", padding: "4px 8px", borderRadius: 4 }}>
                                        <span><strong>{m.skill}</strong> ↔ <em>{m.matched_to}</em></span>
                                        <span style={{ color: "var(--green)", fontFamily: "var(--font-mono)" }}>{m.relevance}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ATS Panel */}
                          {r?.ats && (
                            <div className="panel">
                              <div className="panel-title">ATS Analysis</div>
                              <div className="ats-grid">
                                {[{ l: "Overall", v: r.ats.ats_score }, { l: "Keywords", v: r.ats.keyword_match }, { l: "Format", v: r.ats.format_score }, { l: "Experience", v: r.ats.experience_match }].map(m => (
                                  <div className="ats-card" key={m.l}><div className="ats-card-label">{m.l}</div><div className="ats-card-val" style={{ color: scoreColor(m.v) }}>{m.v}%</div></div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Interview Prep Panel */}
                          {r?.prep && <InterviewPrepView data={r.prep} />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TAILOR & DIFF */}
        {activeTab === "tailor" && (
          <div className="fade-up">
            <div className="form-card">
              <div className="form-title">Tailor Resume with Visual Diff</div>
              <p className="form-desc">Provide your resume and target job description to get a bespoke version with highlighted bullet-point changes.</p>

              <div className="field">
                <label>Resume (PDF)</label>
                <div className="file-drop">
                  <input type="file" accept=".pdf" onChange={e => { setTailorFile(e.target.files[0]); setTailorResumeText(""); }} />
                  <div className="file-drop-icon">📄</div>
                  {tailorFile ? <div className="file-drop-name">✓ {tailorFile.name}</div> : <div className="file-drop-text">{resumeText ? "✓ Using loaded resume" : "Click to upload"}</div>}
                </div>
              </div>

              <div className="field">
                <label>Target Job Description</label>
                <textarea className="input" placeholder="Paste the full job requirements and duties here..." value={tailorJD} onChange={e => setTailorJD(e.target.value)} rows={7} />
              </div>

              <button className="submit-btn" onClick={tailorResume} disabled={tailorLoading}>
                {tailorLoading ? "Tailoring resume…" : "→ Tailor My Resume"}
              </button>
              {tailorLoading && <div className="progress"><div className="progress-inner" /></div>}
            </div>

            {tailorResult && (
              <div className="panel fade-up">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div className="panel-title" style={{ margin: 0 }}>Your Tailored Resume</div>
                  <button
                    className="act-btn"
                    style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
                    onClick={loadDiff}
                  >
                    🔍 Compare Visual Diff
                  </button>
                </div>

                <div className="resume-view" dangerouslySetInnerHTML={{ __html: parseResumeMarkdown(tailorResult) }} />
                <div className="dl-row">
                  <button className="dl-btn" onClick={() => dlTxt(tailorResult, "tailored_resume.txt")}>⬇ Download TXT</button>
                </div>

                {showDiff && diffData && (
                  <DiffViewer diffData={diffData} summary={diffSummaryData} onClose={() => setShowDiff(false)} />
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: KANBAN TRACKER */}
        {activeTab === "tracker" && (
          <KanbanTracker token={session?.access_token} apiPost={apiReq} />
        )}

        {/* TAB 4: DAILY DIGEST */}
        {activeTab === "digest" && (
          <DigestSettings userEmail={user?.email} resumeSkills={resumeSkills} />
        )}

        {/* MODAL: ASSISTED APPLY PACK */}
        {activeApplyPack && (
          <ApplyPackModal pack={activeApplyPack} onClose={() => setActiveApplyPack(null)} />
        )}

        {/* MODAL: AUTHENTICATION */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={s => { setSession(s); setUser(s?.user); }}
        />

      </div>
    </>
  );
}