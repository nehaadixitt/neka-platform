import axios from 'axios';

// Configure axios base URL for production
if (process.env.NODE_ENV === 'production') {
  // In production, API is served from same domain
  axios.defaults.baseURL = window.location.origin;
} else {
  // In development, use proxy or API URL
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';
}

// Set auth token
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
    localStorage.removeItem('token');
  }
};

// Initialize token from localStorage
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

export { setAuthToken };
export default axios;