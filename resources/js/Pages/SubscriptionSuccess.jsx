import React from 'react'
import { Head, Link } from '@inertiajs/react'
import Layout from '@/Layouts/Layout'
import { Icons } from '@/utils/icons'

const SubscriptionSuccess = ({ package: packageData, subscription, user, error }) => {
  // Add error boundary for route errors
  const handleRouteError = (routeName) => {
    console.error(`Route '${routeName}' not found`);
    return '#';
  };

  // Add safety check for route function
  const safeRoute = (routeName) => {
    try {
      if (typeof route === 'function') {
        return route(routeName);
      } else {
        console.error('Route function not available');
        return handleRouteError(routeName);
      }
    } catch (err) {
      console.error(`Route '${routeName}' error:`, err);
      return handleRouteError(routeName);
    }
  };

  if (error) {
    return (
      <Layout>
        <Head title="Payment Error" />
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <Icons.Error className="text-danger" style={{ fontSize: '4rem' }} />
                  </div>
                  <h2 className="text-danger mb-3">Payment Error</h2>
                  <p className="text-muted mb-4">{error}</p>
                  <Link href={safeRoute('packages')} className="btn btn-primary">
                    <Icons.ArrowLeft className="me-2" />
                    Back to Packages
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!packageData || !subscription) {
    return (
      <Layout>
        <Head title="Subscription Success" />
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <Icons.CheckCircle className="text-success" style={{ fontSize: '4rem' }} />
                  </div>
                  <h2 className="text-success mb-3">Subscription Activated!</h2>
                  <p className="text-muted mb-4">Your subscription has been successfully activated.</p>
                  <Link href={safeRoute('user-dashboard.user.dashboard')} className="btn btn-primary">
                    <Icons.Dashboard className="me-2" />
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (priceCents) => {
    if (!priceCents) return 'N/A'
    return `$${(priceCents / 100).toFixed(2)}`
  }

  return (
    <Layout headerClass="inner-header">
      <Head title="Subscription Success" />
      <section className="pt-200 pb-100 sec-bg">
      <div className="container ">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            {/* Success Header */}
            {/* <div className="text-center mb-5">
              <div className="mb-4">
                <Icons.CheckCircle className="text-success" style={{ fontSize: '4rem' }} />
              </div>
              <h1 className="text-success mb-3">Welcome to Premium!</h1>
              <p className="text-muted lead">Your subscription has been successfully activated</p>
            </div> */}

            {/* Package Details Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-primary-theme py-20  text-white">
                <h4 className="mb-0 d-flex align-items-center fs-20">
                  <Icons.Package className="me-2" />
                  Package Details
                </h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <h5 className="text-primary mb-2 fs-20">{packageData.name}</h5>
                    <p className="text-muted mb-0 fs-16">Subscription Plan</p>
                  </div>
                  <div className="col-md-6 mb-3 text-md-end">
                    <h4 className="text-success mb-0 fs-20">{formatPrice(packageData.price_cents)}</h4>
                    <p className="text-muted mb-0 fs-16">{packageData.interval || 'month'}</p>
                  </div>
                </div>
                
                <hr />
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <Icons.Words className="text-info me-2" />
                      <div>
                        <strong>{packageData.words_limit?.toLocaleString() || 'Unlimited'}</strong>
                        <p className="text-muted mb-0 small">Daily Word Limit</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <Icons.Book className="text-warning me-2" />
                      <div>
                        <strong>{packageData.stories_limit?.toLocaleString() || 'Unlimited'}</strong>
                        <p className="text-muted mb-0 small">Monthly Stories</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Subscription Details Card */}
            <div className="card border-0 shadow-sm mb-30">
              <div className="card-header bg-primary-theme py-20  text-white">
                <h4 className="mb-0 d-flex fs-20 align-items-center">
                  <Icons.Subscription className="me-2" />
                  Subscription Information
                </h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <Icons.User className="text-primary me-2" />
                      <div>
                        <strong>{user.name}</strong>
                        <p className="text-muted mb-0 small">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <Icons.Status className="text-success me-2" />
                      <div>
                        <strong className="text-capitalize">{subscription.status}</strong>
                        <p className="text-muted mb-0 small">Status</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <hr />
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <Icons.Calendar className="text-warning me-2" />
                      <div>
                        <strong>{formatDate(subscription.current_period_start)}</strong>
                        <p className="text-muted mb-0 small">Started On</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <Icons.ExpiredFill className="text-danger me-2" />
                      <div>
                        <strong>{formatDate(subscription.current_period_end)}</strong>
                        <p className="text-muted mb-0 small">Next Billing</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                                                  <a href={safeRoute('user-dashboard.user.dashboard')} className="btn btn-primary btn-lg">
                   <Icons.Dashboard className="me-2" />
                   Go to Dashboard
                 </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>
    </Layout>
  )
}

// Wrap the component with error boundary
const SubscriptionSuccessWithErrorBoundary = (props) => {
  try {
    return <SubscriptionSuccess {...props} />;
  } catch (error) {
    console.error('SubscriptionSuccess component error:', error);
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-5">
                <div className="mb-4">
                  <Icons.Error className="text-danger" style={{ fontSize: '4rem' }} />
                </div>
                <h2 className="text-danger mb-3">Something went wrong</h2>
                <p className="text-muted mb-4">We encountered an error while loading the success page.</p>
                <a href="/packages" className="btn btn-primary">
                  <Icons.ArrowLeft className="me-2" />
                  Back to Packages
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default SubscriptionSuccessWithErrorBoundary
