import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

const LikeButton = ({ storyId, className = '' }) => {
  const { auth } = usePage().props;
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check if the user has liked this story
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await axios.get(route('likes.check', storyId));
        setLiked(response.data.liked);
        setLikesCount(response.data.likes_count);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLikeStatus();
  }, [storyId]);

  // Handle like/unlike
  const handleToggleLike = async () => {
    if (!auth.user) {
      // Redirect to login if not logged in
      window.location.href = route('login');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(route('likes.toggle', storyId));
      setLiked(response.data.liked);
      setLikesCount(response.data.likes_count);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`d-flex align-items-center ${className}`}>
      <button
        className={`${liked ? 'text-primary-theme' : 'text-secondary'}`}
        onClick={handleToggleLike}
        disabled={isLoading}
        style={{ border: 'none', background: 'transparent' }}
      >
        {isLoading ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : (
          <i className={`${liked ? 'fas' : 'far'} fa-heart`}></i>
        )}
      </button>
      <span className="ms-1 fs-14">{likesCount}</span>
      <span className="ms-2 fs-14">{likesCount > 1 ? 'Likes' : 'Like'}</span>
    </div>
  );
};

export default LikeButton;
