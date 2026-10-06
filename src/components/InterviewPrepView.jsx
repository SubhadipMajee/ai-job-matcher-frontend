export default function InterviewPrepView({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-4 pt-1">
      <div className="text-xs font-semibold text-white uppercase tracking-wider">
        AI Interview Preparation & Gap Coach
      </div>

      {/* Key Tips */}
      {data.key_tips?.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
            Top Interview Strategies
          </div>
          <ul className="space-y-1.5">
            {data.key_tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-amber-400 flex-shrink-0">💡</span>
                <span className="break-words">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gap Questions */}
      {data.gap_questions?.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
            Probing Skill Gaps & How to Pivot
          </div>
          <div className="flex flex-col gap-2.5">
            {data.gap_questions.map((gap, idx) => (
              <div key={idx} className="bg-brand-panel border border-brand-border rounded-xl p-3 space-y-1.5">
                <div className="text-[10px] font-mono text-rose-400">
                  Gap Identified: {gap.gap}
                </div>
                <div className="text-xs font-semibold text-white break-words">
                  Q: "{gap.question}"
                </div>
                <div className="text-xs text-slate-300 bg-amber-500/10 border-l-2 border-amber-500 p-2 rounded-r break-words">
                  <strong className="text-amber-300">Strategy:</strong> {gap.strategy}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Questions */}
      {data.technical_questions?.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Core Technical Questions
          </div>
          <div className="flex flex-col gap-2.5">
            {data.technical_questions.map((item, idx) => (
              <div key={idx} className="bg-brand-panel border border-brand-border rounded-xl p-3 space-y-1.5">
                <div className="text-xs font-semibold text-white break-words">
                  {idx + 1}. {item.question}
                </div>
                {item.context && (
                  <div className="text-[11px] text-slate-400 break-words">
                    Context: {item.context}
                  </div>
                )}
                {item.sample_answer && (
                  <div className="text-xs text-slate-300 bg-brand-surface p-2 rounded-lg leading-relaxed break-words">
                    <strong className="text-emerald-400">Model Answer Outline:</strong> {item.sample_answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Behavioral Questions */}
      {data.behavioral_questions?.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Role-Specific Behavioral Scenarios
          </div>
          <div className="flex flex-col gap-2.5">
            {data.behavioral_questions.map((b, idx) => (
              <div key={idx} className="bg-brand-panel border border-brand-border rounded-xl p-3 space-y-1">
                <div className="text-xs font-semibold text-white break-words">
                  "{b.question}"
                </div>
                {b.star_tip && (
                  <div className="text-xs text-amber-300 italic break-words">
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
