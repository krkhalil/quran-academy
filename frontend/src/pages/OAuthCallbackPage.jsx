import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('oauth_error');

    if (error) {
      setStatus('error');
      return;
    }

    if (!code) {
      setStatus('error');
      return;
    }

    axios
      .get(`${API_BASE}/oauth/exchange/`, {
        params: { code },
        withCredentials: true,
      })
      .then((res) => {
        const { access_token, refresh_token, id_token, expires_in } = res.data;
        localStorage.setItem('qf_access_token', access_token);
        if (refresh_token) localStorage.setItem('qf_refresh_token', refresh_token);
        if (id_token) localStorage.setItem('qf_id_token', id_token);
        if (expires_in) {
          const expiry = Date.now() + expires_in * 1000;
          localStorage.setItem('qf_token_expiry', String(expiry));
        }
        setStatus('success');
        setTimeout(() => navigate('/'), 1500);
      })
      .catch(() => setStatus('error'));
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-red-600 dark:text-red-400 mb-4">Sign in failed. Please try again.</p>
        <a href="/" className="text-emerald-600 hover:underline">
          Return home
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <p className="text-emerald-600 dark:text-emerald-400 mb-4">Successfully signed in!</p>
      <p className="text-sm text-gray-500">Redirecting...</p>
    </div>
  );
}
