// // import { useState } from "react";
// // import axios from "axios";

// // const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// // export default function App() {
// //   const [file, setFile] = useState(null);
// //   const [jobRole, setJobRole] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [resumeText, setResumeText] = useState("");
// //   const [resumeSkills, setResumeSkills] = useState([]);
// //   const [jobs, setJobs] = useState([]);
// //   const [jobResults, setJobResults] = useState({});

// //   const handleAnalyze = async () => {
// //     if (!file || !jobRole) return alert("Upload resume and enter job role");
// //     setLoading(true);

// //     const formData = new FormData();
// //     formData.append("file", file);
// //     const parseRes = await axios.post(`${API}/parse-resume`, formData);
// //     const { resume_text, resume_skills } = parseRes.data;
// //     setResumeText(resume_text);
// //     setResumeSkills(resume_skills);

// //     const jobForm = new FormData();
// //     jobForm.append("job_role", jobRole);
// //     const jobRes = await axios.post(`${API}/fetch-jobs`, jobForm);
// //     setJobs(jobRes.data.jobs);
// //     setLoading(false);
// //   };

// //   const handleMatch = async (job, index) => {
// //     const form = new FormData();
// //     form.append("job_description", job.description);
// //     const skillRes = await axios.post(`${API}/job-skills`, form);
// //     const job_skills = skillRes.data.job_skills;

// //     const matchForm = new FormData();
// //     matchForm.append("resume_skills", JSON.stringify(resumeSkills));
// //     matchForm.append("job_skills", JSON.stringify(job_skills));
// //     const matchRes = await axios.post(`${API}/match`, matchForm);

// //     setJobResults(prev => ({ ...prev, [index]: { ...matchRes.data, job_skills } }));
// //   };

// //   const handleOptimize = async (index, result) => {
// //     const form = new FormData();
// //     form.append("resume_text", resumeText);
// //     form.append("missing_skills", JSON.stringify(result.missing_skills));
// //     const res = await axios.post(`${API}/optimize-resume`, form);
// //     setJobResults(prev => ({ ...prev, [index]: { ...prev[index], improved_resume: res.data.improved_resume } }));
// //   };

// //   const handleEmail = async (job, index) => {
// //     const form = new FormData();
// //     form.append("resume_text", resumeText);
// //     form.append("job_title", job.title);
// //     form.append("company", job.company);
// //     const res = await axios.post(`${API}/generate-email`, form);
// //     setJobResults(prev => ({ ...prev, [index]: { ...prev[index], email: res.data.email } }));
// //   };

// //   const handleATS = async (job, index) => {
// //     const form = new FormData();
// //     form.append("resume_text", resumeText);
// //     form.append("job_description", job.description);
// //     const res = await axios.post(`${API}/ats-score`, form);
// //     setJobResults(prev => ({ ...prev, [index]: { ...prev[index], ats: res.data } }));
// //   };

// //   return (
// //     <div style={{ fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto", padding: 24 }}>
// //       <h1>🎯 AI Job Match & Resume Optimizer</h1>

// //       <div style={{ marginBottom: 16 }}>
// //         <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
// //       </div>

// //       <div style={{ marginBottom: 16 }}>
// //         <input
// //           type="text"
// //           placeholder="Job Role (e.g. Python Developer)"
// //           value={jobRole}
// //           onChange={e => setJobRole(e.target.value)}
// //           style={{ padding: 8, width: 300, marginRight: 8 }}
// //         />
// //         <button onClick={handleAnalyze} disabled={loading} style={{ padding: "8px 16px" }}>
// //           {loading ? "Analyzing..." : "Analyze Jobs"}
// //         </button>
// //       </div>

// //       {jobs.map((job, i) => (
// //         <div key={i} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
// //           <h3>{job.title} @ {job.company}</h3>
// //           <a href={job.link} target="_blank" rel="noreferrer">Apply Here</a>

// //           <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
// //             <button onClick={() => handleMatch(job, i)}>Match Score</button>
// //             <button onClick={() => handleOptimize(i, jobResults[i] || {missing_skills: []})}>Improve Resume</button>
// //             <button onClick={() => handleEmail(job, i)}>Generate Email</button>
// //             <button onClick={() => handleATS(job, i)}>ATS Score</button>
// //           </div>

