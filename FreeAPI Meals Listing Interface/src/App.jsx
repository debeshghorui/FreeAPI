import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_ENDPOINT = 'https://api.freeapi.app/api/v1/public/meals'
const PAGE_SIZE = 12

function getInstructionPreview(text) {
  if (!text) return 'No preparation notes are available for this meal.'
  const condensed = text.replace(/\s+/g, ' ').trim()
  return condensed.length > 170 ? `${condensed.slice(0, 170)}...` : condensed
}

function getIngredientPreview(meal) {
  const ingredientList = []

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim()
    const measure = meal[`strMeasure${index}`]?.trim()

    if (!ingredient) continue

    ingredientList.push(measure ? `${measure} ${ingredient}`.trim() : ingredient)
  }

  return ingredientList.slice(0, 4)
}

function App() {
  const [meals, setMeals] = useState([])
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPageItems: 0,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    const abortController = new AbortController()

    async function loadMeals() {
      setIsLoading(true)
      setError('')

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        })

        const response = await fetch(`${API_ENDPOINT}?${params.toString()}`, {
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error('Could not fetch meals data')
        }

        const payload = await response.json()
        const apiData = payload?.data ?? {}
        const nextMeals = Array.isArray(apiData.data) ? apiData.data : []

        setMeals(nextMeals)
        setMeta({
          totalItems: apiData.totalItems ?? nextMeals.length,
          totalPages: apiData.totalPages ?? 1,
          currentPageItems: apiData.currentPageItems ?? nextMeals.length,
        })
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError('Could not load meals right now. Please try again.')
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadMeals()

    return () => abortController.abort()
  }, [page, refreshCount])

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      meals
        .map((meal) => meal.strCategory)
        .filter((category) => typeof category === 'string' && category.length > 0),
    )

    return ['All', ...uniqueCategories]
  }, [meals])

  const filteredMeals = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return meals.filter((meal) => {
      const inCategory =
        activeCategory === 'All' || meal.strCategory === activeCategory

      if (!inCategory) return false
      if (!query) return true

      return [meal.strMeal, meal.strCategory, meal.strArea, meal.strTags]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    })
  }, [activeCategory, meals, searchTerm])

  return (
    <main className="app-shell">
      <header className="hero-panel">
        <p className="hero-kicker">FreeAPI Meals Listing Interface</p>
        <h1>Discover recipes worth cooking tonight</h1>
        <p className="hero-copy">
          Browse global meals, filter by cuisine or category, and jump straight
          to detailed recipes.
        </p>
        <div className="stats-grid">
          <article className="stat-card">
            <span>Total Meals</span>
            <strong>{meta.totalItems.toLocaleString()}</strong>
          </article>
          <article className="stat-card">
            <span>Current Page</span>
            <strong>{page}</strong>
          </article>
          <article className="stat-card">
            <span>Loaded Items</span>
            <strong>{meta.currentPageItems}</strong>
          </article>
        </div>
      </header>

      <section className="filter-panel" aria-label="Meal filters">
        <label className="search-field" htmlFor="meal-search">
          <span>Search meals</span>
          <input
            id="meal-search"
            type="search"
            placeholder="Try: dessert, indian, chicken..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        <div className="chip-row" role="tablist" aria-label="Meal categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              className={`chip ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <section className="message error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRefreshCount((count) => count + 1)}
          >
            Retry
          </button>
        </section>
      )}

      {isLoading && (
        <section className="meal-grid" aria-live="polite" aria-busy="true">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <article className="meal-card skeleton" key={`skeleton-${index}`} />
          ))}
        </section>
      )}

      {!isLoading && !error && filteredMeals.length === 0 && (
        <section className="message empty" aria-live="polite">
          <p>No meals matched your current search. Try a different keyword.</p>
        </section>
      )}

      {!isLoading && !error && filteredMeals.length > 0 && (
        <section className="meal-grid" aria-label="Meals list">
          {filteredMeals.map((meal, index) => (
            <article
              className="meal-card"
              key={meal.idMeal}
              style={{ '--order': index }}
            >
              <img
                src={meal.strMealThumb}
                alt={meal.strMeal}
                loading="lazy"
                width="480"
                height="320"
              />
              <div className="meal-content">
                <div className="meal-heading">
                  <h2>{meal.strMeal}</h2>
                  <p className="area-pill">{meal.strArea || 'Global'}</p>
                </div>

                <p className="category-label">{meal.strCategory || 'Unknown'}</p>
                <p className="instruction-preview">
                  {getInstructionPreview(meal.strInstructions)}
                </p>

                <ul className="ingredient-list">
                  {getIngredientPreview(meal).map((ingredient) => (
                    <li key={`${meal.idMeal}-${ingredient}`}>{ingredient}</li>
                  ))}
                </ul>

                <div className="meal-links">
                  {meal.strYoutube ? (
                    <a
                      href={meal.strYoutube}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Watch Recipe
                    </a>
                  ) : null}
                  {meal.strSource ? (
                    <a
                      href={meal.strSource}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Read Source
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="pagination-panel" aria-label="Pagination controls">
        <button
          type="button"
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          disabled={isLoading || page <= 1}
        >
          Previous
        </button>
        <p>
          Page <strong>{page}</strong> of <strong>{meta.totalPages}</strong>
        </p>
        <button
          type="button"
          onClick={() =>
            setPage((value) => Math.min(meta.totalPages, value + 1))
          }
          disabled={isLoading || page >= meta.totalPages}
        >
          Next
        </button>
      </section>
    </main>
  )
}

export default App
