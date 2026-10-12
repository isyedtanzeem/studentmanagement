let activeRefreshPromise: Promise<string | null> | null = null;

async function refreshTokens(refreshToken: string): Promise<string | null> {
  if (activeRefreshPromise) return activeRefreshPromise;

  activeRefreshPromise = (async () => {
    try {
      const refreshRes = await fetch('/api/v1/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.success && refreshData.data) {
          const { accessToken, refreshToken: newRefresh, user } = refreshData.data;
          localStorage.setItem('sims_access_token', accessToken);
          localStorage.setItem('sims_refresh_token', newRefresh);
          if (user) {
            localStorage.setItem('sims_user_profile', JSON.stringify(user));
          }
          return accessToken;
        }
      }
    } catch {
      // Network or fetch error
    } finally {
      activeRefreshPromise = null;
    }

    // Refresh failed or token expired: clean up stale tokens & notify session
    localStorage.removeItem('sims_access_token');
    localStorage.removeItem('sims_refresh_token');
    localStorage.removeItem('sims_user_profile');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sims:unauthorized'));
    }
    return null;
  })();

  return activeRefreshPromise;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  overrideToken?: string | null
): Promise<Response> {
  const getHeaders = (token?: string | null): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const authToken = token || localStorage.getItem('sims_access_token');
    if (authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
    }

    return headers;
  };

  let response = await fetch(url, {
    ...options,
    headers: getHeaders(overrideToken)
  });

  // If unauthorized and not login/refresh endpoint, attempt auto token refresh
  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh-token')) {
    const storedRefresh = localStorage.getItem('sims_refresh_token');
    if (storedRefresh) {
      const newAccessToken = await refreshTokens(storedRefresh);
      if (newAccessToken) {
        // Retry original request with the fresh access token
        response = await fetch(url, {
          ...options,
          headers: getHeaders(newAccessToken)
        });
      }
    } else {
      localStorage.removeItem('sims_access_token');
      localStorage.removeItem('sims_user_profile');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sims:unauthorized'));
      }
    }
  }

  return response;
}
