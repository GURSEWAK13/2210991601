import React, { useState, useEffect } from 'react';
import { fetchUsers, fetchUserPosts, fetchPostComments, getRandomImage } from '../api';
import './Feed.css';

function Feed() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);

  // Function to fetch all posts from all users
  const fetchAllPosts = async () => {
    try {
      // Get all users
      const usersData = await fetchUsers();
      const userMap = usersData.users;
      
      // Array to hold all posts
      const allPosts = [];
      
      // Fetch posts for each user
      await Promise.all(
        Object.keys(userMap).map(async (userId) => {
          try {
            const postsData = await fetchUserPosts(userId);
            
            // Process each post
            postsData.posts.forEach(post => {
              allPosts.push({
                id: post.id,
                userId,
                userName: userMap[userId],
                content: post.content,
                image: getRandomImage('post', post.id),
                // Add a timestamp for sorting - in a real app, this would come from the API
                timestamp: new Date().getTime() - Math.random() * 10000000
              });
            });
          } catch (err) {
            console.error(`Error fetching posts for user ${userId}:`, err);
          }
        })
      );
      
      // Sort posts by timestamp (newest first)
      return allPosts.sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        const allPosts = await fetchAllPosts();
        setPosts(allPosts);
        setLoading(false);
      } catch (err) {
        console.error('Error loading feed:', err);
        setError('Failed to load feed. Please try again later.');
        setLoading(false);
      }
    };

    loadFeed();

    // Set up a polling mechanism to refresh the feed periodically
    const pollingInterval = setInterval(async () => {
      try {
        const allPosts = await fetchAllPosts();
        setPosts(allPosts);
      } catch (err) {
        console.error('Error refreshing feed:', err);
      }
    }, 30000); // Refresh every 30 seconds

    // Clean up the interval when component unmounts
    return () => clearInterval(pollingInterval);
  }, []);

  if (loading) return <div className="loading">Loading feed...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="feed-container">
      <h2>Latest Posts</h2>
      <div className="posts-stream">
        {posts.map((post) => (
          <div key={post.id} className="feed-post">
            <div className="post-header">
              <img 
                src={getRandomImage('user', post.userId)} 
                alt={post.userName} 
                className="user-avatar-small" 
              />
              <div className="post-header-text">
                <h3>{post.userName}</h3>
                <span className="post-timestamp">
                  {new Date(post.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
            <img src={post.image} alt="Post content" className="feed-post-image" />
            <div className="feed-post-content">
              <p>{post.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;
