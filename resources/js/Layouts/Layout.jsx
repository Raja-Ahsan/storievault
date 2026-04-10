import { useEffect } from 'react';
import Header from '../Components/common/Header';
import Footer from '../Components/common/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../js/assets/styles/utilities.css';
import '../../js/assets/styles/style.css';
import '../../js/assets/styles/content-block.css';
import Chatbot from '../Components/Chatbot';
import UserWayWidget from '../Components/UserWayWidget';


export default function Layout({ children, headerClass, mainClass }) {
  useEffect(() => {
    // Initialize AOS
    if (window.innerWidth < 1025) {
      AOS.init({
        disable: true
      });
    } else {
      AOS.init();
    }

    // Add lazy loading to images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  }, []);

  return (
    <>
      <Header headerClass={headerClass} />
      <main className={`${mainClass} web-main`}>{children}</main>
      <Chatbot />
      <Footer />
      <UserWayWidget />
    </>
  );
}
