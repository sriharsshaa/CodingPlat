import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import Editor from "@monaco-editor/react"

const API = "http://localhost:8080"

function ProblemDetails() {
  const { id } = useParams()

  const [problem, setProblem] = useState(null)
  const [error, setError] = useState(null)

  const DEFAULT_CODE = `#include <iostream>
    #include <vector>
    using namespace std;

    int main() {
    return 0;
    }`;

    const [code, setCode] = useState(() => {
    return localStorage.getItem(`problem-code-${id}`) ?? DEFAULT_CODE;
    });


  const [editorTheme, setEditorTheme] = useState(
    localStorage.getItem("appTheme") === "dark"
    ? "vs-dark"
    : "vs"
    );

    useEffect(() => {
    const handleThemeChange = (event) => {
    setEditorTheme(
    event.detail === "dark" ? "vs-dark" : "vs"
    );
    };

    window.addEventListener("themeChanged", handleThemeChange);

    return () => {
    window.removeEventListener("themeChanged", handleThemeChange);
    };
    }, []);


  const [testCases, setTestCases] = useState([])
  const [testCasesLoading, setTestCasesLoading] = useState(true)
  const [selectedTestCase, setSelectedTestCase] = useState(0)

  const [runResult, setRunResult] = useState(null)
  const [running, setRunning] = useState(false)

  const [result, setResult] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmittedCode, setShowSubmittedCode] = useState(true)

  const [activeTab, setActiveTab] = useState("description")

  const [descriptionWidth, setDescriptionWidth] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const [editorHeight, setEditorHeight] = useState(430)
  const [isEditorResizing, setIsEditorResizing] = useState(false)

  const [submissions, setSubmissions] = useState([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)

  const workspaceRef = useRef(null)
  const codeSectionRef = useRef(null)

  // =========================================================
  // HELPERS
  // =========================================================

  const getStatusLabel = (status) => {
    const normalized = String(status || "ERROR").toUpperCase()

    const labels = {
      ACCEPTED: "Accepted",
      WRONG_ANSWER: "Wrong Answer",
      COMPILE_ERROR: "Compilation Error",
      RUNTIME_ERROR: "Runtime Error",
      TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
      MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
      ERROR: "Submission Error",
    }

    return labels[normalized] || normalized.replaceAll("_", " ")
  }

  const getPassedCases = (submission) => {
    const value =
      submission?.passedTestCases ??
      submission?.passedCases ??
      submission?.testCasesPassed

    return value == null ? null : Number(value)
  }

  const getTotalCases = (submission) => {
    const value =
      submission?.totalTestCases ??
      submission?.totalCases ??
      submission?.testCasesTotal

    return value == null ? null : Number(value)
  }

  const getRuntime = (submission) =>
    submission?.runtimeMs ?? submission?.runtime ?? null

  const getMemory = (submission) =>
    submission?.memoryMb ??
    submission?.memoryMB ??
    submission?.memory ??
    null

  const getFailedCase = (submission) => {
    const details = submission?.testCaseResult || {}

    return {
      number:
        submission?.failedTestCaseNumber ??
        details?.testCaseNumber ??
        details?.testcaseNumber,

      input:
        submission?.failedInput ??
        details?.input,

      expected:
        submission?.failedExpectedOutput ??
        details?.expectedOutput ??
        details?.expected,

      actual:
        submission?.failedActualOutput ??
        details?.actualOutput ??
        details?.actual,
    }
  }

  const formatSubmittedAt = (value) => {
    if (!value) return null

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return String(value)
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null")
    } catch {
      return null
    }
  }

  const currentUser = getUser()

  const getDisplayResult = () =>
    selectedSubmission || result

  const displayResult = getDisplayResult()

  useEffect(() => {
      const savedCode = localStorage.getItem(`problem-code-${id}`);

      setCode(savedCode ?? DEFAULT_CODE);
      }, [id]);

      useEffect(() => {
      localStorage.setItem(`problem-code-${id}`, code);
      }, [id, code]);


  // =========================================================
  // FETCH PROBLEM
  // =========================================================

  useEffect(() => {
    let cancelled = false

    const fetchProblem = async () => {
      try {
        setError(null)

        const response = await fetch(
          `${API}/api/problems/${id}`
        )

        if (!response.ok) {
          throw new Error("Problem not found")
        }

        const data = await response.json()

        if (!cancelled) {
          setProblem(data)
        }
      } catch (err) {
        console.error("Error fetching problem:", err)

        if (!cancelled) {
          setError("Unable to load this problem.")
        }
      }
    }

    fetchProblem()

    return () => {
      cancelled = true
    }
  }, [id])

  // =========================================================
  // FETCH TEST CASES
  // =========================================================

  useEffect(() => {
    let cancelled = false

    const fetchTestCases = async () => {
      try {
        setTestCasesLoading(true)

        const response = await fetch(
          `${API}/api/problems/${id}/testcases`
        )

        if (!response.ok) {
          throw new Error("Unable to load test cases")
        }

        const data = await response.json()

        if (!cancelled) {
          setTestCases(Array.isArray(data) ? data : [])
          setSelectedTestCase(0)
        }
      } catch (err) {
        console.error("Error fetching test cases:", err)

        if (!cancelled) {
          setTestCases([])
        }
      } finally {
        if (!cancelled) {
          setTestCasesLoading(false)
        }
      }
    }

    fetchTestCases()

    return () => {
      cancelled = true
    }
  }, [id])

  // =========================================================
  // RESIZE DESCRIPTION PANEL
  // =========================================================

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!isDragging || !workspaceRef.current) return

      const rect = workspaceRef.current.getBoundingClientRect()
      const percentage =
        ((event.clientX - rect.left) / rect.width) * 100

      setDescriptionWidth(
        Math.min(Math.max(percentage, 25), 65)
      )
    }

    const handleMouseUp = () => setIsDragging(false)

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isDragging])

  // =========================================================
  // RESIZE EDITOR
  // =========================================================

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!isEditorResizing || !codeSectionRef.current) return

      const rect = codeSectionRef.current.getBoundingClientRect()
      const newHeight = event.clientY - rect.top

      setEditorHeight(
        Math.min(Math.max(newHeight, 220), 700)
      )
    }

    const handleMouseUp = () => setIsEditorResizing(false)

    if (isEditorResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "row-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isEditorResizing])

  // =========================================================
  // FETCH SUBMISSIONS FOR THIS PROBLEM
  // =========================================================

  const fetchSubmissions = async () => {
    const token = localStorage.getItem("token")

    if (!token) return

    setSubmissionsLoading(true)

    try {
      const response = await fetch(
        `${API}/api/submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Unable to fetch submissions")
      }

      const data = await response.json()

      const filtered = Array.isArray(data)
        ? data.filter(
            (submission) =>
              Number(submission.problemId) === Number(id)
          )
        : []

      setSubmissions(filtered)
    } catch (err) {
      console.error("Error fetching submissions:", err)
    } finally {
      setSubmissionsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "submissions") {
      fetchSubmissions()
    }
  }, [activeTab, id])

  // =========================================================
  // RUN CODE
  // =========================================================

  const handleRun = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      alert("Please login first")
      return
    }

    if (!code.trim()) {
      alert("Please enter some code before running.")
      return
    }

    setRunning(true)
    setRunResult(null)
    setResult(null)
    setSelectedSubmission(null)
    setSelectedTestCase(0)

    try {
      const response = await fetch(
        `${API}/api/execution/cpp/problem/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            code,
            input: "",
          }),
        }
      )

      const data = await response.json()

      setRunResult({
        ...data,
        status: data.status || "ERROR",
        runtime: data.runtime ?? data.runtimeMs ?? 0,
        testCases: Array.isArray(data.testCases)
          ? data.testCases
          : [],
        message: data.message || "",
      })
    } catch (err) {
      console.error("Run error:", err)

      setRunResult({
        status: "ERROR",
        runtime: 0,
        message: "Unable to connect to the backend server.",
        testCases: [],
      })
    } finally {
      setRunning(false)
    }
  }

  // =========================================================
  // SUBMIT CODE
  // =========================================================

  const handleSubmit = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      alert("Please login first")
      return
    }

    if (!code.trim()) {
      alert("Please enter some code before submitting.")
      return
    }

    setSubmitting(true)
    setResult(null)
    setSelectedSubmission(null)
    setRunResult(null)
    setShowSubmittedCode(true)

    try {
      const response = await fetch(
        `${API}/api/submissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            problemId: Number(id),
            code,
            language: "cpp",
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setResult({
          ...data,
          status: "ERROR",
          message: data.message || "Submission failed",
          code,
          language: "cpp",
        })
        setActiveTab("result")
        return
      }

      const submittedResult = {
        ...data,
        code: data.code ?? code,
        language: data.language || "cpp",
      }

      setResult(submittedResult)
      setActiveTab("result")

      // Refresh the problem's submission history.
      await fetchSubmissions()

      // Stay on the current /problems/:id URL.
    } catch (err) {
      console.error("Submission error:", err)

      setResult({
        status: "ERROR",
        message: "Unable to connect to the backend server.",
        code,
        language: "cpp",
      })

      setActiveTab("result")
    } finally {
      setSubmitting(false)
    }
  }

  // =========================================================
  // OPEN A SUBMISSION FROM HISTORY
  // =========================================================

  const openSubmission = (submission) => {
    setSelectedSubmission(submission)
    setResult(null)
    setShowSubmittedCode(true)
    setActiveTab("result")
  }

  // =========================================================
  // CLOSE RESULT
  // =========================================================

  const closeResult = () => {
    setResult(null)
    setSelectedSubmission(null)
    setShowSubmittedCode(false)
    setActiveTab("description")
  }

  // =========================================================
  // LOADING / ERROR
  // =========================================================

  if (!problem && !error) {
    return (
      <main className="main">
        <div className="loading-state">
          <p>Loading problem...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="main">
        <div className="error-state">
          <h2>Problem unavailable</h2>
          <p>{error}</p>
        </div>
      </main>
    )
  }

  // =========================================================
  // SELECTED TEST CASE
  // =========================================================

  const selectedSampleCase = testCases[selectedTestCase]
  const selectedRunCase = runResult?.testCases?.[selectedTestCase]
  const selectedCase = selectedRunCase || selectedSampleCase

  // =========================================================
  // RESULT DETAILS
  // =========================================================

  const submission = displayResult
  const submissionStatus = String(
    submission?.status || "ERROR"
  ).toUpperCase()

  const isAccepted = submissionStatus === "ACCEPTED"

  const passedCases = getPassedCases(submission)
  const totalCases = getTotalCases(submission)
  const runtime = getRuntime(submission)
  const memory = getMemory(submission)
  const failedCase = getFailedCase(submission)

  const userName =
    currentUser?.name ||
    currentUser?.username ||
    "User"

  const submittedAt = formatSubmittedAt(
    submission?.submittedAt ??
    submission?.createdAt ??
    submission?.submissionTime
  )

  const submittedCode =
    submission?.code ??
    submission?.sourceCode ??
    ""

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="problem-page">

      {/* =====================================================
          TABS
          ===================================================== */}

      <div className="problem-tabs">

        <button
          className={
            activeTab === "description"
              ? "problem-tab active"
              : "problem-tab"
          }
          onClick={() => setActiveTab("description")}
        >
          Description
        </button>

        {displayResult && (
          <button
            className={
              activeTab === "result"
                ? "problem-tab active"
                : "problem-tab"
            }
            onClick={() => setActiveTab("result")}
          >
            {getStatusLabel(displayResult.status)}
          </button>
        )}

        <button
          className={
            activeTab === "solutions"
              ? "problem-tab active"
              : "problem-tab"
          }
          onClick={() => setActiveTab("solutions")}
        >
          Solutions
        </button>

        <button
          className={
            activeTab === "submissions"
              ? "problem-tab active"
              : "problem-tab"
          }
          onClick={() => setActiveTab("submissions")}
        >
          Submissions
        </button>

      </div>

      {/* =====================================================
          DESCRIPTION TAB
          ===================================================== */}

      {activeTab === "description" && (
        <div
          ref={workspaceRef}
          className="problem-workspace"
          style={{
            gridTemplateColumns:
              `${descriptionWidth}% 6px ${100 - descriptionWidth}%`,
          }}
        >

          <section className="problem-description-panel">
            <div className="problem-description">

              <div className="problem-heading">
                <h1>
                  {problem.id}. {problem.title}
                </h1>

                <span
                  className={
                    `difficulty ${String(
                      problem.difficulty
                    ).toLowerCase()}`
                  }
                >
                  {problem.difficulty}
                </span>
              </div>

              <hr />

              <h2>Description</h2>
              <p>{problem.description}</p>

              <h2>Input</h2>
              <p>{problem.inputFormat}</p>

              <h2>Output</h2>
              <p>{problem.outputFormat}</p>

              <h2>Constraints</h2>
              <p>{problem.constraints}</p>

            </div>
          </section>

          <div
            className={
              isDragging
                ? "workspace-divider dragging"
                : "workspace-divider"
            }
            onMouseDown={() => setIsDragging(true)}
          >
            <div className="workspace-divider-handle" />
          </div>

          <section
            ref={codeSectionRef}
            className="code-section"
          >

            {/* CODE TOOLBAR */}

            <div className="code-editor-toolbar">
              <div className="code-editor-title">
                <span>Code</span>
                <span className="language-badge">C++</span>
              </div>

              <div className="editor-buttons">
                <button
                  className="run-button"
                  onClick={handleRun}
                  disabled={running || submitting}
                >
                  {running ? "Running..." : "▶ Run"}
                </button>

                <button
                  className="submit-button"
                  onClick={handleSubmit}
                  disabled={submitting || running}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>

            {/* MONACO EDITOR */}

            <div
              className="editor-container"
              style={{
                height: `${editorHeight}px`,
                flex: "none",
              }}
            >
              <Editor
                height="100%"
                language="cpp"
                theme={editorTheme}
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  tabSize: 4,
                  padding: { top: 15, bottom: 15 },
                  lineNumbers: "on",
                  renderLineHighlight: "line",
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  folding: true,
                }}
              />
            </div>

            {/* EDITOR RESIZE HANDLE */}

            <div
              className={
                isEditorResizing
                  ? "editor-resize-handle dragging"
                  : "editor-resize-handle"
              }
              onMouseDown={() => setIsEditorResizing(true)}
            >
              <span />
            </div>

            {/* TESTCASE SECTION */}

            <div className="testcase-section">
              <div className="testcase-header">
                <div>
                  <h3>Testcase</h3>

                  {runResult && (
                    <div className="testcase-run-summary">
                      <span
                        className={
                          `testcase-overall ${String(
                            runResult.status
                          ).toLowerCase()}`
                        }
                      >
                        {getStatusLabel(runResult.status)}
                      </span>

                      <span className="testcase-runtime">
                        Runtime: {runResult.runtime} ms
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {testCasesLoading ? (
                <div className="testcase-empty">
                  <p>Loading test cases...</p>
                </div>
              ) : testCases.length === 0 ? (
                <div className="testcase-empty">
                  <p>No sample test cases available.</p>
                </div>
              ) : (
                <>
                  <div className="testcase-tabs">
                    {testCases.slice(0, 3).map(
                      (sampleCase, index) => {
                        const resultCase =
                          runResult?.testCases?.[index]

                        return (
                          <button
                            key={
                              sampleCase.id ??
                              sampleCase.testCaseNumber ??
                              index
                            }
                            className={
                              selectedTestCase === index
                                ? "testcase-tab active"
                                : "testcase-tab"
                            }
                            onClick={() => setSelectedTestCase(index)}
                          >
                            {resultCase?.status && (
                              <span
                                className={
                                  `case-status ${String(
                                    resultCase.status
                                  ).toLowerCase()}`
                                }
                              />
                            )}

                            <span>Case {index + 1}</span>
                          </button>
                        )
                      }
                    )}
                  </div>

                  {selectedCase ? (
                    <div className="testcase-content">

                      {selectedRunCase && (
                        <div className="testcase-status-row">
                          <span
                            className={
                              `testcase-result-status ${String(
                                selectedRunCase.status
                              ).toLowerCase()}`
                            }
                          >
                            {getStatusLabel(selectedRunCase.status)}
                          </span>
                        </div>
                      )}

                      <div className="testcase-box">
                        <h4>Input</h4>
                        <pre>{selectedCase.input || "(empty)"}</pre>
                      </div>

                      <div className="testcase-box">
                        <h4>Output</h4>
                        <pre>
                          {selectedRunCase
                            ? selectedRunCase.actualOutput ?? "(empty)"
                            : "Run your code to see the output."}
                        </pre>
                      </div>

                      <div className="testcase-box">
                        <h4>Expected</h4>
                        <pre>
                          {selectedCase.expectedOutput || "(empty)"}
                        </pre>
                      </div>

                    </div>
                  ) : (
                    <div className="testcase-empty">
                      <p>Select a test case.</p>
                    </div>
                  )}
                </>
              )}
            </div>

          </section>
        </div>
      )}

      {/* =====================================================
          ACCEPTED / WRONG ANSWER RESULT TAB
          ===================================================== */}

      {activeTab === "result" && submission && (
        <section className="submission-details-page">

          {/* RESULT TITLE */}

          <div
            className={
              `submission-details-status ${
                isAccepted ? "accepted" : "failed"
              }`
            }
          >
            <span className="submission-details-status-icon">
              {isAccepted ? "✓" : "✕"}
            </span>

            <div>
              <h1>{getStatusLabel(submissionStatus)}</h1>

              {passedCases !== null && totalCases !== null && (
                <p>
                  {passedCases} / {totalCases} testcases passed
                </p>
              )}

              {submission.message && !isAccepted && (
                <p>{submission.message}</p>
              )}
            </div>
          </div>

          {/* SUBMITTER INFORMATION */}

          <div className="submission-author">
            <div className="submission-author-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{userName}</strong>

              {submittedAt && (
                <p>submitted at {submittedAt}</p>
              )}
            </div>
          </div>

          {/* RUNTIME AND MEMORY */}

          <div className="submission-performance">

            <div className="submission-performance-card">
              <span>Runtime</span>
              <strong>
                {runtime != null ? `${runtime} ms` : "N/A"}
              </strong>

              {submission.runtimePercentile != null && (
                <p>
                  Beats {submission.runtimePercentile}%
                </p>
              )}
            </div>

            <div className="submission-performance-card">
              <span>Memory</span>
              <strong>
                {memory != null
                  ? `${memory} MB`
                  : "N/A"}
              </strong>

              {submission.memoryPercentile != null && (
                <p>
                  Beats {submission.memoryPercentile}%
                </p>
              )}
            </div>

            <div className="submission-performance-card">
              <span>Language</span>
              <strong>
                {String(
                  submission.language || "cpp"
                ).toUpperCase()}
              </strong>
            </div>

          </div>

          {/* FAILED TESTCASE DETAILS */}

          {!isAccepted && (
            <div className="submission-detail-section">
              <h2>Testcase Details</h2>

              {failedCase.number != null && (
                <p className="submission-failed-number">
                  Failed at Test Case {failedCase.number}
                </p>
              )}

              {failedCase.input != null && (
                <div className="submission-detail-box">
                  <h3>Input</h3>
                  <pre>{String(failedCase.input || "(empty)")}</pre>
                </div>
              )}

              {failedCase.expected != null && (
                <div className="submission-detail-box">
                  <h3>Expected Output</h3>
                  <pre>{String(failedCase.expected || "(empty)")}</pre>
                </div>
              )}

              {failedCase.actual != null && (
                <div className="submission-detail-box">
                  <h3>Your Output</h3>
                  <pre>{String(failedCase.actual || "(empty)")}</pre>
                </div>
              )}

              {failedCase.number == null &&
                failedCase.input == null &&
                failedCase.expected == null &&
                failedCase.actual == null && (
                  <p>
                    Detailed failed-testcase information is not
                    available for this submission.
                  </p>
                )}
            </div>
          )}

          {/* SUBMITTED CODE */}

          <div className="submission-detail-section">
            <button
              type="button"
              className="submission-detail-code-toggle"
              onClick={() =>
                setShowSubmittedCode((previous) => !previous)
              }
            >
              <span>
                {showSubmittedCode ? "▼" : "▶"} Code
              </span>

              <span>
                {String(
                  submission.language || "cpp"
                ).toUpperCase()}
              </span>
            </button>

            {showSubmittedCode && (
              <pre className="submission-detail-code">
                <code>
                  {submittedCode || "Submitted code was not returned by the backend."}
                </code>
              </pre>
            )}
          </div>

          {/* ACTIONS */}

          <div className="submission-details-actions">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
            >
              Back to Problem
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("submissions")}
            >
              View Submissions
            </button>
          </div>

        </section>
      )}

      {/* =====================================================
          SOLUTIONS TAB
          ===================================================== */}

      {activeTab === "solutions" && (
        <section className="problem-tab-content">
          <div className="solutions-content">
            <h2>Solutions</h2>
            <p>Solutions will be available here.</p>
          </div>
        </section>
      )}

      {/* =====================================================
          SUBMISSIONS TAB
          ===================================================== */}

      {activeTab === "submissions" && (
        <section className="problem-submissions-content">

          <div className="problem-submissions-header">
            <div>
              <h2>Submissions</h2>
              <p>
                Your submissions for{" "}
                <strong>{problem.title}</strong>
              </p>
            </div>
          </div>

          {submissionsLoading ? (
            <div className="problem-submissions-empty">
              <p>Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="problem-submissions-empty">
              <div className="submissions-empty-icon">↑</div>
              <h3>No submissions yet</h3>
              <p>
                Submit your solution to see your submission history here.
              </p>
            </div>
          ) : (
            <div className="problem-submission-list">
              {submissions.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="problem-submission-card"
                  onClick={() => openSubmission(item)}
                >
                  <div className="submission-info">
                    <span className="submission-id">
                      #{item.id}
                    </span>

                    <span className="submission-language">
                      {String(
                        item.language || "cpp"
                      ).toUpperCase()}
                    </span>

                    <span className="submission-history-date">
                      {formatSubmittedAt(
                        item.submittedAt ?? item.createdAt
                      )}
                    </span>
                  </div>

                  <div className="submission-card-right">
                    <span
                      className={
                        `submission-status ${String(
                          item.status
                        ).toLowerCase()}`
                      }
                    >
                      {getStatusLabel(item.status)}
                    </span>

                    <span className="submission-view">
                      View →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

        </section>
      )}

    </main>
  )
}

export default ProblemDetails