import { useEffect, useState } from "react"
import { Link } from "react-router-dom"


function Submissions() {

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // =======================================================
  // PAGINATION
  // =======================================================

  const [currentPage, setCurrentPage] = useState(1)

  const submissionsPerPage = 20

  const totalPages = Math.ceil(
    submissions.length / submissionsPerPage
  )

  const startIndex =
    (currentPage - 1) * submissionsPerPage

  const currentSubmissions =
    submissions.slice(
      startIndex,
      startIndex + submissionsPerPage
    )


  // =======================================================
  // FETCH SUBMISSIONS
  // =======================================================

  useEffect(() => {

    const fetchSubmissions = async () => {

      const token = localStorage.getItem("token")

      if (!token) {
        setError("Please login first")
        setLoading(false)
        return
      }

      try {

        const response = await fetch(
          "http://localhost:8080/api/submissions",
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setError(
            data.message ||
            "Failed to load submissions"
          )
          return
        }

        setSubmissions(data)

      } catch (error) {

        console.error(
          "Error fetching submissions:",
          error
        )

        setError(
          "Unable to connect to server"
        )

      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()

  }, [])


  // =======================================================
  // CHANGE PAGE
  // =======================================================

  const goToPage = (page) => {

    if (
      page >= 1 &&
      page <= totalPages
    ) {
      setCurrentPage(page)

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    }
  }


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (
      <main className="main">

        <h1 className="page-title">
          My Submissions
        </h1>

        <p className="submission-message">
          Loading submissions...
        </p>

      </main>
    )
  }


  // =======================================================
  // ERROR
  // =======================================================

  if (error) {

    return (
      <main className="main">

        <h1 className="page-title">
          My Submissions
        </h1>

        <div className="submission-message">

          <p>
            {error}
          </p>

          <Link
            to="/"
            className="solve-link"
          >
            Go to Problems
          </Link>

        </div>

      </main>
    )
  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <main className="main submissions-page">

      <div className="submissions-header">

        <div>

          <h1 className="page-title">
            My Submissions
          </h1>

          <p className="submissions-count">
            {submissions.length} submission
            {submissions.length !== 1 ? "s" : ""}
          </p>

        </div>

      </div>


      {submissions.length === 0 ? (

        <div className="empty-submissions">

          <h2>
            No submissions yet
          </h2>

          <p>
            Start solving problems and your
            submissions will appear here.
          </p>

          <Link
            to="/"
            className="solve-link"
          >
            Solve a Problem
          </Link>

        </div>

      ) : (

        <>

          {/* =================================================
              SUBMISSION LIST
              ================================================= */}

          <div className="submission-list">

            {currentSubmissions.map(submission => (

              <Link
                to={`/submissions/${submission.id}`}
                className="submission-card"
                key={submission.id}
              >

                <div className="submission-left">

                  <div>

                    <h2 className="submission-title">
                      Submission #{submission.id}
                    </h2>


                    {/* =================================================
                        SUBMISSION DETAILS
                        ================================================= */}

                    <div className="submission-details">

                      <span className="submission-detail-item">

                        <span className="detail-label">
                          Problem ID:
                        </span>

                        <strong className="detail-value">
                          {submission.problemId}
                        </strong>

                      </span>


                      <span className="detail-separator">
                        •
                      </span>


                      <span className="submission-detail-item">

                        <span className="detail-label">
                          Language:
                        </span>

                        <strong className="detail-value">
                          {submission.language.toUpperCase()}
                        </strong>

                      </span>

                    </div>

                  </div>

                </div>


                <div className="submission-right">

                  <span
                    className={
                      `submission-status ${
                        submission.status.toLowerCase()
                      }`
                    }
                  >
                    {submission.status.replaceAll(
                      "_",
                      " "
                    )}
                  </span>

                </div>

              </Link>

            ))}

          </div>


          {/* =================================================
              PAGINATION
              ================================================= */}

          {totalPages > 1 && (

            <div className="submission-pagination">

              {/* PREVIOUS */}

              <button
                className="pagination-button"
                onClick={() =>
                  goToPage(currentPage - 1)
                }
                disabled={currentPage === 1}
              >
                ← Previous
              </button>


              {/* PAGE NUMBERS */}

              <div className="pagination-pages">

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map(page => (

                  <button
                    key={page}
                    className={
                      `pagination-number ${
                        currentPage === page
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      goToPage(page)
                    }
                  >
                    {page}
                  </button>

                ))}

              </div>


              {/* NEXT */}

              <button
                className="pagination-button"
                onClick={() =>
                  goToPage(currentPage + 1)
                }
                disabled={
                  currentPage === totalPages
                }
              >
                Next →
              </button>

            </div>

          )}

        </>

      )}

    </main>
  )
}

export default Submissions