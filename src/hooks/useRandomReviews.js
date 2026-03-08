import { useState, useEffect } from 'react';

export default function useRandomReviews() {
  const [randomReviews, setRandomReviews] = useState([]);
  const [randomLoading, setRandomLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRandom() {
      try {
        const response = await fetch('/api/letterboxd/random');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        if (!cancelled) {
          setRandomReviews(data.reviews);
        }
      } catch {
        
      } finally {
        if (!cancelled) {
          setRandomLoading(false);
        }
      }
    }

    fetchRandom();
    return () => { cancelled = true; };
  }, []);

  return { randomReviews, randomLoading };
}
