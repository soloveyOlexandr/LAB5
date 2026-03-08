import SearchBar from './components/SearchBar';
import MovieGrid from './components/MovieGrid';
import LoadingSkeleton from './components/LoadingSkeleton';
import useLetterboxd from './hooks/useLetterboxd';
import useRandomReviews from './hooks/useRandomReviews';

export default function App() {
  const { reviews, loading, error, search, savedUsername } = useLetterboxd();
  const { randomReviews, randomLoading } = useRandomReviews();

  const hasSearched = reviews.length > 0 || loading || error;
  const showRandom = !hasSearched && randomReviews.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <SearchBar onSearch={search} loading={loading} initialUsername={savedUsername} />

        {error && (
          <p className="text-red-500 text-center mb-8 font-medium bg-red-50 px-4 py-2 rounded-lg max-w-lg mx-auto">
            {error}
          </p>
        )}

        {loading && <LoadingSkeleton />}

        {!loading && reviews.length > 0 && <MovieGrid reviews={reviews} />}

        {!hasSearched && randomLoading && <LoadingSkeleton />}

        {showRandom && (
          <MovieGrid
            reviews={randomReviews}
            title="Що дивляться зараз"
            showFilters={false}
          />
        )}
      </div>
    </div>
  );
}
