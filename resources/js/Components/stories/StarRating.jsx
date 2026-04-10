import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';

const StarRating = ({ storyId, initialRating = null, averageRating = null }) => {
  const { auth } = usePage().props;
  const [userRating, setUserRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [average, setAverage] = useState(averageRating);

  // Fetch rating on mount
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await axios.get(route('ratings.get', storyId));
        setUserRating(response.data.user_rating);
        setAverage(response.data.average_rating);
      } catch (error) {
        console.error('Error fetching rating:', error);
      }
    };

    fetchRating();
  }, [storyId]);

  const handleStarClick = async (rating) => {
    if (!auth.user) {
      window.location.href = route('login');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(route('ratings.store', storyId), {
        rating: rating,
      });
      setUserRating(response.data.user_rating);
      setAverage(response.data.average_rating);
      
    Swal.fire({
  html: `
    <div style="
      font-size: 50px;
      color: #28a745;
      margin-bottom: 10px;
    ">✔️</div>
  `,
  title: 'Thank you for your rating!',
  text: 'Your feedback helps us improve.',
  showConfirmButton: false,
  timer: 1800,
  timerProgressBar: true,
  background: '#ffffff',
  color: '#333',
  iconColor: '#22c55e',
  position: 'center',
  showClass: {
    popup: 'animate__animated animate__zoomIn'
  },
  hideClass: {
    popup: 'animate__animated animate__zoomOut'
  }
});

    } catch (error) {
      console.error('Error submitting rating:', error);
      if (error.response?.status === 401) {
        window.location.href = route('login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStar = (index) => {
    const rating = index + 1;
    const isActive = hoveredRating >= rating || (!hoveredRating && userRating >= rating);
    
    return (
      <i
        key={index}
        className={`${isActive ? 'fas' : 'far'} fa-star`}
        style={{
          color: isActive ? '#ffc107' : '#ccc',
          cursor: auth.user ? 'pointer' : 'default',
          fontSize: '24px',
          marginRight: '5px',
        }}
        onMouseEnter={() => auth.user && setHoveredRating(rating)}
        onMouseLeave={() => setHoveredRating(0)}
        onClick={() => auth.user && !isLoading && handleStarClick(rating)}
      />
    );
  };

  return (
    <div className="rating-section mt-4">
      <h5 className="mb-10">Rate this Story</h5>
      <div className="d-flex align-items-center mb-10">
        <div className="star-rating d-flex align-items-center">
          {[0, 1, 2, 3, 4].map((index) => renderStar(index))}
        </div>
      </div>
      {!auth.user && (
        <div 
          className="mt-3 p-3 rounded-3 d-flex align-items-center"
          style={{
            background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
            border: '1px solid #e1e4e8',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
            <div className="me-3 d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                <i className="fas fa-lock text-muted" style={{ fontSize: '14px' }}></i>
            </div>
            <div>
                <p className="mb-0 text-muted" style={{ fontSize: '13px', lineHeight: '1' }}>
                    Want to leave a rating?
                </p>
                <a href={route('login')} className="text-dark fw-bold text-decoration-none d-inline-flex align-items-center mt-1" style={{ fontSize: '14px' }}>
                    Login to your account <i className="fas fa-arrow-right ms-1" style={{ fontSize: '10px' }}></i>
                </a>
            </div>
        </div>
      )}
      {isLoading && (
        <div className="mt-2">
          <i className="fas fa-spinner fa-spin"></i> Submitting...
        </div>
      )}
    </div>
  );
};

export default StarRating;

