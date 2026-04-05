// import { useState } from "react";
// import axios from "axios";

// const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// export default function App() {
//   const [file, setFile] = useState(null);
//   const [jobRole, setJobRole] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [resumeText, setResumeText] = useState("");
//   const [resumeSkills, setResumeSkills] = useState([]);
//   const [jobs, setJobs] = useState([]);
//   const [jobResults, setJobResults] = useState({});

//   const handleAnalyze = async () => {
//     if (!file || !jobRole) return alert("Upload resume and enter job role");
//     setLoading(true);

//     const formData = new FormData();
//     formData.append("file", file);
//     const parseRes = await axios.post(`${API}/parse-resume`, formData);
//     const { resume_text, resume_skills } = parseRes.data;
//     setResumeText(resume_text);
//     setResumeSkills(resume_skills);

//     const jobForm = new FormData();
//     jobForm.append("job_role", jobRole);
//     const jobRes = await axios.post(`${API}/fetch-jobs`, jobForm);
//     setJobs(jobRes.data.jobs);
//     setLoading(false);
//   };

//   const handleMatch = async (job, index) => {
//     const form = new FormData();
//     form.append("job_description", job.description);
//     const skillRes = await axios.post(`${API}/job-skills`, form);
//     const job_skills = skillRes.data.job_skills;

//     const matchForm = new FormData();
//     matchForm.append("resume_skills", JSON.stringify(resumeSkills));
//     matchForm.append("job_skills", JSON.stringify(job_skills));
//     const matchRes = await axios.post(`${API}/match`, matchForm);

//     setJobResults(prev => ({ ...prev, [index]: { ...matchRes.data, job_skills } }));
//   };

//   const handleOptimize = async (index, result) => {
//     const form = new FormData();
//     form.append("resume_text", resumeText);
//     form.append("missing_skills", JSON.stringify(result.missing_skills));
//     const res = await axios.post(`${API}/optimize-resume`, form);
//     setJobResults(prev => ({ ...prev, [index]: { ...prev[index], improved_resume: res.data.improved_resume } }));
//   };

//   const handleEmail = async (job, index) => {
//     const form = new FormData();
//     form.append("resume_text", resumeText);
//     form.append("job_title", job.title);
//     form.append("company", job.company);
//     const res = await axios.post(`${API}/generate-email`, form);
//     setJobResults(prev => ({ ...prev, [index]: { ...prev[index], email: res.data.email } }));
//   };

//   const handleATS = async (job, index) => {
//     const form = new FormData();
//     form.append("resume_text", resumeText);
//     form.append("job_description", job.description);
//     const res = await axios.post(`${API}/ats-score`, form);
//     setJobResults(prev => ({ ...prev, [index]: { ...prev[index], ats: res.data } }));
//   };

//   return (
//     <div style={{ fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto", padding: 24 }}>
//       <h1>🎯 AI Job Match & Resume Optimizer</h1>

//       <div style={{ marginBottom: 16 }}>
//         <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
//       </div>

//       <div style={{ marginBottom: 16 }}>
//         <input
//           type="text"
//           placeholder="Job Role (e.g. Python Developer)"
//           value={jobRole}
//           onChange={e => setJobRole(e.target.value)}
//           style={{ padding: 8, width: 300, marginRight: 8 }}
//         />
//         <button onClick={handleAnalyze} disabled={loading} style={{ padding: "8px 16px" }}>
//           {loading ? "Analyzing..." : "Analyze Jobs"}
//         </button>
//       </div>

//       {jobs.map((job, i) => (
//         <div key={i} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
//           <h3>{job.title} @ {job.company}</h3>
//           <a href={job.link} target="_blank" rel="noreferrer">Apply Here</a>

//           <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
//             <button onClick={() => handleMatch(job, i)}>Match Score</button>
//             <button onClick={() => handleOptimize(i, jobResults[i] || {missing_skills: []})}>Improve Resume</button>
//             <button onClick={() => handleEmail(job, i)}>Generate Email</button>
//             <button onClick={() => handleATS(job, i)}>ATS Score</button>
//           </div>

