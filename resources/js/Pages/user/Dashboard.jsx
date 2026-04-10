import React, { useState } from 'react'
import DashboardLayout from '../../Layouts/DashboardLayout'
import { usePage, router } from '@inertiajs/react'
import { CCard, CCardBody, CRow, CCol } from '@coreui/react'
import { Icons } from '../../utils/icons'
import Swal from 'sweetalert2'
import axios from 'axios'

const UserDashboard = () => {
  const { user, metrics } = usePage().props;
  // const { user, metrics } = usePage().props
  
  // State for toggle switch
  // When cancelAtPeriodEnd is true, auto-renewal is disabled, so toggle should be false
  // When cancelAtPeriodEnd is false/undefined, auto-renewal is enabled, so toggle should be true
  const [isAutoRenewalEnabled, setIsAutoRenewalEnabled] = useState(metrics?.cancelAtPeriodEnd === false);
  
  // Debug logging to understand the toggle state
  console.log('Toggle Debug:', {
    cancelAtPeriodEnd: metrics?.cancelAtPeriodEnd,
    isAutoRenewalEnabled: isAutoRenewalEnabled,
    subscriptionStatus: metrics?.subscriptionStatus
  });

  // Helper function to get subscription status styling
  const getSubscriptionStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { color: 'text-success', icon: 'check-circle' };
      case 'canceled':
        return { color: 'text-danger', icon: 'x-circle' };
      case 'past_due':
        return { color: 'text-warning', icon: 'exclamation-triangle' };
      case 'incomplete':
        return { color: 'text-info', icon: 'clock' };
      case 'trialing':
        return { color: 'text-primary', icon: 'star' };
      default:
        return { color: 'text-muted', icon: 'user' };
    }
  };

  const handleToggleRenewal = async (event) => {
    if (!metrics?.subscriptionId) {
      Swal.fire({
        title: 'No Subscription Found',
        text: 'You need an active subscription to toggle renewal settings.',
        icon: 'warning',
        confirmButtonColor: '#6c757d',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Check if subscription is canceled or inactive
    if (metrics?.subscriptionStatus === 'Canceled' || metrics?.subscriptionStatus === 'canceled') {
      Swal.fire({
        title: 'Subscription Canceled',
        text: 'Your subscription has been canceled and cannot be toggled for renewal.',
        icon: 'warning',
        confirmButtonColor: '#6c757d',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Check if subscription is not active
    if (metrics?.subscriptionStatus !== 'Active' && metrics?.subscriptionStatus !== 'active') {
      Swal.fire({
        title: 'Subscription Not Active',
        text: `Your subscription status is "${metrics?.subscriptionStatus}". Only active subscriptions can toggle renewal settings.`,
        icon: 'warning',
        confirmButtonColor: '#6c757d',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Get current toggle state
    const newState = !isAutoRenewalEnabled;

    // Show loading toast
    const loadingToast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 0,
      didOpen: (toast) => {
        Swal.showLoading();
      }
    });
    
    loadingToast.fire({
      title: 'Updating auto-renewal...'
    });

    try {
      // Make API call directly
      const response = await axios.post(route('subscription.toggle-renewal', metrics?.subscriptionId));
      
      // Close loading toast
      Swal.close();
      
      if (response.data.success) {
        // Update the toggle state
        setIsAutoRenewalEnabled(newState);
        
        // Show success toast
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        
        Toast.fire({
          icon: 'success',
          title: response.data.message || 'Auto-renewal updated successfully!'
        });
      }
    } catch (error) {
      // Close loading toast
      Swal.close();
      
      // Reset toggle state on error - no need to do anything as state wasn't updated yet
      
      const errorMessage = error.response?.data?.error || 'Failed to update auto-renewal settings';
      
      // Show error toast
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      
      Toast.fire({
        icon: 'error',
        title: errorMessage
      });
    }
  };

  const subscriptionStyle = getSubscriptionStatusStyle(metrics?.subscriptionStatus);

  // Check if subscription is expiring soon (within 7 days)
  const isExpiringSoon = metrics?.subscriptionEndsAt &&
    new Date(metrics.subscriptionEndsAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    new Date(metrics.subscriptionEndsAt) > new Date();

  // Calculate days until expiration
  const getDaysUntilExpiration = () => {
    if (!metrics?.subscriptionExpireDate) return null;
    const expireDate = new Date(metrics.subscriptionExpireDate);
    const today = new Date();
    const diffTime = expireDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiration = getDaysUntilExpiration();



  // Calculate subscription duration
  const getSubscriptionDuration = () => {
    if (!metrics?.subscriptionPurchasedDate) return null;
    const purchaseDate = new Date(metrics.subscriptionPurchasedDate);
    const today = new Date();
    const diffTime = today - purchaseDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const subscriptionDuration = getSubscriptionDuration();

  // Check if user should consider upgrading
  const shouldUpgrade = () => {
    if (!metrics?.dailyWordLimit || !metrics?.monthlyStoryLimit) return false;
    
    const dailyUsagePercentage = (metrics.dailyWords / metrics.dailyWordLimit) * 100;
    const monthlyUsagePercentage = (metrics.monthlyStories / metrics.monthlyStoryLimit) * 100;
    
    return dailyUsagePercentage >= 80 || monthlyUsagePercentage >= 80;
  };

  const upgradeReason = () => {
    if (!metrics?.dailyWordLimit || !metrics?.monthlyStoryLimit) return null;
    
    const dailyUsagePercentage = (metrics.dailyWords / metrics.dailyWordLimit) * 100;
    const monthlyUsagePercentage = (metrics.monthlyStories / metrics.monthlyStoryLimit) * 100;
    
    if (dailyUsagePercentage >= 80) {
      return `You're using ${Math.round(dailyUsagePercentage)}% of your daily word limit`;
    } else if (monthlyUsagePercentage >= 80) {
      return `You're using ${Math.round(monthlyUsagePercentage)}% of your monthly story limit`;
    }
    return null;
  };

    // Helper function to get progress bar color based on usage
  const getProgressBarColor = (used, limit) => {
    if (!limit || limit === 0) return 'bg-secondary';
    
    const percentage = (used / limit) * 100;
    
    if (percentage >= 90) return 'bg-danger';      // Red when 90%+ used
    if (percentage >= 75) return 'bg-warning';    // Yellow when 75%+ used
    if (percentage >= 50) return 'bg-info';       // Blue when 50%+ used
    return 'bg-success';                           // Green when under 50%
  };

  // Handle early renewal with SweetAlert2 confirmation
  const handleRenewEarly = () => {
    // Validate that user has an active subscription
    if (!metrics?.subscriptionId) {
      Swal.fire({
        title: 'No Active Subscription',
        text: 'You need an active subscription to renew. Please subscribe first.',
        icon: 'warning',
        confirmButtonColor: '#6c757d',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (metrics?.subscriptionStatus !== 'Active') {
      Swal.fire({
        title: 'Subscription Not Active',
        text: 'Your subscription is not currently active. Please check your subscription status.',
        icon: 'warning',
        confirmButtonColor: '#6c757d',
        confirmButtonText: 'OK',
      });
      return;
    }

    Swal.fire({
      title: 'Renew Subscription Early?',
      html: `
        <div class="text-start">
          <p class="mb-3">Are you sure you want to renew your <strong>${metrics?.subscriptionPackage || 'current'} subscription</strong> early?</p>
          
          <div class="alert alert-primary">
            <i class="bi bi-package me-2"></i>
            <strong>Current Package:</strong> ${metrics?.subscriptionPackage || 'Standard'}
            <br>
            <strong>Daily Limit:</strong> ${metrics?.dailyWordLimit || 0} words | <strong>Monthly Limit:</strong> ${metrics?.monthlyStoryLimit || 0} stories
          </div>
          
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            <strong>Benefits of early renewal:</strong>
            <ul class="mb-0 mt-2">
              <li>Uninterrupted service</li>
              <li>No downtime</li>
              <li>Maintain all current benefits</li>
              <li>Keep your usage progress</li>
            </ul>
          </div>
          
          <div class="alert alert-warning">
            <i class="bi bi-credit-card me-2"></i>
            <strong>Payment Information:</strong>
            <ul class="mb-0 mt-2">
              <li>Your default payment method will be charged immediately</li>
              <li>Amount: Based on your current package pricing</li>
              <li>New billing cycle starts from today</li>
            </ul>
          </div>
          
          ${daysUntilExpiration !== null && daysUntilExpiration > 0 ? `
            <div class="alert alert-warning">
              <i class="bi bi-calendar me-2"></i>
              <strong>Current expiration:</strong> ${new Date(metrics?.subscriptionExpireDate).toLocaleDateString()} (${daysUntilExpiration} days remaining)
            </div>
          ` : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="bi bi-check-circle me-2"></i>Yes, Renew Now',
      cancelButtonText: '<i class="bi bi-x-circle me-2"></i>Cancel',
      reverseButtons: true,
      showLoaderOnConfirm: true,
      customClass: {
        popup: 'swal-wide',
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary'
      },
      preConfirm: async () => {
        try {
          // Make actual API call to renew the subscription
          const response = await axios.post(route('subscription.renew'));
          
          if (response.data.success) {
            return response.data;
          } else {
            throw new Error(response.data.error || 'Renewal failed');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.error || error.message || 'Renewal failed';
          
          // Handle specific payment-related errors
          if (errorMessage.includes('payment method') || errorMessage.includes('Payment failed')) {
            Swal.showValidationMessage(`
              <div class="text-start">
                <strong>Payment Issue:</strong> ${errorMessage}
                <br><br>
                <small class="text-muted">
                  Please ensure your payment method is valid and has sufficient funds.
                  <br>
                  You can update your payment method in your account settings.
                </small>
              </div>
            `);
          } else {
            Swal.showValidationMessage(`Renewal failed: ${errorMessage}`);
          }
          
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const renewalData = result.value;
        
        // Show success message with actual data from backend
        Swal.fire({
          title: 'Subscription Renewed!',
          html: `
            <div class="text-center">
              <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
              <p class="mt-3">Your <strong>${renewalData.package_name || metrics?.subscriptionPackage || 'subscription'}</strong> has been successfully renewed!</p>
              <div class="alert alert-success">
                <i class="bi bi-calendar-check me-2"></i>
                <strong>New expiration date:</strong> ${new Date(renewalData.new_end_date).toLocaleDateString()}
              </div>
              <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                <strong>Billing cycle:</strong> ${renewalData.interval || 'Monthly'}
              </div>
              ${renewalData.payment_id ? `
                <div class="alert alert-primary">
                  <i class="bi bi-credit-card me-2"></i>
                  <strong>Payment processed:</strong> ${renewalData.amount_paid || 'Amount charged'}
                  <br>
                  <small class="text-muted">Transaction ID: ${renewalData.payment_id}</small>
                </div>
              ` : ''}
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#198754',
          confirmButtonText: '<i class="bi bi-check me-2"></i>Great!',
        }).then(() => {
          // Refresh the page to show updated subscription data
          window.location.reload();
        });
      }
    });
  };

  return (
    <>
      <style>
        {`
          .swal-wide {
            width: 600px !important;
            max-width: 90vw !important;
          }
          .swal-wide .swal2-html-container {
            margin: 1rem 0;
          }
          .swal-wide .alert {
            margin-bottom: 0.5rem;
            padding: 0.75rem;
            border-radius: 0.375rem;
          }
          .swal-wide .alert ul {
            padding-left: 1.5rem;
            margin-bottom: 0;
          }
          .swal-wide .alert li {
            margin-bottom: 0.25rem;
          }
          
          /* Toggle Switch Styles */
          .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
          }
          
          .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .toggle-label {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 24px;
            display: flex;
            align-items: center;
            padding: 2px;
          }
          
          .toggle-label:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          .toggle-switch input:checked + .toggle-label {
            background-color: #fea257;
          }
          
          .toggle-switch input:checked + .toggle-label:before {
            transform: translateX(26px);
          }
          
          .toggle-switch input:focus + .toggle-label {
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
          }
          
          .toggle-switch.warning input:checked + .toggle-label {
            background-color: #ffc107;
          }
          
          .toggle-switch.warning input:focus + .toggle-label {
            box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.25);
          }
          
          .toggle-switch.disabled .toggle-label {
            background-color: #e9ecef;
            cursor: not-allowed;
            opacity: 0.6;
          }
          
          .toggle-switch.disabled input:checked + .toggle-label {
            background-color: #e9ecef;
          }
          
          .toggle-switch.disabled .toggle-label:before {
            background-color: #adb5bd;
          }
          
          /* Hover effects */
          .toggle-switch:not(.disabled):hover .toggle-label {
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
          }
          
          .toggle-switch.warning:not(.disabled):hover .toggle-label {
            box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.1);
          }
        `}
      </style>
      <DashboardLayout>
      <div className="row row-gap-3">
        <div className="col-md-4 col-lg-3">
          <div className='dashboard-card-wrapper d-flex align-items-center gap-2'>
            <div>
              <div className="dcw-icon">
                <Icons.Book />
              </div>
            </div>
            <div>
              <h4 id="traffic" className="card-title mb-2 fw-medium">
                Written Stories
              </h4>
              <div className="small text-body-secondary">{metrics?.totalStories || 0}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-3">
          <div className='dashboard-card-wrapper d-flex align-items-center gap-2'>
            <div>
              <div className="dcw-icon">
                <Icons.AutoStories />
              </div>
            </div>
            <div>
              <h4 id="traffic" className="card-title mb-2 fw-medium">
                Stories published
              </h4>
              <div className="small text-body-secondary">{metrics?.publishedStories || 0}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-3">
          <div className='dashboard-card-wrapper d-flex align-items-center gap-2'>
            <div>
              <div className="dcw-icon">
                <Icons.Readme />
              </div>
            </div>
            <div>
              <h4 id="traffic" className="card-title mb-2 fw-medium">
                Total reads
              </h4>
              <div className="small text-body-secondary">{metrics?.totalReads || 0}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-3">
          <div className='dashboard-card-wrapper d-flex align-items-center gap-2'>
            <div>
              <div className="dcw-icon">
                <Icons.Heart />
              </div>
            </div>
            <div>
              <h4 id="traffic" className="card-title mb-2 fw-medium">
                Total Likes
              </h4>
              <div className="small text-body-secondary">
                {metrics?.totalLikes || 0}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-3">
          <div className='dashboard-card-wrapper d-flex align-items-center gap-2'>
            <div>
              <div className="dcw-icon">
                <Icons.Chat />
              </div>
            </div>
            <div>
              <h4 className='text-black card-title' id="card-title mb-2 fw-medium">
                Total Comments
              </h4>
              <div className="small text-body-secondary">
                {metrics?.totalComments || 0}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-3">
          <div className='dashboard-card-wrapper d-flex align-items-center gap-2' style={{ cursor: 'pointer' }} onClick={() => router.visit(route('user.publish-requests'))}>
            <div>
              <div className="dcw-icon">
                <Icons.FileText />
              </div>
            </div>
            <div>
              <h4 className='text-black card-title' id="card-title mb-2 fw-medium">
                Publish Requests
              </h4>
              <div className="small text-body-secondary">
                View & Track Status
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-3">
          <div className='dashboard-card-wrapper d-flex align-items-center gap-2'>
            <div>
              <div className="dcw-icon">
                <Icons.Payment />
              </div>
            </div>
            <div>
              <h4 className='text-black card-title' id="card-title mb-0 fw-medium">
                Subscription status
              </h4>
              <div className={`small ${subscriptionStyle.color}`}>
                <Icons.Check className="me-1" />
                {metrics?.subscriptionStatus || 'No Subscription'}
                {metrics?.subscriptionPackage && (
                  <span className="ms-2 text-muted">({metrics.subscriptionPackage})</span>
                )}
                {metrics?.isTrialing && (
                  <div className="mt-1">
                    <small className="text-primary">
                      <Icons.Clock className="me-1" />
                      Trial Period
                    </small>
                  </div>
                )}
                {metrics?.subscriptionEndsAt && (
                  <div className="mt-1">
                    <small className={isExpiringSoon ? "text-warning" : "text-muted"}>
                      {isExpiringSoon ? <Icons.ExpiredFill className="me-1" /> : <Icons.Calendar className="me-1" />}
                      {isExpiringSoon ? "Expires soon: " : "Ends: "}
                      {new Date(metrics.subscriptionEndsAt).toLocaleDateString()}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-3">
          <div className='dashboard-card-wrapper d-flex align-items-center gap-2'>
            <div>
              <div className="dcw-icon">
                <Icons.Subscription />
              </div>
            </div>
            <div>
              <h4 className='text-black card-title' id="card-title mb-0 fw-medium">
                Subscription Purchased
              </h4>
              <div className="small text-body-secondary">
                {metrics?.subscriptionPurchasedDate ? (
                  <>
                    <Icons.Check className="me-1 text-success" />
                    {new Date(metrics.subscriptionPurchasedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                    {subscriptionDuration !== null && (
                      <div className="mt-1">
                        <small className="text-success">
                          <Icons.Clock className="me-1" />
                          {subscriptionDuration === 0 ? (
                            'Today'
                          ) : subscriptionDuration === 1 ? (
                            '1 day ago'
                          ) : (
                            `${subscriptionDuration} days ago`
                          )}
                        </small>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-muted">No subscription</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-3">
          <div className='dashboard-card-wrapper d-flex align-items-center gap-2'>
            <div>
              <div className="dcw-icon">
                <Icons.ExpiredFill />
              </div>
            </div>
            <div>
              <h4 className='text-black card-title' id="card-title mb-0 fw-medium">
                Subscription Expiry
              </h4>
              <div className="small text-body-secondary">
                {metrics?.subscriptionExpireDate ? (
                  <>
                    <Icons.ExpiredFill className={`me-1 ${isExpiringSoon ? 'text-warning' : 'text-danger'}`} />
                    {new Date(metrics.subscriptionExpireDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                    {daysUntilExpiration !== null && (
                      <div className="mt-1">
                        <small className={daysUntilExpiration <= 7 ? 'text-warning' : 'text-success'}>
                          {daysUntilExpiration <= 7 ? <Icons.ExpiredFill className="me-1" /> : <Icons.Clock className="me-1" />}
                          {daysUntilExpiration > 0 ? (
                            `${daysUntilExpiration} day${daysUntilExpiration === 1 ? '' : 's'} remaining`
                          ) : daysUntilExpiration === 0 ? (
                            'Bills today!'
                          ) : (
                            'Expired'
                          )}
                        </small>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-muted">No billing date set</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-3">
          <div className='dashboard-card-wrapper d-flex align-items-center gap-2'>
            <div>
              <div className="dcw-icon">
                <Icons.ExpiredFill />
              </div>
            </div>
            <div>
              
              <div className="small text-body-secondary">
                {metrics?.subscriptionStatus === 'Canceled' || metrics?.subscriptionStatus === 'canceled' ? (
                  <div className="d-flex align-items-center gap-2">
                    <div className="toggle-switch disabled">
                      <input type="checkbox" id="toggle-canceled" disabled />
                      <label htmlFor="toggle-canceled" className="toggle-label">
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <span className="text-muted">
                      <Icons.X className="me-1" />
                      Subscription Canceled
                    </span>
                  </div>
                ) : metrics?.subscriptionStatus !== 'Active' && metrics?.subscriptionStatus !== 'active' ? (
                  <div className="d-flex align-items-center gap-2">
                    <div className="toggle-switch warning">
                      <input type="checkbox" id="toggle-inactive" onClick={(e) => handleToggleRenewal(e)} />
                      <label htmlFor="toggle-inactive" className="toggle-label">
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <span className="text-warning">
                      <Icons.ExclamationTriangle className="me-1" />
                      Subscription Inactive
                    </span>
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-2">
                    <div className="toggle-switch">
                      <input type="checkbox" id="toggle-renewal" checked={isAutoRenewalEnabled} onChange={(e) => handleToggleRenewal(e)} />
                      <label htmlFor="toggle-renewal" className="toggle-label">
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <span className="text-black">
                      {/* <Icons.ToggleOn className="me-1" /> */}
                      Auto Renewal
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Limits Section */}
      <div className="row mt-5">
        <div className="col-12 mb-3">
          <h4 className="fw-medium text-dark mb-0 text-24 d-flex align-items-center gap-2">
            <Icons.Speedometer className='text-muted' />
            Usage Limits & Progress
          </h4>
          {/* <p className="text-muted mb-0 small">Track your daily word usage and monthly story submissions (only approved stories count)</p> */}
        </div>
        <div className="col-lg-6 col-md-12 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="card-title mb-0 fw-medium text-dark d-flex align-items-center gap-2">
                  <Icons.PencilSquare className='text-muted' />
                  Daily Word Limit
                </h5>
                {/* <small className="text-muted d-block">Approved community stories only</small> */}
                <span className="badge bg-primary-theme rounded-pill fs-6">
                  {metrics?.dailyWords || 0} / {metrics?.dailyWordLimit || 0}
                </span>
              </div>

              {metrics?.dailyWordLimit > 0 ? (
                <>
                  <div className="progress mb-3" style={{ height: '10px', borderRadius: '5px' }}>
                    <div
                      className={`progress-bar ${getProgressBarColor(metrics.dailyWords, metrics.dailyWordLimit)}`}
                      role="progressbar"
                      style={{
                        width: `${Math.min((metrics.dailyWords / metrics.dailyWordLimit) * 100, 100)}%`,
                        borderRadius: '5px',
                        transition: 'width 0.6s ease'
                      }}
                      aria-valuenow={metrics.dailyWords}
                      aria-valuemin="0"
                      aria-valuemax={metrics.dailyWordLimit}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      <Icons.ArrowLeft className="me-1" />
                      {metrics.dailyWordLimit - metrics.dailyWords} words remaining today
                    </small>
                    <small className={`fw-medium ${getProgressBarColor(metrics.dailyWords, metrics.dailyWordLimit).replace('bg-', 'text-')}`}>
                      <Icons.Percent className="me-1" />
                      {Math.round((metrics.dailyWords / metrics.dailyWordLimit) * 100)}% used
                    </small>
                  </div>
                  <div className="mt-2">
                    <small className="text-secondary-theme">
                      <Icons.Info className="me-1" />
                      Only approved community stories count toward your daily limit
                    </small>
                    {metrics?.pendingStories > 0 && (
                      <div className="mt-1">
                        <small className="text-muted">
                          <Icons.Clock className="me-1" />
                          {metrics.pendingStories} pending stories not counted yet
                        </small>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-3">
                  <i className="bi bi-info-circle text-muted fs-1"></i>
                  <p className="text-muted mb-0 mt-2">Please subscribe to start tracking your writing progress.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-md-12 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="card-title mb-0 fw-medium text-dark d-flex align-items-center gap-2">
                <Icons.Book className='text-muted'/>
                  Monthly Story Limit
                </h5>
                {/* <small className="text-muted d-block">Approved community stories only</small> */}
                <span className="badge bg-primary-theme rounded-pill fs-6">
                  {metrics?.monthlyStories || 0} / {metrics?.monthlyStoryLimit || 0}
                </span>
              </div>

              {metrics?.monthlyStoryLimit > 0 ? (
                <>
                  <div className="progress mb-3" style={{ height: '10px', borderRadius: '5px' }}>
                    <div
                      className={`progress-bar ${getProgressBarColor(metrics.monthlyStories, metrics.monthlyStoryLimit)}`}
                      role="progressbar"
                      style={{
                        width: `${Math.min((metrics.monthlyStories / metrics.monthlyStoryLimit) * 100, 100)}%`,
                        borderRadius: '5px',
                        transition: 'width 0.6s ease'
                      }}
                      aria-valuenow={metrics.monthlyStories}
                      aria-valuemin="0"
                      aria-valuemax={metrics.monthlyStoryLimit}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      <Icons.ArrowLeft className="me-1" />
                      {metrics.monthlyStoryLimit - metrics.monthlyStories} stories remaining this month
                    </small>
                    <small className={`fw-medium ${getProgressBarColor(metrics.monthlyStories, metrics.monthlyStoryLimit).replace('bg-', 'text-')}`}>
                      <Icons.Percent className="me-1" />
                      {Math.round((metrics.monthlyStories / metrics.monthlyStoryLimit) * 100)}% used
                    </small>
                  </div>
                  <div className="mt-2">
                    <small className="text-secondary-theme">
                      <Icons.Info className="me-1" />
                      Only approved community stories count toward your monthly limit
                    </small>
                    {metrics?.pendingStoriesThisMonth > 0 && (
                      <div className="mt-1">
                        <small className="text-muted">
                          <Icons.Clock className="me-1" />
                          {metrics.pendingStoriesThisMonth} pending stories this month not counted yet
                        </small>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-3">
                  <i className="bi bi-info-circle text-muted fs-1"></i>
                  <p className="text-muted mb-0 mt-2">Please subscribe to start tracking your writing progress.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Recommendation Banner */}
      {shouldUpgrade() && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-info border-0 shadow-sm">
              <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                <Icons.Lightbulb className="text-warning fs-3 me-3" />
                <div>
                  <h6 className="mb-1 fw-medium text-dark">Upgrade Recommendation</h6>
                  <p className="mb-0 text-dark">
                    {upgradeReason()}. Consider upgrading to get higher limits and more features.
                  </p>
                </div>
              </div>
              <a 
                href={route('packages')} 
                className="btn btn-warning btn-sm"
              >
                <Icons.ArrowUp className="me-2" />
                View Upgrades
              </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Management Section */}
      {metrics?.subscriptionStatus && metrics.subscriptionStatus !== 'No Subscription' ? (
        // Check if subscription is active
        metrics.subscriptionStatus === 'Active' ? (
          // User has ACTIVE subscription - show management cards
          <div className="row mt-4">
            <div className="col-12 mb-3">
              <h4 className="fw-medium text-dark mb-0 text-24 d-flex align-items-center gap-2">
                <Icons.CreditCard className='text-muted' />
                Subscription Management
              </h4>
              <p className="text-muted mb-0 small">Upgrade, renew, or manage your subscription</p>
            </div>
            
            <div className="col-lg-12 col-md-12">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="card-title mb-0 fw-medium text-dark">
                      Upgrade Subscription
                    </h5>
                    <span className="badge bg-primary-theme rounded-pill">Recommended</span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-muted mb-2">
                      Get more features and higher limits with our premium packages
                    </p>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className="badge bg-light text-dark border">
                        Higher word limits
                      </span>
                      <span className="badge bg-light text-dark border">
                        More story submissions
                      </span>
                      <span className="badge bg-light text-dark border">
                        Priority support
                      </span>
                    </div>
                  </div>
                  
                  <div className="d-grid">
                    <a
                      href={route('packages')} 
                      className="btn btn-primary btn-lg"
                    >
                      View Upgrade Options
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* <div className="col-lg-6 col-md-12">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="card-title mb-0 fw-medium text-dark">
                      Renew Subscription
                    </h5>
                    <span className="badge bg-primary-theme rounded-pill">Active</span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-muted mb-2">
                      Your subscription is currently active. Renew early to avoid any interruptions.
                    </p>
                    {daysUntilExpiration !== null && daysUntilExpiration <= 30 && (
                      <div className="alert alert-warning py-2 mb-3">
                        <Icons.ExpiredFill className="me-2" />
                        <small>
                          <strong>Renewal Reminder:</strong> Your subscription expires in {daysUntilExpiration} day{daysUntilExpiration === 1 ? '' : 's'}.
                        </small>
                      </div>
                    )}
                    
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className="badge bg-light text-dark border">
                        Uninterrupted access
                      </span>
                      <span className="badge bg-light text-dark border">
                        Keep your data
                      </span>
                      <span className="badge bg-light text-dark border">
                        Maintain benefits
                      </span>
                    </div>
                  </div>
                  
                  <div className="d-grid">
                    <button 
                      onClick={() => handleRenewEarly()}
                      className="btn btn-primary btn-lg"
                    >
                      Renew Early
                    </button>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        ) : (
          // User has INACTIVE/EXPIRED subscription - show renewal card
          <div className="row mt-4">
            <div className="col-12 mb-3">
              <h4 className="fw-medium text-dark mb-0 text-24 d-flex align-items-center gap-2">
                <Icons.ExpiredFill className='text-warning' />
                Subscription Expired
              </h4>
              <p className="text-muted mb-0 small">Your subscription has expired. Renew to continue enjoying premium features.</p>
            </div>
            
            <div className="col-md-12">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="card-title mb-0 fw-medium text-dark">
                      Renew Your Subscription
                    </h5>
                    <span className="badge bg-warning rounded-pill">Expired</span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-muted mb-2">
                      Your subscription benefits have been paused. Renew now to restore access.
                    </p>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className="badge bg-light text-dark border">
                        Restore premium features
                      </span>
                      <span className="badge bg-light text-dark border">
                        Continue where you left off
                      </span>
                      <span className="badge bg-light text-dark border">
                        No data loss
                      </span>
                    </div>
                  </div>
                  
                  <div className="d-grid">
                    <a
                      href={route('packages')} 
                      className="btn btn-warning btn-lg"
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Renew Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        // User has no subscription - show purchase card
        <div className="row mt-5">
          <div className="col-12 mb-3">
            <h4 className="fw-medium text-dark mb-0 text-24 d-flex align-items-center gap-2">
              <Icons.CreditCard className='text-muted' />
              Get Started with Premium
            </h4>
            <p className="text-muted mb-0 small">Choose a subscription plan to unlock premium features</p>
          </div>
          
          <div className="col-md-12">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="card-title mb-0 fw-medium text-dark">
                    Choose Your Plan
                  </h5>
                  <span className="badge bg-success rounded-pill">New</span>
                </div>
                
                <div className="mb-3">
                  <p className="text-muted mb-2">
                    Start your journey with our flexible subscription plans
                  </p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-light text-dark border">
                      Daily word limits
                    </span>
                    <span className="badge bg-light text-dark border">
                      Monthly story submissions
                    </span>
                    <span className="badge bg-light text-dark border">
                      Community features
                    </span>
                  </div>
                </div>
                
                <div className="d-grid">
                  <a
                    href={route('packages')} 
                    className="btn btn-primary btn-lg"
                  >
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    View Plans & Subscribe
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription Details */}
      {metrics?.subscriptionStatus && metrics.subscriptionStatus !== 'No Subscription' && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3 fw-medium text-dark">
                  <Icons.Info className="me-2 text-info" />
                  Current Subscription Details
                </h5>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-light rounded-circle sm-check-cirlce  me-3">
                        <Icons.Check />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-medium">Package</h6>
                        <p className="text-muted mb-0">{metrics.subscriptionPackage || 'Standard'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-light rounded-circle sm-check-cirlce me-3">
                      <Icons.Check />
                        
                      </div>
                      <div>
                        <h6 className="mb-1 fw-medium">Billing Cycle</h6>
                        <p className="text-muted mb-0">
                          {metrics.subscriptionPackage?.includes('Yearly') ? 'Annual' : 'Monthly'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-light rounded-circle sm-check-cirlce me-3">
                      <Icons.Check />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-medium">Daily Word Limit</h6>
                        <p className="text-muted mb-0">{metrics.dailyWordLimit || 0} words</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-light rounded-circle sm-check-cirlce me-3">
                      <Icons.Check />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-medium">Monthly Story Limit</h6>
                        <p className="text-muted mb-0">{metrics.monthlyStoryLimit || 0} stories</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add more sections: recent stories, profile links, etc. */}
    </DashboardLayout>
    </>
  )
}

export default UserDashboard
