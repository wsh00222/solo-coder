const API_BASE = '/api/books';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || '请求失败');
  }
  return response.json();
};

export const initBooks = async () => {
  return fetch(`${API_BASE}/init`).then(handleResponse);
};

export const fetchBooks = async () => {
  return fetch(`${API_BASE}`).then(handleResponse);
};

export const fetchBookById = async (id) => {
  return fetch(`${API_BASE}/${id}`).then(handleResponse);
};

export const createBook = async (bookData) => {
  return fetch(`${API_BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookData)
  }).then(handleResponse);
};

export const updateBook = async (id, bookData) => {
  return fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookData)
  }).then(handleResponse);
};

export const deleteBook = async (id) => {
  return fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  }).then(handleResponse);
};
