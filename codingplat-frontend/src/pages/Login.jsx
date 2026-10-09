import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)


  // =========================
  // Handle Login
  // =========================

  const handleLogin = async (event) => {

    event.preventDefault()

    setLoading(true)

    try {

      const response = await fetch(
        "http://localhost:8080/api/users/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: email,
            password: password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {

        alert(
          data.message ||
          "Login failed"
        )

        return
      }


      // =========================
      // Store JWT
      // =========================

      localStorage.setItem(
        "token",
        data.token
      )


      // =========================
      // Store User Information
      // =========================

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email
        })
      )


      // =========================
      // Notify Navbar
      // =========================
      //
      // Navbar listens for this event
      // and reloads the logged-in user.
      //

      window.dispatchEvent(
        new Event("authChanged")
      )


      alert("Login successful!")


      // Go to Problems page

      navigate("/")

    } catch (error) {

      console.error(
        "Login error:",
        error
      )

      alert(
        "Unable to connect to server"
      )

    } finally {

      setLoading(false)

    }
  }


  return (

    <main className="auth-page">

      <div className="auth-card">

        <h1>
          Welcome Back
        </h1>

        <p className="auth-subtitle">
          Login to continue solving problems.
        </p>


        <form onSubmit={handleLogin}>

          {/* Email */}

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
            />

          </div>


          {/* Password */}

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
            />

          </div>


          {/* Login Button */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"
            }

          </button>

        </form>


        <p className="auth-footer">

          Don't have an account?{" "}

          <button
            type="button"
            className="auth-link"
            onClick={() =>
              navigate("/register")
            }
          >
            Register
          </button>

        </p>

      </div>

    </main>

  )
}

export default Login