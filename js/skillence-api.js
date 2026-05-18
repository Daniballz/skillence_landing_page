// Skillence frontend API client.
// Override the API base URL by setting window.SKILLENCE_API_URL before this script loads,
// e.g. <script>window.SKILLENCE_API_URL='https://skillence-api.onrender.com'</script>
(function () {
  const DEFAULT_API = 'http://localhost:4000';
  const baseUrl = (window.SKILLENCE_API_URL || DEFAULT_API).replace(/\/$/, '');

  async function request(path, options = {}) {
    const res = await fetch(baseUrl + path, {
      method: options.method || 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      // empty body
    }
    if (!res.ok) {
      const message = (data && (data.error || data.message)) || `Request failed (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  window.SkillenceAPI = {
    baseUrl,
    auth: {
      register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
      login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
      logout: () => request('/api/auth/logout', { method: 'POST' }),
      me: () => request('/api/auth/me'),
    },
    courses: {
      list: () => request('/api/courses'),
      get: (slug) => request(`/api/courses/${encodeURIComponent(slug)}`),
      enroll: (slug, payload = {}) =>
        request(`/api/courses/${encodeURIComponent(slug)}/enroll`, {
          method: 'POST',
          body: payload,
        }),
    },
    scholarships: {
      apply: (payload) => request('/api/scholarships/apply', { method: 'POST', body: payload }),
    },
    contact: (payload) => request('/api/contact', { method: 'POST', body: payload }),
    newsletter: (email) => request('/api/newsletter', { method: 'POST', body: { email } }),
    me: {
      enrollments: () => request('/api/me/enrollments'),
      scholarshipApplications: () => request('/api/me/scholarship-applications'),
    },
  };
})();
