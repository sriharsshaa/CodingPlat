import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Register() {

  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)


  // =========================
  // Handle Registration
  // =========================

  const handleRegister = async (event) => {

    event.preventDefault()

    setLoading(true)

    try {

      const response = await fetch(
        "http://localhost:8080/api/users/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name: name,
            email: email,
            password: password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {

        alert(
          data.message ||
          "Registration failed"
        )

        return
      }

      alert("Registration successful!")

      navigate("/login")

    } catch (error) {

      console.error(
        "Registration error:",
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
          Create Account
        </h1>

        <p className="auth-subtitle">
          Join CodingPlat and start solving problems.
        </p>


        <form onSubmit={handleRegister}>

          {/* Name */}

          <div className="form-group">

            <label>
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your name"
              required
            />

          </div>


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
              placeholder="Create a password"
              required
            />

          </div>


          {/* Register Button */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "Creating Account..."
              : "Register"
            }

          </button>

        </form>


        <p className="auth-footer">

          Already have an account?{" "}

          <button
            type="button"
            className="auth-link"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

        </p>

      </div>

    </main>
  )
}

export default Register