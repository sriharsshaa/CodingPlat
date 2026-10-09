import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function Profile() {

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {

    const fetchProfile = async () => {

      const token = localStorage.getItem("token")

      if (!token) {
        setError("Please login first")
        setLoading(false)
        return
      }

      try {

        const response = await fetch(
          "http://localhost:8080/api/users/profile",
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
            "Failed to load profile"
          )

          return
        }

        setProfile(data)

      } catch (error) {

        console.error(
          "Profile error:",
          error
        )

        setError(
          "Unable to connect to server"
        )

      } finally {

        setLoading(false)

      }
    }

    fetchProfile()

  }, [])

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {

    return (
      <main className="main profile-page">

        <div className="profile-loading">

          <div className="profile-spinner"></div>

          <p>
            Loading profile...
          </p>

        </div>

      </main>
    )
  }


  /* =====================================================
     ERROR
     ===================================================== */

  if (error) {

    return (
      <main className="main profile-page">

        <div className="profile-error">

          <h2>
            Unable to load profile
          </h2>

          <p>
            {error}
          </p>

          <Link
            to="/login"
            className="profile-action-button"
          >
            Login
          </Link>

        </div>

      </main>
    )
  }


  /* =====================================================
     DONUT CALCULATIONS
     ===================================================== */

  const solved =
    profile.solved || 0

  const easy =
    profile.easy || 0

  const medium =
    profile.medium || 0

  const hard =
    profile.hard || 0


  const easyPercentage =
    solved > 0
      ? (easy / solved) * 100
      : 0


  const mediumPercentage =
    solved > 0
      ? (medium / solved) * 100
      : 0


  const mediumEnd =
    easyPercentage +
    mediumPercentage


  /* =====================================================
     MAIN PROFILE
     ===================================================== */

  return (
    <main className="main profile-page">


      {/* =================================================
          PROFILE HEADER
          ================================================= */}

      <section className="profile-card">

        <div className="profile-cover"></div>


        <div className="profile-header-content">

          <div className="profile-main-avatar">
            👤
          </div>


          <div className="profile-main-info">

            <h1>
              {profile.name}
            </h1>

            <p className="profile-username">
              @{profile.name
                .toLowerCase()
                .replace(/\s+/g, "")
              }
            </p>

            <p className="profile-email">
              {profile.email}
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          PROFILE STATS
          ================================================= */}

      <section className="profile-stats-grid">


        {/* SOLVED */}

        <div className="profile-stat-card">

          <div className="profile-stat-icon">
            ✓
          </div>

          <div>

            <span className="profile-stat-label">
              Solved
            </span>

            <strong className="profile-stat-value">
              {profile.solved}
            </strong>

          </div>

        </div>


        {/* ATTEMPTING */}

        <div className="profile-stat-card">

          <div className="profile-stat-icon attempting">
            ◐
          </div>

          <div>

            <span className="profile-stat-label">
              Attempting
            </span>

            <strong className="profile-stat-value">
              {profile.attempting}
            </strong>

          </div>

        </div>


        {/* EASY */}

        <div className="profile-stat-card">

          <div className="profile-stat-icon easy-icon">
            E
          </div>

          <div>

            <span className="profile-stat-label">
              Easy
            </span>

            <strong className="profile-stat-value">
              {profile.easy}
            </strong>

          </div>

        </div>


        {/* MEDIUM */}

        <div className="profile-stat-card">

          <div className="profile-stat-icon medium-icon">
            M
          </div>

          <div>

            <span className="profile-stat-label">
              Medium
            </span>

            <strong className="profile-stat-value">
              {profile.medium}
            </strong>

          </div>

        </div>


        {/* HARD */}

        <div className="profile-stat-card">

          <div className="profile-stat-icon hard-icon">
            H
          </div>

          <div>

            <span className="profile-stat-label">
              Hard
            </span>

            <strong className="profile-stat-value">
              {profile.hard}
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          PROFILE CONTENT
          ================================================= */}

      <section className="profile-content-grid">


        {/* =================================================
            LEFT COLUMN
            ================================================= */}

        <div className="profile-left-column">


          {/* =================================================
              PROBLEM SOLVING
              ================================================= */}

          <div className="profile-section-card">

            <div className="profile-section-header">

              <div>

                <h2>
                  Problem Solving
                </h2>

                <p>
                  Your problem solving progress
                </p>

              </div>

            </div>


            <div className="solving-summary">


              {/* =================================================
                  DONUT CHART
                  ================================================= */}

              <div
                className="solved-donut"
                style={{
                  "--easy": `${easyPercentage}%`,
                  "--medium": `${mediumEnd}%`
                }}
              >

                <div className="solved-donut-inner">

                  <strong>
                    {solved}
                  </strong>

                  <span>
                    Solved
                  </span>

                </div>

              </div>


              {/* =================================================
                  DIFFICULTY LEGEND
                  ================================================= */}

              <div className="difficulty-summary">


                {/* EASY */}

                <div className="difficulty-item">

                  <div className="difficulty-item-left">

                    <span className="difficulty-dot easy-dot"></span>

                    <span className="difficulty-name">
                      Easy
                    </span>

                  </div>

                  <strong className="difficulty-count easy-count">
                    {easy}
                  </strong>

                </div>


                {/* MEDIUM */}

                <div className="difficulty-item">

                  <div className="difficulty-item-left">

                    <span className="difficulty-dot medium-dot"></span>

                    <span className="difficulty-name">
                      Medium
                    </span>

                  </div>

                  <strong className="difficulty-count medium-count">
                    {medium}
                  </strong>

                </div>


                {/* HARD */}

                <div className="difficulty-item">

                  <div className="difficulty-item-left">

                    <span className="difficulty-dot hard-dot"></span>

                    <span className="difficulty-name">
                      Hard
                    </span>

                  </div>

                  <strong className="difficulty-count hard-count">
                    {hard}
                  </strong>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              BADGES
              ================================================= */}

          <div className="profile-section-card">

            <div className="profile-section-header">

              <div>

                <h2>
                  Badges
                </h2>

                <p>
                  Achievements you've earned
                </p>

              </div>

            </div>


            <div className="badges-grid">


              {/* FIRST SOLVE */}

              {profile.solved >= 1 && (

                <div className="badge-card">

                  <div className="badge-icon">
                    🏆
                  </div>

                  <div>

                    <strong>
                      First Solve
                    </strong>

                    <span>
                      Solved your first problem
                    </span>

                  </div>

                </div>

              )}


              {/* PROBLEM SOLVER */}

              {profile.solved >= 5 && (

                <div className="badge-card">

                  <div className="badge-icon">
                    ⭐
                  </div>

                  <div>

                    <strong>
                      Problem Solver
                    </strong>

                    <span>
                      Solved 5 problems
                    </span>

                  </div>

                </div>

              )}


              {/* PERSISTENT CODER */}

              {profile.totalSubmissions >= 10 && (

                <div className="badge-card">

                  <div className="badge-icon">
                    🚀
                  </div>

                  <div>

                    <strong>
                      Persistent Coder
                    </strong>

                    <span>
                      Made 10 submissions
                    </span>

                  </div>

                </div>

              )}


              {/* NO BADGES */}

              {profile.solved === 0 && (

                <div className="no-badges">

                  <span>
                    🏅
                  </span>

                  <p>
                    Solve your first problem
                    to earn a badge.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>


        {/* =================================================
            RIGHT COLUMN
            ================================================= */}

        <div className="profile-right-column">


          {/* =================================================
              SUBMISSION ACTIVITY
              ================================================= */}

          <div className="profile-section-card">

            <div className="profile-section-header">

              <div>

                <h2>
                  Submission Activity
                </h2>

                <p>
                  Your coding activity
                </p>

              </div>

            </div>


            <div className="submission-activity">

              <div className="activity-number">

                <strong>
                  {profile.totalSubmissions}
                </strong>

                <span>
                  submissions
                </span>

              </div>


              <div className="activity-message">

                <span className="activity-dot"></span>

                <p>
                  Keep solving problems
                  and building your streak!
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              RECENT SUBMISSIONS
              ================================================= */}

          <div className="profile-section-card">

            <div className="profile-section-header">

              <div>

                <h2>
                  Recent Submissions
                </h2>

                <p>
                  Your latest coding attempts
                </p>

              </div>


              <Link
                to="/submissions"
                className="view-all-link"
              >
                View all
              </Link>

            </div>


            <div className="profile-submissions">

              {profile.recentSubmissions.length === 0 ? (

                <div className="no-submissions">

                  <p>
                    No submissions yet.
                  </p>

                  <Link
                    to="/"
                    className="profile-action-button"
                  >
                    Solve a Problem
                  </Link>

                </div>

              ) : (

                profile.recentSubmissions.map(
                  submission => (

                    <Link
                      key={submission.id}
                      to={`/submissions/${submission.id}`}
                      className="profile-submission-row"
                    >

                      <div className="submission-problem-info">

                        <strong>
                          Problem #{submission.problemId}
                        </strong>

                        <span>
                          Submission #{submission.id}
                          {" • "}
                          {submission.language.toUpperCase()}
                        </span>

                      </div>


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

                    </Link>

                  )
                )

              )}

            </div>

          </div>

        </div>

      </section>

    </main>
  )
}

export default Profile