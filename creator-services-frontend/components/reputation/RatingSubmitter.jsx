// src/components/reputation/RatingSubmitter.jsx
import { useState } from 'react';
import { useReputation } from '../../hooks/useReputation';

const RatingSubmitter = ({ providerAddress, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { submitRating, checkInteraction, loading, error } = useReputation();
  const [canRate, setCanRate] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkCanRate = async () => {
      const hasInteracted = await checkInteraction(providerAddress);
      setCanRate(hasInteracted);
      if (!hasInteracted) {
        setMessage("You must complete a project with this creator before rating");
      }
    };
    
    checkCanRate();
  }, [providerAddress, checkInteraction]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setMessage("Please select a rating");
      return;
    }
    
    try {
      await submitRating(providerAddress, rating);
      setMessage("Rating submitted successfully!");
      if (onRatingSubmitted) onRatingSubmitted();
    } catch (err) {
      setMessage(error || "Failed to submit rating");
    }
  };

  if (!canRate) {
    return <div className="rating-message">{message}</div>;
  }

  return (
    <div className="rating-submitter">
      <h3>Rate this Creator</h3>
      <div className="rating-stars-input">
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star}
            className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          >
            ★
          </span>
        ))}
      </div>
      <button 
        className="btn btn-primary" 
        onClick={handleSubmit}
        disabled={loading || rating === 0}
      >
        {loading ? 'Submitting...' : 'Submit Rating'}
      </button>
      {message && <div className="rating-message">{message}</div>}
    </div>
  );
};

export default RatingSubmitter;
