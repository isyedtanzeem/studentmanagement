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
      try {
        const refreshRes = await fetch('/api/v1/auth/refresh-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefresh })
        });

        const refreshData = await refreshRes.json();
        if (refreshRes.ok && refreshData.success && refreshData.data) {
          const { accessToken, refreshToken, user } = refreshData.data;
          localStorage.setItem('sims_access_token', accessToken);
          localStorage.setItem('sims_refresh_token', refreshToken);
          if (user) {
            localStorage.setItem('sims_user_profile', JSON.stringify(user));
          }

          // Retry original request with the fresh access token
          response = await fetch(url, {
            ...options,
            headers: getHeaders(accessToken)
          });
        }
      } catch {
        // Token refresh failed silently, return original 401 response
      }
    }
  }

  return response;
}
