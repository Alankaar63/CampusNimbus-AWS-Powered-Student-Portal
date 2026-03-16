import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { extractReportUrl, fetchStudentRecord, openReportUrl } from "../lib/api";
import { getStoredTokens } from "../lib/auth";

const students = [
  { prn: "23070123015", name: "Alankar Tripathi" },
  { prn: "23070123016", name: "Rahul Sharma" },
  { prn: "23070123017", name: "Sneha Patil" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [busyPrn, setBusyPrn] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    const demoMode = localStorage.getItem("portal_demo_mode") === "true";
    if (!accessToken && !demoMode) {
      navigate("/");
    }
  }, [navigate]);

  const viewReport = async (prn) => {
    setBusyPrn(prn);
    setFeedback("");

    try {
      const { accessToken } = getStoredTokens();
      const demoMode = localStorage.getItem("portal_demo_mode") === "true";
      if (!accessToken && demoMode) {
        setFeedback(`Demo mode active for PRN ${prn}. Use Cognito login for live report card fetch.`);
        return;
      }

      const data = await fetchStudentRecord(prn, accessToken);
      const reportUrl = extractReportUrl(data);

      if (!reportUrl) {
        setFeedback(`No report link was returned for PRN ${prn}.`);
        return;
      }

      openReportUrl(reportUrl);
      setFeedback(`Opened report card for PRN ${prn}.`);
    } catch (err) {
      setFeedback(err.message || "Unable to fetch report card right now.");
    } finally {
      setBusyPrn("");
    }
  };

  return (
    <div className="portal-scene">
      <div className="animated-gradient" />
      <div className="grain-overlay" />

      <Navbar />

      <div className="dashboard-wrap">
        <h1 className="section-title">Faculty / HOD Dashboard</h1>

        {feedback ? (
          <p className={feedback.startsWith("Opened") ? "muted" : "error-text"}>{feedback}</p>
        ) : null}

        <div className="card-grid">
          {students.map((student) => (
            <article key={student.prn} className="glass-card">
              <p className="field-label">Student</p>
              <h2 className="field-value">{student.name}</h2>

              <p className="field-label mt">PRN</p>
              <p className="field-value">{student.prn}</p>

              <button
                onClick={() => viewReport(student.prn)}
                className="portal-btn action-btn"
                disabled={busyPrn === student.prn}
                data-cursor="hover"
              >
                {busyPrn === student.prn ? "Fetching..." : "View Report Card"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