// //           {jobResults[i] && (
// //             <div style={{ marginTop: 12 }}>
// //               {jobResults[i].score !== undefined && (
// //                 <p>✅ Match Score: <strong>{jobResults[i].score}%</strong> | Missing: {jobResults[i].missing_skills?.join(", ")}</p>
// //               )}
// //               {jobResults[i].ats && (
// //                 <div>
// //                   <p>🤖 ATS Score: {jobResults[i].ats.ats_score}% | Keywords: {jobResults[i].ats.keyword_match}%</p>
// //                   <p>💪 {jobResults[i].ats.strengths?.join(" | ")}</p>
// //                   <p>⚠️ {jobResults[i].ats.improvements?.join(" | ")}</p>
// //                 </div>
// //               )}
// //               {jobResults[i].improved_resume && (
// //                 <textarea value={jobResults[i].improved_resume} readOnly rows={8} style={{ width: "100%", marginTop: 8 }} />
// //               )}
// //               {jobResults[i].email && (
// //                 <textarea value={jobResults[i].email} readOnly rows={8} style={{ width: "100%", marginTop: 8 }} />
// //               )}
// //             </div>
// //           )}
// //         </div>
// //       ))}
// //     </div>
// //   );
// // }


// import { useState } from "react";
// import axios from "axios";

// const API = "https://ai-job-matcher-backend-0oc7.onrender.com";

// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//   :root {
//     --bg: #080b10;
//     --surface: #0e1420;
//     --surface2: #141c2e;
//     --border: #1e2d4a;
//     --accent: #00e5ff;
//     --accent2: #7c3aed;
//     --green: #00ff88;
//     --red: #ff4466;
//     --yellow: #ffd600;
//     --text: #e8f0fe;
//     --muted: #6b7fa3;
//     --font-head: 'Syne', sans-serif;
//     --font-mono: 'Space Mono', monospace;
//   }

//   body {
//     background: var(--bg);
//     color: var(--text);
//     font-family: var(--font-head);
//     min-height: 100vh;
//     background-image: 
//       radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,229,255,0.07) 0%, transparent 60%),
//       radial-gradient(ellipse 40% 40% at 80% 80%, rgba(124,58,237,0.05) 0%, transparent 60%);
//   }

//   .app {
//     max-width: 900px;
//     margin: 0 auto;
//     padding: 48px 24px;
//   }

//   /* HEADER */
//   .header {
//     text-align: center;
//     margin-bottom: 56px;
//     position: relative;
//   }
//   .header-tag {
//     display: inline-block;
//     font-family: var(--font-mono);
//     font-size: 11px;
//     letter-spacing: 3px;
//     color: var(--accent);
//     border: 1px solid rgba(0,229,255,0.3);
//     padding: 4px 12px;
//     border-radius: 2px;
//     margin-bottom: 20px;
//     text-transform: uppercase;
//   }
//   .header h1 {
//     font-size: clamp(2rem, 5vw, 3.2rem);
//     font-weight: 800;
//     line-height: 1.1;
//     letter-spacing: -1px;
//     background: linear-gradient(135deg, #fff 0%, var(--accent) 60%, var(--accent2) 100%);
//     -webkit-background-clip: text;
//     -webkit-text-fill-color: transparent;
//     background-clip: text;
//     margin-bottom: 12px;
//   }
//   .header p {
//     color: var(--muted);
//     font-size: 15px;
//     font-family: var(--font-mono);
//   }

//   /* INPUT SECTION */
//   .input-section {
//     background: var(--surface);
//     border: 1px solid var(--border);
//     border-radius: 16px;
//     padding: 32px;
//     margin-bottom: 32px;
//     position: relative;
//     overflow: hidden;
//   }
//   .input-section::before {
//     content: '';
//     position: absolute;
//     top: 0; left: 0; right: 0;
//     height: 1px;
//     background: linear-gradient(90deg, transparent, var(--accent), transparent);
//     opacity: 0.5;
//   }
//   .input-grid {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 20px;
//     margin-bottom: 20px;
//   }
//   @media (max-width: 600px) { .input-grid { grid-template-columns: 1fr; } }

