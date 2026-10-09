import { useEffect, useState, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate
} from "react-router-dom";

import ProblemDetails from "./pages/ProblemDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Submissions from "./pages/Submissions";
import SubmissionDetails from "./pages/SubmissionDetails";
import Profile from "./pages/Profile";

/* =========================================================
   Protected Route
   ========================================================= */

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================================================
   Problems Page
   ========================================================= */

function Problems() {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Fetch Problems */

  const fetchProblems = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8080/api/problems"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch problems");
      }

      const data = await response.json();
      setProblems(data);
    } catch (error) {
      console.error("Error fetching problems:", error);
      setError("Unable to load problems. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Fetch Solved Problems */

  const fetchSolvedProblems = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setSolvedProblems(new Set());
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/submissions/solved-problems",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        setSolvedProblems(new Set());
        return;
      }

      const data = await response.json();
      setSolvedProblems(new Set(data));
    } catch (error) {
      console.error("Error fetching solved problems:", error);
      setSolvedProblems(new Set());
    }
  };

  /* Initial Fetch */

  useEffect(() => {
    fetchProblems();
    fetchSolvedProblems();
  }, []);

  /* Refresh Solved Problems */

  useEffect(() => {
    const handleFocus = () => {
      fetchSolvedProblems();
    };

    const handleAuthChanged = () => {
      fetchSolvedProblems();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("authChanged", handleAuthChanged);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(
        "authChanged",
        handleAuthChanged
      );
    };
  }, []);

  /* Extract All Tags */

  const allTags = [
    ...new Set(
      problems.flatMap((problem) => {
        if (!problem.tags) {
          return [];
        }

        return problem.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      })
    )
  ].sort();

  /* Filter Problems */

  const filteredProblems = problems.filter((problem) => {
    const title = problem.title?.toLowerCase() || "";
    const tags = problem.tags?.toLowerCase() || "";
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      title.includes(searchText) ||
      tags.includes(searchText);

    const matchesDifficulty =
      difficulty === "ALL" ||
      problem.difficulty === difficulty;

    const problemTags = problem.tags
      ? problem.tags
          .split(",")
          .map((tag) => tag.trim())
      : [];

    const matchesTag =
      selectedTag === "ALL" ||
      problemTags.includes(selectedTag);

    return (
      matchesSearch &&
      matchesDifficulty &&
      matchesTag
    );
  });

  /* Reset Filters */

  const resetFilters = () => {
    setSearch("");
    setDifficulty("ALL");
    setSelectedTag("ALL");
  };

  /* Loading */

  if (loading) {
    return (
      <main className="main problems-page">
        <div className="page-state">
          <div className="loading-spinner" />
          <p>Loading problems...</p>
        </div>
      </main>
    );
  }

  /* Error */

  if (error) {
    return (
      <main className="main problems-page">
        <div className="page-state error-state">
          <div className="page-state-icon">⚠️</div>

          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button
            className="reset-filters-button"
            onClick={fetchProblems}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  /* Render Problems */

  return (
    <main className="main problems-page">
      <div className="problems-header">
        <div>
          <h1 className="page-title">Problems</h1>

          <p className="problems-subtitle">
            Solve coding problems and improve your skills
          </p>
        </div>

        <div className="problem-count">
          {filteredProblems.length} problem
          {filteredProblems.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Search and Difficulty Filters */}

      <div className="problem-filters">
        <div className="problem-search">
          <span
            className="search-icon"
            aria-hidden="true"
          >
            🔍
          </span>

          <input
            type="text"
            placeholder="Search problems or tags..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            aria-label="Search problems or tags"
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div
          className="difficulty-filters"
          role="group"
          aria-label="Filter by difficulty"
        >
          {["ALL", "EASY", "MEDIUM", "HARD"].map(
            (filter) => (
              <button
                key={filter}
                className={`difficulty-filter ${
                  difficulty === filter ? "active" : ""
                }`}
                onClick={() => setDifficulty(filter)}
              >
                {filter === "ALL"
                  ? "All"
                  : filter.charAt(0) +
                    filter.slice(1).toLowerCase()}
              </button>
            )
          )}
        </div>
      </div>

      {/* Tag Filters */}

      <div className="tag-filters">
        <button
          className={`tag-filter ${
            selectedTag === "ALL" ? "active" : ""
          }`}
          onClick={() => setSelectedTag("ALL")}
        >
          All Topics
        </button>

        {allTags.map((tag) => (
          <button
            key={tag}
            className={`tag-filter ${
              selectedTag === tag ? "active" : ""
            }`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Problem List */}

      <div className="problem-list">
        {filteredProblems.length === 0 ? (
          <div className="no-problems">
            <div className="no-problems-icon">🔍</div>

            <h2>No problems found</h2>

            <p>
              Try changing your search or filters.
            </p>

            <button
              className="reset-filters-button"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredProblems.map((problem) => {
            const problemTags = problem.tags
              ? problem.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              : [];

            const isSolved = solvedProblems.has(problem.id);

            return (
              <Link
                to={`/problems/${problem.id}`}
                key={problem.id}
                className="problem-card-link"
              >
                <article className="problem-card">
                  <div className="problem-card-left">
                    <div className="problem-number">
                      #{problem.id}
                    </div>

                    <div className="problem-card-content">
                      <div className="problem-title-row">
                        <h2 className="problem-title">
                          {problem.title}
                        </h2>

                        {isSolved && (
                          <span className="solved-badge">
                            ✓ Solved
                          </span>
                        )}
                      </div>

                      <p className="problem-description">
                        {problem.description}
                      </p>

                      {problemTags.length > 0 && (
                        <div className="problem-tags">
                          {problemTags.map((tag) => (
                            <span
                              key={tag}
                              className="problem-tag"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="problem-card-right">
                    <span
                      className={`difficulty ${
                        problem.difficulty?.toLowerCase()
                      }`}
                    >
                      {problem.difficulty}
                    </span>

                    <span
                      className="problem-arrow"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>
                </article>
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}

/* =========================================================
   Navbar
   ========================================================= */

function Navbar({ theme, setTheme }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  const profileRef = useRef(null);

  /* Load User */

  const loadUser = () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setUser(null);
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Invalid user data:", error);
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  /* Authentication Listeners */

  useEffect(() => {
    loadUser();

    window.addEventListener("storage", loadUser);
    window.addEventListener("authChanged", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("authChanged", loadUser);
    };
  }, []);

  /* Close Menu When Clicking Outside */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
        setAppearanceOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* Close Menu With Escape */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setAppearanceOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* Logout */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setProfileOpen(false);
    setAppearanceOpen(false);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/login", { replace: true });
  };

  /* Open Profile */

  const handleProfile = () => {
    setProfileOpen(false);
    setAppearanceOpen(false);
    navigate("/profile");
  };

  /* Change Appearance */

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setAppearanceOpen(false);
  };

  /* Render Navbar */

  return (
    <nav className="navbar">
      <Link
        to="/"
        className="logo"
        aria-label="CodingPlat Home"
      >
        CodingPlat
      </Link>

      <div className="nav-buttons">
        {user ? (
          <>
            <Link
              to="/submissions"
              className="nav-button"
            >
              My Submissions
            </Link>

            <div
              className="profile-container"
              ref={profileRef}
            >
              <button
                type="button"
                className="profile-button"
                onClick={() => {
                  setProfileOpen((previous) => !previous);
                  setAppearanceOpen(false);
                }}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                <span
                  className="profile-avatar"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4.42 3.58-8 8-8s8 3.58 8 8" />
                  </svg>
                </span>
              </button>

              {profileOpen && (
                <div
                  className="profile-dropdown"
                  role="menu"
                >
                  {/* User Information */}

                  <div className="profile-header">
                    <div
                      className="profile-avatar-large"
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21c0-4.42 3.58-8 8-8s8 3.58 8 8" />
                      </svg>
                    </div>

                    <div className="profile-user-info">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className="profile-divider" />

                  {/* Profile */}

                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={handleProfile}
                    role="menuitem"
                  >
                    <span aria-hidden="true">👤</span>
                    <span>Profile</span>
                  </button>

                  {/* My Submissions */}

                  <Link
                    to="/submissions"
                    className="profile-menu-item"
                    onClick={() => {
                      setProfileOpen(false);
                      setAppearanceOpen(false);
                    }}
                    role="menuitem"
                  >
                    <span aria-hidden="true">📋</span>
                    <span>My Submissions</span>
                  </Link>

                  {/* Appearance */}

                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() =>
                      setAppearanceOpen((previous) => !previous)
                    }
                    aria-expanded={appearanceOpen}
                    aria-controls="appearance-options"
                    role="menuitem"
                  >
                    <span aria-hidden="true">◐</span>
                    <span>Appearance</span>

                    <span className="appearance-current">
                      {theme === "dark" ? "Dark" : "Light"}
                    </span>

                    <span aria-hidden="true">
                      {appearanceOpen ? "⌃" : "›"}
                    </span>
                  </button>

                  {/* Appearance Options */}

                  {appearanceOpen && (
                    <div
                      className="appearance-options"
                      id="appearance-options"
                      aria-label="Choose appearance"
                    >
                      <button
                        type="button"
                        className={`appearance-option ${
                          theme === "light" ? "active" : ""
                        }`}
                        onClick={() =>
                          handleThemeChange("light")
                        }
                      >
                        <span aria-hidden="true">☀️</span>
                        <span>Light Mode</span>

                        {theme === "light" && (
                          <span aria-label="Selected">✓</span>
                        )}
                      </button>

                      <button
                        type="button"
                        className={`appearance-option ${
                          theme === "dark" ? "active" : ""
                        }`}
                        onClick={() =>
                          handleThemeChange("dark")
                        }
                      >
                        <span aria-hidden="true">🌙</span>
                        <span>Dark Mode</span>

                        {theme === "dark" && (
                          <span aria-label="Selected">✓</span>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="profile-divider" />

                  {/* Logout */}

                  <button
                    type="button"
                    className="profile-menu-item logout-item"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <span aria-hidden="true">↪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-button">
              Login
            </Link>

            <Link to="/register" className="nav-button">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

/* =========================================================
   App
   ========================================================= */

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("appTheme");

    return savedTheme === "dark" ? "dark" : "light";
  });

  /* Apply and Save Theme */

  useEffect(() => {
    localStorage.setItem("appTheme", theme);

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    window.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: theme
      })
    );
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="app" data-theme={theme}>
        <Navbar
          theme={theme}
          setTheme={setTheme}
        />

        <Routes>
          {/* Home / Problems */}

          <Route
            path="/"
            element={<Problems />}
          />

          {/* Problem Details */}

          <Route
            path="/problems/:id"
            element={<ProblemDetails />}
          />

          {/* Authentication */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* Protected Routes */}

          <Route
            path="/submissions"
            element={
              <ProtectedRoute>
                <Submissions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/submissions/:id"
            element={
              <ProtectedRoute>
                <SubmissionDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Unknown Route */}

          <Route
            path="*"
            element={
              <Navigate to="/" replace />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;