//           {jobResults[i] && (
//             <div style={{ marginTop: 12 }}>
//               {jobResults[i].score !== undefined && (
//                 <p>✅ Match Score: <strong>{jobResults[i].score}%</strong> | Missing: {jobResults[i].missing_skills?.join(", ")}</p>
//               )}
//               {jobResults[i].ats && (
//                 <div>
//                   <p>🤖 ATS Score: {jobResults[i].ats.ats_score}% | Keywords: {jobResults[i].ats.keyword_match}%</p>
//                   <p>💪 {jobResults[i].ats.strengths?.join(" | ")}</p>
//                   <p>⚠️ {jobResults[i].ats.improvements?.join(" | ")}</p>
//                 </div>
//               )}
//               {jobResults[i].improved_resume && (
//                 <textarea value={jobResults[i].improved_resume} readOnly rows={8} style={{ width: "100%", marginTop: 8 }} />
//               )}
//               {jobResults[i].email && (
//                 <textarea value={jobResults[i].email} readOnly rows={8} style={{ width: "100%", marginTop: 8 }} />
//               )}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }


import { useState } from "react";
import axios from "axios";

const API = "https://ai-job-matcher-backend-0oc7.onrender.com";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080b10;
    --surface: #0e1420;
    --surface2: #141c2e;
    --border: #1e2d4a;
    --accent: #00e5ff;
    --accent2: #7c3aed;
    --green: #00ff88;
    --red: #ff4466;
    --yellow: #ffd600;
    --text: #e8f0fe;
    --muted: #6b7fa3;
    --font-head: 'Syne', sans-serif;
    --font-mono: 'Space Mono', monospace;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-head);
    min-height: 100vh;
    background-image: 
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,229,255,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 80% 80%, rgba(124,58,237,0.05) 0%, transparent 60%);
  }

  .app {
    max-width: 900px;
    margin: 0 auto;
    padding: 48px 24px;
  }

  /* HEADER */
  .header {
    text-align: center;
    margin-bottom: 56px;
    position: relative;
  }
  .header-tag {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 3px;
    color: var(--accent);
    border: 1px solid rgba(0,229,255,0.3);
    padding: 4px 12px;
    border-radius: 2px;
    margin-bottom: 20px;
    text-transform: uppercase;
  }
  .header h1 {
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -1px;
    background: linear-gradient(135deg, #fff 0%, var(--accent) 60%, var(--accent2) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 12px;
  }
  .header p {
    color: var(--muted);
    font-size: 15px;
    font-family: var(--font-mono);
  }

  /* INPUT SECTION */
  .input-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
  }
  .input-section::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: 0.5;
  }
  .input-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  @media (max-width: 600px) { .input-grid { grid-template-columns: 1fr; } }

  .input-group label {
    display: block;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .file-input-wrapper {
    position: relative;
    border: 1px dashed var(--border);
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    background: var(--surface2);
  }
  .file-input-wrapper:hover { border-color: var(--accent); background: rgba(0,229,255,0.03); }
  .file-input-wrapper input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
  .file-icon { font-size: 24px; margin-bottom: 6px; }
  .file-text { font-family: var(--font-mono); font-size: 12px; color: var(--muted); }
  .file-name { color: var(--accent); font-size: 12px; margin-top: 4px; font-family: var(--font-mono); }

  .text-input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
    color: var(--text);
    font-family: var(--font-head);
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
    height: 100%;
    min-height: 80px;
  }
  .text-input:focus { border-color: var(--accent); }
  .text-input::placeholder { color: var(--muted); }

  .analyze-btn {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border: none;
    border-radius: 10px;
    color: #000;
    font-family: var(--font-head);
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
    position: relative;
    overflow: hidden;
  }
  .analyze-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .analyze-btn:active { transform: translateY(0); }
  .analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* LOADING */
  .loading-bar {
    width: 100%;
    height: 2px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 16px;
  }
  .loading-bar-inner {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    animation: loading 1.5s ease-in-out infinite;
    width: 40%;
  }
  @keyframes loading {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }

  /* JOB CARDS */
  .jobs-header {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 3px;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .jobs-header span { color: var(--accent); }

  .job-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    margin-bottom: 16px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .job-card:hover { border-color: rgba(0,229,255,0.3); }

  .job-header {
    padding: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .job-info { flex: 1; }
  .job-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 4px;
    color: var(--text);
  }
  .job-company {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--muted);
  }
  .job-score-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .score-circle {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 700;
    border: 2px solid;
    flex-shrink: 0;
  }
  .score-high { border-color: var(--green); color: var(--green); background: rgba(0,255,136,0.05); }
  .score-mid { border-color: var(--yellow); color: var(--yellow); background: rgba(255,214,0,0.05); }
  .score-low { border-color: var(--red); color: var(--red); background: rgba(255,68,102,0.05); }

  .chevron { color: var(--muted); font-size: 18px; transition: transform 0.2s; }
  .chevron.open { transform: rotate(180deg); }

  .job-body {
    border-top: 1px solid var(--border);
    padding: 24px;
  }

  .apply-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--accent);
    text-decoration: none;
    margin-bottom: 20px;
    opacity: 0.8;
    transition: opacity 0.2s;
  }
  .apply-link:hover { opacity: 1; }

  /* ACTION BUTTONS */
  .action-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }
  .action-btn {
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface2);
    color: var(--text);
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .action-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,229,255,0.05); }
  .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .action-btn.loading { opacity: 0.6; }

  /* RESULTS */
  .result-box {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    margin-top: 16px;
  }
  .result-box-title {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .skills-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .skill-tag {
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid;
  }
  .skill-tag.matched { border-color: rgba(0,255,136,0.4); color: var(--green); background: rgba(0,255,136,0.05); }
  .skill-tag.missing { border-color: rgba(255,68,102,0.4); color: var(--red); background: rgba(255,68,102,0.05); }

  .progress-bar {
    height: 6px;
    background: var(--border);
    border-radius: 3px;
    overflow: hidden;
    margin: 8px 0 16px;
  }
  .progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.8s ease;
  }

  .ats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  @media (max-width: 500px) { .ats-grid { grid-template-columns: 1fr; } }

  .ats-metric {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px;
  }
  .ats-metric-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .ats-metric-value {
    font-size: 24px;
    font-weight: 800;
    font-family: var(--font-mono);
  }

  .text-output {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.7;
    resize: vertical;
    outline: none;
    min-height: 180px;
  }

  .strength-list { list-style: none; }
  .strength-list li {
    font-family: var(--font-mono);
    font-size: 12px;
    padding: 6px 0;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: flex-start;
    gap: 8px;
    color: var(--muted);
  }
  .strength-list li:last-child { border-bottom: none; }
  .strength-list li .dot { flex-shrink: 0; margin-top: 2px; }
