import { useState } from "react";

export default function ApplyPackModal({ pack, onClose }) {
  const [copiedSection, setCopiedSection] = useState(null);

  if (!pack) return null;

  const handleCopy = (text, sectionName) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleDownload = (text, filename) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-slate-200 z-10 flex flex-col gap-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-xl p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20">
              ✦
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
              Assisted Apply Pack
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-white tracking-tight">
            {pack.job_title} <span className="text-slate-400 font-sans text-base font-normal">@ {pack.company}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pre-tailored materials optimized specifically for this position.
          </p>
        </div>

        {/* 1. Pre-Submission Quality Checklist */}
        {pack.checklist?.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>📋</span>
              <span>Pre-Submission Quality Checklist</span>
            </div>
            <div className="flex flex-col gap-2">
              {pack.checklist.map((item, idx) => (
                <label key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 accent-amber-500 cursor-pointer"
                  />
                  <span className="group-hover:text-white transition leading-relaxed">{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 2. Tailored Outreach Email */}
        {pack.cover_email && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>✉️</span>
                <span>Tailored Outreach Email</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(pack.cover_email, "email")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-slate-600 transition flex items-center gap-1"
              >
                {copiedSection === "email" ? "✓ Copied!" : "📋 Copy Email"}
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={pack.cover_email}
              className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed resize-y focus:outline-none focus:border-amber-500/50 transition selection:bg-amber-500/30"
            />
          </div>
        )}

        {/* 3. Tailored Resume Content */}
        {pack.tailored_resume && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>📄</span>
                <span>Tailored Resume Content</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(pack.tailored_resume, `${pack.company}_Tailored_Resume.txt`)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition flex items-center gap-1"
                >
                  💾 Download .txt
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(pack.tailored_resume, "resume")}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-slate-600 transition flex items-center gap-1"
                >
                  {copiedSection === "resume" ? "✓ Copied!" : "📋 Copy Resume"}
                </button>
              </div>
            </div>
            <textarea
              readOnly
              rows={10}
              value={pack.tailored_resume}
              className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed resize-y focus:outline-none focus:border-amber-500/50 transition selection:bg-amber-500/30"
            />
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Close
          </button>
          {pack.apply_link && (
            <a
              href={pack.apply_link}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <span>Open Application Page</span>
              <span>↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
