import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [jokes, setJokes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [cardKey, setCardKey] = useState(0); // forces re-animation on joke change

  const API_URL = "https://api.freeapi.app/api/v1/public/randomjokes";

  const fetchJokes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch jokes");

      const result = await response.json();
      if (result.success && result.data && result.data.data) {
        const jokeArray = result.data.data;
        setJokes(Array.isArray(jokeArray) ? jokeArray : [jokeArray]);
        setCurrentIndex(0);
        setCardKey((k) => k + 1);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err.message);
      setJokes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJokes();
  }, []);

  const handleNextJoke = () => {
    if (currentIndex < jokes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCardKey((k) => k + 1);
    } else {
      fetchJokes();
    }
  };

  const handlePreviousJoke = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCardKey((k) => k + 1);
    }
  };

  const handleFavorite = () => {
    const currentJoke = jokes[currentIndex];
    if (!currentJoke) return;

    setFavorites((prev) => {
      const exists = prev.find((fav) => fav.id === currentJoke.id);
      if (exists) {
        return prev.filter((fav) => fav.id !== currentJoke.id);
      } else {
        return [...prev, currentJoke];
      }
    });
  };

  const isFavorited =
    jokes.length > 0 &&
    favorites.some((fav) => fav.id === jokes[currentIndex].id);

  const currentJoke = jokes[currentIndex];

  return (
    <div className="app-container">
      {/* ── Header ── */}
      <header className="header">
        <span className="header-icon">🎭</span>
        <h1 className="title">Comedy Corner</h1>
        <p className="subtitle">Random Jokes · Powered by FreeAPI</p>
        <div className="header-divider">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="main-content">
        {/* Loading */}
        {loading && (
          <div className="loading">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="loading-text">Fetching laughs…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error">
            <span className="error-icon">⚠️</span>
            <strong>Oops — </strong>
            {error}
          </div>
        )}

        {/* Joke Card */}
        {!loading && !error && currentJoke && (
          <div className="joke-container">
            <div className="joke-card" key={cardKey}>
              <div className="joke-type">{currentJoke.type || "General"}</div>

              <div className="joke-content">
                <p className="joke-text">{currentJoke.content}</p>
                {currentJoke.punchline && (
                  <p className="punchline">{currentJoke.punchline}</p>
                )}
              </div>

              <div className="joke-counter">
                <span className="joke-counter-pill">
                  {currentIndex + 1} / {jokes.length}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="controls">
              <button
                id="btn-previous"
                className="btn btn-secondary"
                onClick={handlePreviousJoke}
                disabled={currentIndex === 0}
              >
                ← Prev
              </button>

              <button
                id="btn-favorite"
                className={`btn btn-favorite ${isFavorited ? "favorited" : ""}`}
                onClick={handleFavorite}
              >
                {isFavorited ? "❤️ Saved" : "🤍 Save"}
              </button>

              <button
                id="btn-next"
                className="btn btn-primary"
                onClick={handleNextJoke}
              >
                Next →
              </button>
            </div>

            <button
              id="btn-refresh"
              className="btn btn-refresh"
              onClick={fetchJokes}
            >
              <span className="refresh-icon">↻</span>&nbsp; Load New Set
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && jokes.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">🎤</span>
            <p>No jokes yet — let's fix that!</p>
            <button
              id="btn-load"
              className="btn btn-primary"
              onClick={fetchJokes}
            >
              Load Jokes
            </button>
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="favorites-section">
            <div className="favorites-header">
              <h2>Saved Jokes</h2>
              <span className="favorites-count-badge">{favorites.length}</span>
            </div>

            <div className="favorites-list">
              {favorites.map((fav) => (
                <div key={fav.id} className="favorite-item">
                  <div className="favorite-text-wrap">
                    <p className="favorite-text">{fav.content}</p>
                    {fav.punchline && (
                      <p className="favorite-punchline">🥁 {fav.punchline}</p>
                    )}
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() =>
                      setFavorites((prev) =>
                        prev.filter((f) => f.id !== fav.id),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>
          Comedy Corner
          <span className="footer-dot">◆</span>
          Built with React &amp; Vite
          <span className="footer-dot">◆</span>
          FreeAPI © 2026
        </p>
      </footer>
    </div>
  );
}

export default App;
