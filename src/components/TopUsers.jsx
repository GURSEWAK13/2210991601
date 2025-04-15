import React, { useState, useEffect } from 'react';
import { fetchUsers, fetchUserPosts, fetchPostComments, getRandomImage } from '../api';
import './TopUsers.css';

function TopUsers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        setLoading(true);
        // Get all users
        const usersData = await fetchUsers();
        
        // Process users to calculate comment counts
        const usersWithCommentCounts = await Promise.all(
          Object.entries(usersData.users).map(async ([userId, userName]) => {
            try {
              // Get posts for each user
              const postsData = await fetchUserPosts(userId);
              
              // Calculate total comments for all user posts
              let totalComments = 0;
              
              // Use Promise.all to fetch comments for all posts in parallel
              await Promise.all(
                postsData.posts.map(async (post) => {
                  try {
                    const commentsData = await fetchPostComments(post.id);
                    const commentCount = commentsData.comments.length;
                    totalComments += commentCount;
                  } catch (err) {
                    console.error(`Error fetching comments for post ${post.id}:`, err);
                  }
                })
              );
              
              return {
                userId,
                userName,
                postCount: postsData.posts.length,
                totalComments,
                avatar: getRandomImage('user', userId)
              };
            } catch (err) {
              console.error(`Error processing user ${userId}:`, err);
              return {
                userId,
                userName,
                postCount: 0,
                totalComments: 0,
                avatar: getRandomImage('user', userId)
              };
            }
          })
        );
        
        // Sort by total comments and take top 5
        const sortedUsers = usersWithCommentCounts
          .sort((a, b) => b.totalComments - a.totalComments)
          .slice(0, 5);
        
        setTopUsers(sortedUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching top users:', err);
        setError('Failed to load top users. Please try again later.');
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  if (loading) return <div className="loading">Loading top users...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="top-users-container">
      <h2>Top 5 Most Commented Users</h2>
      <div className="users-grid">
        {topUsers.map((user) => (
          <div key={user.userId} className="user-card">
            <img src={user.avatar} alt={user.userName} className="user-avatar" />
            <h3>{user.userName}</h3>
            <div className="user-stats">
              <div className="stat">
                <span className="stat-value">{user.postCount}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user.totalComments}</span>
                <span className="stat-label">Comments</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopUsers;