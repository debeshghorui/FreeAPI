import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://api.freeapi.app/api/v1/public/youtube/videos'
const DEFAULT_PAGE = 1

function buildApiUrl(page) {
  const url = new URL(API_URL)
  url.searchParams.set('page', String(page))
  return url.toString()
}

function formatCompactNumber(value) {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return '0'
  }

  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(numericValue)
}

function formatDuration(duration) {
  const match = duration?.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/)

  if (!match) {
    return '0:00'
  }

  const days = Number(match[1] || 0)
  const hours = Number(match[2] || 0) + days * 24
  const minutes = Number(match[3] || 0)
  const seconds = Number(match[4] || 0)

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatPublishedDate(dateValue) {
  if (!dateValue) {
    return 'Recently uploaded'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateValue))
}

function pickThumbnail(thumbnails = {}) {
  return (
    thumbnails.maxres?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    ''
  )
}

function trimText(text, limit) {
  if (!text) {
    return 'No description was provided for this video.'
  }

  const collapsedText = text.replace(/\s+/g, ' ').trim()

  if (collapsedText.length <= limit) {
    return collapsedText
  }

  return `${collapsedText.slice(0, limit).trim()}…`
}

function VideoCard({ video, featured = false }) {
  const { id, snippet = {}, contentDetails = {}, statistics = {} } = video
  const videoUrl = `https://www.youtube.com/watch?v=${id}`
  const thumbnailUrl = pickThumbnail(snippet.thumbnails)

  return (
    <article className={`video-card ${featured ? 'video-card--featured' : ''}`}>
      <a className="video-card__media" href={videoUrl} target="_blank" rel="noreferrer">
        <img src={thumbnailUrl} alt={snippet.title || 'YouTube video thumbnail'} loading="lazy" />
        <span className="video-card__duration">{formatDuration(contentDetails.duration)}</span>
      </a>

      <div className="video-card__body">
        <div className="video-card__meta">
          <span>{snippet.channelTitle || 'Unknown channel'}</span>
          <span>{formatPublishedDate(snippet.publishedAt)}</span>
        </div>

        <h3>
          <a href={videoUrl} target="_blank" rel="noreferrer">
            {snippet.title || 'Untitled video'}
          </a>
        </h3>

        <p>{trimText(snippet.description, featured ? 180 : 120)}</p>

        <div className="video-card__stats">
          <span>{formatCompactNumber(statistics.viewCount)} views</span>
          <span>{formatCompactNumber(statistics.likeCount)} likes</span>
          <span>{formatCompactNumber(statistics.commentCount)} comments</span>
        </div>
      </div>
    </article>
  )
}

function App() {
  const [videos, setVideos] = useState([])
  const [pageInfo, setPageInfo] = useState(null)
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadVideos() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(buildApiUrl(page), { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const result = await response.json()
        const apiData = result?.data || {}
        const items = Array.isArray(apiData.data) ? apiData.data : []

        setVideos(items.map((entry) => entry.items).filter(Boolean))
        setPageInfo(apiData)
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError('Unable to load videos right now. Please try again in a moment.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadVideos()

    return () => controller.abort()
  }, [page])

  const featuredVideo = videos[0]
  const queueVideos = videos.slice(1)
  const currentPage = pageInfo?.page ?? page
  const totalPages = pageInfo?.totalPages ?? 0
  const canGoPrevious = !loading && Boolean(pageInfo?.previousPage)
  const canGoNext = !loading && Boolean(pageInfo?.nextPage)
  const goToPreviousPage = () => {
    if (canGoPrevious) {
      setPage((currentPageNumber) => Math.max(DEFAULT_PAGE, currentPageNumber - 1))
    }
  }
  const goToNextPage = () => {
    if (canGoNext) {
      setPage((currentPageNumber) => currentPageNumber + 1)
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-panel__copy">
          <p className="eyebrow">FreeAPI / Web Dev Cohort 2026</p>
          <h1>YouTube-style browsing for the FreeAPI feed.</h1>
          <p className="hero-panel__summary">
            A cinematic listing interface built from the public videos endpoint. The layout spotlights
            thumbnails, publishing details, and quick metrics so the feed reads like a real browsing surface.
          </p>

          <div className="hero-panel__actions">
            <a href="#videos">Browse videos</a>
            <a href={API_URL} target="_blank" rel="noreferrer" className="hero-panel__link">
              Open API source
            </a>
          </div>
        </div>

        <div className="hero-panel__stats">
          <div>
            <span>Loaded</span>
            <strong>{loading ? '...' : formatCompactNumber(videos.length)}</strong>
          </div>
          <div>
            <span>Total items</span>
            <strong>{pageInfo ? formatCompactNumber(pageInfo.totalItems) : '...'}</strong>
          </div>
          <div>
            <span>Current page</span>
            <strong>{currentPage}</strong>
          </div>
          <div>
            <span>Total pages</span>
            <strong>{totalPages || '...'}</strong>
          </div>
        </div>
      </section>

      <section id="videos" className="content-area">
        {error ? <div className="notice notice--error">{error}</div> : null}

        {loading ? (
          <div className="loading-grid" aria-live="polite" aria-busy="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <article className="skeleton-card" key={index}>
                <div className="skeleton-card__media" />
                <div className="skeleton-card__body">
                  <span />
                  <span />
                  <span />
                </div>
              </article>
            ))}
          </div>
        ) : featuredVideo ? (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Spotlight</p>
                <h2>Featured upload</h2>
              </div>
              <p>
                One large card leads the feed, followed by a responsive grid for the remaining videos.
              </p>
            </div>

            <VideoCard video={featuredVideo} featured />

            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">Library</p>
                <h2>Latest videos</h2>
              </div>
              <p>{queueVideos.length} additional videos in the current API page.</p>
            </div>

            <div className="video-grid">
              {queueVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </>
        ) : (
          <div className="notice">No videos were returned by the API.</div>
        )}
      </section>

      <div className="pagination-controls" aria-label="Video page controls">
        <button type="button" className="pagination-controls__button" onClick={goToPreviousPage} disabled={!canGoPrevious}>
          Previous page
        </button>
        <div className="pagination-controls__status">
          <span>Page</span>
          <strong>
            {currentPage}
            {totalPages ? ` / ${totalPages}` : ''}
          </strong>
        </div>
        <button type="button" className="pagination-controls__button" onClick={goToNextPage} disabled={!canGoNext}>
          Next page
        </button>
      </div>

      <footer className="page-footer">
        <p>Built with React and the FreeAPI public YouTube videos endpoint.</p>
      </footer>
    </main>
  )
}

export default App