//   .input-group label {
//     display: block;
//     font-family: var(--font-mono);
//     font-size: 11px;
//     letter-spacing: 2px;
//     color: var(--muted);
//     text-transform: uppercase;
//     margin-bottom: 10px;
//   }
//   .file-input-wrapper {
//     position: relative;
//     border: 1px dashed var(--border);
//     border-radius: 10px;
//     padding: 20px;
//     text-align: center;
//     cursor: pointer;
//     transition: border-color 0.2s, background 0.2s;
//     background: var(--surface2);
//   }
//   .file-input-wrapper:hover { border-color: var(--accent); background: rgba(0,229,255,0.03); }
//   .file-input-wrapper input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
//   .file-icon { font-size: 24px; margin-bottom: 6px; }
//   .file-text { font-family: var(--font-mono); font-size: 12px; color: var(--muted); }
//   .file-name { color: var(--accent); font-size: 12px; margin-top: 4px; font-family: var(--font-mono); }

//   .text-input {
//     width: 100%;
//     background: var(--surface2);
//     border: 1px solid var(--border);
//     border-radius: 10px;
//     padding: 14px 16px;
//     color: var(--text);
//     font-family: var(--font-head);
//     font-size: 15px;
//     outline: none;
//     transition: border-color 0.2s;
//     height: 100%;
//     min-height: 80px;
//   }
//   .text-input:focus { border-color: var(--accent); }
//   .text-input::placeholder { color: var(--muted); }

//   .analyze-btn {
//     width: 100%;
//     padding: 16px;
//     background: linear-gradient(135deg, var(--accent), var(--accent2));
//     border: none;
//     border-radius: 10px;
//     color: #000;
//     font-family: var(--font-head);
//     font-weight: 700;
//     font-size: 15px;
//     letter-spacing: 0.5px;
//     cursor: pointer;
//     transition: opacity 0.2s, transform 0.1s;
//     position: relative;
//     overflow: hidden;
//   }
//   .analyze-btn:hover { opacity: 0.9; transform: translateY(-1px); }
//   .analyze-btn:active { transform: translateY(0); }
//   .analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

//   /* LOADING */
//   .loading-bar {
//     width: 100%;
//     height: 2px;
//     background: var(--border);
//     border-radius: 2px;
//     overflow: hidden;
//     margin-top: 16px;
//   }
//   .loading-bar-inner {
//     height: 100%;
//     background: linear-gradient(90deg, var(--accent), var(--accent2));
//     animation: loading 1.5s ease-in-out infinite;
//     width: 40%;
//   }
//   @keyframes loading {
//     0% { transform: translateX(-100%); }
//     100% { transform: translateX(350%); }
//   }

//   /* JOB CARDS */
//   .jobs-header {
//     font-family: var(--font-mono);
//     font-size: 11px;
//     letter-spacing: 3px;
//     color: var(--muted);
//     text-transform: uppercase;
//     margin-bottom: 16px;
//   }
//   .jobs-header span { color: var(--accent); }

//   .job-card {
//     background: var(--surface);
//     border: 1px solid var(--border);
//     border-radius: 16px;
//     margin-bottom: 16px;
//     overflow: hidden;
//     transition: border-color 0.2s;
//   }
//   .job-card:hover { border-color: rgba(0,229,255,0.3); }

//   .job-header {
//     padding: 24px;
//     cursor: pointer;
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     gap: 16px;
//   }
//   .job-info { flex: 1; }
//   .job-title {
//     font-size: 16px;
//     font-weight: 700;
//     margin-bottom: 4px;
//     color: var(--text);
//   }
//   .job-company {
//     font-family: var(--font-mono);
//     font-size: 12px;
//     color: var(--muted);
//   }
//   .job-score-badge {
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     flex-shrink: 0;
//   }
//   .score-circle {
//     width: 52px;
//     height: 52px;
//     border-radius: 50%;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     font-family: var(--font-mono);
//     font-size: 13px;
//     font-weight: 700;
//     border: 2px solid;
//     flex-shrink: 0;
//   }
//   .score-high { border-color: var(--green); color: var(--green); background: rgba(0,255,136,0.05); }
//   .score-mid { border-color: var(--yellow); color: var(--yellow); background: rgba(255,214,0,0.05); }
//   .score-low { border-color: var(--red); color: var(--red); background: rgba(255,68,102,0.05); }

//   .chevron { color: var(--muted); font-size: 18px; transition: transform 0.2s; }
//   .chevron.open { transform: rotate(180deg); }

