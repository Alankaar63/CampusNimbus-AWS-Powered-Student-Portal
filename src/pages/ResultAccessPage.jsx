import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { extractReportUrl, fetchStudentRecord, openReportUrl } from "../lib/api";
import { getStoredTokens, getUserContext } from "../lib/auth";

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function getRecordName(record) {
  if (!record || typeof record !== "object") return "";
  return record.Name || record.name || record.studentName || record.student_name || "";
}

export default function ResultAccessPage() {
  const user = useMemo(() => getUserContext(), []);
  const [prn, setPrn] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      setError("Session expired. Please login again via Cognito.");
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      setError("Missing access token. Please login again.");
      return;
    }

    const safePrn = String(prn).trim();
    const safeName = normalizeName(name);

    if (!safePrn || !safeName) {
      setError("Enter both PRN and Name.");
      return;
    }

    setLoading(true);
    try {
      const record = await fetchStudentRecord(safePrn, accessToken);
      const recordName = normalizeName(getRecordName(record));

      if (!recordName) {
        setError("Record found but Name field is missing in DynamoDB.");
        return;
      }

      if (recordName !== safeName) {
        setError("PRN and Name do not match. Access denied.");
        return;
      }

      const reportUrl = extractReportUrl(record);
      if (!reportUrl) {
        setError("No report PDF link found for this PRN.");
        return;
      }

      openReportUrl(reportUrl);
      setNotice(`Report opened for ${getRecordName(record)} (${safePrn}).`);
    } catch (err) {
      setError(err.message || "Unable to fetch result right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-scene">
      <div className="animated-gradient" />
      <div className="grain-overlay" />
      <Navbar />

      <div className="dashboard-wrap">
        <h1 className="section-title">Result Access</h1>

        <div className="glass-card">
          <p className="muted">Enter PRN and Name exactly as stored in SIU records to view the PDF report card.</p>

          <form className="portal-form mt" onSubmit={onSubmit}>
            <label>
              PRN
              <input
                value={prn}
                onChange={(e) => setPrn(e.target.value)}
                placeholder="e.g. 23070123015"
                autoComplete="off"
              />
            </label>

            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alankar Tripathi"
                autoComplete="off"
              />
            </label>

            <button className="portal-btn action-btn" type="submit" disabled={loading} data-cursor="hover">
              {loading ? "Verifying..." : "View Result PDF"}
            </button>
          </form>

          {error ? <p className="error-text mt">{error}</p> : null}
          {notice ? <p className="muted mt">{notice}</p> : null}
          <p className="muted mt">Signed in as: {user.username} ({user.role})</p>
        </div>
      </div>
    </div>
  );
}
