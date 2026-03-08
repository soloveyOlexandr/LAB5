import { useState } from 'react';

export default function SearchBar({ onSearch, loading, initialUsername }) {
  const [username, setUsername] = useState(initialUsername);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(username);
  };

  return (
    <header className="mb-12 text-center">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
        Letterboxd <span className="text-orange-500">Explorer</span>
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-lg mx-auto">
        <input
          type="text"
          placeholder="Ваш Letterboxd username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full sm:w-2/3 px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-1/3 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-60 transition-all text-lg flex justify-center items-center"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : 'Знайти'}
        </button>
      </form>
    </header>
  );
}