//   .job-body {
//     border-top: 1px solid var(--border);
//     padding: 24px;
//   }

//   .apply-link {
//     display: inline-flex;
//     align-items: center;
//     gap: 6px;
//     font-family: var(--font-mono);
//     font-size: 12px;
//     color: var(--accent);
//     text-decoration: none;
//     margin-bottom: 20px;
//     opacity: 0.8;
//     transition: opacity 0.2s;
//   }
//   .apply-link:hover { opacity: 1; }

//   /* ACTION BUTTONS */
//   .action-btns {
//     display: flex;
//     flex-wrap: wrap;
//     gap: 10px;
//     margin-bottom: 20px;
//   }
//   .action-btn {
//     padding: 8px 16px;
//     border-radius: 8px;
//     border: 1px solid var(--border);
//     background: var(--surface2);
//     color: var(--text);
//     font-family: var(--font-head);
//     font-size: 13px;
//     font-weight: 600;
//     cursor: pointer;
//     transition: all 0.2s;
//     display: flex;
//     align-items: center;
//     gap: 6px;
//   }
//   .action-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,229,255,0.05); }
//   .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
//   .action-btn.loading { opacity: 0.6; }

//   /* RESULTS */
//   .result-box {
//     background: var(--surface2);
//     border: 1px solid var(--border);
//     border-radius: 12px;
//     padding: 20px;
//     margin-top: 16px;
//   }
//   .result-box-title {
//     font-family: var(--font-mono);
//     font-size: 11px;
//     letter-spacing: 2px;
//     color: var(--muted);
//     text-transform: uppercase;
//     margin-bottom: 16px;
//   }

//   .skills-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
//   .skill-tag {
//     font-family: var(--font-mono);
//     font-size: 11px;
//     padding: 4px 10px;
//     border-radius: 4px;
//     border: 1px solid;
//   }
//   .skill-tag.matched { border-color: rgba(0,255,136,0.4); color: var(--green); background: rgba(0,255,136,0.05); }
//   .skill-tag.missing { border-color: rgba(255,68,102,0.4); color: var(--red); background: rgba(255,68,102,0.05); }

//   .progress-bar {
//     height: 6px;
//     background: var(--border);
//     border-radius: 3px;
//     overflow: hidden;
//     margin: 8px 0 16px;
//   }
//   .progress-fill {
//     height: 100%;
//     border-radius: 3px;
//     transition: width 0.8s ease;
//   }

//   .ats-grid {
//     display: grid;
//     grid-template-columns: repeat(2, 1fr);
//     gap: 12px;
//     margin-bottom: 16px;
//   }
//   @media (max-width: 500px) { .ats-grid { grid-template-columns: 1fr; } }

//   .ats-metric {
//     background: var(--surface);
//     border: 1px solid var(--border);
//     border-radius: 10px;
//     padding: 14px;
//   }
//   .ats-metric-label {
//     font-family: var(--font-mono);
//     font-size: 10px;
//     letter-spacing: 1px;
//     color: var(--muted);
//     text-transform: uppercase;
//     margin-bottom: 6px;
//   }
//   .ats-metric-value {
//     font-size: 24px;
//     font-weight: 800;
//     font-family: var(--font-mono);
//   }

//   .text-output {
//     width: 100%;
//     background: var(--bg);
//     border: 1px solid var(--border);
//     border-radius: 8px;
//     padding: 16px;
//     color: var(--text);
//     font-family: var(--font-mono);
//     font-size: 12px;
//     line-height: 1.7;
//     resize: vertical;
//     outline: none;
//     min-height: 180px;
//   }

//   .strength-list { list-style: none; }
//   .strength-list li {
//     font-family: var(--font-mono);
//     font-size: 12px;
//     padding: 6px 0;
//     border-bottom: 1px solid var(--border);
//     display: flex;
//     align-items: flex-start;
//     gap: 8px;
//     color: var(--muted);
//   }
//   .strength-list li:last-child { border-bottom: none; }
//   .strength-list li .dot { flex-shrink: 0; margin-top: 2px; }
// `;

// function getScoreClass(score) {
//   if (score >= 60) return "score-high";
//   if (score >= 30) return "score-mid";
//   return "score-low";
// }

// function getScoreColor(score) {
//   if (score >= 60) return "#00ff88";
//   if (score >= 30) return "#ffd600";
//   return "#ff4466";
// }

