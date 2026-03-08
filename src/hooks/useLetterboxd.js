import { useState, useCallback } from 'react';

const STORAGE_KEY = 'letterboxd_last_username';

export default function useLetterboxd() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const savedUsername = localStorage.getItem(STORAGE_KEY) || '';

  const search = useCallback(async (username) => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Будь ласка, введіть ім'я користувача.");
      return;
    }

    setLoading(true);
    setError('');
    setReviews([]);

    try {
      const response = await fetch(`/api/letterboxd/${encodeURIComponent(trimmed)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Щось пішло не так');
      }

      setReviews(data.reviews);
      localStorage.setItem(STORAGE_KEY, trimmed);
    } catch (err) {
      if (err.name === 'TypeError') {
        setError('Не вдалося з\'єднатися з сервером. Перевірте, чи запущений бекенд.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { reviews, loading, error, search, savedUsername };
}
