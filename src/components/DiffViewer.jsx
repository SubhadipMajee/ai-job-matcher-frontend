export default function DiffViewer({ diffData, summary, onClose }) {
  if (!diffData || !diffData.length) return null;

  return (
    <div className="surface-card p-4 sm:p-5 mt-4">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-sm font-semibold text-white">
          Resume Changes Diff View
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded bg-brand-surface hover:bg-slate-800 border border-brand-border text-slate-400 hover:text-slate-200 text-xs transition"
          >
            Hide Diff
          </button>
        )}
      </div>

      {summary && (
        <div className="flex flex-wrap gap-2 mb-3.5">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            +{summary.lines_added} Added
          </span>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
            -{summary.lines_removed} Removed
          </span>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-brand-surface border border-brand-border text-slate-400">
            {summary.lines_unchanged} Unchanged
          </span>
        </div>
      )}

      <div className="bg-brand-panel border border-brand-border rounded-xl p-3 sm:p-4 max-h-[60vh] sm:max-h-[500px] overflow-y-auto font-mono text-xs leading-relaxed">
        {diffData.map((chunk, idx) => {
          let bg = "transparent";
          let color = "text-slate-300";
          let prefix = "  ";

          if (chunk.type === "added") {
            bg = "bg-emerald-500/10";
            color = "text-emerald-300";
            prefix = "+ ";
          } else if (chunk.type === "removed") {
            bg = "bg-rose-500/10";
            color = "text-rose-300";
            prefix = "- ";
          }

          return (
            <div
              key={idx}
              className={`${bg} ${color} px-2 py-0.5 rounded my-0.5 whitespace-pre-wrap break-words`}
            >
              <span className="opacity-60 select-none mr-1">{prefix}</span>
              {chunk.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