// export default function App() {
//   const [file, setFile] = useState(null);
//   const [jobRole, setJobRole] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [resumeText, setResumeText] = useState("");
//   const [resumeSkills, setResumeSkills] = useState([]);
//   const [jobs, setJobs] = useState([]);
//   const [jobResults, setJobResults] = useState({});
//   const [expanded, setExpanded] = useState({});
//   const [actionLoading, setActionLoading] = useState({});
//   const [location, setLocation] = useState("");
//   const [jobType, setJobType] = useState("");
//   const [minScore, setMinScore] = useState(0);

//   const setAL = (key, val) => setActionLoading(p => ({ ...p, [key]: val }));

//   const downloadAsTxt = (text, filename) => {
//     const blob = new Blob([text], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const downloadAsDoc = (text, filename) => {
//     const html = `
//     <html><head><meta charset="utf-8">
//     <style>body{font-family:Arial,sans-serif;padding:40px;line-height:1.6;}</style>
//     </head><body><pre style="white-space:pre-wrap;">${text}</pre></body></html>
//   `;
//     const blob = new Blob([html], { type: "application/msword" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleAnalyze = async () => {
//     if (!file || !jobRole) return alert("Upload a resume and enter a job role");
//     setLoading(true);
//     setJobs([]);
//     setJobResults({});
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       const parseRes = await axios.post(`${API}/parse-resume`, formData);
//       setResumeText(parseRes.data.resume_text);
//       setResumeSkills(parseRes.data.resume_skills);

//       const jobForm = new FormData();
//       jobForm.append("job_role", jobRole);
//       jobForm.append("location", location);
//       jobForm.append("job_type", jobType);

//       const jobRes = await axios.post(`${API}/fetch-jobs`, jobForm);
//       setJobs(jobRes.data.jobs);
//     } catch (e) {
//       alert("Error: " + (e.response?.data?.detail || e.message));
//     }
//     setLoading(false);
//   };

//   const handleMatch = async (job, i) => {
//     setAL(`match_${i}`, true);
//     try {
//       const form = new FormData();
//       form.append("job_description", job.description);
//       const skillRes = await axios.post(`${API}/job-skills`, form);
//       const job_skills = skillRes.data.job_skills;

//       const matchForm = new FormData();
//       matchForm.append("resume_skills", JSON.stringify(resumeSkills));
//       matchForm.append("job_skills", JSON.stringify(job_skills));
//       const matchRes = await axios.post(`${API}/match`, matchForm);
//       setJobResults(p => ({ ...p, [i]: { ...p[i], ...matchRes.data, job_skills } }));
//     } catch (e) { alert("Match error: " + e.message); }
//     setAL(`match_${i}`, false);
//   };

//   const handleOptimize = async (i) => {
//     setAL(`opt_${i}`, true);
//     try {
//       const form = new FormData();
//       form.append("resume_text", resumeText);
//       form.append("missing_skills", JSON.stringify(jobResults[i]?.missing_skills || []));
//       const res = await axios.post(`${API}/optimize-resume`, form);
//       setJobResults(p => ({ ...p, [i]: { ...p[i], improved_resume: res.data.improved_resume } }));
//     } catch (e) { alert("Optimize error: " + e.message); }
//     setAL(`opt_${i}`, false);
//   };

//   const handleEmail = async (job, i) => {
//     setAL(`email_${i}`, true);
//     try {
//       const form = new FormData();
//       form.append("resume_text", resumeText);
//       form.append("job_title", job.title);
//       form.append("company", job.company);
//       const res = await axios.post(`${API}/generate-email`, form);
//       setJobResults(p => ({ ...p, [i]: { ...p[i], email: res.data.email } }));
//     } catch (e) { alert("Email error: " + e.message); }
//     setAL(`email_${i}`, false);
//   };

