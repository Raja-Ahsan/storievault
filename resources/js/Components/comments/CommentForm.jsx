import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';

const CommentForm = ({ storyId, parentId = null, onCancel = null, onCommentAdded = null }) => {
  const { auth } = usePage().props;
  const [charCount, setCharCount] = useState(0);
  const maxChars = 1000;

  const { data, setData, post, processing, reset, errors } = useForm({
    content: '',
    parent_id: parentId,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create an optimistic comment object for immediate display
    const optimisticComment = {
      id: 'temp-' + Date.now(), // Temporary ID
      content: data.content,
      parent_id: parentId,
      created_at: new Date().toISOString(),
      user: auth.user,
      user_id: auth.user.id,
      replies: [],
      is_optimistic: true // Flag to identify this as an optimistic update
    };

    // Call the onCommentAdded callback with the optimistic comment
    if (onCommentAdded) {
      onCommentAdded(optimisticComment);
    }

    // Actually post to the server
    post(route('comments.store', storyId), {
      preserveScroll: true, // Maintain scroll position
      onSuccess: () => {
        reset();
        setCharCount(0);
        if (onCancel) onCancel();
      },
    });
  };

  const handleChange = (e) => {
    const content = e.target.value;
    setData('content', content);
    setCharCount(content.length);
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form mb-4">
      <div className="form-group mb-3">
        <textarea
          className={`form-control ${errors.content ? 'is-invalid' : ''}`}
          placeholder={parentId ? "Write your reply..." : "Share your thoughts on this story..."}
          rows={parentId ? 3 : 4}
          value={data.content}
          onChange={handleChange}
          maxLength={maxChars}
        ></textarea>
        {errors.content && (
          <div className="invalid-feedback">{errors.content}</div>
        )}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <small className={`text-muted ${charCount > maxChars * 0.9 ? 'text-danger' : ''}`}>
            {charCount}/{maxChars} characters
          </small>
        </div>
      </div>
      <div className="d-flex justify-content-end gap-2">
        {onCancel && (
          <button
            type="button"
            className="btn py-10 px-20 radius-60 secondry-font"
            onClick={onCancel}
            disabled={processing}
            style={{ backgroundColor: '#f8f8f8', color: '#333', border: '1px solid #ddd' }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`btn py-10 px-20 radius-60 secondry-font ${data.content.trim() && charCount <= maxChars ? 'bg-secondry-theme text-white comment-modal-delete-btn' : 'btn-light text-muted'}`}
          disabled={processing || !data.content.trim() || charCount > maxChars}
          style={{
            opacity: 1,
            transition: 'all 0.3s ease',
            border: data.content.trim() && charCount <= maxChars ? 'none' : '1px solid #ddd'
          }}
        >
          {parentId ? 'Reply' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
