export default function DiffViewer({ diffData, summary, onClose }) {
  if (!diffData || !diffData.length) return null;

  return (
    <div className="panel fade-up" style={{ marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div className="panel-title" style={{ margin: 0 }}>
          Resume Changes Diff View
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--border2)",
              borderRadius: 4,
              color: "var(--muted)",
              padding: "2px 8px",
              cursor: "pointer",
              fontSize: 12
            }}
          >
            Hide Diff
          </button>
        )}
      </div>

      {summary && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <span style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            padding: "4px 10px",
            borderRadius: 4,
            background: "rgba(93,186,126,0.1)",
            border: "1px solid rgba(93,186,126,0.3)",
            color: "var(--green)"
          }}>
            +{summary.lines_added} Added
          </span>
          <span style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            padding: "4px 10px",
            borderRadius: 4,
            background: "rgba(217,95,95,0.1)",
            border: "1px solid rgba(217,95,95,0.3)",
            color: "var(--red)"
          }}>
            -{summary.lines_removed} Removed
          </span>
          <span style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            padding: "4px 10px",
            borderRadius: 4,
            background: "var(--surface)",
            border: "1px solid var(--border2)",
            color: "var(--muted)"
          }}>
            {summary.lines_unchanged} Unchanged
          </span>
        </div>
      )}

      <div style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 16,
        maxHeight: 500,
        overflowY: "auto",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        lineHeight: 1.6
      }}>
        {diffData.map((chunk, idx) => {
          let bg = "transparent";
          let color = "var(--text)";
          let prefix = "  ";

          if (chunk.type === "added") {
            bg = "rgba(93,186,126,0.12)";
            color = "#76d698";
            prefix = "+ ";
          } else if (chunk.type === "removed") {
            bg = "rgba(217,95,95,0.12)";
            color = "#f07f7f";
            prefix = "- ";
          }

          return (
            <div
              key={idx}
              style={{
                background: bg,
                color: color,
                padding: "2px 8px",
                borderRadius: 3,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word"
              }}
            >
              <span style={{ opacity: 0.6, userSelect: "none" }}>{prefix}</span>
              {chunk.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