//   const handleRoadmap = async (i) => {
//     setAL(`roadmap_${i}`, true);
//     try {
//       const form = new FormData();
//       form.append("missing_skills", JSON.stringify(jobResults[i]?.missing_skills || []));
//       const res = await axios.post(`${API}/skill-roadmap`, form);
//       setJobResults(p => ({ ...p, [i]: { ...p[i], roadmap: res.data.roadmap } }));
//     } catch (e) { alert("Roadmap error: " + e.message); }
//     setAL(`roadmap_${i}`, false);
//   };
//   const handleATS = async (job, i) => {
//     setAL(`ats_${i}`, true);
//     try {
//       const form = new FormData();
//       form.append("resume_text", resumeText);
//       form.append("job_description", job.description);
//       const res = await axios.post(`${API}/ats-score`, form);
//       setJobResults(p => ({ ...p, [i]: { ...p[i], ats: res.data } }));
//     } catch (e) { alert("ATS error: " + e.message); }
//     setAL(`ats_${i}`, false);
//   };

//   return (
//     <>
//       <style>{styles}</style>
//       <div className="app">
//         {/* HEADER */}
//         <div className="header">
//           <div className="header-tag">AI-Powered · Live Jobs · LLaMA 3.3</div>
//           <h1>Job Match &<br />Resume Optimizer</h1>
//           <p>Upload your resume. Find your fit. Get hired.</p>
//         </div>
//         {/* INPUT */}
//         <div className="input-section">
//           <div className="input-grid">
//             <div className="input-group">
//               <label>Resume PDF</label>
//               <div className="file-input-wrapper">
//                 <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
//                 <div className="file-icon">📄</div>
//                 <div className="file-text">{file ? "" : "Click to upload PDF"}</div>
//                 {file && <div className="file-name">✓ {file.name}</div>}
//               </div>
//             </div>
//             <div className="input-group">
//               <label>Job Role</label>
//               <input
//                 className="text-input"
//                 type="text"
//                 placeholder="e.g. React Developer"
//                 value={jobRole}
//                 onChange={e => setJobRole(e.target.value)}
//                 style={{ minHeight: "unset", height: 46, marginBottom: 10 }}
//               />
//               <label style={{ marginTop: 8 }}>Location (optional)</label>
//               <input
//                 className="text-input"
//                 type="text"
//                 placeholder="e.g. New York, Remote"
//                 value={location}
//                 onChange={e => setLocation(e.target.value)}
//                 style={{ minHeight: "unset", height: 46 }}
//               />
//             </div>
//           </div>

//           <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
//             <div className="input-group" style={{ flex: 1 }}>
//               <label>Job Type</label>
//               <select
//                 value={jobType}
//                 onChange={e => setJobType(e.target.value)}
//                 style={{
//                   width: "100%", padding: "12px 16px", background: "var(--surface2)",
//                   border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)",
//                   fontFamily: "var(--font-head)", fontSize: 14, outline: "none"
//                 }}
//               >
//                 <option value="">Any Type</option>
//                 <option value="FULLTIME">Full Time</option>
//                 <option value="PARTTIME">Part Time</option>
//                 <option value="INTERN">Internship</option>
//                 <option value="CONTRACTOR">Contract</option>
//               </select>
//             </div>
//             <div className="input-group" style={{ flex: 1 }}>
//               <label>Min Match Score: {minScore}%</label>
//               <input
//                 type="range" min="0" max="80" step="5"
//                 value={minScore}
//                 onChange={e => setMinScore(Number(e.target.value))}
//                 style={{ width: "100%", marginTop: 14, accentColor: "var(--accent)" }}
//               />
//             </div>
//           </div>

//           <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
//             {loading ? "⏳ Analyzing..." : "🔍 Analyze Jobs"}
//           </button>
//           {loading && <div className="loading-bar"><div className="loading-bar-inner" /></div>}
//         </div>

//         {/* JOBS */}
//         {jobs.length > 0 && (
//           <>
//             <div className="jobs-header">
//               Found <span>{jobs.length}</span> jobs for "{jobRole}"
//             </div>

//             {jobs.filter((_, i) => {
//               const score = jobResults[i]?.score;
//               if (score === undefined) return true;
//               return score >= minScore;
//             }).map((job, i) => {
//               const result = jobResults[i];
//               const isOpen = expanded[i];
//               const score = result?.score;

