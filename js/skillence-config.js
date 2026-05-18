// API base URL. Empty string = same origin (the recommended setup, where the API
// is deployed alongside the frontend at /api on Vercel). To call a different host
// (e.g. a separate dev server on :4000), override window.SKILLENCE_API_URL before
// this script loads.
window.SKILLENCE_API_URL = window.SKILLENCE_API_URL ?? '';
