import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_ENDPOINT = 'https://api.freeapi.app/api/v1/public/quotes'
const PAGE_LIMIT = 12

const getRandomQuote = (items) =>
  items[Math.floor(Math.random() * items.length)]

function App() {
  const [quotes, setQuotes] = useState([])
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [featuredQuoteId, setFeaturedQuoteId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
  })

  useEffect(() => {
    const controller = new AbortController()

    const fetchQuotes = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetch(
          `${API_ENDPOINT}?page=${page}&limit=${PAGE_LIMIT}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload = await response.json()
        const apiData = payload?.data ?? {}
        const incomingQuotes = Array.isArray(apiData?.data) ? apiData.data : []

        setQuotes(incomingQuotes)
        setMeta({
          page: Number(apiData?.page) || page,
          totalPages: Number(apiData?.totalPages) || 1,
          totalItems: Number(apiData?.totalItems) || incomingQuotes.length,
        })

        setFeaturedQuoteId((currentId) => {
          if (incomingQuotes.length === 0) {
            return null
          }

          if (currentId && incomingQuotes.some((quote) => quote.id === currentId)) {
            return currentId
          }

          return incomingQuotes[0].id
        })
      } catch (requestError) {
        if (requestError.name === 'AbortError') {
          return
        }

        setError('Unable to load quotes right now. Please try again.')
        setQuotes([])
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchQuotes()

    return () => {
      controller.abort()
    }
  }, [page, refreshKey])

  const filteredQuotes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return quotes
    }

    return quotes.filter((quote) => {
      const tagContent = Array.isArray(quote.tags)
        ? quote.tags.join(' ').toLowerCase()
        : ''

      return (
        quote.content.toLowerCase().includes(query) ||
        quote.author.toLowerCase().includes(query) ||
        tagContent.includes(query)
      )
    })
  }, [quotes, searchTerm])

  const featuredQuote =
    filteredQuotes.find((quote) => quote.id === featuredQuoteId) ??
    filteredQuotes[0] ??
    null

  const handleSurpriseMe = () => {
    if (filteredQuotes.length === 0) {
      return
    }

    setFeaturedQuoteId(getRandomQuote(filteredQuotes).id)
  }

  const handleRetry = () => {
    setRefreshKey((current) => current + 1)
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">FreeAPI Reading Room</p>
        <h1>Quotes for deep work, fresh starts, and better days</h1>
        <p className="hero-copy">
          Browse handpicked words from the public Quotes API. Search by author,
          topic, or phrase, then pin a quote to your spotlight.
        </p>
      </section>

      <section className="control-panel" aria-label="Quote controls">
        <label className="search-block" htmlFor="search">
          <span>Search by author, tag, or phrase</span>
          <input
            id="search"
            name="search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Try: inspirational, work, or Thomas Edison"
          />
        </label>
        <div className="button-row">
          <button
            type="button"
            onClick={handleSurpriseMe}
            disabled={filteredQuotes.length === 0}
          >
            Surprise Me
          </button>
          <button
            type="button"
            className="secondary"
            onClick={handleRetry}
            disabled={isLoading}
          >
            Refresh Page
          </button>
        </div>
      </section>

      <section className="featured-panel" aria-live="polite">
        <div className="featured-header">
          <p>Featured Quote</p>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
        </div>

        {isLoading ? (
          <p className="status-message">Loading a fresh set of quotes...</p>
        ) : featuredQuote ? (
          <>
            <blockquote>{featuredQuote.content}</blockquote>
            <p className="author">- {featuredQuote.author}</p>
            {featuredQuote.tags?.length > 0 && (
              <ul className="tag-list">
                {featuredQuote.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="status-message">
            No quote matches your search on this page.
          </p>
        )}
      </section>

      <section className="quotes-grid-panel" aria-live="polite">
        <div className="panel-heading">
          <h2>Quotes on this page</h2>
          <p>
            Showing {filteredQuotes.length} of {quotes.length} loaded (
            {meta.totalItems} total in API).
          </p>
        </div>

        {error ? (
          <div className="status-card error-card">
            <p>{error}</p>
            <button type="button" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <p className="status-card">Loading quotes...</p>
        ) : filteredQuotes.length === 0 ? (
          <p className="status-card">
            No matches found. Try a different keyword.
          </p>
        ) : (
          <ul className="quotes-grid">
            {filteredQuotes.map((quote) => (
              <li key={quote.id} className="quote-card">
                <button
                  type="button"
                  className="quote-select"
                  onClick={() => setFeaturedQuoteId(quote.id)}
                >
                  Spotlight
                </button>
                <p className="quote-text">{quote.content}</p>
                <p className="quote-author">- {quote.author}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav className="pagination" aria-label="Quote pages">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
          disabled={page === 1 || isLoading}
        >
          Previous
        </button>
        <p>Page {page}</p>
        <button
          type="button"
          onClick={() =>
            setPage((current) => Math.min(current + 1, meta.totalPages))
          }
          disabled={page >= meta.totalPages || isLoading}
        >
          Next
        </button>
      </nav>
    </main>
  )
}

export default App