`;

function getScoreClass(score) {
  if (score >= 60) return "score-high";
  if (score >= 30) return "score-mid";
  return "score-low";
}

function getScoreColor(score) {
  if (score >= 60) return "#00ff88";
  if (score >= 30) return "#ffd600";
  return "#ff4466";
}

export default function App() {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeSkills, setResumeSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobResults, setJobResults] = useState({});
  const [expanded, setExpanded] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [minScore, setMinScore] = useState(0);

  const setAL = (key, val) => setActionLoading(p => ({ ...p, [key]: val }));

  const handleAnalyze = async () => {
    if (!file || !jobRole) return alert("Upload a resume and enter a job role");
    setLoading(true);
    setJobs([]);
    setJobResults({});
    try {
      const formData = new FormData();
      formData.append("file", file);
      const parseRes = await axios.post(`${API}/parse-resume`, formData);
      setResumeText(parseRes.data.resume_text);
      setResumeSkills(parseRes.data.resume_skills);

      const jobForm = new FormData();
      jobForm.append("job_role", jobRole);
      jobForm.append("location", location);
      jobForm.append("job_type", jobType);

      const jobRes = await axios.post(`${API}/fetch-jobs`, jobForm);
      setJobs(jobRes.data.jobs);
    } catch (e) {
      alert("Error: " + (e.response?.data?.detail || e.message));
    }
    setLoading(false);
  };

  const handleMatch = async (job, i) => {
    setAL(`match_${i}`, true);
    try {
      const form = new FormData();
      form.append("job_description", job.description);
      const skillRes = await axios.post(`${API}/job-skills`, form);
      const job_skills = skillRes.data.job_skills;

      const matchForm = new FormData();
      matchForm.append("resume_skills", JSON.stringify(resumeSkills));
      matchForm.append("job_skills", JSON.stringify(job_skills));
      const matchRes = await axios.post(`${API}/match`, matchForm);
      setJobResults(p => ({ ...p, [i]: { ...p[i], ...matchRes.data, job_skills } }));
    } catch (e) { alert("Match error: " + e.message); }
    setAL(`match_${i}`, false);
  };

  const handleOptimize = async (i) => {
    setAL(`opt_${i}`, true);
    try {
      const form = new FormData();
      form.append("resume_text", resumeText);
      form.append("missing_skills", JSON.stringify(jobResults[i]?.missing_skills || []));
      const res = await axios.post(`${API}/optimize-resume`, form);
      setJobResults(p => ({ ...p, [i]: { ...p[i], improved_resume: res.data.improved_resume } }));
    } catch (e) { alert("Optimize error: " + e.message); }
    setAL(`opt_${i}`, false);
  };

  const handleEmail = async (job, i) => {
    setAL(`email_${i}`, true);
    try {
      const form = new FormData();
      form.append("resume_text", resumeText);
      form.append("job_title", job.title);
      form.append("company", job.company);
      const res = await axios.post(`${API}/generate-email`, form);
      setJobResults(p => ({ ...p, [i]: { ...p[i], email: res.data.email } }));
    } catch (e) { alert("Email error: " + e.message); }
    setAL(`email_${i}`, false);
  };

  const handleRoadmap = async (i) => {
    setAL(`roadmap_${i}`, true);
    try {
      const form = new FormData();
      form.append("missing_skills", JSON.stringify(jobResults[i]?.missing_skills || []));
      const res = await axios.post(`${API}/skill-roadmap`, form);
      setJobResults(p => ({ ...p, [i]: { ...p[i], roadmap: res.data.roadmap } }));
    } catch (e) { alert("Roadmap error: " + e.message); }
    setAL(`roadmap_${i}`, false);
  };
  const handleATS = async (job, i) => {
    setAL(`ats_${i}`, true);
    try {
      const form = new FormData();
      form.append("resume_text", resumeText);
      form.append("job_description", job.description);
      const res = await axios.post(`${API}/ats-score`, form);
      setJobResults(p => ({ ...p, [i]: { ...p[i], ats: res.data } }));
    } catch (e) { alert("ATS error: " + e.message); }
    setAL(`ats_${i}`, false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* HEADER */}
        <div className="header">
          <div className="header-tag">AI-Powered · Live Jobs · LLaMA 3.3</div>
          <h1>Job Match &<br />Resume Optimizer</h1>
          <p>Upload your resume. Find your fit. Get hired.</p>
        </div>
        {/* INPUT */}
        <div className="input-section">
          <div className="input-grid">
            <div className="input-group">
              <label>Resume PDF</label>
              <div className="file-input-wrapper">
                <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
                <div className="file-icon">📄</div>
                <div className="file-text">{file ? "" : "Click to upload PDF"}</div>
                {file && <div className="file-name">✓ {file.name}</div>}
              </div>
            </div>
            <div className="input-group">
              <label>Job Role</label>
              <input
                className="text-input"
                type="text"
                placeholder="e.g. React Developer"
                value={jobRole}
                onChange={e => setJobRole(e.target.value)}
                style={{ minHeight: "unset", height: 46, marginBottom: 10 }}
              />
              <label style={{ marginTop: 8 }}>Location (optional)</label>
              <input
                className="text-input"
                type="text"
                placeholder="e.g. New York, Remote"
                value={location}
                onChange={e => setLocation(e.target.value)}
                style={{ minHeight: "unset", height: 46 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Job Type</label>
              <select
                value={jobType}
                onChange={e => setJobType(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px", background: "var(--surface2)",
                  border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)",
                  fontFamily: "var(--font-head)", fontSize: 14, outline: "none"
                }}
              >
                <option value="">Any Type</option>
                <option value="FULLTIME">Full Time</option>
                <option value="PARTTIME">Part Time</option>
                <option value="INTERN">Internship</option>
                <option value="CONTRACTOR">Contract</option>
              </select>
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Min Match Score: {minScore}%</label>
              <input
                type="range" min="0" max="80" step="5"
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                style={{ width: "100%", marginTop: 14, accentColor: "var(--accent)" }}
              />
            </div>
          </div>

          <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
            {loading ? "⏳ Analyzing..." : "🔍 Analyze Jobs"}
          </button>
          {loading && <div className="loading-bar"><div className="loading-bar-inner" /></div>}
        </div>

        {/* JOBS */}
        {jobs.length > 0 && (
          <>
            <div className="jobs-header">
              Found <span>{jobs.length}</span> jobs for "{jobRole}"
            </div>

            {jobs.filter((_, i) => {
              const score = jobResults[i]?.score;
              if (score === undefined) return true;
              return score >= minScore;
            }).map((job, i) => {
              const result = jobResults[i];
              const isOpen = expanded[i];
              const score = result?.score;

              return (
                <div className="job-card" key={i}>
                  <div className="job-header" onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}>
                    <div className="job-info">
                      <div className="job-title">{job.title}</div>
                      <div className="job-company">@ {job.company}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 4, display: "flex", gap: 12 }}>
                        {job.location && <span>📍 {job.location}</span>}
                        {job.job_type && <span>💼 {job.job_type}</span>}
                      </div>
                    </div>
                    <div className="job-score-badge">
                      {score !== undefined && (
                        <div className={`score-circle ${getScoreClass(score)}`}>{score}%</div>
                      )}
                      <span className={`chevron ${isOpen ? "open" : ""}`}>⌄</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="job-body">
                      <a className="apply-link" href={job.link} target="_blank" rel="noreferrer">
                        ↗ Apply Here
                      </a>

                      <div className="action-btns">
                        <button className={`action-btn ${actionLoading[`match_${i}`] ? "loading" : ""}`}
                          onClick={() => handleMatch(job, i)} disabled={actionLoading[`match_${i}`]}>
                          {actionLoading[`match_${i}`] ? "⏳" : "📊"} Match Score
                        </button>
                        <button className={`action-btn ${actionLoading[`opt_${i}`] ? "loading" : ""}`}
                          onClick={() => handleOptimize(i)} disabled={actionLoading[`opt_${i}`]}>
                          {actionLoading[`opt_${i}`] ? "⏳" : "✨"} Improve Resume
                        </button>
                        <button className={`action-btn ${actionLoading[`email_${i}`] ? "loading" : ""}`}
                          onClick={() => handleEmail(job, i)} disabled={actionLoading[`email_${i}`]}>
                          {actionLoading[`email_${i}`] ? "⏳" : "✉️"} Generate Email
                        </button>
                        <button className={`action-btn ${actionLoading[`ats_${i}`] ? "loading" : ""}`}
                          onClick={() => handleATS(job, i)} disabled={actionLoading[`ats_${i}`]}>
                          {actionLoading[`ats_${i}`] ? "⏳" : "🤖"} ATS Score
                        </button>
                        <button className={`action-btn ${actionLoading[`roadmap_${i}`] ? "loading" : ""}`}
                          onClick={() => handleRoadmap(i)} disabled={actionLoading[`roadmap_${i}`]}>
                          {actionLoading[`roadmap_${i}`] ? "⏳" : "🗺️"} Skill Roadmap
                        </button>
                      </div>

                      {/* MATCH RESULT */}
                      {result?.score !== undefined && (
                        <div className="result-box">
                          <div className="result-box-title">Skill Match Analysis</div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{
                              width: `${result.score}%`,
                              background: `linear-gradient(90deg, ${getScoreColor(result.score)}, ${getScoreColor(result.score)}88)`
                            }} />
                          </div>
                          {result.matched_skills?.length > 0 && (
                            <>
                              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>MATCHED</div>
                              <div className="skills-row">
                                {result.matched_skills.map(s => <span key={s} className="skill-tag matched">{s}</span>)}
                              </div>
                            </>
                          )}
                          {result.missing_skills?.length > 0 && (
                            <>
                              <div style={{ fontSize: 12, color: "var(--muted)", margin: "12px 0 6px", fontFamily: "var(--font-mono)" }}>MISSING</div>
                              <div className="skills-row">
                                {result.missing_skills.map(s => <span key={s} className="skill-tag missing">{s}</span>)}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* ATS RESULT */}
                      {result?.ats && (
                        <div className="result-box">
                          <div className="result-box-title">ATS Analysis</div>
                          <div className="ats-grid">
                            {[
                              { label: "ATS Score", val: result.ats.ats_score },
                              { label: "Keyword Match", val: result.ats.keyword_match },
                              { label: "Format Score", val: result.ats.format_score },
                              { label: "Experience Match", val: result.ats.experience_match },
                            ].map(m => (
                              <div className="ats-metric" key={m.label}>
                                <div className="ats-metric-label">{m.label}</div>
                                <div className="ats-metric-value" style={{ color: getScoreColor(m.val) }}>{m.val}%</div>
                              </div>
                            ))}
                          </div>
                          {result.ats.strengths?.length > 0 && (
                            <>
                              <div style={{ fontSize: 11, color: "var(--green)", fontFamily: "var(--font-mono)", letterSpacing: 2, marginBottom: 8 }}>STRENGTHS</div>
                              <ul className="strength-list">
                                {result.ats.strengths.map(s => <li key={s}><span className="dot" style={{ color: "var(--green)" }}>▸</span>{s}</li>)}
                              </ul>
                            </>
                          )}
                          {result.ats.improvements?.length > 0 && (
                            <>
                              <div style={{ fontSize: 11, color: "var(--yellow)", fontFamily: "var(--font-mono)", letterSpacing: 2, margin: "12px 0 8px" }}>IMPROVEMENTS</div>
                              <ul className="strength-list">
                                {result.ats.improvements.map(s => <li key={s}><span className="dot" style={{ color: "var(--yellow)" }}>▸</span>{s}</li>)}
                              </ul>
                            </>
                          )}
                        </div>
                      )}

                      {/* IMPROVED RESUME */}
                      {result?.improved_resume && (
                        <div className="result-box">
                          <div className="result-box-title">Optimized Resume</div>
                          <textarea className="text-output" value={result.improved_resume} readOnly rows={10} />
                        </div>
                      )}

                      {/* ROADMAP */}
                      {result?.roadmap && result.roadmap.length > 0 && (
                        <div className="result-box">
                          <div className="result-box-title">Skill Gap Roadmap</div>
                          {result.roadmap.map((item, ri) => (
                            <div key={ri} style={{
                              background: "var(--surface)", border: "1px solid var(--border)",
                              borderRadius: 10, padding: 16, marginBottom: 12
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontWeight: 700, fontSize: 15 }}>{item.skill}</span>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <span style={{
                                    fontFamily: "var(--font-mono)", fontSize: 11, padding: "3px 8px",
                                    borderRadius: 4, border: "1px solid var(--accent)", color: "var(--accent)"
                                  }}>{item.level}</span>
                                  <span style={{
                                    fontFamily: "var(--font-mono)", fontSize: 11, padding: "3px 8px",
                                    borderRadius: 4, border: "1px solid var(--muted)", color: "var(--muted)"
                                  }}>⏱ {item.time}</span>
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {item.resources?.map((r, rj) => (
                                  <a key={rj} href={r.url} target="_blank" rel="noreferrer" style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "8px 12px", background: "var(--surface2)",
                                    borderRadius: 8, textDecoration: "none", border: "1px solid var(--border)",
                                    transition: "border-color 0.2s"
                                  }}>
                                    <span style={{ color: "var(--text)", fontSize: 13 }}>{r.name}</span>
                                    <span style={{
                                      fontFamily: "var(--font-mono)", fontSize: 11,
                                      color: r.type === "Free" ? "var(--green)" : "var(--yellow)"
                                    }}>{r.type}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* EMAIL */}
                      {result?.email && (
                        <div className="result-box">
                          <div className="result-box-title">Application Email</div>
                          <textarea className="text-output" value={result.email} readOnly rows={10} />
                        </div>
                      )}
                    </div>
                  )
                  }
                </div>
              );
            })}
          </>
        )}
      </div >
    </>
  );
}