import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useVerification() {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/api/verify/status')
      .then(data => { if (!cancelled) setVerification(data?.verification ?? null); })
      .catch(err => { if (!cancelled) setError(err.message || 'Failed to load status'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function initiateVerification(type) {
    return api.post('/api/verify/initiate', { type });
  }

  return { verification, loading, error, initiateVerification };
}
