import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../api';

export function useDBStatus() {
  const [status, setStatus] = useState('checking');
  const [info,   setInfo]   = useState(null);

  const ping = useCallback(async () => {
    try {
      const data = await checkHealth();
      setStatus('connected');
      setInfo(data);
    } catch {
      setStatus('disconnected');
      setInfo(null);
    }
  }, []);

  useEffect(() => {
    ping();
    const interval = setInterval(ping, 5000);
    return () => clearInterval(interval);
  }, [ping]);

  return { status, info, ping };
}

export function useData(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchFn();
      setData(res.data ?? res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}