//               return (
//                 <div className="job-card" key={i}>
//                   <div className="job-header" onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}>
//                     <div className="job-info">
//                       <div className="job-title">{job.title}</div>
//                       <div className="job-company">@ {job.company}</div>
//                       <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 4, display: "flex", gap: 12 }}>
//                         {job.location && <span>📍 {job.location}</span>}
//                         {job.job_type && <span>💼 {job.job_type}</span>}
//                       </div>
//                     </div>
//                     <div className="job-score-badge">
//                       {score !== undefined && (
//                         <div className={`score-circle ${getScoreClass(score)}`}>{score}%</div>
//                       )}
//                       <span className={`chevron ${isOpen ? "open" : ""}`}>⌄</span>
//                     </div>
//                   </div>

//                   {isOpen && (
//                     <div className="job-body">
//                       <a className="apply-link" href={job.link} target="_blank" rel="noreferrer">
//                         ↗ Apply Here
//                       </a>

//                       <div className="action-btns">
//                         <button className={`action-btn ${actionLoading[`match_${i}`] ? "loading" : ""}`}
//                           onClick={() => handleMatch(job, i)} disabled={actionLoading[`match_${i}`]}>
//                           {actionLoading[`match_${i}`] ? "⏳" : "📊"} Match Score
//                         </button>
//                         <button className={`action-btn ${actionLoading[`opt_${i}`] ? "loading" : ""}`}
//                           onClick={() => handleOptimize(i)} disabled={actionLoading[`opt_${i}`]}>
//                           {actionLoading[`opt_${i}`] ? "⏳" : "✨"} Improve Resume
//                         </button>
//                         <button className={`action-btn ${actionLoading[`email_${i}`] ? "loading" : ""}`}
//                           onClick={() => handleEmail(job, i)} disabled={actionLoading[`email_${i}`]}>
//                           {actionLoading[`email_${i}`] ? "⏳" : "✉️"} Generate Email
//                         </button>
//                         <button className={`action-btn ${actionLoading[`ats_${i}`] ? "loading" : ""}`}
//                           onClick={() => handleATS(job, i)} disabled={actionLoading[`ats_${i}`]}>
//                           {actionLoading[`ats_${i}`] ? "⏳" : "🤖"} ATS Score
//                         </button>
//                         <button className={`action-btn ${actionLoading[`roadmap_${i}`] ? "loading" : ""}`}
//                           onClick={() => handleRoadmap(i)} disabled={actionLoading[`roadmap_${i}`]}>
//                           {actionLoading[`roadmap_${i}`] ? "⏳" : "🗺️"} Skill Roadmap
//                         </button>
//                       </div>

//                       {/* MATCH RESULT */}
//                       {result?.score !== undefined && (
//                         <div className="result-box">
//                           <div className="result-box-title">Skill Match Analysis</div>
//                           <div className="progress-bar">
//                             <div className="progress-fill" style={{
//                               width: `${result.score}%`,
//                               background: `linear-gradient(90deg, ${getScoreColor(result.score)}, ${getScoreColor(result.score)}88)`
//                             }} />
//                           </div>
//                           {result.matched_skills?.length > 0 && (
//                             <>
//                               <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>MATCHED</div>
//                               <div className="skills-row">
//                                 {result.matched_skills.map(s => <span key={s} className="skill-tag matched">{s}</span>)}
//                               </div>
//                             </>
//                           )}
//                           {result.missing_skills?.length > 0 && (
//                             <>
//                               <div style={{ fontSize: 12, color: "var(--muted)", margin: "12px 0 6px", fontFamily: "var(--font-mono)" }}>MISSING</div>
//                               <div className="skills-row">
//                                 {result.missing_skills.map(s => <span key={s} className="skill-tag missing">{s}</span>)}
//                               </div>
//                             </>
//                           )}
//                         </div>
//                       )}

