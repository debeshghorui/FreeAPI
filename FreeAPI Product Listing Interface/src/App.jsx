import { useState, useEffect, useMemo, useCallback } from 'react'
import './App.css'

const API_BASE = 'https://api.freeapi.app/api/v1/public/randomproducts'

function getStars(rating) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  let s = '★'.repeat(full)
  if (half) s += '½'
  s += '☆'.repeat(5 - full - (half ? 1 : 0))
  return s
}

function getStockColor(stock) {
  if (stock > 80) return 'var(--success)'
  if (stock > 30) return 'var(--warning)'
  return 'var(--danger)'
}

function calcOriginalPrice(price, discount) {
  return (price / (1 - discount / 100)).toFixed(2)
}

/* ═══════════════════════════════════════════
   Skeleton Loader
   ═══════════════════════════════════════════ */
function SkeletonGrid() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-img" />
          <div className="skeleton-body">
            <div className="skeleton-line short" />
            <div className="skeleton-line medium" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Product Card
   ═══════════════════════════════════════════ */
function ProductCard({ product, index, onSelect }) {
  return (
    <article
      className="product-card"
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={() => onSelect(product)}
      id={`product-card-${product.id}`}
    >
      <div className="card-image-wrap">
        <img src={product.thumbnail} alt={product.title} loading="lazy" />
        <div className="badge-row">
          <span className="discount-badge">
            -{Math.round(product.discountPercentage)}%
          </span>
          <span className="category-badge">{product.category}</span>
        </div>
      </div>
      <div className="card-body">
        <div className="card-brand">{product.brand}</div>
        <h2 className="card-title">{product.title}</h2>
        <p className="card-desc">{product.description}</p>
        <div className="card-footer">
          <div className="price-block">
            <span className="price-current">${product.price}</span>
            <span className="price-original">
              ${calcOriginalPrice(product.price, product.discountPercentage)}
            </span>
          </div>
          <div className="rating-block">
            <span className="stars">{getStars(product.rating)}</span>
            <span className="rating-num">{product.rating}</span>
          </div>
        </div>
        <div className="stock-bar">
          <div className="stock-track">
            <div
              className="stock-fill"
              style={{
                width: `${Math.min(product.stock, 100)}%`,
                background: getStockColor(product.stock),
              }}
            />
          </div>
          <span className="stock-label">{product.stock} left</span>
        </div>
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════
   Product Modal
   ═══════════════════════════════════════════ */
function ProductModal({ product, onClose }) {
  const [imgIdx, setImgIdx] = useState(0)
  const images = product.images || [product.thumbnail]

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const prevImg = () => setImgIdx((i) => (i - 1 + images.length) % images.length)
  const nextImg = () => setImgIdx((i) => (i + 1) % images.length)

  return (
    <div className="modal-overlay" onClick={onClose} id="product-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        <div className="modal-gallery">
          <img src={images[imgIdx]} alt={product.title} />
          {images.length > 1 && (
            <>
              <button className="gallery-nav gallery-prev" onClick={prevImg} aria-label="Previous image">‹</button>
              <button className="gallery-nav gallery-next" onClick={nextImg} aria-label="Next image">›</button>
              <div className="gallery-dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={`gallery-dot ${i === imgIdx ? 'active' : ''}`}
                    onClick={() => setImgIdx(i)}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="modal-details">
          <div className="modal-brand">{product.brand}</div>
          <h1 className="modal-title">{product.title}</h1>
          <p className="modal-description">{product.description}</p>
          <div className="modal-meta">
            <div className="meta-item">
              <div className="meta-label">Price</div>
              <div className="meta-value price-val">${product.price}</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Discount</div>
              <div className="meta-value">{Math.round(product.discountPercentage)}%</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Rating</div>
              <div className="meta-value">⭐ {product.rating}</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">In Stock</div>
              <div className="meta-value">{product.stock}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Main App
   ═══════════════════════════════════════════ */
function App() {
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const fetchProducts = useCallback(async (p = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}?page=${p}&limit=10`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setAllProducts(json.data?.data || [])
      setTotalPages(json.data?.totalPages || 1)
      setPage(json.data?.page || p)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts(page) }, [page, fetchProducts])

  const categories = useMemo(() => {
    const cats = [...new Set(allProducts.map((p) => p.category))]
    return ['all', ...cats.sort()]
  }, [allProducts])

  const filtered = useMemo(() => {
    let items = [...allProducts]
    if (activeCategory !== 'all') {
      items = items.filter((p) => p.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }
    switch (sortBy) {
      case 'price-asc': items.sort((a, b) => a.price - b.price); break
      case 'price-desc': items.sort((a, b) => b.price - a.price); break
      case 'rating': items.sort((a, b) => b.rating - a.rating); break
      case 'discount': items.sort((a, b) => b.discountPercentage - a.discountPercentage); break
      default: break
    }
    return items
  }, [allProducts, activeCategory, search, sortBy])

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) {
      setPage(p)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* ── Header ── */}
      <header className="app-header" id="app-header">
        <div className="logo">
          <div className="logo-icon">S</div>
          <span className="logo-text">ShopVault</span>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-dot" />
            <span>API Connected</span>
          </div>
          <div className="stat-item">
            Page {page} of {totalPages}
          </div>
        </div>
      </header>

      {/* ── Toolbar ── */}
      <div className="toolbar" id="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products, brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-input"
          />
        </div>
        <div className="filter-chips" id="category-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          id="sort-select"
        >
          <option value="default">Sort by</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
          <option value="discount">Biggest Discount</option>
        </select>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <div className="error-container" id="error-state">
          <div className="error-icon">⚠️</div>
          <p className="error-msg">{error}</p>
          <button className="retry-btn" onClick={() => fetchProducts(page)}>
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" id="empty-state">
          <div className="empty-icon">📦</div>
          <p className="empty-text">No products found</p>
          <p className="empty-sub">Try adjusting your search or filters</p>
        </div>
      ) : (
        <main className="main-content" id="product-listing">
          <div className="results-bar">
            <div className="results-count">
              Showing <span>{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="product-grid">
            {filtered.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        </main>
      )}

      {/* ── Pagination ── */}
      {!loading && !error && totalPages > 1 && (
        <nav className="pagination" id="pagination">
          <button
            className="page-btn page-nav"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn ${p === page ? 'active' : ''}`}
              onClick={() => goToPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="page-btn page-nav"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next →
          </button>
        </nav>
      )}

      {/* ── Footer ── */}
      <footer className="app-footer" id="app-footer">
        Powered by{' '}
        <a href="https://freeapi.app" target="_blank" rel="noopener noreferrer">
          FreeAPI
        </a>{' '}
        · Built with React + Vite
      </footer>

      {/* ── Modal ── */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  )
}

export default App
