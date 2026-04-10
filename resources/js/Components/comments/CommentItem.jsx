import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import CommentForm from './CommentForm';
import { motion, AnimatePresence } from 'framer-motion';

const CommentItem = ({ comment, storyId, currentUser, onReplyAdded = null, onCommentDeleted = null, onCommentUpdated = null }) => {
  // Add animation state
  const [isVisible, setIsVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data, setData, put, processing, reset, errors } = useForm({
    content: comment.content,
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleEdit = (e) => {
    e.preventDefault();

    // Create an updated comment for optimistic UI
    const updatedComment = {
      ...comment,
      content: data.content,
      is_edited: true
    };

    // Update UI immediately
    if (onCommentUpdated) {
      onCommentUpdated(updatedComment);
    }

    // Send to server
    router.put(route('comments.update', comment.id), {
      content: data.content
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  const handleDelete = () => {
    setShowDeleteModal(false);

    // Notify parent component to remove this comment
    if (onCommentDeleted) {
      onCommentDeleted(comment.id);
    }

    // Send delete request to server
    router.delete(route('comments.destroy', comment.id), {
      preserveScroll: true
    });
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteReply = (replyId) => {
    // Notify parent component to remove this reply
    if (onCommentDeleted) {
      onCommentDeleted(replyId, comment.id);
    }

    // Send delete request to server
    router.delete(route('comments.destroy', replyId), {
      preserveScroll: true
    });
  };

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  // Handle new replies being added
  const handleReplyAdded = (newReply) => {
    if (onReplyAdded) {
      onReplyAdded(comment.id, newReply);
    }
  };

  // Animation effect
  useEffect(() => {
    setIsVisible(true);

    // If this is an optimistic comment, add a subtle highlight effect
    if (comment.is_optimistic) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const isOwner = currentUser && currentUser.id === comment.user_id;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <>
      <motion.div
        className={`comment-item mb-4 ${comment.is_optimistic ? 'optimistic-comment' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      >
      <div className="comment-header d-flex justify-content-between align-items-start">
        <div className="d-flex align-items-center">
          <div className="comment-avatar me-2">
            {/* Default avatar with first letter of username */}
            <div className="avatar-circle">
              {comment.user.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h6 className="mb-0 fw-bold">{comment.user.name}</h6>
            <small className="text-muted">{formatDate(comment.created_at)}</small>
          </div>
        </div>
        {isOwner && (
          <div className="dropdown">
            <button className="btn btn-sm btn-link text-muted" type="button" data-bs-toggle="dropdown">
              <i className="fas fa-ellipsis-v"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><button className="dropdown-item" onClick={() => setIsEditing(true)}>Edit</button></li>
              <li><button className="dropdown-item text-danger" onClick={openDeleteModal}>Delete</button></li>
            </ul>
          </div>
        )}
      </div>

      <div className="comment-body mt-2">
        {isEditing ? (
          <form onSubmit={handleEdit}>
            <div className="form-group mb-2">
              <textarea
                className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                value={data.content}
                onChange={(e) => setData('content', e.target.value)}
                rows="3"
              ></textarea>
              {errors.content && <div className="invalid-feedback">{errors.content}</div>}
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setIsEditing(false)}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-sm py-5 px-10 radius-30 secondry-font ${data.content.trim() ? 'bg-secondry-theme text-white' : 'btn-light text-muted'}`}
                disabled={processing || !data.content.trim()}
                style={{
                  opacity: 1,
                  transition: 'all 0.3s ease',
                  border: data.content.trim() ? 'none' : '1px solid #ddd'
                }}
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <p className="mb-2">{comment.content}</p>
        )}
      </div>

      <div className="comment-actions">
        {currentUser && !isEditing && (
          <button
            className="btn btn-sm btn-link p-0 me-3 secondry-font"
            onClick={toggleReplyForm}
            style={{ color: 'var(--secondry-theme, #6c5ce7)' }}
          >
            <i className="fas fa-reply me-1"></i> Reply
          </button>
        )}

        {hasReplies && (
          <button
            className="btn btn-sm btn-link p-0 secondry-font"
            onClick={toggleReplies}
            style={{ color: 'var(--secondry-theme, #6c5ce7)' }}
          >
            <i className={`fas fa-chevron-${showReplies ? 'up' : 'down'} me-1`}></i>
            {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showReplyForm && currentUser && (
          <motion.div
            className="reply-form mt-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CommentForm
              storyId={storyId}
              parentId={comment.id}
              onCancel={toggleReplyForm}
              onCommentAdded={handleReplyAdded}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {hasReplies && showReplies && (
        <div className="replies-container mt-3 ms-4 ps-2 border-start">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="reply-item mb-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center">
                  <div className="comment-avatar me-2">
                    <div className="avatar-circle avatar-circle-sm">
                      {reply.user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold fs-14">{reply.user.name}</h6>
                    <small className="text-muted">{formatDate(reply.created_at)}</small>
                  </div>
                </div>
                {currentUser && currentUser.id === reply.user_id && (
                  <div className="dropdown">
                    <button className="btn btn-sm btn-link text-muted" type="button" data-bs-toggle="dropdown">
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><button className="dropdown-item text-danger" onClick={() => handleDeleteReply(reply.id)}>Delete</button></li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="reply-body mt-1">
                <p className="mb-1 fs-14">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="mb-0 primary-font">Confirm Delete</h5>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body text-center">
              <div className="delete-icon">
                <i className="fas fa-trash-alt fa-3x text-danger"></i>
              </div>
              <h4 className="secondry-font mb-3">Delete Comment?</h4>
              <p className="mb-4 secondry-font fs-18">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn py-10 px-20 radius-60 secondry-font comment-modal-cencel-btn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <i className="fas fa-times me-2"></i> Cancel
                </button>
                <button
                  className="btn bg-secondry-theme comment-modal-delete-btn text-white py-10 px-20 radius-60 secondry-font"
                  onClick={handleDelete}
                >
                  <i className="fas fa-trash-alt me-2"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommentItem;
