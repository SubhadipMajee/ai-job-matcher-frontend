import { useState } from "react";

export default function ApplyPackModal({ pack, onClose }) {
  const [copiedSection, setCopiedSection] = useState(null);

  if (!pack) return null;

  const handleCopy = (text, sectionName) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "28px 24px",
        width: "100%",
        maxWidth: 720,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            fontSize: 22,
            cursor: "pointer",
            lineHeight: 1
          }}
        >
          ×
        </button>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--gold)", letterSpacing: 1.5, textTransform: "uppercase" }}>
            Assisted Apply Pack
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--cream)", marginTop: 4 }}>
            {pack.job_title} @ {pack.company}
          </h2>
        </div>

        {/* 1. Checklist */}
        {pack.checklist?.length > 0 && (
          <div className="panel" style={{ marginTop: 0, marginBottom: 20 }}>
            <div className="panel-title">Pre-Submission Quality Checklist</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pack.checklist.map((item, idx) => (
                <label key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--text)", cursor: "pointer" }}>
                  <input type="checkbox" style={{ marginTop: 3, accentColor: "var(--gold)" }} />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 2. Cover Email */}
        {pack.cover_email && (
          <div className="panel" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div className="panel-title" style={{ margin: 0 }}>Tailored Outreach Email</div>
              <button
                className="act-btn"
                style={{ padding: "4px 10px", fontSize: 11 }}
                onClick={() => handleCopy(pack.cover_email, "email")}
              >
                {copiedSection === "email" ? "✓ Copied!" : "📋 Copy Email"}
              </button>
            </div>
            <textarea
              className="text-out"
              readOnly
              rows={8}
              value={pack.cover_email}
            />
          </div>
        )}

        {/* 3. Tailored Resume */}
        {pack.tailored_resume && (
          <div className="panel" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div className="panel-title" style={{ margin: 0 }}>Tailored Resume Content</div>
              <button
                className="act-btn"
                style={{ padding: "4px 10px", fontSize: 11 }}
                onClick={() => handleCopy(pack.tailored_resume, "resume")}
              >
                {copiedSection === "resume" ? "✓ Copied!" : "📋 Copy Resume"}
              </button>
            </div>
            <textarea
              className="text-out"
              readOnly
              rows={10}
              value={pack.tailored_resume}
            />
          </div>
        )}

        {/* Action Button: Apply Direct */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button className="act-btn" onClick={onClose}>
            Close
          </button>
          {pack.apply_link && (
            <a
              href={pack.apply_link}
              target="_blank"
              rel="noreferrer"
              className="submit-btn"
              style={{ width: "auto", margin: 0, padding: "10px 20px", textDecoration: "none" }}
            >
              Open Application Page ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
