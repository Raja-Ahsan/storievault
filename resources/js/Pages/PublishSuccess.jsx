import React from 'react'
import { Head, Link } from '@inertiajs/react'
import Layout from '@/Layouts/Layout'
import { Icons } from '@/utils/icons'

const PublishSuccess = ({ publishRequest, session }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (priceCents) => {
    if (!priceCents) return 'N/A'
    return `$${(priceCents / 100).toFixed(2)}`
  }

  return (
    <Layout headerClass="inner-header">
      <Head title="Publication Request Submitted" />
      <section className="pt-200 pb-100 sec-bg">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8">
              {/* Success Header */}
              <div className="text-center mb-5">
                <div className="mb-10">
                  <Icons.CheckCircle className="text-success" style={{ fontSize: '4rem' }} />
                </div>
                <h1 className="text-success mb-10">Publication Request Submitted!</h1>
                <p className="text-muted lead mb-30" style={{fontSize: '2rem'}}>Your story has been submitted for review and payment has been processed successfully.</p>
              </div>

              {/* Story Details Card */}
              <div className="card border-0 shadow-sm mb-30">
                <div className="card-header bg-primary-theme py-20 text-white">
                  <h4 className="mb-0 d-flex align-items-center fs-20">
                    <Icons.Book className="me-2" />
                    Story Details
                  </h4>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <h5 className="text-primary mb-2 fs-20">{publishRequest?.title || 'N/A'}</h5>
                      <p className="text-muted mb-0 fs-16">Story Title</p>
                    </div>
                    <div className="col-md-6 mb-3 text-md-end">
                      <h4 className="text-success mb-0">{formatPrice(session?.amount_total)}</h4>
                      <p className="text-muted mb-0 fs-16">Publication Fee</p>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <Icons.Words className="text-info me-2" />
                        <div>
                          <strong>{publishRequest?.genre || 'N/A'}</strong>
                          <p className="text-muted mb-0 small">Genre</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <Icons.User className="text-warning me-2" />
                        <div>
                          <strong>{publishRequest?.character || 'N/A'}</strong>
                          <p className="text-muted mb-0 small">Main Character</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {publishRequest?.content && (
                    <>
                      <hr />
                      <div className="mb-3">
                        <h6 className="mb-2">Story Preview:</h6>
                        <div className="bg-light p-3 rounded">
                          <p className="mb-0 text-muted" style={{ 
                            maxHeight: '100px', 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {publishRequest.content}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Details Card */}
              <div className="card border-0 shadow-sm mb-30">
                <div className="card-header bg-primary-theme py-20 text-white">
                  <h4 className="mb-0 d-flex align-items-center fs-20">
                    <Icons.CreditCard className="me-2" />
                    Payment Information
                  </h4>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <Icons.Status className="text-success me-2" />
                        <div>
                          <strong className="text-capitalize text-success">Paid</strong>
                          <p className="text-muted mb-0 small">Payment Status</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <Icons.Calendar className="text-warning me-2" />
                        <div>
                          <strong>{formatDate(publishRequest?.created_at)}</strong>
                          <p className="text-muted mb-0 small">Submitted On</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="row">
                    {/* <div className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <Icons.Info className="text-info me-2" />
                        <div>
                          <strong>#{session?.id || 'N/A'}</strong>
                          <p className="text-muted mb-0 small">Stripe Session ID</p>
                        </div>
                      </div>
                    </div> */}
                    <div className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <Icons.Clock className="text-primary me-2" />
                        <div>
                          <strong>Under Review</strong>
                          <p className="text-muted mb-0 small">Current Status</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="card next-step-wrapper border-0 shadow-sm mb-30">
                <div className="card-header text-white py-20">
                  <h4 className="mb-0 d-flex align-items-center fs-20">
                    <Icons.Info className="me-2" />
                    What Happens Next?
                  </h4>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4 mb-3 text-center">
                      <div className="step-item">
                        <div className="step-number bg-primary-theme text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-10" style={{ width: '40px', height: '40px' }}>
                          1
                        </div>
                        <h6 className='mb-10'>Review Process</h6>
                        <p className="small text-muted">Our team will review your story for quality and content guidelines.</p>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3 text-center">
                      <div className="step-item">
                        <div className="step-number bg-primary-theme text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-10" style={{ width: '40px', height: '40px' }}>
                          2
                        </div>
                        <h6 className='mb-10'>Feedback</h6>
                        <p className="small text-muted">You'll receive feedback and any necessary revisions within 5-7 business days.</p>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3 text-center">
                      <div className="step-item">
                        <div className="step-number bg-primary-theme text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-10" style={{ width: '40px', height: '40px' }}>
                          3
                        </div>
                        <h6 className='mb-10'>Publication</h6>
                        <p className="small text-muted">Once approved, your story will be published and available to readers.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-center">
                <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                  <Link href="/stories" className="btn btn-primary btn-lg">
                    <Icons.Book className="me-2" />
                    View Stories
                  </Link>
                    {/* <Link href="/stories/create" className="btn btn-outline-primary btn-lg">
                      <Icons.Plus className="me-2" />
                      Write Another Story
                    </Link> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default PublishSuccess



