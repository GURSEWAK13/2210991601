import React, { useState, useEffect } from 'react';
import { fetchUsers, fetchUserPosts, fetchPostComments, getRandomImage } from '../api';
import './TrendingPosts.css';

function TrendingPosts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendingPosts, setTrendingPosts] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        // Get all users
        const usersData = await fetchUsers();
        
        // Create a mapping of user IDs to names for later use
        const userMap = usersData.users;
        
        // Collect all posts with their comment counts
        const allPostsWithComments = [];
        
        // Use Promise.all to process users in parallel
        await Promise.all(
          Object.keys(userMap).map(async (userId) => {
            try {
              // Get posts for each user
              const postsData = await fetchUserPosts(userId);
              
              // Process each post
              await Promise.all(
                postsData.posts.map(async (post) => {
                  try {
                    // Get comments for this post
                    const commentsData = await fetchPostComments(post.id);
                    const commentCount = commentsData.comments.length;
                    
                    allPostsWithComments.push({
                      id: post.id,
                      userId,
                      userName: userMap[userId],
                      content: post.content,
                      commentCount,
                      image: getRandomImage('post', post.id)
                    });
                  } catch (err) {
                    console.error(`Error processing post ${post.id}:`, err);
                  }
                })
              );
            } catch (err) {
              console.error(`Error processing user ${userId}:`, err);
            }
          })
        );
        
        // Find the maximum comment count
        let maxComments = 0;
        allPostsWithComments.forEach(post => {
          if (post.commentCount > maxComments) {
            maxComments = post.commentCount;
          }
        });
        
        // Filter posts with the maximum comment count
        const trending = allPostsWithComments.filter(post => post.commentCount === maxComments);
        
        setTrendingPosts(trending);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trending posts:', err);
        setError('Failed to load trending posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) return <div className="loading">Loading trending posts...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="trending-posts-container">
      <h2>Trending Posts</h2>
      {trendingPosts.length === 0 ? (
        <p>No trending posts found.</p>
      ) : (
        <div className="posts-grid">
          {trendingPosts.map((post) => (
            <div key={post.id} className="post-card">
              <img src={post.image} alt="Post thumbnail" className="post-image" />
              <div className="post-content">
                <h3>{post.content}</h3>
                <div className="post-meta">
                  <div className="post-author">
                    <img 
                      src={getRandomImage('user', post.userId)} 
                      alt={post.userName} 
                      className="author-avatar" 
                    />
                    <span>{post.userName}</span>
                  </div>
                  <div className="comment-count">
                    <span>{post.commentCount} comments</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrendingPosts;
