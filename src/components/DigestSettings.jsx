import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function DigestSettings({ userEmail, resumeSkills }) {
  const [email, setEmail] = useState(userEmail || "");
  const [jobQuery, setJobQuery] = useState("");
  const [location, setLocation] = useState("");
  const [minScore, setMinScore] = useState(60);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [existingSetting, setExistingSetting] = useState(null);

  useEffect(() => {
    if (userEmail) setEmail(userEmail);
    fetchExisting();
  }, [userEmail]);

  const fetchExisting = async () => {
    if (!userEmail) return;
    try {
      const { data } = await supabase
        .from("digest_settings")
        .select("*")
        .eq("email", userEmail)
        .maybeSingle();

      if (data) {
        setExistingSetting(data);
        setJobQuery(data.job_query || "");
        setLocation(data.location || "");
        setMinScore(data.min_score || 60);
        setActive(data.active ?? true);
      }
    } catch (err) {
      console.warn("Could not load existing digest settings:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!email.trim() || !jobQuery.trim()) {
      alert("Please provide both email and target job role.");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        email: email.trim(),
        job_query: jobQuery.trim(),
        location: location.trim(),
        min_score: Number(minScore),
        skills: resumeSkills || [],
        active: active,
      };

      let error;
      if (existingSetting?.id) {
        const res = await supabase
          .from("digest_settings")
          .update(payload)
          .eq("id", existingSetting.id);
        error = res.error;
      } else {
        const res = await supabase
          .from("digest_settings")
          .insert([payload]);
        error = res.error;
      }

      if (error) throw error;
      setMessage("✓ Daily digest criteria saved successfully! GitHub Actions will email matches at 07:00 UTC daily.");
      fetchExisting();
    } catch (err) {
      setMessage("Error saving settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 sm:p-6 md:p-8 backdrop-blur-sm shadow-xl">
      <div className="text-center mb-5 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-serif text-white font-medium mb-2">Automated Daily Job Digest</h3>
        <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          Never miss an opening. Our scheduled background runner queries fresh postings, scores them against your skills, deduplicates previous emails, and delivers the top 10 matches directly to your inbox every morning.
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs mb-6 border ${
            message.startsWith("✓")
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/40 border-red-500/30 text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Recipient Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your-email@gmail.com"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Role / Keywords</label>
            <input
              type="text"
              required
              value={jobQuery}
              onChange={e => setJobQuery(e.target.value)}
              placeholder="e.g. Full Stack Developer"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Preferred Location (Optional)</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Remote or London"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-400">Minimum Match Score</label>
            <span className="text-xs font-mono font-bold text-amber-400">{minScore}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={minScore}
            onChange={e => setMinScore(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Only jobs meeting or exceeding this match threshold will be included.
          </span>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={active}
            onChange={e => setActive(e.target.checked)}
            className="rounded border-slate-800 text-amber-500 focus:ring-amber-500 bg-slate-950"
          />
          <span className="text-xs text-slate-300 font-medium">Enable active daily digest emails</span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full mt-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
        >
          {saving ? "Saving Preferences..." : "Save Digest Preferences"}
        </button>
      </form>
    </div>
  );
}
