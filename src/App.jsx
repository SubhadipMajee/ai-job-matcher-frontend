import { useState } from "react";
import axios from "axios";

const API = "https://ai-job-matcher-backend-0oc7.onrender.com";

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
    --blue: #5b8fd4;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', sans-serif;
    --font-mono: 'DM Mono', monospace;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    min-height: 100vh;
    background-image:
      radial-gradient(ellipse 60% 40% at 20% 0%, rgba(232,184,75,0.04) 0%, transparent 60%),
      radial-gradient(ellipse 40% 60% at 80% 100%, rgba(91,143,212,0.03) 0%, transparent 60%);
  }

  .app { max-width: 780px; margin: 0 auto; padding: 48px 20px 80px; }

  .header { margin-bottom: 48px; }
  .header-eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
  .eyebrow-line { height: 1px; width: 32px; background: var(--gold); opacity: 0.6; }
  .eyebrow-text { font-family: var(--font-mono); font-size: 11px; letter-spacing: 2px; color: var(--gold); text-transform: uppercase; opacity: 0.8; }
  .header h1 { font-family: var(--font-display); font-size: clamp(2.4rem, 7vw, 4rem); font-weight: 900; line-height: 1.05; color: var(--cream); letter-spacing: -1px; margin-bottom: 14px; }
  .header h1 em { font-style: italic; color: var(--gold); }
  .header-sub { font-size: 15px; color: var(--muted); font-weight: 300; line-height: 1.6; max-width: 420px; }

  .divider { height: 1px; background: linear-gradient(90deg, var(--border2), transparent); margin: 32px 0; }

  .form-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 28px; margin-bottom: 24px; }
  .form-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--cream); margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
  .form-title-num { font-family: var(--font-mono); font-size: 12px; color: var(--gold); background: rgba(232,184,75,0.1); border: 1px solid rgba(232,184,75,0.2); border-radius: 4px; padding: 2px 8px; }

  .field { margin-bottom: 20px; }
  .field label { display: block; font-size: 12px; font-weight: 500; color: var(--muted); margin-bottom: 8px; letter-spacing: 0.3px; }

  .file-drop { border: 1px dashed var(--border2); border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; position: relative; transition: all 0.2s; background: var(--surface2); }
  .file-drop:hover { border-color: var(--gold); background: rgba(232,184,75,0.03); }
  .file-drop input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
  .file-drop-icon { font-size: 28px; margin-bottom: 8px; opacity: 0.7; }
  .file-drop-text { font-size: 13px; color: var(--muted); }
  .file-drop-name { font-size: 13px; color: var(--gold); margin-top: 4px; font-family: var(--font-mono); }

  .input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; color: var(--cream); font-family: var(--font-body); font-size: 14px; font-weight: 400; outline: none; transition: border-color 0.2s; }
  .input:focus { border-color: var(--gold); }
  .input::placeholder { color: var(--muted); opacity: 0.6; }
  select.input { cursor: pointer; }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 500px) { .two-col { grid-template-columns: 1fr; } }

  .slider-row { display: flex; align-items: center; gap: 12px; }
  .slider-val { font-family: var(--font-mono); font-size: 13px; color: var(--gold); min-width: 36px; text-align: right; }
  input[type=range] { flex: 1; accent-color: var(--gold); cursor: pointer; }

  .submit-btn { width: 100%; padding: 15px 24px; background: var(--gold); border: none; border-radius: 8px; color: #0f0e0c; font-family: var(--font-body); font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; }
  .submit-btn:hover { background: var(--gold2); transform: translateY(-1px); }
  .submit-btn:active { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .progress { height: 2px; background: var(--border); border-radius: 2px; overflow: hidden; margin-top: 16px; }
  .progress-inner { height: 100%; background: var(--gold); animation: prog 1.4s ease-in-out infinite; width: 35%; }
  @keyframes prog { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }

  .results-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px; }
  .results-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--cream); }
  .results-count { font-family: var(--font-mono); font-size: 12px; color: var(--muted); }

  .job-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 12px; overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
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

  .chevron { color: var(--muted); font-size: 16px; transition: transform 0.2s; line-height: 1; }
  .chevron.open { transform: rotate(180deg); }

  .job-body { border-top: 1px solid var(--border); padding: 22px; }

  .apply-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(232,184,75,0.08); border: 1px solid rgba(232,184,75,0.25); border-radius: 6px; color: var(--gold); font-size: 13px; font-weight: 500; text-decoration: none; margin-bottom: 20px; transition: all 0.2s; }
  .apply-btn:hover { background: rgba(232,184,75,0.14); }

  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
  .act-btn { padding: 8px 14px; border: 1px solid var(--border2); border-radius: 6px; background: var(--surface2); color: var(--text); font-family: var(--font-body); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
  .act-btn:hover { border-color: var(--gold); color: var(--gold); }
  .act-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .panel { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; margin-top: 14px; }
  .panel-title { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .panel-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .match-bar-wrap { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 16px; }
  .match-bar-fill { height: 100%; border-radius: 3px; transition: width 0.9s cubic-bezier(0.16,1,0.3,1); }

  .skills-section-label { font-size: 11px; font-weight: 600; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
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
  .feedback-dot { flex-shrink: 0; margin-top: 3px; font-size: 10px; }

  .roadmap-item { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
  .roadmap-item:last-child { margin-bottom: 0; }
  .roadmap-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
  .roadmap-skill { font-weight: 600; font-size: 14px; color: var(--cream); }
  .roadmap-meta { display: flex; gap: 6px; }
  .roadmap-badge { font-family: var(--font-mono); font-size: 10px; padding: 3px 8px; border-radius: 4px; border: 1px solid var(--border2); color: var(--muted); }

  .resource-link { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; text-decoration: none; margin-bottom: 6px; transition: border-color 0.2s; }
  .resource-link:hover { border-color: var(--gold); }
  .resource-link:last-child { margin-bottom: 0; }
  .resource-name { font-size: 13px; color: var(--text); }
  .resource-type { font-family: var(--font-mono); font-size: 10px; padding: 2px 7px; border-radius: 3px; border: 1px solid; }
  .resource-type.free { border-color: rgba(93,186,126,0.4); color: var(--green); }
  .resource-type.paid { border-color: rgba(232,184,75,0.4); color: var(--gold); }

  .text-out { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 14px; color: var(--text); font-family: var(--font-mono); font-size: 12px; line-height: 1.8; resize: vertical; outline: none; min-height: 160px; }

  .dl-row { display: flex; gap: 8px; margin-top: 10px; }
  .dl-btn { flex: 1; padding: 9px 14px; border: 1px solid var(--border2); border-radius: 6px; background: var(--surface); color: var(--muted); font-family: var(--font-body); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; text-align: center; }
  .dl-btn:hover { border-color: var(--gold); color: var(--gold); }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.4s ease forwards; }

  .company-type-group { margin-bottom: 20px; }
  .company-type-label { display: block; font-size: 12px; font-weight: 500; color: var(--muted); margin-bottom: 10px; letter-spacing: 0.3px; }
  .company-type-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .company-pill { padding: 9px 18px; border: 1px solid var(--border2); border-radius: 20px; background: var(--surface2); color: var(--muted); font-family: var(--font-body); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.25s ease; display: flex; align-items: center; gap: 7px; user-select: none; }
  .company-pill:hover { border-color: var(--gold); color: var(--gold); background: rgba(232,184,75,0.04); }
  .company-pill.active { border-color: var(--gold); color: #0f0e0c; background: var(--gold); font-weight: 600; box-shadow: 0 2px 12px rgba(232,184,75,0.25); }
  .company-pill .pill-icon { font-size: 15px; line-height: 1; }
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

export default function App() {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeSkills, setResumeSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [results, setResults] = useState({});
  const [expanded, setExpanded] = useState({});
  const [busy, setBusy] = useState({});

  const [tailorJD, setTailorJD] = useState("");
  const [tailorResult, setTailorResult] = useState("");
  const [tailorLoading, setTailorLoading] = useState(false);

  const set = (k, v) => setBusy(p => ({ ...p, [k]: v }));
  const upd = (i, data) => setResults(p => ({ ...p, [i]: { ...p[i], ...data } }));

  const analyze = async () => {
    if (!file || !jobRole) return alert("Upload a resume and enter a job role");
    setLoading(true); setJobs([]); setResults({});
    try {
      const fd = new FormData(); fd.append("file", file);
      const pr = await axios.post(`${API}/parse-resume`, fd);
      setResumeText(pr.data.resume_text);
      setResumeSkills(pr.data.resume_skills);
      const jf = new FormData();
      jf.append("job_role", jobRole);
      jf.append("location", location);
      jf.append("job_type", jobType);
      jf.append("company_type", companyType);
      const jr = await axios.post(`${API}/fetch-jobs`, jf);
      setJobs(jr.data.jobs);
    } catch (e) { alert("Error: " + (e.response?.data?.detail || e.message)); }
    setLoading(false);
  };

  const matchScore = async (job, i) => {
    set(`m${i}`, true);
    try {
      const sf = new FormData(); sf.append("job_description", job.description);
      const sr = await axios.post(`${API}/job-skills`, sf);
      const mf = new FormData();
      mf.append("resume_skills", JSON.stringify(resumeSkills));
      mf.append("job_skills", JSON.stringify(sr.data.job_skills));
      const mr = await axios.post(`${API}/match`, mf);
      upd(i, { ...mr.data });
    } catch (e) { alert(e.message); }
    set(`m${i}`, false);
  };

  const improveResume = async (i) => {
    set(`r${i}`, true);
    try {
      const f = new FormData();
      f.append("resume_text", resumeText);
      f.append("missing_skills", JSON.stringify(results[i]?.missing_skills || []));
      const r = await axios.post(`${API}/optimize-resume`, f);
      upd(i, { improved_resume: r.data.improved_resume });
    } catch (e) { alert(e.message); }
    set(`r${i}`, false);
  };

  const genEmail = async (job, i) => {
    set(`e${i}`, true);
    try {
      const f = new FormData();
      f.append("resume_text", resumeText);
      f.append("job_title", job.title);
      f.append("company", job.company);
      const r = await axios.post(`${API}/generate-email`, f);
      upd(i, { email: r.data.email });
    } catch (e) { alert(e.message); }
    set(`e${i}`, false);
  };

  const atsScore = async (job, i) => {
    set(`a${i}`, true);
    try {
      const f = new FormData();
      f.append("resume_text", resumeText);
      f.append("job_description", job.description);
      const r = await axios.post(`${API}/ats-score`, f);
      upd(i, { ats: r.data });
    } catch (e) { alert(e.message); }
    set(`a${i}`, false);
  };

  const roadmap = async (i) => {
    set(`rd${i}`, true);
    try {
      const f = new FormData();
      f.append("missing_skills", JSON.stringify(results[i]?.missing_skills || []));
      const r = await axios.post(`${API}/skill-roadmap`, f);
      upd(i, { roadmap: r.data.roadmap });
    } catch (e) { alert(e.message); }
    set(`rd${i}`, false);
  };

  const dlTxt = (text, name) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = name; a.click();
  };

  const dlDoc = (text, name) => {
    const html = `<html><head><meta charset="utf-8"><style>body{font-family:Arial;padding:40px;line-height:1.7}</style></head><body><pre style="white-space:pre-wrap">${text}</pre></body></html>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "application/msword" }));
    a.download = name; a.click();
  };

  const tailorResume = async () => {
    if (!resumeText) return alert("Analyze jobs first to load your resume");
    if (!tailorJD) return alert("Paste a job description");
    setTailorLoading(true);
    try {
      const f = new FormData();
      f.append("resume_text", resumeText);
      f.append("job_description", tailorJD);
      const r = await axios.post(`${API}/tailor-resume`, f);
      setTailorResult(r.data.tailored_resume);
    } catch (e) { alert(e.message); }
    setTailorLoading(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        <header className="header">
          <div className="header-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">AI-Powered Career Tool</span>
          </div>
          <h1>Find jobs that<br /><em>actually fit</em> you.</h1>
          <p className="header-sub">Upload your resume, search live listings, and let AI score your match — then fix your resume on the spot.</p>
        </header>

        <div className="divider" />

        <div className="form-card">
          <div className="form-title">
            <span className="form-title-num">01</span>
            Your Details
          </div>

          <div className="two-col">
            <div className="field">
              <label>Resume (PDF)</label>
              <div className="file-drop">
                <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
                <div className="file-drop-icon">📄</div>
                {file
                  ? <div className="file-drop-name">✓ {file.name}</div>
                  : <div className="file-drop-text">Click to upload</div>
                }
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
                <input className="input" type="text" placeholder="e.g. Remote, New York"
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
                <input type="range" min="0" max="80" step="5"
                  value={minScore} onChange={e => setMinScore(Number(e.target.value))} />
                <span className="slider-val">{minScore}%</span>
              </div>
            </div>
          </div>

          <div className="company-type-group">
            <label className="company-type-label">Company Type</label>
            <div className="company-type-pills">
              {[
                { value: "", label: "All Types", icon: "◉" },
                { value: "product based", label: "Product Based", icon: "🏢" },
                { value: "service based", label: "Service Based", icon: "🔧" },
                { value: "startup", label: "Startup", icon: "🚀" },
              ].map(opt => (
                <button
                  key={opt.value}
                  className={`company-pill ${companyType === opt.value ? "active" : ""}`}
                  onClick={() => setCompanyType(companyType === opt.value ? "" : opt.value)}
                  type="button"
                >
                  <span className="pill-icon">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button className="submit-btn" onClick={analyze} disabled={loading}>
            {loading ? "Analyzing…" : "→ Analyze Jobs"}
          </button>
          {loading && <div className="progress"><div className="progress-inner" /></div>}
        </div>

        {jobs.length > 0 && (
          { resumeText && (
            <div className="form-card fade-up" style={{ marginBottom: 24 }}>
              <div className="form-title">
                <span className="form-title-num">02</span>
                Tailor Resume for a Specific Job
              </div>
              <div className="field">
                <label>Paste Job Description</label>
                <textarea
                  className="input"
                  placeholder="Paste the full job description here..."
                  value={tailorJD}
                  onChange={e => setTailorJD(e.target.value)}
                  rows={6}
                  style={{ resize: "vertical", lineHeight: 1.6 }}
                />
              </div>
              <button className="submit-btn" onClick={tailorResume} disabled={tailorLoading}>
                {tailorLoading ? "Tailoring…" : "→ Tailor My Resume"}
              </button>
              {tailorLoading && <div className="progress"><div className="progress-inner" /></div>}
              {tailorResult && (
                <div className="panel" style={{ marginTop: 16 }}>
                  <div className="panel-title">Tailored Resume</div>
                  <textarea className="text-out" value={tailorResult} readOnly rows={12} />
                  <div className="dl-row">
                    <button className="dl-btn" onClick={() => dlTxt(tailorResult, "tailored_resume.txt")}>⬇ Download TXT</button>
                    <button className="dl-btn" onClick={() => dlDoc(tailorResult, "tailored_resume.doc")}>⬇ Download Word</button>
                  </div>
                </div>
              )}
            </div>
          )}
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
                    <div className={`score-ring ${scoreClass(sc)}`}>
                      {sc !== undefined ? `${sc}%` : "—"}
                    </div>
                    <span className={`chevron ${isOpen ? "open" : ""}`}>⌄</span>
                  </div>
                </div>

                {isOpen && (
                  <div className="job-body">
                    <a className="apply-btn" href={job.link} target="_blank" rel="noreferrer">Apply ↗</a>

                    <div className="actions">
                      {[
                        { key: `m${i}`, label: "Match Score", icon: "◎", fn: () => matchScore(job, i) },
                        { key: `r${i}`, label: "Improve Resume", icon: "✦", fn: () => improveResume(i) },
                        { key: `e${i}`, label: "Write Email", icon: "✉", fn: () => genEmail(job, i) },
                        { key: `a${i}`, label: "ATS Score", icon: "◈", fn: () => atsScore(job, i) },
                        { key: `rd${i}`, label: "Skill Roadmap", icon: "◆", fn: () => roadmap(i) },
                      ].map(btn => (
                        <button key={btn.key} className="act-btn"
                          onClick={btn.fn} disabled={busy[btn.key]}>
                          {busy[btn.key] ? "…" : btn.icon} {btn.label}
                        </button>
                      ))}
                    </div>

                    {r?.score !== undefined && (
                      <div className="panel">
                        <div className="panel-title">Skill Match</div>
                        <div className="match-bar-wrap">
                          <div className="match-bar-fill" style={{ width: `${r.score}%`, background: scoreColor(r.score) }} />
                        </div>
                        {r.matched_skills?.length > 0 && (
                          <><div className="skills-section-label">Matched</div>
                            <div className="chips">{r.matched_skills.map(s => <span key={s} className="chip matched">{s}</span>)}</div></>
                        )}
                        {r.missing_skills?.length > 0 && (
                          <><div className="skills-section-label">Missing</div>
                            <div className="chips">{r.missing_skills.map(s => <span key={s} className="chip missing">{s}</span>)}</div></>
                        )}
                      </div>
                    )}

                    {r?.ats && (
                      <div className="panel">
                        <div className="panel-title">ATS Analysis</div>
                        <div className="ats-grid">
                          {[{ l: "Overall", v: r.ats.ats_score }, { l: "Keywords", v: r.ats.keyword_match }, { l: "Format", v: r.ats.format_score }, { l: "Experience", v: r.ats.experience_match }].map(m => (
                            <div className="ats-card" key={m.l}>
                              <div className="ats-card-label">{m.l}</div>
                              <div className="ats-card-val" style={{ color: scoreColor(m.v) }}>{m.v}%</div>
                            </div>
                          ))}
                        </div>
                        {r.ats.strengths?.length > 0 && (
                          <><div className="skills-section-label" style={{ color: "#5dba7e" }}>Strengths</div>
                            <ul className="feedback-list" style={{ marginBottom: 12 }}>
                              {r.ats.strengths.map(s => <li key={s} className="feedback-item"><span className="feedback-dot" style={{ color: "#5dba7e" }}>▸</span>{s}</li>)}
                            </ul></>
                        )}
                        {r.ats.improvements?.length > 0 && (
                          <><div className="skills-section-label" style={{ color: "#e8b84b" }}>Improvements</div>
                            <ul className="feedback-list">
                              {r.ats.improvements.map(s => <li key={s} className="feedback-item"><span className="feedback-dot" style={{ color: "#e8b84b" }}>▸</span>{s}</li>)}
                            </ul></>
                        )}
                      </div>
                    )}

                    {r?.roadmap?.length > 0 && (
                      <div className="panel">
                        <div className="panel-title">Skill Roadmap</div>
                        {r.roadmap.map((item, ri) => (
                          <div className="roadmap-item" key={ri}>
                            <div className="roadmap-header">
                              <span className="roadmap-skill">{item.skill}</span>
                              <div className="roadmap-meta">
                                <span className="roadmap-badge">{item.level}</span>
                                <span className="roadmap-badge">⏱ {item.time}</span>
                              </div>
                            </div>
                            {item.resources?.map((res, rj) => (
                              <a key={rj} className="resource-link" href={res.url} target="_blank" rel="noreferrer">
                                <span className="resource-name">{res.name}</span>
                                <span className={`resource-type ${res.type === "Free" ? "free" : "paid"}`}>{res.type}</span>
                              </a>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {r?.improved_resume && (
                      <div className="panel">
                        <div className="panel-title">Optimized Resume</div>
                        <textarea className="text-out" value={r.improved_resume} readOnly rows={10} />
                        <div className="dl-row">
                          <button className="dl-btn" onClick={() => dlTxt(r.improved_resume, "resume.txt")}>⬇ Download TXT</button>
                          <button className="dl-btn" onClick={() => dlDoc(r.improved_resume, "resume.doc")}>⬇ Download Word</button>
                        </div>
                      </div>
                    )}

                    {r?.email && (
                      <div className="panel">
                        <div className="panel-title">Application Email</div>
                        <textarea className="text-out" value={r.email} readOnly rows={10} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>
    </>
  );
}


// import { useState } from "react";
// import axios from "axios";

// const API = "https://ai-job-matcher-backend-0oc7.onrender.com";

// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//   :root {
//     --bg: #0f0e0c;
//     --surface: #1a1916;
//     --surface2: #222019;
//     --border: #2e2b24;
//     --border2: #3d3930;
//     --gold: #e8b84b;
//     --gold2: #f5d07a;
//     --cream: #f0e6d3;
//     --text: #ddd5c4;
//     --muted: #7a7060;
//     --green: #5dba7e;
//     --red: #d95f5f;
//     --font-display: 'Playfair Display', Georgia, serif;
//     --font-body: 'DM Sans', sans-serif;
//     --font-mono: 'DM Mono', monospace;
//   }

//   body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; background-image: radial-gradient(ellipse 60% 40% at 20% 0%, rgba(232,184,75,0.04) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 80% 100%, rgba(91,143,212,0.03) 0%, transparent 60%); }

//   .app { max-width: 780px; margin: 0 auto; padding: 48px 20px 80px; }

//   .header { margin-bottom: 40px; }
//   .header-eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
//   .eyebrow-line { height: 1px; width: 32px; background: var(--gold); opacity: 0.6; }
//   .eyebrow-text { font-family: var(--font-mono); font-size: 11px; letter-spacing: 2px; color: var(--gold); text-transform: uppercase; opacity: 0.8; }
//   .header h1 { font-family: var(--font-display); font-size: clamp(2.4rem, 7vw, 4rem); font-weight: 900; line-height: 1.05; color: var(--cream); letter-spacing: -1px; margin-bottom: 14px; }
//   .header h1 em { font-style: italic; color: var(--gold); }
//   .header-sub { font-size: 15px; color: var(--muted); font-weight: 300; line-height: 1.6; max-width: 420px; }

//   .divider { height: 1px; background: linear-gradient(90deg, var(--border2), transparent); margin: 32px 0; }

//   .tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 6px; margin-bottom: 24px; }
//   .tab { flex: 1; padding: 12px 16px; border-radius: 8px; border: none; background: transparent; color: var(--muted); font-family: var(--font-body); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
//   .tab:hover { color: var(--text); }
//   .tab.active { background: var(--surface2); color: var(--gold); border: 1px solid var(--border2); }

//   .form-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 28px; margin-bottom: 24px; }
//   .form-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--cream); margin-bottom: 6px; }
//   .form-desc { font-size: 13px; color: var(--muted); margin-bottom: 24px; line-height: 1.5; }

//   .field { margin-bottom: 18px; }
//   .field label { display: block; font-size: 12px; font-weight: 500; color: var(--muted); margin-bottom: 8px; }

//   .file-drop { border: 1px dashed var(--border2); border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; position: relative; transition: all 0.2s; background: var(--surface2); }
//   .file-drop:hover { border-color: var(--gold); }
//   .file-drop input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
//   .file-drop-icon { font-size: 28px; margin-bottom: 8px; opacity: 0.7; }
//   .file-drop-text { font-size: 13px; color: var(--muted); }
//   .file-drop-name { font-size: 13px; color: var(--gold); margin-top: 4px; font-family: var(--font-mono); }

//   .input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; color: var(--cream); font-family: var(--font-body); font-size: 14px; outline: none; transition: border-color 0.2s; }
//   .input:focus { border-color: var(--gold); }
//   .input::placeholder { color: var(--muted); opacity: 0.6; }
//   select.input { cursor: pointer; }
//   textarea.input { resize: vertical; line-height: 1.6; }

//   .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
//   @media (max-width: 500px) { .two-col { grid-template-columns: 1fr; } }

//   .slider-row { display: flex; align-items: center; gap: 12px; }
//   .slider-val { font-family: var(--font-mono); font-size: 13px; color: var(--gold); min-width: 36px; text-align: right; }
//   input[type=range] { flex: 1; accent-color: var(--gold); cursor: pointer; }

//   .submit-btn { width: 100%; padding: 15px 24px; background: var(--gold); border: none; border-radius: 8px; color: #0f0e0c; font-family: var(--font-body); font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; }
//   .submit-btn:hover { background: var(--gold2); transform: translateY(-1px); }
//   .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

//   .progress { height: 2px; background: var(--border); border-radius: 2px; overflow: hidden; margin-top: 16px; }
//   .progress-inner { height: 100%; background: var(--gold); animation: prog 1.4s ease-in-out infinite; width: 35%; }
//   @keyframes prog { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }

//   .results-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px; }
//   .results-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--cream); }
//   .results-count { font-family: var(--font-mono); font-size: 12px; color: var(--muted); }

//   .job-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 12px; overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
//   .job-card:hover { border-color: var(--border2); box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
//   .job-top { padding: 20px 22px; cursor: pointer; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
//   .job-left { flex: 1; min-width: 0; }
//   .job-title { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--cream); margin-bottom: 5px; line-height: 1.3; }
//   .job-company { font-size: 13px; color: var(--muted); margin-bottom: 8px; }
//   .job-tags { display: flex; flex-wrap: wrap; gap: 6px; }
//   .job-tag { font-family: var(--font-mono); font-size: 11px; padding: 3px 8px; border-radius: 4px; background: var(--surface2); border: 1px solid var(--border2); color: var(--muted); }
//   .job-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
//   .score-ring { width: 48px; height: 48px; border-radius: 50%; border: 2px solid; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 12px; font-weight: 500; flex-shrink: 0; }
//   .score-ring.high { border-color: var(--green); color: var(--green); }
//   .score-ring.mid { border-color: var(--gold); color: var(--gold); }
//   .score-ring.low { border-color: var(--red); color: var(--red); }
//   .score-ring.none { border-color: var(--border2); color: var(--muted); }
//   .chevron { color: var(--muted); font-size: 16px; transition: transform 0.2s; }
//   .chevron.open { transform: rotate(180deg); }
//   .job-body { border-top: 1px solid var(--border); padding: 22px; }
//   .apply-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(232,184,75,0.08); border: 1px solid rgba(232,184,75,0.25); border-radius: 6px; color: var(--gold); font-size: 13px; font-weight: 500; text-decoration: none; margin-bottom: 20px; transition: all 0.2s; }
//   .apply-btn:hover { background: rgba(232,184,75,0.14); }

//   .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
//   .act-btn { padding: 8px 14px; border: 1px solid var(--border2); border-radius: 6px; background: var(--surface2); color: var(--text); font-family: var(--font-body); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
//   .act-btn:hover { border-color: var(--gold); color: var(--gold); }
//   .act-btn:disabled { opacity: 0.35; cursor: not-allowed; }

//   .panel { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; margin-top: 14px; }
//   .panel-title { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
//   .panel-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

//   .match-bar-wrap { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 16px; }
//   .match-bar-fill { height: 100%; border-radius: 3px; transition: width 0.9s cubic-bezier(0.16,1,0.3,1); }

//   .skills-label { font-size: 11px; font-weight: 600; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
//   .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
//   .chip { font-family: var(--font-mono); font-size: 11px; padding: 4px 10px; border-radius: 4px; border: 1px solid; }
//   .chip.matched { border-color: rgba(93,186,126,0.35); color: var(--green); background: rgba(93,186,126,0.06); }
//   .chip.missing { border-color: rgba(217,95,95,0.35); color: var(--red); background: rgba(217,95,95,0.06); }

//   .ats-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-bottom: 14px; }
//   .ats-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; }
//   .ats-card-label { font-size: 10px; color: var(--muted); letter-spacing: 0.5px; margin-bottom: 4px; }
//   .ats-card-val { font-family: var(--font-mono); font-size: 22px; font-weight: 500; }

//   .feedback-list { list-style: none; }
//   .feedback-item { font-size: 13px; color: var(--muted); padding: 7px 0; border-bottom: 1px solid var(--border); display: flex; gap: 10px; line-height: 1.5; }
//   .feedback-item:last-child { border-bottom: none; }

//   .roadmap-item { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
//   .roadmap-item:last-child { margin-bottom: 0; }
//   .roadmap-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
//   .roadmap-skill { font-weight: 600; font-size: 14px; color: var(--cream); }
//   .roadmap-meta { display: flex; gap: 6px; }
//   .roadmap-badge { font-family: var(--font-mono); font-size: 10px; padding: 3px 8px; border-radius: 4px; border: 1px solid var(--border2); color: var(--muted); }
//   .resource-link { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; text-decoration: none; margin-bottom: 6px; transition: border-color 0.2s; }
//   .resource-link:hover { border-color: var(--gold); }
//   .resource-link:last-child { margin-bottom: 0; }
//   .resource-name { font-size: 13px; color: var(--text); }
//   .resource-type { font-family: var(--font-mono); font-size: 10px; padding: 2px 7px; border-radius: 3px; border: 1px solid; }
//   .resource-type.free { border-color: rgba(93,186,126,0.4); color: var(--green); }
//   .resource-type.paid { border-color: rgba(232,184,75,0.4); color: var(--gold); }

//   .text-out { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 14px; color: var(--text); font-family: var(--font-mono); font-size: 12px; line-height: 1.8; resize: vertical; outline: none; min-height: 160px; }

//   .dl-row { display: flex; gap: 8px; margin-top: 10px; }
//   .dl-btn { flex: 1; padding: 9px 14px; border: 1px solid var(--border2); border-radius: 6px; background: var(--surface); color: var(--muted); font-family: var(--font-body); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; text-align: center; }
//   .dl-btn:hover { border-color: var(--gold); color: var(--gold); }

//   .tailor-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
//   @media (max-width: 500px) { .tailor-steps { grid-template-columns: 1fr; } }
//   .tailor-step { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 16px; text-align: center; }
//   .tailor-step-num { font-family: var(--font-mono); font-size: 11px; color: var(--gold); margin-bottom: 6px; }
//   .tailor-step-text { font-size: 12px; color: var(--muted); line-height: 1.4; }

//   @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
//   .fade-up { animation: fadeUp 0.4s ease forwards; }
// `;

// function scoreClass(s) {
//   if (s === undefined) return "none";
//   if (s >= 60) return "high";
//   if (s >= 30) return "mid";
//   return "low";
// }
// function scoreColor(s) {
//   if (s >= 60) return "#5dba7e";
//   if (s >= 30) return "#e8b84b";
//   return "#d95f5f";
// }

// export default function App() {
//   const [activeTab, setActiveTab] = useState("find");

//   const [file, setFile] = useState(null);
//   const [jobRole, setJobRole] = useState("");
//   const [location, setLocation] = useState("");
//   const [jobType, setJobType] = useState("");
//   const [minScore, setMinScore] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [resumeText, setResumeText] = useState("");
//   const [resumeSkills, setResumeSkills] = useState([]);
//   const [jobs, setJobs] = useState([]);
//   const [results, setResults] = useState({});
//   const [expanded, setExpanded] = useState({});
//   const [busy, setBusy] = useState({});

//   const [tailorFile, setTailorFile] = useState(null);
//   const [tailorJD, setTailorJD] = useState("");
//   const [tailorLoading, setTailorLoading] = useState(false);
//   const [tailorResult, setTailorResult] = useState("");
//   const [tailorResumeText, setTailorResumeText] = useState("");

//   const set = (k, v) => setBusy(p => ({ ...p, [k]: v }));
//   const upd = (i, data) => setResults(p => ({ ...p, [i]: { ...p[i], ...data } }));

//   const analyze = async () => {
//     if (!file || !jobRole) return alert("Upload a resume and enter a job role");
//     setLoading(true); setJobs([]); setResults({});
//     try {
//       const fd = new FormData(); fd.append("file", file);
//       const pr = await axios.post(`${API}/parse-resume`, fd);
//       setResumeText(pr.data.resume_text);
//       setResumeSkills(pr.data.resume_skills);
//       const jf = new FormData();
//       jf.append("job_role", jobRole);
//       jf.append("location", location);
//       jf.append("job_type", jobType);
//       const jr = await axios.post(`${API}/fetch-jobs`, jf);
//       setJobs(jr.data.jobs);
//     } catch (e) { alert("Error: " + (e.response?.data?.detail || e.message)); }
//     setLoading(false);
//   };

//   const matchScore = async (job, i) => {
//     set(`m${i}`, true);
//     try {
//       const sf = new FormData(); sf.append("job_description", job.description);
//       const sr = await axios.post(`${API}/job-skills`, sf);
//       const mf = new FormData();
//       mf.append("resume_skills", JSON.stringify(resumeSkills));
//       mf.append("job_skills", JSON.stringify(sr.data.job_skills));
//       const mr = await axios.post(`${API}/match`, mf);
//       upd(i, { ...mr.data });
//     } catch (e) { alert(e.message); }
//     set(`m${i}`, false);
//   };

//   const improveResume = async (i) => {
//     set(`r${i}`, true);
//     try {
//       const f = new FormData();
//       f.append("resume_text", resumeText);
//       f.append("missing_skills", JSON.stringify(results[i]?.missing_skills || []));
//       const r = await axios.post(`${API}/optimize-resume`, f);
//       upd(i, { improved_resume: r.data.improved_resume });
//     } catch (e) { alert(e.message); }
//     set(`r${i}`, false);
//   };

//   const genEmail = async (job, i) => {
//     set(`e${i}`, true);
//     try {
//       const f = new FormData();
//       f.append("resume_text", resumeText);
//       f.append("job_title", job.title);
//       f.append("company", job.company);
//       const r = await axios.post(`${API}/generate-email`, f);
//       upd(i, { email: r.data.email });
//     } catch (e) { alert(e.message); }
//     set(`e${i}`, false);
//   };

//   const atsScore = async (job, i) => {
//     set(`a${i}`, true);
//     try {
//       const f = new FormData();
//       f.append("resume_text", resumeText);
//       f.append("job_description", job.description);
//       const r = await axios.post(`${API}/ats-score`, f);
//       upd(i, { ats: r.data });
//     } catch (e) { alert(e.message); }
//     set(`a${i}`, false);
//   };

//   const roadmap = async (i) => {
//     set(`rd${i}`, true);
//     try {
//       const f = new FormData();
//       f.append("missing_skills", JSON.stringify(results[i]?.missing_skills || []));
//       const r = await axios.post(`${API}/skill-roadmap`, f);
//       upd(i, { roadmap: r.data.roadmap });
//     } catch (e) { alert(e.message); }
//     set(`rd${i}`, false);
//   };

//   const tailorResume = async () => {
//     if (!tailorFile) return alert("Upload your resume PDF");
//     if (!tailorJD) return alert("Paste a job description");
//     setTailorLoading(true);
//     setTailorResult("");
//     try {
//       let rText = tailorResumeText;
//       if (!rText) {
//         const fd = new FormData(); fd.append("file", tailorFile);
//         const pr = await axios.post(`${API}/parse-resume`, fd);
//         rText = pr.data.resume_text;
//         setTailorResumeText(rText);
//       }
//       const f = new FormData();
//       f.append("resume_text", rText);
//       f.append("job_description", tailorJD);
//       const r = await axios.post(`${API}/tailor-resume`, f);
//       setTailorResult(r.data.tailored_resume);
//     } catch (e) { alert(e.message); }
//     setTailorLoading(false);
//   };

//   const dlTxt = (text, name) => {
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
//     a.download = name; a.click();
//   };

//   const dlDoc = (text, name) => {
//     const html = `<html><head><meta charset="utf-8"><style>body{font-family:Arial;padding:40px;line-height:1.7}</style></head><body><pre style="white-space:pre-wrap">${text}</pre></body></html>`;
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(new Blob([html], { type: "application/msword" }));
//     a.download = name; a.click();
//   };

//   return (
//     <>
//       <style>{styles}</style>
//       <div className="app">

//         <header className="header">
//           <div className="header-eyebrow">
//             <div className="eyebrow-line" />
//             <span className="eyebrow-text">AI-Powered Career Tool</span>
//           </div>
//           <h1>Find jobs that<br /><em>actually fit</em> you.</h1>
//           <p className="header-sub">Match your resume to live jobs, or tailor it for any role — powered by LLaMA 3.3.</p>
//         </header>

//         <div className="divider" />

//         <div className="tabs">
//           <button className={`tab ${activeTab === "find" ? "active" : ""}`} onClick={() => setActiveTab("find")}>
//             🔍 Find & Match Jobs
//           </button>
//           <button className={`tab ${activeTab === "tailor" ? "active" : ""}`} onClick={() => setActiveTab("tailor")}>
//             ✦ Tailor My Resume
//           </button>
//         </div>

//         {activeTab === "find" && (
//           <div className="fade-up">
//             <div className="form-card">
//               <div className="form-title">Search & Match</div>
//               <p className="form-desc">Upload your resume and search live job listings. We'll score how well you match each one.</p>

//               <div className="two-col">
//                 <div className="field">
//                   <label>Resume (PDF)</label>
//                   <div className="file-drop">
//                     <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
//                     <div className="file-drop-icon">📄</div>
//                     {file ? <div className="file-drop-name">✓ {file.name}</div> : <div className="file-drop-text">Click to upload</div>}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="field">
//                     <label>Job Role</label>
//                     <input className="input" type="text" placeholder="e.g. React Developer"
//                       value={jobRole} onChange={e => setJobRole(e.target.value)}
//                       onKeyDown={e => e.key === "Enter" && analyze()} />
//                   </div>
//                   <div className="field">
//                     <label>Location (optional)</label>
//                     <input className="input" type="text" placeholder="e.g. Remote, New York"
//                       value={location} onChange={e => setLocation(e.target.value)} />
//                   </div>
//                 </div>
//               </div>

//               <div className="two-col">
//                 <div className="field">
//                   <label>Job Type</label>
//                   <select className="input" value={jobType} onChange={e => setJobType(e.target.value)}>
//                     <option value="">Any Type</option>
//                     <option value="FULLTIME">Full Time</option>
//                     <option value="PARTTIME">Part Time</option>
//                     <option value="INTERN">Internship</option>
//                     <option value="CONTRACTOR">Contract</option>
//                   </select>
//                 </div>
//                 <div className="field">
//                   <label>Min Match Score</label>
//                   <div className="slider-row" style={{ marginTop: 10 }}>
//                     <input type="range" min="0" max="80" step="5" value={minScore} onChange={e => setMinScore(Number(e.target.value))} />
//                     <span className="slider-val">{minScore}%</span>
//                   </div>
//                 </div>
//               </div>

//               <button className="submit-btn" onClick={analyze} disabled={loading}>
//                 {loading ? "Analyzing…" : "→ Analyze Jobs"}
//               </button>
//               {loading && <div className="progress"><div className="progress-inner" /></div>}
//             </div>

//             {jobs.length > 0 && (
//               <div className="fade-up">
//                 <div className="results-header">
//                   <span className="results-title">Results</span>
//                   <span className="results-count">{jobs.length} jobs found</span>
//                 </div>

//                 {jobs.map((job, i) => {
//                   const r = results[i];
//                   const isOpen = expanded[i];
//                   const sc = r?.score;
//                   if (sc !== undefined && sc < minScore) return null;

//                   return (
//                     <div className="job-card fade-up" key={i}>
//                       <div className="job-top" onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}>
//                         <div className="job-left">
//                           <div className="job-title">{job.title}</div>
//                           <div className="job-company">{job.company}</div>
//                           <div className="job-tags">
//                             {job.location && <span className="job-tag">📍 {job.location}</span>}
//                             {job.job_type && <span className="job-tag">💼 {job.job_type}</span>}
//                           </div>
//                         </div>
//                         <div className="job-right">
//                           <div className={`score-ring ${scoreClass(sc)}`}>{sc !== undefined ? `${sc}%` : "—"}</div>
//                           <span className={`chevron ${isOpen ? "open" : ""}`}>⌄</span>
//                         </div>
//                       </div>

//                       {isOpen && (
//                         <div className="job-body">
//                           <a className="apply-btn" href={job.link} target="_blank" rel="noreferrer">Apply ↗</a>
//                           <div className="actions">
//                             {[
//                               { key: `m${i}`, label: "Match Score", icon: "◎", fn: () => matchScore(job, i) },
//                               { key: `r${i}`, label: "Improve Resume", icon: "✦", fn: () => improveResume(i) },
//                               { key: `e${i}`, label: "Write Email", icon: "✉", fn: () => genEmail(job, i) },
//                               { key: `a${i}`, label: "ATS Score", icon: "◈", fn: () => atsScore(job, i) },
//                               { key: `rd${i}`, label: "Skill Roadmap", icon: "◆", fn: () => roadmap(i) },
//                             ].map(btn => (
//                               <button key={btn.key} className="act-btn" onClick={btn.fn} disabled={busy[btn.key]}>
//                                 {busy[btn.key] ? "…" : btn.icon} {btn.label}
//                               </button>
//                             ))}
//                           </div>

//                           {r?.score !== undefined && (
//                             <div className="panel">
//                               <div className="panel-title">Skill Match</div>
//                               <div className="match-bar-wrap"><div className="match-bar-fill" style={{ width: `${r.score}%`, background: scoreColor(r.score) }} /></div>
//                               {r.matched_skills?.length > 0 && <><div className="skills-label">Matched</div><div className="chips">{r.matched_skills.map(s => <span key={s} className="chip matched">{s}</span>)}</div></>}
//                               {r.missing_skills?.length > 0 && <><div className="skills-label">Missing</div><div className="chips">{r.missing_skills.map(s => <span key={s} className="chip missing">{s}</span>)}</div></>}
//                             </div>
//                           )}

//                           {r?.ats && (
//                             <div className="panel">
//                               <div className="panel-title">ATS Analysis</div>
//                               <div className="ats-grid">
//                                 {[{ l: "Overall", v: r.ats.ats_score }, { l: "Keywords", v: r.ats.keyword_match }, { l: "Format", v: r.ats.format_score }, { l: "Experience", v: r.ats.experience_match }].map(m => (
//                                   <div className="ats-card" key={m.l}><div className="ats-card-label">{m.l}</div><div className="ats-card-val" style={{ color: scoreColor(m.v) }}>{m.v}%</div></div>
//                                 ))}
//                               </div>
//                               {r.ats.strengths?.length > 0 && <><div className="skills-label" style={{ color: "#5dba7e" }}>Strengths</div><ul className="feedback-list" style={{ marginBottom: 12 }}>{r.ats.strengths.map(s => <li key={s} className="feedback-item"><span style={{ color: "#5dba7e", flexShrink: 0 }}>▸</span>{s}</li>)}</ul></>}
//                               {r.ats.improvements?.length > 0 && <><div className="skills-label" style={{ color: "#e8b84b" }}>Improvements</div><ul className="feedback-list">{r.ats.improvements.map(s => <li key={s} className="feedback-item"><span style={{ color: "#e8b84b", flexShrink: 0 }}>▸</span>{s}</li>)}</ul></>}
//                             </div>
//                           )}

//                           {r?.roadmap?.length > 0 && (
//                             <div className="panel">
//                               <div className="panel-title">Skill Roadmap</div>
//                               {r.roadmap.map((item, ri) => (
//                                 <div className="roadmap-item" key={ri}>
//                                   <div className="roadmap-header">
//                                     <span className="roadmap-skill">{item.skill}</span>
//                                     <div className="roadmap-meta"><span className="roadmap-badge">{item.level}</span><span className="roadmap-badge">⏱ {item.time}</span></div>
//                                   </div>
//                                   {item.resources?.map((res, rj) => (
//                                     <a key={rj} className="resource-link" href={res.url} target="_blank" rel="noreferrer">
//                                       <span className="resource-name">{res.name}</span>
//                                       <span className={`resource-type ${res.type === "Free" ? "free" : "paid"}`}>{res.type}</span>
//                                     </a>
//                                   ))}
//                                 </div>
//                               ))}
//                             </div>
//                           )}

//                           {r?.improved_resume && (
//                             <div className="panel">
//                               <div className="panel-title">Optimized Resume</div>
//                               <textarea className="text-out" value={r.improved_resume} readOnly rows={10} />
//                               <div className="dl-row">
//                                 <button className="dl-btn" onClick={() => dlTxt(r.improved_resume, "resume.txt")}>⬇ Download TXT</button>
//                                 <button className="dl-btn" onClick={() => dlDoc(r.improved_resume, "resume.doc")}>⬇ Download Word</button>
//                               </div>
//                             </div>
//                           )}

//                           {r?.email && (
//                             <div className="panel">
//                               <div className="panel-title">Application Email</div>
//                               <textarea className="text-out" value={r.email} readOnly rows={10} />
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === "tailor" && (
//           <div className="fade-up">
//             <div className="form-card">
//               <div className="form-title">Tailor Resume for a Specific Job</div>
//               <p className="form-desc">Already found a job you want? Upload your resume and paste the job description — we'll rewrite your resume to perfectly match it.</p>

//               <div className="tailor-steps">
//                 <div className="tailor-step"><div className="tailor-step-num">01</div><div className="tailor-step-text">Upload your resume PDF</div></div>
//                 <div className="tailor-step"><div className="tailor-step-num">02</div><div className="tailor-step-text">Paste the job description</div></div>
//                 <div className="tailor-step"><div className="tailor-step-num">03</div><div className="tailor-step-text">Download tailored resume</div></div>
//               </div>

//               <div className="field">
//                 <label>Resume (PDF)</label>
//                 <div className="file-drop">
//                   <input type="file" accept=".pdf" onChange={e => { setTailorFile(e.target.files[0]); setTailorResumeText(""); }} />
//                   <div className="file-drop-icon">📄</div>
//                   {tailorFile ? <div className="file-drop-name">✓ {tailorFile.name}</div> : <div className="file-drop-text">Click to upload</div>}
//                 </div>
//               </div>

//               <div className="field">
//                 <label>Job Description</label>
//                 <textarea className="input" placeholder="Paste the full job description here — requirements, responsibilities, qualifications..." value={tailorJD} onChange={e => setTailorJD(e.target.value)} rows={8} />
//               </div>

//               <button className="submit-btn" onClick={tailorResume} disabled={tailorLoading}>
//                 {tailorLoading ? "Tailoring your resume…" : "→ Tailor My Resume"}
//               </button>
//               {tailorLoading && <div className="progress"><div className="progress-inner" /></div>}
//             </div>

//             {tailorResult && (
//               <div className="panel fade-up">
//                 <div className="panel-title">Your Tailored Resume</div>
//                 <textarea className="text-out" value={tailorResult} readOnly rows={16} />
//                 <div className="dl-row">
//                   <button className="dl-btn" onClick={() => dlTxt(tailorResult, "tailored_resume.txt")}>⬇ Download TXT</button>
//                   <button className="dl-btn" onClick={() => dlDoc(tailorResult, "tailored_resume.doc")}>⬇ Download Word</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//       </div>
//     </>
//   );
// }