import { useState, useEffect } from 'react';
import axios from 'axios';

const LikeCount = ({ storyId, className = '', likeText = false, likecountnumberClass = '' }) => {
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Get the likes count for this story
  useEffect(() => {
    const getLikesCount = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(route('likes.check', storyId));
        setLikesCount(response.data.likes_count);
      } catch (error) {
        console.error('Error getting likes count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getLikesCount();
  }, [storyId]);

  return (
    <div className={`d-flex align-items-center ${className}`}>
      <i className="far fa-heart text-primary-theme me-1"></i>
      <span className={likecountnumberClass}>{isLoading ? '...' : likesCount}</span>
      {likeText && <span className='fs-14'>{likesCount > 1 ? 'Likes' : 'Like'}</span>}
    </div>
  );
};

export default LikeCount;
