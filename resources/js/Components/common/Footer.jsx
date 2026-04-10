import { Link } from '@inertiajs/react';
import { Icons } from '../../utils/icons';
const Footer = () => {
  return (
    <footer className='footer'>
      <div className="container">
        <div className="footer-content">
          <div className="row justify-content-between row-gap-40">
            <div className="col-lg-2">
              <div className="logo mb-40">
                <img src="/assets/images/logo.webp" alt="logo" />
              </div>
              <div className="footer-logos">
                <img src="/assets/images/dmc-icon.webp" alt="dmc" />
                <img src="/assets/images/pci.webp" alt="pci" />
              </div>
            </div>
            <div className="col-lg-2">
              <h4 className='fs-36 secondry-font text-primary fw-600 mb-10'>Quick Links</h4>
              <ul className='footer-nav secondry-font'>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/stories">Stories</Link></li>
                <li><Link href="/community">Community</Link></li>
                <li><Link href="/publish">Publish</Link></li>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/blog">Blog</Link></li>
              </ul>
            </div>
            <div className="col-lg-2">
              <h4 className='fs-36 secondry-font text-primary fw-600 mb-10'>Other links</h4>
              <ul className='footer-nav secondry-font'>
                <li><Link href="/faqs">FAQ’s</Link></li>
                <li><Link href="/how-it-works">
                  How It Works</Link></li>
                <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
                <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                <li><Link href="/community-guidelines">Community Guidelines</Link></li>
              </ul>
            </div>
            <div className="col-lg-4">
              <h4 className='fs-36 secondry-font text-primary fw-600 mb-30'>Contact Us</h4>
              <div className="footer-contact-info">
                <p className='fs-18 secondry-font d-flex align-items-center text-white fw-500 mb-20'><span className='md-circle mr-10'><i class="fa-solid fa-envelope"></i></span> <a className='' href="mailto:Storievault@yahoo.com">Storievault@yahoo.com</a></p>
              </div>
              <h4 className='fs-36 secondry-font footer-newsletter-hd text-white fw-500 mb-20'>Subscribe To Our Newsletter</h4>
              <form action="">
                <div className="field-wrapper position-relative">
                  <input type="text" className='input-field' placeholder='Enter Your Email  Address' />
                  <button type='submit' className='btn-primary position-absolute translate-middle-y top-50'><Icons.Send className='text-white fs-25' /></button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="bottom-bar">
        <p className='text-white fs-18 secondry-font text-center'>© 2025 Author Website | All rights reserved</p>
      </div>
    </footer>
  )
}

export default Footer;
