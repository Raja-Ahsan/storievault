import Layout from '@/Layouts/Layout'
import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Head, router, usePage } from '@inertiajs/react'
import TextInput from '@/Components/TextInput';
import Swal from 'sweetalert2';
import { Icons } from '@/utils/icons';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const CheckoutForm = ({ story, character, storyText, package: packageData, finalPrice, discountApplied, discountCode, discountAmount, originalPrice, rating }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");

  // Debug logging
  console.log('CheckoutForm props:', { story, character, storyText, packageData, finalPrice, discountApplied, discountCode, discountAmount, originalPrice });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleProceedToStripe = async () => {
    if (!packageData) {
      Swal.fire({
        title: 'Error!',
        text: 'No package selected. Please go back and select a package.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        background: '#fff',
      });
      return;
    }

    setLoading(true);

    // Show loading alert
    Swal.fire({
      title: 'Redirecting to Stripe...',
      text: 'Please wait while we redirect you to complete your payment.',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Create Stripe checkout session directly without creating publish request first
      await createStripeCheckoutSession();
    } catch (error) {
      console.error('Error:', error);
      Swal.close();
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to submit publish request.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        background: '#fff',
      });
      setLoading(false);
    }
  };

  const createStripeCheckoutSession = async () => {
    try {
      // Log the request payload for debugging
      const requestPayload = {
        mode: 'payment', // One-time payment
        amount: finalPrice ? Math.round(parseFloat(finalPrice) * 100) : (packageData ? Math.round(parseFloat(packageData.price) * 100) : 1900), // Convert to cents
        story_title: story.title,
        story_id: story.id,
        character: character,
        content: storyText,
        title: story.title,
        genre: story.genre,
        rating: rating,
        cover_image: story.cover_image,
        package_id: packageData.id,
        package_name: packageData.name,
        package_price: packageData.price,
        stripe_price_id: packageData?.stripe_price_id, // Add stripe price ID
        discount_applied: discountApplied,
        discount_code: discountCode,
        final_price: finalPrice
      };
      
      console.log('Request payload:', requestPayload);
      console.log('CSRF Token:', document.querySelector('meta[name="csrf-token"]')?.getAttribute("content"));

      const response = await fetch("/stripe/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
          "Accept": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (!data.id) {
        throw new Error('No session ID received from server');
      }
      
      // Redirect to Stripe checkout
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_KEY);
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.id,
        });
        
        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      Swal.fire({
        title: 'Payment Error!',
        text: error.message || 'Failed to create payment session.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc3545',
        background: '#fff',
      });
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <button type="submit" className="btn btn-primary mt-4">
          {loading ? 'Processing...' : 'Publish Your Book'}
        </button>
      </form>

      {/* Payment Modal */}
      {showModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <div className="modal-header" style={modalHeaderStyle}>
              <h3 id="modal-title">
                {packageData ? `Complete Your ${packageData.name} Publication` : 'Complete Your Publication'}
              </h3>
              <button
                onClick={closeModal}
                style={closeButtonStyle}
                className="close-button"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="modal-body" style={modalBodyStyle}>
              {/* Package Summary */}
              <div
                className="package-summary"
                style={packageSummaryStyle}
              >
                <h4>{story?.title}</h4>
                <p className="price">
                  {packageData ? (
                    <>
                      ${(finalPrice || parseFloat(packageData.price) || 0).toFixed(2)} / {packageData.name}
                      {discountApplied && (
                        <span className="text-success small d-block">
                          (Original: ${(originalPrice || parseFloat(packageData.price) || 0).toFixed(2)} - {discountAmount || 0}% off)
                        </span>
                      )}
                    </>
                  ) : (
                    '$19.00 / Publication Review'
                  )}
                </p>
                
              </div>

              {/* Payment Method Selection */}
              <div
                className="payment-methods"
                style={paymentMethodsStyle}
              >
                <h5
                  style={{
                    marginBottom: "16px",
                    color: "#495057",
                  }}
                >
                  Choose Payment Method
                </h5>

                <div
                  className="payment-option"
                  style={{
                    ...paymentOptionStyle,
                    borderColor:
                      selectedPaymentMethod === "card"
                        ? "#007bff"
                        : "#e9ecef",
                    backgroundColor:
                      selectedPaymentMethod === "card"
                        ? "#f8f9ff"
                        : "white",
                  }}
                  onClick={() => setSelectedPaymentMethod("card")}
                >
                  <input
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    value="card"
                    checked={selectedPaymentMethod === "card"}
                    onChange={(e) =>
                      setSelectedPaymentMethod(e.target.value)
                    }
                    style={{ margin: 0 }}
                  />
                  <label htmlFor="card" style={paymentLabelStyle}>
                    <Icons.CreditCard
                      style={paymentIconStyle}
                    />
                    Stripe Payment
                  </label>
                </div>
              </div>

              {/* Payment Form */}
              {selectedPaymentMethod === "card" && (
                <button
                  className="btn btn-primary w-100"
                  onClick={handleProceedToStripe}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Processing...
                    </>
                  ) : (
                    "Proceed to Stripe"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Form = ({ prefill, story, package: packageData, ratings = [] }) => {
  const { auth } = usePage().props;
  
  // Function to strip HTML tags and clean up text
  const stripHtmlTags = (html) => {
    if (!html) return '';
    // Create a temporary div element
    const temp = document.createElement('div');
    temp.innerHTML = html;
    // Get text content and clean up extra whitespace
    return temp.textContent || temp.innerText || '';
  };

  const [character, setCharacter] = useState('');
  const [storyText, setStoryText] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(parseFloat(packageData?.price) || 0);
  const [finalPrice, setFinalPrice] = useState(parseFloat(packageData?.price) || 0);
  const [discountError, setDiscountError] = useState('');
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [formData, setFormData] = useState({
    title: story.title || '',
    genre: story.genre || '',
    rating: story.rating || '',
    character: prefill.character_name || '',
    content: stripHtmlTags(prefill.content || ''),
  });

  // Debug logging
  console.log('Form props:', { prefill, story, packageData });

  // Discount code validation function
  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    setIsValidatingDiscount(true);
    setDiscountError('');

    try {
      const response = await fetch('/api/validate-discount-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({ code: discountCode })
      });

      const data = await response.json();

      if (data.success) {
        setDiscountApplied(true);
        setDiscountAmount(data.discount);
        const currentPrice = originalPrice || parseFloat(packageData?.price) || 0;
        const discountValue = (currentPrice * data.discount) / 100;
        setFinalPrice(currentPrice - discountValue);
        setDiscountError('');
      } else {
        setDiscountError(data.message || 'Invalid discount code');
        setDiscountApplied(false);
        setFinalPrice(originalPrice || parseFloat(packageData?.price) || 0);
      }
    } catch (error) {
      setDiscountError('Error validating discount code');
      setDiscountApplied(false);
      setFinalPrice(originalPrice || parseFloat(packageData?.price) || 0);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  // Check user validation on component mount
  useEffect(() => {
    const user = auth.user;

    // Check if user is not logged in
    if (!user) {
      router.visit(route('login'));
      return;
    }

    // Check if user is a guest (is_guest = 1)
    if (user.is_guest) {
      router.visit(route('register'));
      return;
    }

    // Check if user account is inactive (is_active = 0)
    if (!user.is_active) {
      router.visit(route('login'));
      return;
    }
  }, [auth.user]);

  useEffect(() => {
    if (prefill) {
      setCharacter(prefill.character_name || '');
      // Strip HTML tags from the content before setting it
      setStoryText(stripHtmlTags(prefill.content || ''));
    }
  }, [prefill]);

  // Update prices when packageData changes
  useEffect(() => {
    if (packageData?.price) {
      const price = parseFloat(packageData.price) || 0;
      setOriginalPrice(price);
      setFinalPrice(price);
    }
  }, [packageData]);

  return (
    <Elements stripe={stripePromise}>
      <Layout headerClass="inner-header">
        <Head title="Publish Form" />
        <section className="py-200 sec-bg">
          <div className="container-xxl">
            <div className="d-flex justify-content-center align-items-center flex-column pb-100">
              <h1 className="heading mb-10">Publish Your <span>Story</span></h1>
              <p className="fs-20 mb-30">
                Share your imagination with the world — publish your story
              </p>
            </div>
            <div className="col-8 mx-auto">
              <div className="row justify-content-center publish-form-wrapper">
                <div className="col-md-12">
                  <div className="field-wrapper">
                    <label className='label-field d-block' htmlFor="title">Cover Image</label>
                    <img src={story.cover_image ? `/storage/${story.cover_image}` : '/assets/images/default-cover.jpg'} alt="" className='img-fluid object-fit-cover' style={{ maxHeight: '100px' }} />
                  </div>
                  <div className="field-wrapper">
                    <label className='label-field' htmlFor="title">Title</label>
                    <TextInput type="text" className="input-field" id="title" name="title" value={story.title} readOnly
                    // onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="field-wrapper">
                    <label className='label-field' htmlFor="title">Character</label>
                    <TextInput value={character} type="text" className="input-field" id="character" name="character" readOnly
                    // onChange={(e) => setFormData({ ...formData, character: e.target.value })}
                    />
                  </div>
                  <div className="field-wrapper">
                    <label className='label-field' htmlFor="title">Genre</label>
                    <TextInput type="text" className="input-field" id="title" value={story.genre} name="title" readOnly />
                  </div>
                  <div className="field-wrapper">
                    <label className='label-field' htmlFor="rating">Content Rating</label>
                    <select 
                      className="input-field" 
                      id="rating" 
                      name="rating" 
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    >
                      <option value="">Select Rating</option>
                      {ratings.map((rating) => (
                        <option key={rating.id} value={rating.name}>
                          {rating.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-wrapper">
                    <label className='label-field' htmlFor="title">Description</label>
                    <textarea name="your_story" className="input-field textarea-field" value={storyText} id="your_story" readOnly></textarea>
                  </div>
                  
                  {/* Discount Code Section */}
                  <div className="field-wrapper discount-code-wrapper">
                    <label className='label-field '>Discount Code (Optional)</label>
                    <div className="d-flex mb-12">
                      <input 
                        type="text" 
                        className="input-field discount-code-field" 
                        placeholder="Enter your discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        disabled={isValidatingDiscount}
                      />
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={validateDiscountCode}
                        disabled={isValidatingDiscount || !discountCode.trim()}
                      >
                        {isValidatingDiscount ? 'Validating...' : 'Apply'}
                      </button>
                    </div>
                    {discountError && <div className="text-danger small mb-12">{discountError}</div>}
                    
                    {/* Price Display */}
                    <div className="bg-light input-field p-3 rounded">
                      <div className="d-flex justify-content-between mb-8">
                        <span>Original Price:</span>
                        <span>${(originalPrice || 0).toFixed(2)}</span>
                      </div>
                      {discountApplied && (
                        <>
                          <div className="d-flex justify-content-between text-success mb-8">
                            <span>Discount ({discountAmount}%):</span>
                            <span>-${(((originalPrice || 0) * discountAmount) / 100).toFixed(2)}</span>
                          </div>
                          <hr className="my-8" />
                          <div className="d-flex justify-content-between fw-bold">
                            <span>Final Price:</span>
                            <span className="text-success">${(finalPrice || 0).toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <h4 className='pay-hd'>Pay With Stripe</h4>
                  <CheckoutForm
                    story={story}
                    character={character}
                    storyText={storyText}
                    package={packageData}
                    finalPrice={finalPrice}
                    discountApplied={discountApplied}
                    discountCode={discountCode}
                    discountAmount={discountAmount}
                    originalPrice={originalPrice}
                    rating={formData.rating}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <style jsx>{`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .payment-option:hover {
            border-color: #007bff !important;
            background-color: #f8f9ff !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
          }
          
          .payment-option {
            transition: all 0.2s ease;
          }
          
          .close-button:hover {
            background-color: #e9ecef !important;
            color: #495057 !important;
          }
        `}</style>
      </Layout>
    </Elements>
  )
}

// Modal Styles
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  backdropFilter: "blur(2px)",
};

const modalContentStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  width: "90%",
  maxWidth: "550px",
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
  animation: "modalSlideIn 0.3s ease-out",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "24px 24px 20px 24px",
  borderBottom: "1px solid #e1e5e9",
  backgroundColor: "#f8f9fa",
  borderTopLeftRadius: "12px",
  borderTopRightRadius: "12px",
};

const closeButtonStyle = {
  background: "none",
  border: "none",
  fontSize: "28px",
  cursor: "pointer",
  color: "#6c757d",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  transition: "all 0.2s ease",
  ":hover": {
    backgroundColor: "#e9ecef",
    color: "#495057",
  },
};

const modalBodyStyle = {
  padding: "24px",
};

const packageSummaryStyle = {
  textAlign: "center",
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  border: "1px solid #e9ecef",
};

const paymentMethodsStyle = {
  marginBottom: "24px",
};

const paymentOptionStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "12px",
  padding: "16px",
  border: "2px solid #e9ecef",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":hover": {
    borderColor: "#007bff",
    backgroundColor: "#f8f9ff",
  },
};

const paymentLabelStyle = {
  display: "flex",
  alignItems: "center",
  marginLeft: "12px",
  cursor: "pointer",
  flex: 1,
  fontSize: "16px",
  fontWeight: "500",
  color: "#495057",
};

const paymentIconStyle = {
  marginRight: "12px",
  width: "24px",
  height: "24px",
  color: "#6c757d",
};

export default Form