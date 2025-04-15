const API_BASE_URL = 'http://20.244.56.144/evaluation-service';
const myHeaders = new Headers();

myHeaders.append('Content-Type', 'application/json');
myHeaders.append('token_type', 'Bearer');
myHeaders.append('access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ0NzAwODg2LCJpYXQiOjE3NDQ3MDA1ODYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjViNjBmMjEyLWRmMzMtNGIzYi1iZDAwLWZjNTk4OTkxZjNhZSIsInN1YiI6Imd1cnNld2FrMTYwMS5iZTIyQGNoaXRrYXJhLmVkdS5pbiJ9LCJlbWFpbCI6Imd1cnNld2FrMTYwMS5iZTIyQGNoaXRrYXJhLmVkdS5pbiIsIm5hbWUiOiJndXJzZXdhayBzaW5naCIsInJvbGxOb1IiOiIyMjEwOTkxNjAxIiwiYWNjZXNzQ29kZSI6IlB3enVmRyIsImNsaWVudElEIjoiNWI2MGYyMTItZGYzMy00YjNiLWJkMDAtZmM1OTg5OTFmNmFlIiwiY2xpZW50U2VjcmV0IjoiR1dadEJhQkpibVhtYVNXWiJ9._mZm1fU6sv1uWuyygyAoYNgVMnLTR0e9yNsnNd6eJI8');

// Now you can use 'myHeaders' in your fetch requests:
// fetch('your_api_endpoint', {
//   method: 'GET', // or POST, PUT, DELETE, etc.
//   headers: myHeaders,
//   // ... other options
// })
// .then(response => response.json())
// .then(data => console.log(data))
// .catch(error => console.error('Error:', error));

// Cache mechanism to reduce API calls
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
  if (key === 'users') {
    return cache.users && cache.lastUpdated.users && 
           (Date.now() - cache.lastUpdated.users < cache.CACHE_DURATION);
  } else if (key === 'userPosts' && userId) {
    return cache.userPosts[userId] && cache.lastUpdated.userPosts[userId] && 
           (Date.now() - cache.lastUpdated.userPosts[userId] < cache.CACHE_DURATION);
  } else if (key === 'postComments' && postId) {
    return cache.postComments[postId] && cache.lastUpdated.postComments[postId] && 
           (Date.now() - cache.lastUpdated.postComments[postId] < cache.CACHE_DURATION);
  }
  return false;
};

// API calls with caching
export const fetchUsers = async () => {
  if (isCacheValid('users')) {
    return cache.users;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/users`, { 
      headers: myHeaders
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    
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
    return cache.userPosts[userId];
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/posts`, { 
      headers: myHeaders
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    
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
    return cache.postComments[postId];
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, { 
      headers: myHeaders
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    
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
