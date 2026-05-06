import { useCallback, useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://api.freeapi.app/api/v1/public/randomusers'

const formatDate = (isoDate) => {
  if (!isoDate) return 'Unknown'

  return new Date(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const fullName = (user) =>
  [user?.name?.title, user?.name?.first, user?.name?.last]
    .filter(Boolean)
    .join(' ')

const locationLabel = (user) =>
  [user?.location?.city, user?.location?.state, user?.location?.country]
    .filter(Boolean)
    .join(', ')

const getVisiblePages = (currentPage, totalPages, windowSize = 5) => {
  if (!totalPages) return []

  const safeWindow = Math.max(windowSize, 3)
  const halfWindow = Math.floor(safeWindow / 2)
  let start = Math.max(1, currentPage - halfWindow)
  let end = Math.min(totalPages, start + safeWindow - 1)

  start = Math.max(1, end - safeWindow + 1)

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

function App() {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 0,
    totalItems: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = useCallback(async (options = {}) => {
    const { mode = 'initial', signal, page } = options
    const backgroundFetch = mode === 'refresh' || mode === 'page'
    const randomPage = Math.floor(Math.random() * 50) + 1
    const targetPage = Number.isInteger(page) ? page : backgroundFetch ? randomPage : 1
    const endpoint = `${API_URL}?page=${targetPage}`

    if (backgroundFetch) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const response = await fetch(endpoint, { signal })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const payload = await response.json()
      const records = payload?.data?.data

      if (!Array.isArray(records)) {
        throw new Error('Unexpected response format from API.')
      }

      setUsers(records)
      setMeta({
        page: payload?.data?.page ?? 1,
        totalPages: payload?.data?.totalPages ?? 0,
        totalItems: payload?.data?.totalItems ?? 0,
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to load users right now.')
      }
    } finally {
      if (backgroundFetch) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timerId = setTimeout(() => {
      fetchUsers({ mode: 'initial', signal: controller.signal })
    }, 0)

    return () => {
      clearTimeout(timerId)
      controller.abort()
    }
  }, [fetchUsers])

  const visiblePages = getVisiblePages(meta.page, meta.totalPages)
  const firstVisiblePage = visiblePages[0]
  const lastVisiblePage = visiblePages[visiblePages.length - 1]

  const goToPage = (page) => {
    if (
      page < 1 ||
      page > meta.totalPages ||
      page === meta.page ||
      loading ||
      refreshing
    ) {
      return
    }

    fetchUsers({ mode: 'page', page })
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="hero-tag">FreeAPI Project</p>
        <h1>Random Users Directory</h1>
        <p className="hero-subtitle">
          Live profiles rendered from
          <code>https://api.freeapi.app/api/v1/public/randomusers</code>
        </p>
        <div className="hero-meta">
          <span>{meta.totalItems} total users</span>
          <span>
            Page {meta.page} of {meta.totalPages || '--'}
          </span>
        </div>
        <button
          type="button"
          className="refresh-btn"
          onClick={() => fetchUsers({ mode: 'refresh' })}
          disabled={refreshing || loading}
        >
          {refreshing ? 'Refreshing...' : 'Load Random Page'}
        </button>
      </header>

      {loading && <p className="status-message">Loading random users...</p>}

      {!loading && error && (
        <p className="status-message status-error">
          {error}
          <button
            type="button"
            onClick={() => fetchUsers({ mode: 'initial', page: meta.page || 1 })}
          >
            Retry
          </button>
        </p>
      )}

      {!loading && !error && (
        <>
          <section className="users-grid" aria-live="polite">
            {users.map((user, index) => (
              <article className="user-card" key={user?.login?.uuid || user?.id}>
                <div className="card-head">
                  <img
                    src={user?.picture?.large}
                    alt={fullName(user)}
                    loading="lazy"
                  />
                  <div>
                    <p className="card-name">{fullName(user)}</p>
                    <p className="card-handle">@{user?.login?.username}</p>
                  </div>
                </div>

                <dl className="card-details">
                  <div>
                    <dt>Email</dt>
                    <dd>{user?.email}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{locationLabel(user)}</dd>
                  </div>
                  <div>
                    <dt>Age</dt>
                    <dd>{user?.dob?.age} years</dd>
                  </div>
                  <div>
                    <dt>Registered</dt>
                    <dd>{formatDate(user?.registered?.date)}</dd>
                  </div>
                </dl>

                <div className="card-foot">
                  <span>{user?.gender}</span>
                  <span>{user?.nat}</span>
                  <span>#{String(index + 1).padStart(2, '0')}</span>
                </div>
              </article>
            ))}
          </section>

          {meta.totalPages > 1 && (
            <nav className="pagination" aria-label="Page navigation">
              <button
                type="button"
                className="page-btn"
                onClick={() => goToPage(meta.page - 1)}
                disabled={meta.page <= 1 || refreshing}
              >
                Previous
              </button>

              {firstVisiblePage > 1 && (
                <>
                  <button
                    type="button"
                    className="page-btn"
                    onClick={() => goToPage(1)}
                    disabled={refreshing}
                  >
                    1
                  </button>
                  {firstVisiblePage > 2 && <span className="pagination-gap">...</span>}
                </>
              )}

              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`page-btn ${pageNumber === meta.page ? 'is-active' : ''}`}
                  onClick={() => goToPage(pageNumber)}
                  aria-current={pageNumber === meta.page ? 'page' : undefined}
                  disabled={refreshing}
                >
                  {pageNumber}
                </button>
              ))}

              {lastVisiblePage < meta.totalPages && (
                <>
                  {lastVisiblePage < meta.totalPages - 1 && (
                    <span className="pagination-gap">...</span>
                  )}
                  <button
                    type="button"
                    className="page-btn"
                    onClick={() => goToPage(meta.totalPages)}
                    disabled={refreshing}
                  >
                    {meta.totalPages}
                  </button>
                </>
              )}

              <button
                type="button"
                className="page-btn"
                onClick={() => goToPage(meta.page + 1)}
                disabled={meta.page >= meta.totalPages || refreshing}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  )
}

export default App
