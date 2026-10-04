const BASE_URL = '/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('interviewsense_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getCurrentUser() {
    const token = localStorage.getItem('interviewsense_token');
    if (!token) return null;
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        localStorage.removeItem('interviewsense_token');
        return null;
      }
      return res.json();
    } catch {
      return null;
    }
  },

  // Resume
  async uploadResume(formData) {
    const res = await fetch(`${BASE_URL}/resume/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    if (!res.ok) throw new Error('Resume upload failed');
    return res.json();
  },

  async getLatestResume() {
    const res = await fetch(`${BASE_URL}/resume/latest`, {
      headers: getHeaders()
    });
    if (!res.ok) return null;
    return res.json();
  },

  // Interviews
  async startInterview(config) {
    const res = await fetch(`${BASE_URL}/interviews/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Failed to start interview');
    return res.json();
  },

  async getSession(sessionId) {
    const res = await fetch(`${BASE_URL}/interviews/${sessionId}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Session not found');
    return res.json();
  },

  async submitAnswer(sessionId, questionIndex, answer, durationSeconds = 0) {
    const res = await fetch(`${BASE_URL}/interviews/${sessionId}/answer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        question_index: questionIndex,
        user_answer: answer,
        audio_duration_seconds: durationSeconds
      })
    });
    if (!res.ok) throw new Error('Failed to submit answer');
    return res.json();
  },

  async completeInterview(sessionId) {
    const res = await fetch(`${BASE_URL}/interviews/${sessionId}/complete`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to finalize interview');
    return res.json();
  },

  async getReport(sessionId) {
    const res = await fetch(`${BASE_URL}/interviews/${sessionId}/report`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to get report');
    return res.json();
  },

  async getHistory() {
    const res = await fetch(`${BASE_URL}/interviews/history/all`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async getAdminCandidates() {
    const res = await fetch(`${BASE_URL}/admin/candidates`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch candidates');
    return res.json();
  }
};
