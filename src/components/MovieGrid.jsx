import { useState, useMemo } from 'react';
import MovieCard from './MovieCard';

const SORT_OPTIONS = {
  default: { label: 'За замовчуванням', fn: () => 0 },
  ratingDesc: { label: 'Рейтинг (високий)', fn: (a, b) => b.rating - a.rating },
  ratingAsc: { label: 'Рейтинг (низький)', fn: (a, b) => a.rating - b.rating },
  titleAsc: { label: 'Назва (А-Я)', fn: (a, b) => a.title.localeCompare(b.title) },
};

export default function MovieGrid({ reviews, title = 'Останні активності', showFilters = true }) {
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');

  const processedReviews = useMemo(() => {
    let result = reviews.filter((film) => film.rating >= minRating);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((film) => film.title.toLowerCase().includes(q));
    }

    const sortFn = SORT_OPTIONS[sortBy].fn;
    if (sortBy !== 'default') {
      result = [...result].sort(sortFn);
    }

    return result;
  }, [reviews, minRating, sortBy, searchQuery]);

  return (
    <main className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-200 pb-4 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">
          {title}
          {showFilters && (
            <span className="text-base font-normal text-gray-400 ml-3">
              {processedReviews.length} з {reviews.length}
            </span>
          )}
        </h2>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Пошук фільму..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-44"
            />
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value={0}>Всі оцінки</option>
              <option value={3}>★3+</option>
              <option value={4}>★4+</option>
              <option value={4.5}>★4.5+</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {Object.entries(SORT_OPTIONS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {processedReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {processedReviews.map((film) => (
            <MovieCard key={film.id} film={film} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <p className="text-xl text-gray-500">Не знайдено фільмів за вашим запитом</p>
        </div>
      )}
    </main>
  );
}
