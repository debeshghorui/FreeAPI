import { useState, useEffect, useCallback } from 'react'
import './App.css'

const API_URL = 'https://api.freeapi.app/api/v1/public/cats/cat/random'

const StatBar = ({ label, value, max = 5 }) => (
  <div className="stat-bar-row">
    <span className="stat-label">{label}</span>
    <div className="stat-bar-track">
      <div
        className="stat-bar-fill"
        style={{ '--fill-pct': `${(value / max) * 100}%` }}
      />
    </div>
    <span className="stat-value">{value}/{max}</span>
  </div>
)

const TagBadge = ({ children }) => (
  <span className="tag-badge">{children}</span>
)

function App() {
  const [cat, setCat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [fetchCount, setFetchCount] = useState(0)

  const fetchCat = useCallback(async () => {
    setLoading(true)
    setError(null)
    setImgLoaded(false)

    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setCat(json.data)
      setFetchCount(prev => prev + 1)
    } catch (err) {
      setError('Failed to fetch a cat. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCat()
  }, [fetchCat])

  const temperamentTags = cat?.temperament
    ? cat.temperament.split(',').map(t => t.trim())
    : []

  return (
    <div className="app-wrapper">
      {/* Animated background blobs */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-badge">
            <span className="paw-icon">🐾</span>
            <span>FreeAPI</span>
          </div>
          <h1 className="app-title">Random Cat Viewer</h1>
          <p className="app-subtitle">Discover a new feline friend with every click</p>
          {fetchCount > 0 && (
            <div className="fetch-counter">
              <span className="counter-dot" />
              {fetchCount} cat{fetchCount !== 1 ? 's' : ''} discovered
            </div>
          )}
        </header>

        {/* Main Card */}
        <main className="card" aria-live="polite">
          {error && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
            </div>
          )}

          {!error && (
            <div className="card-inner">
              {/* Image Section */}
              <div className="image-section">
                <div className={`image-frame ${loading ? 'loading' : ''} ${imgLoaded ? 'loaded' : ''}`}>
                  {loading && (
                    <div className="skeleton-pulse">
                      <div className="paw-spinner">🐱</div>
                    </div>
                  )}
                  {cat?.image && !loading && (
                    <img
                      key={cat.image}
                      src={cat.image}
                      alt={`A ${cat.name} cat`}
                      className={`cat-image ${imgLoaded ? 'visible' : 'hidden'}`}
                      onLoad={() => setImgLoaded(true)}
                    />
                  )}
                  {cat && !loading && !imgLoaded && (
                    <div className="skeleton-pulse">
                      <div className="paw-spinner">🐱</div>
                    </div>
                  )}
                </div>

                {/* Breed name overlay */}
                {cat && !loading && (
                  <div className="breed-overlay">
                    <span className="breed-flag">{cat.country_code}</span>
                    <span className="breed-name">{cat.name}</span>
                  </div>
                )}
              </div>

              {/* Info Section */}
              {cat && !loading && (
                <div className="info-section">
                  <div className="info-top">
                    <div className="info-row">
                      <InfoChip icon="🌍" label="Origin" value={cat.origin} />
                      <InfoChip icon="⚖️" label="Weight" value={`${cat.weight?.metric} kg`} />
                      <InfoChip icon="🎂" label="Lifespan" value={`${cat.life_span} yrs`} />
                    </div>

                    {cat.description && (
                      <p className="cat-description">{cat.description}</p>
                    )}

                    {temperamentTags.length > 0 && (
                      <div className="temperament-section">
                        <h3 className="section-heading">Temperament</h3>
                        <div className="tags-row">
                          {temperamentTags.map(tag => (
                            <TagBadge key={tag}>{tag}</TagBadge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="stats-section">
                    <h3 className="section-heading">Personality Stats</h3>
                    <div className="stats-grid">
                      <StatBar label="Affection" value={cat.affection_level} />
                      <StatBar label="Intelligence" value={cat.intelligence} />
                      <StatBar label="Energy" value={cat.energy_level} />
                      <StatBar label="Child Friendly" value={cat.child_friendly} />
                      <StatBar label="Dog Friendly" value={cat.dog_friendly} />
                      <StatBar label="Social Needs" value={cat.social_needs} />
                    </div>
                  </div>

                  <div className="links-row">
                    {cat.wikipedia_url && (
                      <a
                        href={cat.wikipedia_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-btn wiki-btn"
                        id="wikipedia-link"
                      >
                        <span>📖</span> Wikipedia
                      </a>
                    )}
                    {cat.vcahospitals_url && (
                      <a
                        href={cat.vcahospitals_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-btn vet-btn"
                        id="vet-link"
                      >
                        <span>🏥</span> Vet Info
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Loading skeleton info */}
              {loading && (
                <div className="info-section skeleton-info">
                  <div className="skeleton-line wide" />
                  <div className="skeleton-line medium" />
                  <div className="skeleton-line narrow" />
                  <div className="skeleton-line wide" />
                  <div className="skeleton-line medium" />
                </div>
              )}
            </div>
          )}
        </main>

        {/* CTA Button */}
        <div className="cta-section">
          <button
            id="fetch-cat-btn"
            className={`fetch-btn ${loading ? 'btn-loading' : ''}`}
            onClick={fetchCat}
            disabled={loading}
            aria-label="Fetch a new random cat"
          >
            <span className="btn-icon">{loading ? '⏳' : '🐾'}</span>
            <span>{loading ? 'Fetching...' : 'New Random Cat'}</span>
            <span className="btn-shimmer" />
          </button>
        </div>

        <footer className="app-footer">
          Powered by <a href="https://freeapi.app" target="_blank" rel="noopener noreferrer">FreeAPI.app</a>
          {' '}& <a href="https://thecatapi.com" target="_blank" rel="noopener noreferrer">TheCatAPI</a>
        </footer>
      </div>
    </div>
  )
}

const InfoChip = ({ icon, label, value }) => (
  <div className="info-chip">
    <span className="chip-icon">{icon}</span>
    <div>
      <div className="chip-label">{label}</div>
      <div className="chip-value">{value || '—'}</div>
    </div>
  </div>
)

export default App
