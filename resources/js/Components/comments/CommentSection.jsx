import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { AnimatePresence } from 'framer-motion';

const CommentSection = ({ storyId, currentUser }) => {
  // State to track comments including optimistic ones
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { props } = usePage();

  // Function to fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(route('comments.get', storyId));
      setComments(response.data.comments);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments on initial load
  useEffect(() => {
    fetchComments();
  }, [storyId]);

  // Handle adding a new comment
  const handleCommentAdded = (newComment) => {
    // Add optimistic comment immediately
    setComments(prevComments => [newComment, ...prevComments]);

    // Refresh comments from server after a short delay
    setTimeout(() => {
      fetchComments();
    }, 1000);
  };

  // Handle adding a reply to a comment
  const handleReplyAdded = (parentId, newReply) => {
    // Add optimistic reply immediately
    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      })
    );

    // Refresh comments from server after a short delay
    setTimeout(() => {
      fetchComments();
    }, 1000);
  };

  // Handle comment deletion
  const handleCommentDeleted = (commentId, parentId = null) => {
    if (parentId) {
      // This is a reply - remove it from its parent
      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply.id !== commentId)
            };
          }
          return comment;
        })
      );
    } else {
      // This is a top-level comment - remove it from the list
      setComments(prevComments =>
        prevComments.filter(comment => comment.id !== commentId)
      );
    }

    // Refresh comments from server after a short delay
    setTimeout(() => {
      fetchComments();
    }, 1000);
  };

  // Handle comment updates
  const handleCommentUpdated = (updatedComment) => {
    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === updatedComment.id) {
          return {
            ...comment,
            content: updatedComment.content,
            is_edited: true
          };
        }
        return comment;
      })
    );

    // Refresh comments from server after a short delay
    setTimeout(() => {
      fetchComments();
    }, 1000);
  };
  return (
    <div className="comments-section mt-5">
      <div className="comments-header mb-4">
        <h3 className="secondry-font">
          <i className="fas fa-comments me-2" style={{ color: 'var(--secondry-theme, #6c5ce7)' }}></i>
          Comments ({comments.length})
        </h3>
        <p className="text-muted">Join the conversation and share your thoughts on this story.</p>
      </div>

      {currentUser ? (
        <div className="comment-form-container mb-5">
          <h5 className="mb-3 secondry-font">Leave a Comment</h5>
          <CommentForm
            storyId={storyId}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      ) : (
        <div className="alert mb-4" style={{ backgroundColor: 'rgba(var(--secondry-theme-rgb, 108, 92, 231), 0.1)', color: '#333', border: '1px solid rgba(var(--secondry-theme-rgb, 108, 92, 231), 0.2)' }}>
          <i className="fas fa-info-circle me-2" style={{ color: 'var(--secondry-theme, #6c5ce7)' }}></i>
          Please <a href="/login" className="alert-link" style={{ color: 'var(--secondry-theme, #6c5ce7)' }}>login</a> or <a href="/register" className="alert-link" style={{ color: 'var(--secondry-theme, #6c5ce7)' }}>register</a> to leave a comment.
        </div>
      )}

      <div className="comments-list">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" style={{ color: 'var(--secondry-theme, #6c5ce7)' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 secondry-font">Loading comments...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        ) : comments.length > 0 ? (
          <AnimatePresence>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                storyId={storyId}
                currentUser={currentUser}
                onReplyAdded={handleReplyAdded}
                onCommentDeleted={handleCommentDeleted}
                onCommentUpdated={handleCommentUpdated}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-5">
            <i className="fas fa-comment-slash fa-3x mb-3" style={{ color: 'var(--secondry-theme, #6c5ce7)' }}></i>
            <p className="lead secondry-font">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
