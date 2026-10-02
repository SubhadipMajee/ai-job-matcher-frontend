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
    <div className="fade-up form-card" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="form-title">Automated Daily Job Digest</div>
      <p className="form-desc">
        Never miss an opening. Our scheduled background runner queries fresh postings, scores them against your skills, deduplicates previous emails, and delivers the top 10 matches directly to your inbox every morning.
      </p>

      {message && (
        <div style={{
          background: message.startsWith("✓") ? "rgba(93,186,126,0.12)" : "rgba(217,95,95,0.12)",
          border: `1px solid ${message.startsWith("✓") ? "rgba(93,186,126,0.3)" : "rgba(217,95,95,0.3)"}`,
          color: message.startsWith("✓") ? "var(--green)" : "var(--red)",
          padding: "10px 14px",
          borderRadius: 8,
          fontSize: 13,
          marginBottom: 20
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="field">
          <label>Recipient Email Address</label>
          <input
            type="email"
            className="input"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your-email@domain.com"
          />
        </div>

        <div className="two-col">
          <div className="field">
            <label>Target Role / Keywords</label>
            <input
              type="text"
              className="input"
              required
              value={jobQuery}
              onChange={e => setJobQuery(e.target.value)}
              placeholder="e.g. Full Stack Engineer"
            />
          </div>
          <div className="field">
            <label>Preferred Location (Optional)</label>
            <input
              type="text"
              className="input"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Remote or London"
            />
          </div>
        </div>

        <div className="field">
          <label>Minimum Match Score</label>
          <div className="slider-row">
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
            />
            <div className="slider-val">{minScore}%</div>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Only jobs meeting or exceeding this match threshold will be included.
          </div>
        </div>

        <div className="field" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
          <input
            type="checkbox"
            id="digest-active"
            checked={active}
            onChange={e => setActive(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: "var(--gold)", cursor: "pointer" }}
          />
          <label htmlFor="digest-active" style={{ fontSize: 13, color: "var(--cream)", cursor: "pointer", margin: 0 }}>
            Enable active daily digest emails
          </label>
        </div>

        <button type="submit" className="submit-btn" disabled={saving}>
          {saving ? "Saving Criteria..." : "Save Digest Preferences"}
        </button>
      </form>
    </div>
  );
}