//                       {/* ATS RESULT */}
//                       {result?.ats && (
//                         <div className="result-box">
//                           <div className="result-box-title">ATS Analysis</div>
//                           <div className="ats-grid">
//                             {[
//                               { label: "ATS Score", val: result.ats.ats_score },
//                               { label: "Keyword Match", val: result.ats.keyword_match },
//                               { label: "Format Score", val: result.ats.format_score },
//                               { label: "Experience Match", val: result.ats.experience_match },
//                             ].map(m => (
//                               <div className="ats-metric" key={m.label}>
//                                 <div className="ats-metric-label">{m.label}</div>
//                                 <div className="ats-metric-value" style={{ color: getScoreColor(m.val) }}>{m.val}%</div>
//                               </div>
//                             ))}
//                           </div>
//                           {result.ats.strengths?.length > 0 && (
//                             <>
//                               <div style={{ fontSize: 11, color: "var(--green)", fontFamily: "var(--font-mono)", letterSpacing: 2, marginBottom: 8 }}>STRENGTHS</div>
//                               <ul className="strength-list">
//                                 {result.ats.strengths.map(s => <li key={s}><span className="dot" style={{ color: "var(--green)" }}>▸</span>{s}</li>)}
//                               </ul>
//                             </>
//                           )}
//                           {result.ats.improvements?.length > 0 && (
//                             <>
//                               <div style={{ fontSize: 11, color: "var(--yellow)", fontFamily: "var(--font-mono)", letterSpacing: 2, margin: "12px 0 8px" }}>IMPROVEMENTS</div>
//                               <ul className="strength-list">
//                                 {result.ats.improvements.map(s => <li key={s}><span className="dot" style={{ color: "var(--yellow)" }}>▸</span>{s}</li>)}
//                               </ul>
//                             </>
//                           )}
//                         </div>
//                       )}

//                       {/* IMPROVED RESUME */}
//                       {/* IMPROVED RESUME */}
//                       {result?.improved_resume && (
//                         <div className="result-box">
//                           <div className="result-box-title">Optimized Resume</div>
//                           <textarea className="text-output" value={result.improved_resume} readOnly rows={10} />
//                           <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
//                             <button
//                               className="action-btn"
//                               onClick={() => downloadAsTxt(result.improved_resume, "optimized_resume.txt")}
//                               style={{ flex: 1 }}
//                             >
//                               ⬇️ Download TXT
//                             </button>
//                             <button
//                               className="action-btn"
//                               onClick={() => downloadAsDoc(result.improved_resume, "optimized_resume.doc")}
//                               style={{ flex: 1 }}
//                             >
//                               📝 Download Word
//                             </button>
//                           </div>
//                         </div>
//                       )}

//                       {/* ROADMAP */}
//                       {result?.roadmap && result.roadmap.length > 0 && (
//                         <div className="result-box">
//                           <div className="result-box-title">Skill Gap Roadmap</div>
//                           {result.roadmap.map((item, ri) => (
//                             <div key={ri} style={{
//                               background: "var(--surface)", border: "1px solid var(--border)",
//                               borderRadius: 10, padding: 16, marginBottom: 12
//                             }}>
//                               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
//                                 <span style={{ fontWeight: 700, fontSize: 15 }}>{item.skill}</span>
//                                 <div style={{ display: "flex", gap: 8 }}>
//                                   <span style={{
//                                     fontFamily: "var(--font-mono)", fontSize: 11, padding: "3px 8px",
//                                     borderRadius: 4, border: "1px solid var(--accent)", color: "var(--accent)"
//                                   }}>{item.level}</span>
//                                   <span style={{
//                                     fontFamily: "var(--font-mono)", fontSize: 11, padding: "3px 8px",
//                                     borderRadius: 4, border: "1px solid var(--muted)", color: "var(--muted)"
//                                   }}>⏱ {item.time}</span>
//                                 </div>
//                               </div>
//                               <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
//                                 {item.resources?.map((r, rj) => (
//                                   <a key={rj} href={r.url} target="_blank" rel="noreferrer" style={{
//                                     display: "flex", justifyContent: "space-between", alignItems: "center",
//                                     padding: "8px 12px", background: "var(--surface2)",
//                                     borderRadius: 8, textDecoration: "none", border: "1px solid var(--border)",
//                                     transition: "border-color 0.2s"
//                                   }}>
//                                     <span style={{ color: "var(--text)", fontSize: 13 }}>{r.name}</span>
//                                     <span style={{
//                                       fontFamily: "var(--font-mono)", fontSize: 11,
//                                       color: r.type === "Free" ? "var(--green)" : "var(--yellow)"
//                                     }}>{r.type}</span>
//                                   </a>
//                                 ))}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}

//                       {/* EMAIL */}
//                       {result?.email && (
//                         <div className="result-box">
//                           <div className="result-box-title">Application Email</div>
//                           <textarea className="text-output" value={result.email} readOnly rows={10} />
//                         </div>
//                       )}
//                     </div>
//                   )
//                   }
//                 </div>
//               );
//             })}
//           </>
//         )}
//       </div >
//     </>
//   );
// }






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