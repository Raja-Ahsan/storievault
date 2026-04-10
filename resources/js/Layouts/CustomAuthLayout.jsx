import { Link } from '@inertiajs/react';
import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../js/assets/styles/utilities.css';
import '../../js/assets/styles/style.css';
import '../../js/assets/styles/auth.css';
import { Icons } from '../utils/icons';

export default function CustomAuthLayout({ children, title }) {
  useEffect(() => {
    // Add lazy loading to images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  }, []);

  return (
    <div className="sec-bg d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="container py-4 py-md-5">
        <div className="row justify-content-center">
          {/* <div className="col-12">
          </div> */}
          <div className="col-lg-5 col-md-8 col-sm-10">
            <button
              type="button"
              className="bg-transparent d-flex w-100  justify-content-center align-items-center gap-10 border-0 text-black fw-600 mb-10"
              onClick={() => window.history.back()}>
            <Icons.ArrowLeft />
              Go Back
            </button>
            <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm auth-card">
              <div className="text-center mb-4">
                <Link href="/" className="d-inline-block">
                  <img src="/assets/images/logo.webp" alt="logo" className="mb-3" style={{ maxWidth: '110px', margin: '0 auto' }} />
                  <span className="d-block text-primary-theme fs-24 tertiary-font">Verba aeternum fluentia</span>
                  <span className="d-block light-black fs-18 secondry-font">(Words flowing eternally)</span>
                </Link>
              </div>

              {title && (
                <h2 className="heading text-center mb-4 primary-font" style={{ fontSize: 'var(--text-40)' }}>
                  {title} <span className="text-primary-theme" style={{ fontSize: '47px' }}>Account</span>
                </h2>
              )}

              <div className="auth-form">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
