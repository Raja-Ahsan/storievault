import React from 'react'
import Layout from '@/Layouts/Layout'
import { Head } from '@inertiajs/react'
import Button from '@/Components/common/Button'
import { Icons } from '@/utils/icons'
import { Link } from '@inertiajs/react'

const Packages = ({ story, publishPackages = [] }) => {
  return (
    <Layout headerClass="inner-header">
      <Head title="Packages" />
      <section className="py-200 sec-bg">
        <div className="container-xxl">
          <div className="d-flex justify-content-center align-items-center flex-column pb-100">
            <h1 className="heading mb-10">Choose Your <span>Story Journey</span></h1>
            <p className="fs-20 mb-30">
              Unlock the full potential of your storytelling with our premium package designed for passionate writers and readers.
            </p>
          </div>
        </div>
        <div className="container-xxl">
          <div className="row justify-content-center">
            {publishPackages.length > 0 ? (
              publishPackages.map((pkg, index) => (
                <div key={pkg.id} className="col-lg-4">
                  {/* Package Card */}
                  <div className="publish-card package-card">
                    {/* Premium Badge */}
                    <div className="package-badge">
                      {pkg.name}
                    </div>

                    {/* Package Icon */}
                    <div className="package-icon">
                      <Icons.Premium className='fs-30 text-white' />
                    </div>

                    {/* Package Title */}
                    <h2 className="hd-md mb-20 package-title">
                      {pkg.name}
                    </h2>

                    {/* Price */}
                    <div className="mb-30">
                      <span className="package-price">
                        {pkg.price ? `$${parseFloat(pkg.price).toFixed(2)}` : 'Free'}
                      </span>
                    </div>

                    {/* Features List */}
                    <div className="mb-40 package-features">
                      {pkg.features && pkg.features.length > 0 ? (
                        pkg.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="package-feature-item">
                            <div className="feature-check-icon">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            </div>
                            <span className="para-mid feature-text">
                              {feature}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="package-feature-item">
                          <div className="feature-check-icon">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          </div>
                          <span className="para-mid feature-text">
                            No features listed
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <div className="d-grid">
                      {story?.id ? (
                        <a 
                          href={route('stories.publish.form', { 
                            story: story.id,
                            package: pkg.id,
                            package_name: pkg.name,
                            package_price: pkg.price
                          })}
                          className="btn btn-primary btn-lg package-cta-button"
                        >
                          Get Started Now
                        </a> 
                      ): (
                          <button className="btn btn-secondary btn-lg" disabled>
                            Loading...
                          </button>)}
                    </div>

                    {/* Money Back Guarantee */}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-lg-8 col-xl-6">
                {/* Default Package Card when no packages exist */}
                <div className="publish-card package-card">
                  {/* Premium Badge */}
                  <div className="package-badge">
                    Premium
                  </div>

                  {/* Package Icon */}
                  <div className="package-icon">
                    <Icons.Premium className='fs-30 text-white' />
                  </div>

                  {/* Package Title */}
                  <h2 className="hd-md mb-20 package-title">
                    Story Vault Premium
                  </h2>

                  {/* Price */}
                  <div className="mb-30">
                    <span className="package-price">$19</span>
                  </div>

                  {/* Features List */}
                  <div className="mb-40 package-features">
                    <div className="package-feature-item">
                      <div className="feature-check-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                      <span className="para-mid feature-text">
                        Unlimited story creation and publishing
                      </span>
                    </div>

                    <div className="package-feature-item">
                      <div className="feature-check-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                      <span className="para-mid feature-text">
                        Advanced character development tools
                      </span>
                    </div>

                    <div className="package-feature-item">
                      <div className="feature-check-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                      <span className="para-mid feature-text">
                        Priority community story approval
                      </span>
                    </div>

                    <div className="package-feature-item">
                      <div className="feature-check-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                      <span className="para-mid feature-text">
                        Exclusive writing workshops and tips
                      </span>
                    </div>

                    <div className="package-feature-item">
                      <div className="feature-check-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                      <span className="para-mid feature-text">
                        Advanced analytics and reader insights
                      </span>
                    </div>

                    <div className="package-feature-item">
                      <div className="feature-check-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                      <span className="para-mid feature-text">
                        24/7 priority customer support
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="d-grid">
                    {story?.id ? (
                      <Link href={route('stories.publish.form', { story: story.id })}
                        className="btn btn-primary btn-lg package-cta-button"
                      >
                        Get Started Now
                      </Link> 
                    ): (
                        <button className="btn btn-secondary btn-lg" disabled>
                          Loading...
                        </button>)}
                  </div>

                  {/* Money Back Guarantee */}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-100 package-info-section">
        <div className="container-xxl">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h3 className="hd-md mb-30 text-white">
                Ready to Transform Your Storytelling?
              </h3>
              <p className="para-mid mb-40 package-info-text">
                Join thousands of writers who have already elevated their craft with Story Vault Premium.
                Start your journey today and unlock the full potential of your creative voice.
              </p>
              <div className="d-flex gap-20 justify-content-center">
                <Button className="btn btn-primary">Start Free Trial</Button>
                <Button className="btn btn-secondary">Learn More</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Packages