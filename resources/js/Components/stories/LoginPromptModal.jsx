import React from 'react';
import { Link, usePage } from '@inertiajs/react';

const LoginPromptModal = ({ show, onHide }) => {
  const { auth } = usePage().props;
  const isGuestUser = auth?.user?.is_guest;

  if (!show) return null;

  return (
    <div className="story-modal-overlay show" onClick={onHide}>
      <div className="story-modal-content login-prompt-modal" onClick={e => e.stopPropagation()}>
        <div className="story-modal-header">
          <h3 className="mb-0 primary-font">Login Required</h3>
          <button className="close-btn text-white" onClick={onHide}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="story-modal-body text-center py-5">
          <div className="login-icon mb-4">
            <i className="fas fa-user-lock fa-4x text-primary-theme"></i>
          </div>
          {isGuestUser ? (
            <>
              <h4 className="secondry-font mb-3">Guest Access Restricted</h4>
              <p className="mb-4 secondry-font fs-18">
                Guest users cannot continue stories. Please register for a full account to access this feature.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <a href="/logout-and-register" className="btn btn-primary secondry-font">
                  <i className="fas fa-user-plus me-2"></i> Create an Account
                </a>
              </div>
            </>
          ) : (
            <>
              <h4 className="secondry-font mb-3">Please Login to Continue</h4>
              <p className="mb-4 secondry-font fs-18">
                You need to be logged in to continue this story. Please login or create an account to access this feature.
              </p>
              <div className="d-flex justify-content-center gap-3 mb-3">
                <a href="/login" className="btn btn-primary secondry-font">
                  <i className="fas fa-sign-in-alt me-2"></i> Login
                </a>
                <a href="/register" className="btn btn-primary btn-outline-primary secondry-font" onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/register';
                }}>
                  <i className="fas fa-user-plus me-2"></i> Register
                </a>
              </div>
              <div className="mt-3">
                <a href="/guest-login" className="btn btn-primary btn-outline-primary secondry-font">
                  <i className="fas fa-user-clock me-2"></i> Continue as Guest
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
