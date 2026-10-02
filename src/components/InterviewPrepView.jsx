export default function InterviewPrepView({ data }) {
  if (!data) return null;

  return (
    <div className="panel fade-up" style={{ marginTop: 14 }}>
      <div className="panel-title">AI Interview Preparation & Gap Coach</div>

      {/* Key Tips */}
      {data.key_tips?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gold)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Top Interview Strategies
          </div>
          <ul className="feedback-list">
            {data.key_tips.map((tip, idx) => (
              <li key={idx} className="feedback-item">
                <span className="feedback-dot" style={{ color: "var(--gold)" }}>💡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gap Questions */}
      {data.gap_questions?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--red)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Probing Skill Gaps & How to Pivot
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.gap_questions.map((gap, idx) => (
              <div key={idx} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--red)", marginBottom: 4 }}>
                  Gap Identified: {gap.gap}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)", marginBottom: 6 }}>
                  Q: "{gap.question}"
                </div>
                <div style={{ fontSize: 12, color: "var(--text)", background: "rgba(232,184,75,0.06)", borderLeft: "2px solid var(--gold)", padding: "6px 10px", borderRadius: 4 }}>
                  <strong>Strategy:</strong> {gap.strategy}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Questions */}
      {data.technical_questions?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Core Technical Questions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.technical_questions.map((item, idx) => (
              <div key={idx} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)", marginBottom: 4 }}>
                  {idx + 1}. {item.question}
                </div>
                {item.context && (
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
                    Context: {item.context}
                  </div>
                )}
                {item.sample_answer && (
                  <div style={{ fontSize: 12, color: "var(--text)", background: "var(--surface2)", padding: "8px 10px", borderRadius: 6, lineHeight: 1.5 }}>
                    <strong>Model Answer Outline:</strong> {item.sample_answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Behavioral Questions */}
      {data.behavioral_questions?.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Role-Specific Behavioral Scenarios
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.behavioral_questions.map((b, idx) => (
              <div key={idx} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)", marginBottom: 4 }}>
                  "{b.question}"
                </div>
                {b.star_tip && (
                  <div style={{ fontSize: 12, color: "var(--gold)", fontStyle: "italic" }}>
                    STAR Guidance: {b.star_tip}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
