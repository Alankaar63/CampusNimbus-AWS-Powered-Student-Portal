import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { extractReportUrl, fetchStudentRecord, openReportUrl } from "../lib/api";
import { getStoredTokens, getUserContext } from "../lib/auth";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = useMemo(() => getUserContext(), []);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    const demoMode = localStorage.getItem("portal_demo_mode") === "true";
    if (!accessToken && !demoMode) {
      navigate("/");
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");
      setNotice("");

      try {
        const { accessToken: token } = getStoredTokens();
        if (!token && demoMode) {
          setRecord({ demo: true });
          setNotice("Demo mode: use Cognito login for live AWS report data.");
          return;
        }

        const data = await fetchStudentRecord(user.prn, token);
        setRecord(data);
      } catch (err) {
        setError(err.message || "Unable to load student record right now.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, user.prn]);

  const onDownload = () => {
    const demoMode = localStorage.getItem("portal_demo_mode") === "true";
    if (demoMode && !localStorage.getItem("access_token")) {
      setError("Demo mode cannot fetch real report cards. Use Cognito login.");
      return;
    }

    const reportUrl = extractReportUrl(record);
    if (!reportUrl) {
      setError("Report card link is not available for this account.");
      return;
    }

    try {
      const opened = openReportUrl(reportUrl);
      if (!opened) {
        setError("Could not open report card. Please try again.");
        return;
      }

      setNotice("Report card opened in a new tab.");
    } catch (err) {
      setError(err.message || "Could not open report card. Please try again.");
    }
  };

  return (
    <div className="portal-scene">
      <div className="animated-gradient" />
      <div className="grain-overlay" />

      <Navbar />

      <div className="dashboard-wrap">
        <h1 className="section-title">Student Academic Record</h1>

        <div className="glass-card">
          {loading && <p className="muted">Loading your data from AWS...</p>}

          {!loading && error && <p className="error-text">{error}</p>}
          {!loading && !error && notice && <p className="muted">{notice}</p>}

          {!loading && !error && (
            <>
              <div className="info-grid">
                <div>
                  <p className="field-label">Name</p>
                  <p className="field-value">{user.username}</p>
                </div>
                <div>
                  <p className="field-label">PRN</p>
                  <p className="field-value">{user.prn || "Not found in token"}</p>
                </div>
                <div>
                  <p className="field-label">Role</p>
                  <p className="field-value">{user.role}</p>
                </div>
                <div>
                  <p className="field-label">Status</p>
                  <p className="field-value">Record Loaded</p>
                </div>
              </div>

              <button onClick={onDownload} className="portal-btn action-btn" data-cursor="hover">
                Download Report Card
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
