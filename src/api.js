const API_BASE_URL = 'http://20.244.56.144/evaluation-service';
// const myHeaders = new Headers();

// const myHeaders = new Headers();
const myHeaders = {
  'Content-Type': 'application/json',
  'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ0NzAwODg2LCJpYXQiOjE3NDQ3MDA1ODYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjViNjBmMjEyLWRmMzMtNGIzYi1iZDAwLWZjNTk4OTkxZjNhZSIsInN1YiI6Imd1cnNld2FrMTYwMS5iZTIyQGNoaXRrYXJhLmVkdS5pbiJ9LCJlbWFpbCI6Imd1cnNld2FrMTYwMS5iZTIyQGNoaXRrYXJhLmVkdS5pbiIsIm5hbWUiOiJndXJzZXdhayBzaW5naCIsInJvbGxObyI6IjIyMTA5OTE2MDEiLCJhY2Nlc3NDb2RlIjoiUHd6dWZHIiwiY2xpZW50SUQiOiI1YjYwZjIxMi1kZjMzLTRiM2ItYmQwMC1mYzU5ODk5MWYzYWUiLCJjbGllbnRTZWNyZXQiOiJHV1p0QmFCSmJ2WG1hU1daIn0._mZm1fU6sv1uWuyygyAoYNgVMnLTR0e9yNsnNd6eJI8'
};
// myHeaders.append('Content-Type', 'application/json');
// myHeaders.append('token_type', 'Bearer');
// myHeaders.append('access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ0NzAwODg2LCJpYXQiOjE3NDQ3MDA1ODYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjViNjBmMjEyLWRmMzMtNGIzYi1iZDAwLWZjNTk4OTkxZjNhZSIsInN1YiI6Imd1cnNld2FrMTYwMS5iZTIyQGNoaXRrYXJhLmVkdS5pbiJ9LCJlbWFpbCI6Imd1cnNld2FrMTYwMS5iZTIyQGNoaXRrYXJhLmVkdS5pbiIsIm5hbWUiOiJndXJzZXdhayBzaW5naCIsInJvbGxOb1IiOiIyMjEwOTkxNjAxIiwiYWNjZXNzQ29kZSI6IlB3enVmRyIsImNsaWVudElEIjoiNWI2MGYyMTItZGYzMy00YjNiLWJkMDAtZmM1OTg5OTFmNmFlIiwiY2xpZW50U2VjcmV0IjoiR1dadEJhQkpibVhtYVNXWiJ9._mZm1fU6sv1uWuyygyAoYNgVMnLTR0e9yNsnNd6eJI8');

// myHeaders.append('email', 'gursewak1601.be22@chitkara.edu.in');
// myHeaders.append('name', 'gursewak singh');
// myHeaders.append('rollNo', '2210991601');
// myHeaders.append('accessCode', 'PwzufG');
// myHeaders.append('clientID', '5b60f212-df33-4b3b-bd00-fc598991f3ae');
// myHeaders.append('clientSecret', 'GWZtBaBJbvXmaSWZ');
// You wouldn't typically send 'expires_in' as a header// Cache mechanism to reduce API calls
const cache = {
  users: null,
  userPosts: {},
  postComments: {},
  lastUpdated: {
    users: null,
    userPosts: {},
    postComments: {}
  },
  // Cache validity duration in milliseconds (e.g., 5 minutes)
  CACHE_DURATION: 5 * 60 * 1000
};

// Check if cache is valid
const isCacheValid = (key, userId = null, postId = null) => {
  const now = Date.now();
  if (key === 'users') {
    return cache.users && cache.lastUpdated.users && (now - cache.lastUpdated.users < cache.CACHE_DURATION);
  } else if (key === 'userPosts' && userId) {
    return cache.userPosts[userId] && cache.lastUpdated.userPosts[userId] && (now - cache.lastUpdated.userPosts[userId] < cache.CACHE_DURATION);
  } else if (key === 'postComments' && postId) {
    return cache.postComments[postId] && cache.lastUpdated.postComments[postId] && (now - cache.lastUpdated.postComments[postId] < cache.CACHE_DURATION);
  }
  return false;
};

// API calls with caching and improved error handling
export const fetchUsers = async () => {
  if (isCacheValid('users')) {
    return Promise.resolve(cache.users); // Return cached data as a resolved Promise
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: myHeaders
    });

    if (!response.ok) {
      const errorData = await response.json(); // Try to get more specific error info
      console.error('Error fetching users:', errorData);
      throw new Error(`Failed to fetch users: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    cache.users = data;
    cache.lastUpdated.users = Date.now();
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchUserPosts = async (userId) => {
  if (isCacheValid('userPosts', userId)) {
    return Promise.resolve(cache.userPosts[userId]); // Return cached data as a resolved Promise
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/posts`, {
      headers: myHeaders
    });

    if (!response.ok) {
      const errorData = await response.json(); // Try to get more specific error info
      console.error(`Error fetching posts for user ${userId}:`, errorData);
      throw new Error(`Failed to fetch posts for user ${userId}: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    cache.userPosts[userId] = data;
    cache.lastUpdated.userPosts[userId] = Date.now();
    return data;
  } catch (error) {
    console.error(`Error fetching posts for user ${userId}:`, error);
    throw error;
  }
};

export const fetchPostComments = async (postId) => {
  if (isCacheValid('postComments', null, postId)) {
    return Promise.resolve(cache.postComments[postId]); // Return cached data as a resolved Promise
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      headers: myHeaders
    });

    if (!response.ok) {
      const errorData = await response.json(); // Try to get more specific error info
      console.error(`Error fetching comments for post ${postId}:`, errorData);
      throw new Error(`Failed to fetch comments for post ${postId}: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    cache.postComments[postId] = data;
    cache.lastUpdated.postComments[postId] = Date.now();
    return data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }
};

// Helper to generate a random image URL for users and posts
export const getRandomImage = (type, id) => {
  const seed = `${type}-${id}`;
  return `https://picsum.photos/seed/${seed}/200`;
};