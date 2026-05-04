const BACKEND_URL = import.meta.env.VITE_API_URL;

export const warmBackend = async () => {
  try {
    await fetch(BACKEND_URL.replace(/\/api$/, ""), { method: "GET" });
  } catch (error) {
    console.error("Error warming backend:", error);
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleAuthFailure = async (response) => {
  if (response.status !== 401) {
    return response;
  }

  let errorCode = "";

  try {
    const errorBody = await response.clone().json();
    errorCode = errorBody.code || "";
  } catch {
    errorCode = "";
  }

  if (errorCode === "TOKEN_EXPIRED" || errorCode === "INVALID_TOKEN") {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    if (window.location.pathname !== "/search") {
      window.location.href = "/search";
    }
  }

  return response;
};

export const searchBooks = async ({ query, genre, maxResults = 30 }) => {
  try {
    const searchQuery = [query, genre].filter(Boolean).join(" ").trim();
    const response = await fetch(`${BACKEND_URL}/catalog/search?q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch books: ${response.statusText}`);
    }
    return await response.json();
    
  }
  catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }

  
};

// ===== BACKEND API =====

export const addBookToReadingList = async (book) => {
  try {
    const response = await handleAuthFailure(await fetch(`${BACKEND_URL}/reading-list`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ google_book_id: book.id, title: book.title, author: book.authors?.join(", ") || "Unknown", thumbnail: book.thumbnail }),
    }));
    if (!response.ok) {
      throw new Error(`Failed to add book: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error adding book to reading list:", error);
    throw error;
  }
};

export const getReadingList = async (userId) => {
  try {
    const response = await handleAuthFailure(await fetch(`${BACKEND_URL}/reading-list?user_id=${userId}`, { headers: getAuthHeaders() }));
    if (!response.ok) {
      throw new Error(`Failed to fetch reading list: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching reading list:", error);
    return [];
  }
};

export const deleteBookFromReadingList = async (id) => {
  const response = await handleAuthFailure(await fetch(`${BACKEND_URL}/reading-list/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }));

  if (!response.ok) {
    throw new Error(`Failed to delete book: ${response.statusText}`);
  }

  return response.json();
};

export const updateReadingListBook = async (id, updates) => {
  const response = await handleAuthFailure(await fetch(`${BACKEND_URL}/reading-list/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  }));

  if (!response.ok) {
    throw new Error(`Failed to update book: ${response.statusText}`);
  }

  return response.json();
};

export const updateBookStatus = async (id, status) => {
  return updateReadingListBook(id, { status });
};

export const registerUser = async (email, password) => {
  const response = await fetch(`${BACKEND_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Failed to register user: ${response.statusText}`);
  }

  return response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Failed to login: ${response.statusText}`);
  }

  return data;
};

export const loginDemoUser = async () => {
  const response = await fetch(`${BACKEND_URL}/auth/demo-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Failed to start demo: ${response.statusText}`);
  }

  return data;
};

export const logActivity = async ({ userId, activityType, activityData }) => {
  const response = await fetch(`${BACKEND_URL}/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      activity_type: activityType,
      activity_data: activityData,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to log activity: ${response.statusText}`);
  }

  return response.json();
};

export const getBookById = async (id) => {
  try {
    const params = new URLSearchParams();
    if (id?.provider) {
      params.set("provider", id.provider);
    }

    const bookId = typeof id === "object" ? id.id : id;
    const response = await fetch(`${BACKEND_URL}/catalog/books/${encodeURIComponent(bookId)}${params.toString() ? `?${params.toString()}` : ""}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch book: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching book details:", error);
    return null;
  }
};
