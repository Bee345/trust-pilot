import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useReports({ mine = false, page = 1, limit = 20 } = {}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const path = mine
      ? `/api/reviews/mine?page=${page}&limit=${limit}`
      : `/api/reviews?page=${page}&limit=${limit}`;

    api.get(path)
      .then(data => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : (data?.reports ?? []);
        setReports(list);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message || 'Failed to load reports');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [mine, page, limit]);

  useEffect(() => {
    Promise.resolve().then(() => fetch());
  }, [fetch]);

  return { reports, loading, error, refetch: fetch };
}
