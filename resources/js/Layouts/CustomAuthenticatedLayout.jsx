import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Footer from '@/Components/common/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../js/assets/styles/utilities.css';
import '../../js/assets/styles/style.css';
import '../../js/assets/styles/auth.css';
import '../../js/assets/styles/profile.css';
import Header from '@/Components/common/Header';
export default function CustomAuthenticatedLayout({ children, title }) {
  const { auth } = usePage().props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    // Add lazy loading to images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  }, []);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header headerClass="inner-header" />
      

      {/* Page Title */}
      {title && (
        <div className="bg-secondry-theme py-3">
          <div className="container">
            <h1 className="text-white fs-30 primary-font text-center mb-0">{title}</h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow-1 sec-bg py-200">
        <div className="container">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
