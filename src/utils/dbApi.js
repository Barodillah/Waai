export const fetchFromDB = async (endpoint, options = {}) => {
  const token = localStorage.getItem('waai_auth_token');
  if (!token) throw new Error('No authentication token found');

  const baseUrl = 'https://wai.bewhy.id/api/api';
  
  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};
