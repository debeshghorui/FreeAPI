import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = '/api/v1/users'

const registerDefaults = {
  email: '',
  password: '',
  role: 'ADMIN',
  username: '',
}

const loginDefaults = {
  password: '',
  username: '',
}

function parseApiError(payload, fallbackMessage) {
  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message
  }

  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const firstError = payload.errors[0]
    if (typeof firstError === 'string' && firstError.trim()) {
      return firstError
    }

    if (
      typeof firstError?.message === 'string' &&
      firstError.message.trim()
    ) {
      return firstError.message
    }
  }

  return fallbackMessage
}

function extractUser(payload) {
  const options = [
    payload?.data?.user,
    payload?.data?.currentUser,
    payload?.data?.loggedInUser,
    payload?.data,
    payload?.user,
    payload?.currentUser,
    payload,
  ]

  return (
    options.find(
      (item) =>
        item &&
        typeof item === 'object' &&
        (item.username || item.email || item.id || item._id),
    ) ?? null
  )
}

function App() {
  const [activeView, setActiveView] = useState('login')
  const [registerForm, setRegisterForm] = useState(registerDefaults)
  const [loginForm, setLoginForm] = useState(loginDefaults)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [feedback, setFeedback] = useState({ type: 'idle', message: '' })
  const [isBooting, setIsBooting] = useState(true)
  const [loading, setLoading] = useState({
    currentUser: false,
    login: false,
    logout: false,
    register: false,
  })

  const setLoadingState = (key, value) => {
    setLoading((previous) => ({ ...previous, [key]: value }))
  }

  const sendFeedback = (type, message) => {
    setFeedback({ type, message })
  }

  const clearFeedback = () => {
    setFeedback({ type: 'idle', message: '' })
  }

  const request = async (path, { method = 'GET', body } = {}) => {
    let response

    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        method,
      })
    } catch {
      throw new Error(
        'Network request failed. Make sure the Vite dev server is running and retry.',
      )
    }

    const responseText = await response.text()
    let payload = {}

    if (responseText) {
      try {
        payload = JSON.parse(responseText)
      } catch {
        payload = { message: responseText }
      }
    }

    if (!response.ok || payload?.success === false) {
      throw new Error(
        parseApiError(payload, `Request failed with status ${response.status}`),
      )
    }

    return payload
  }

  const loadCurrentUser = async ({ withFeedback = false } = {}) => {
    setLoadingState('currentUser', true)

    try {
      const payload = await request('/current-user')
      const user = extractUser(payload)
      setCurrentUser(user)

      if (withFeedback && user) {
        sendFeedback('success', 'Current user details loaded.')
      }

      return user
    } catch (error) {
      setCurrentUser(null)

      if (withFeedback) {
        sendFeedback('error', error.message)
      }

      return null
    } finally {
      setLoadingState('currentUser', false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      try {
        const payload = await request('/current-user')
        const user = extractUser(payload)
        if (isMounted) {
          setCurrentUser(user)
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null)
        }
      } finally {
        if (isMounted) {
          setIsBooting(false)
        }
      }
    }

    bootstrap()

    return () => {
      isMounted = false
    }
  }, [])

  const handleRegisterChange = (event) => {
    const { name, value } = event.target
    setRegisterForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    clearFeedback()
    setLoadingState('register', true)

    try {
      await request('/register', {
        body: registerForm,
        method: 'POST',
      })

      const user = await loadCurrentUser()
      if (user) {
        sendFeedback('success', 'Account created and session started.')
      } else {
        sendFeedback(
          'success',
          'Registration successful. You can now sign in with your credentials.',
        )
        setActiveView('login')
      }

      setRegisterForm(registerDefaults)
    } catch (error) {
      sendFeedback('error', error.message)
    } finally {
      setLoadingState('register', false)
    }
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    clearFeedback()
    setLoadingState('login', true)

    try {
      await request('/login', {
        body: loginForm,
        method: 'POST',
      })

      await loadCurrentUser()
      sendFeedback('success', 'Login successful. Welcome back.')
      setLoginForm(loginDefaults)
    } catch (error) {
      sendFeedback('error', error.message)
    } finally {
      setLoadingState('login', false)
    }
  }

  const handleLogout = async () => {
    clearFeedback()
    setLoadingState('logout', true)

    try {
      await request('/logout', { method: 'POST' })
      setCurrentUser(null)
      sendFeedback('success', 'You have been logged out.')
    } catch (error) {
      sendFeedback('error', error.message)
    } finally {
      setLoadingState('logout', false)
    }
  }

  return (
    <main className="auth-app">
      <div className="atmosphere" aria-hidden="true"></div>

      <header className="hero-block">
        <p className="kicker">FreeAPI Authentication Project</p>
        <h1>Cookie Session Control Room</h1>
        <p className="hero-copy">
          Register, login, logout, and inspect the current authenticated user in
          a single frontend flow.
        </p>
      </header>

      {feedback.message ? (
        <p
          className={`feedback feedback--${feedback.type}`}
          role="status"
          aria-live="polite"
        >
          {feedback.message}
        </p>
      ) : null}

      <section className="workspace">
        <article className="panel form-panel">
          <div className="toggle-row" role="tablist" aria-label="Auth actions">
            <button
              className={activeView === 'login' ? 'tab is-active' : 'tab'}
              onClick={() => setActiveView('login')}
              role="tab"
              aria-selected={activeView === 'login'}
              type="button"
            >
              Login
            </button>
            <button
              className={activeView === 'register' ? 'tab is-active' : 'tab'}
              onClick={() => setActiveView('register')}
              role="tab"
              aria-selected={activeView === 'register'}
              type="button"
            >
              Register
            </button>
          </div>

          <div className="form-area">
            {activeView === 'login' ? (
              <form className="auth-form" onSubmit={handleLoginSubmit}>
                <h2>Sign In</h2>
                <label>
                  Username
                  <input
                    autoComplete="username"
                    name="username"
                    onChange={handleLoginChange}
                    placeholder="doejohn"
                    required
                    value={loginForm.username}
                  />
                </label>
                <label>
                  Password
                  <div className="password-field">
                    <input
                      autoComplete="current-password"
                      name="password"
                      onChange={handleLoginChange}
                      placeholder="test@123"
                      required
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginForm.password}
                    />
                    <button
                      aria-label={
                        showLoginPassword
                          ? 'Hide login password'
                          : 'Show login password'
                      }
                      className="password-toggle"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      type="button"
                    >
                      {showLoginPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>
                <button
                  className="action-btn"
                  disabled={loading.login}
                  type="submit"
                >
                  {loading.login ? 'Signing in...' : 'Login User'}
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRegisterSubmit}>
                <h2>Create Account</h2>
                <label>
                  Email
                  <input
                    autoComplete="email"
                    name="email"
                    onChange={handleRegisterChange}
                    placeholder="user.email@domain.com"
                    required
                    type="email"
                    value={registerForm.email}
                  />
                </label>
                <label>
                  Username
                  <input
                    autoComplete="username"
                    name="username"
                    onChange={handleRegisterChange}
                    placeholder="doejohn"
                    required
                    value={registerForm.username}
                  />
                </label>
                <label>
                  Password
                  <div className="password-field">
                    <input
                      autoComplete="new-password"
                      name="password"
                      onChange={handleRegisterChange}
                      placeholder="test@123"
                      required
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={registerForm.password}
                    />
                    <button
                      aria-label={
                        showRegisterPassword
                          ? 'Hide register password'
                          : 'Show register password'
                      }
                      className="password-toggle"
                      onClick={() => setShowRegisterPassword((prev) => !prev)}
                      type="button"
                    >
                      {showRegisterPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>
                <label>
                  Role
                  <select
                    name="role"
                    onChange={handleRegisterChange}
                    value={registerForm.role}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                  </select>
                </label>
                <button
                  className="action-btn"
                  disabled={loading.register}
                  type="submit"
                >
                  {loading.register ? 'Creating account...' : 'Register User'}
                </button>
              </form>
            )}
          </div>
        </article>

        <article className="panel profile-panel">
          <div className="profile-header">
            <h2>Current User</h2>
            <span className={currentUser ? 'status-dot online' : 'status-dot'}>
              {currentUser ? 'Session Active' : 'No Session'}
            </span>
          </div>

          {isBooting ? (
            <p className="profile-empty">Checking active session...</p>
          ) : currentUser ? (
            <dl className="profile-details">
              <div>
                <dt>Username</dt>
                <dd>{currentUser.username ?? 'N/A'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{currentUser.email ?? 'N/A'}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{currentUser.role ?? 'N/A'}</dd>
              </div>
              <div>
                <dt>User ID</dt>
                <dd>{currentUser._id ?? currentUser.id ?? 'N/A'}</dd>
              </div>
            </dl>
          ) : (
            <p className="profile-empty">
              Login first to view profile data from
              <code>/users/current-user</code>.
            </p>
          )}

          <div className="profile-actions">
            <button
              className="secondary-btn"
              disabled={loading.currentUser || isBooting}
              onClick={() => loadCurrentUser({ withFeedback: true })}
              type="button"
            >
              {loading.currentUser ? 'Refreshing...' : 'Get Current User'}
            </button>

            <button
              className="danger-btn"
              disabled={loading.logout || !currentUser}
              onClick={handleLogout}
              type="button"
            >
              {loading.logout ? 'Logging out...' : 'Logout User'}
            </button>
          </div>
        </article>
      </section>
    </main>
  )
}

export default App
