import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"

function SubmissionDetails() {
  const { id } = useParams()

  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSubmission = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setError("Please login first")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/submissions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setError(data.message || "Failed to load submission")
          return
        }

        setSubmission(data)
      } catch (err) {
        console.error("Error fetching submission:", err)
        setError("Unable to connect to server")
      } finally {
        setLoading(false)
      }
    }

    fetchSubmission()
  }, [id])

  if (loading) {
    return (
      <main className="main submission-details-page">
        <p>Loading submission...</p>
      </main>
    )
  }

  if (error || !submission) {
    return (
      <main className="main submission-details-page">
        <h1 className="page-title">Submission</h1>
        <div className="submission-message">
          <p>{error || "Submission not found"}</p>
          <Link to="/submissions" className="solve-link">
            Back to My Submissions
          </Link>
        </div>
      </main>
    )
  }

  const status = String(submission.status || "PENDING")
    .replaceAll("_", " ")

  const accepted = submission.status === "ACCEPTED"

  const submittedDate = submission.submittedAt
    ? new Date(submission.submittedAt).toLocaleString()
    : "Not available"

  const language = submission.language || "cpp"

  return (
    <main className="main submission-details-page">
      <div className="submission-details-header">
        <div>
          <h1 className="page-title">Submission Details</h1>
          <p className="submission-details-subtitle">
            Submission #{submission.id}
          </p>
        </div>

        <Link to="/submissions" className="back-button">
          ← Back to Submissions
        </Link>
      </div>

      <div className="submission-result-layout">
        <aside className="submission-side-panel">
          <Link
            to={`/problems/${submission.problemId}`}
            className="submission-side-link"
          >
            <span>▤</span>
            Description
          </Link>

          <div
            className={`submission-side-link ${
              accepted ? "side-accepted" : "side-current"
            }`}
          >
            <span>{accepted ? "✓" : "●"}</span>
            {status}
          </div>

          <Link
            to={`/problems/${submission.problemId}`}
            className="submission-side-link"
          >
            <span>▣</span>
            Solutions
          </Link>

          <Link
            to="/submissions"
            className="submission-side-link"
          >
            <span>▤</span>
            Submissions
          </Link>
        </aside>

        <section className="submission-result-content">
          <div
            className={`submission-result-banner ${
              accepted ? "result-accepted" : "result-failed"
            }`}
          >
            <div className="submission-result-icon">
              {accepted ? "✓" : "!"}
            </div>

            <div>
              <h2>{status}</h2>
              <p>
                {submission.passedTestCases} /{" "}
                {submission.totalTestCases} testcases passed
              </p>
            </div>
          </div>

          <div className="submission-metrics">
            <div className="submission-metric">
              <span className="metric-label">Runtime</span>
              <strong>{submission.runtimeMs ?? 0} ms</strong>
            </div>

            <div className="submission-metric">
              <span className="metric-label">Language</span>
              <strong>{language.toUpperCase()}</strong>
            </div>

            <div className="submission-metric">
              <span className="metric-label">Submitted</span>
              <strong>{submittedDate}</strong>
            </div>
          </div>

          {submission.testCaseResult && (
            <section className="failed-testcase-panel">
              <h2>
                Testcase {submission.testCaseResult.testCaseNumber}
              </h2>

              <p className="failed-testcase-status">
                {String(submission.testCaseResult.status || "")
                  .replaceAll("_", " ")}
              </p>

              <div className="testcase-value">
                <span>Input</span>
                <pre>{submission.testCaseResult.input || "(empty)"}</pre>
              </div>

              <div className="testcase-value">
                <span>Expected Output</span>
                <pre>
                  {submission.testCaseResult.expectedOutput ?? ""}
                </pre>
              </div>

              <div className="testcase-value">
                <span>Your Output</span>
                <pre>
                  {submission.testCaseResult.actualOutput ?? ""}
                </pre>
              </div>
            </section>
          )}

          <section className="submitted-code-section">
            <div className="submitted-code-header">
              <h2>Code</h2>
              <span className="code-language">
                {language.toUpperCase()}
              </span>
            </div>

            <pre className="submitted-code">
              <code>{submission.code}</code>
            </pre>
          </section>
        </section>
      </div>
    </main>
  )
}

export default SubmissionDetails