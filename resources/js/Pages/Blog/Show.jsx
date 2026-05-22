import React from 'react';
import Layout from '@/Layouts/Layout';
import { Head, Link } from '@inertiajs/react';
import '@/assets/styles/stories.css';

const Show = ({ post }) => {
  const pageTitle = post.meta_title || post.title;
  const desc = post.meta_description || post.excerpt || '';

  const formattedDate =
    post.created_at &&
    new Date(post.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <Layout headerClass="inner-header">
      <Head title={`${pageTitle} | StoriVault Blog`}>
        {desc && <meta name="description" content={desc} />}
        {post.meta_tags && <meta name="keywords" content={post.meta_tags} />}
        {post.facebook_meta && <meta property="og:title" content={post.facebook_meta} />}
        {post.twitter_meta && <meta name="twitter:title" content={post.twitter_meta} />}
      </Head>

      <main>
        {/* Hero: same pattern as /blog listing (Stories section + Explore / heading) */}
        <section className="stories-sec padding-section py-200 sec-bg">
          <div className="container">
            <div className="row mb-30">
              <div className="col-12 d-flex justify-content-start">
                <Link href={route('blog.index')} className="btn btn-primary secondry-font">
                  <i className="fas fa-arrow-left me-2" />
                  Back to blog
                </Link>
              </div>
            </div>

            <div className="row text-center mb-40">
              <div className="col-12" data-aos-duration="3000" data-aos="fade-down">
                <span className="fs-32 light-black ls-8">Explore</span>
                <h2 className="heading mb-10">
                  Our <span>Blog</span>
                </h2>
                <h5 className="secondry-font fs-30 light-black mb-20 mx-auto" style={{ maxWidth: 720 }}>
                  Ideas for Writers &amp; Readers
                </h5>
              </div>
            </div>

            {/* Title block: same scale as About / Privacy (fs-70 hero titles) */}
            <div className="row justify-content-center text-center">
              <div className="col-12 col-xl-10">
                <h1 className="text-black fs-70 fw-500 mb-30 mx-auto" style={{ maxWidth: 960 }}>
                  {post.title}
                </h1>
                {formattedDate && (
                  <p className="fs-20 light-black mb-30 mb-lg-40">
                    <time dateTime={post.created_at}>{formattedDate}</time>
                  </p>
                )}
                <div className="d-flex flex-wrap gap-10 justify-content-center mb-0">
                  {post.categories?.map((c) => (
                    <span
                      key={c.id}
                      className="label bg-secondry-theme text-white fs-16 py-10 px-20 radius-60 d-inline-block"
                    >
                      {c.name}
                    </span>
                  ))}
                  {post.tags?.map((t) => (
                    <span
                      key={t.id}
                      className="label bg-light text-dark border fs-16 py-10 px-20 radius-60 d-inline-block"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Body: Privacy / Terms–style content column + story card image treatment */}
        <section className="privacy-policy-sec pb-100 pt-70 sec-bg">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-lg-10 col-xl-9">
                {post.featured_image && (
                  <div className="mb-50 text-center">
                    <img
                      src={post.featured_image}
                      alt=""
                      className="img-fluid w-100 story-book-img"
                      style={{ maxHeight: 480, objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div className="privacy-content">
                  {post.excerpt && (
                    <p className="text-black fs-20 fw-500 mb-40">{post.excerpt}</p>
                  )}

                  <div
                    className="category-page-content fs-18 light-black blog-article-body"
                    dangerouslySetInnerHTML={{ __html: post.content || '' }}
                  />
                </div>

                {post.faqs && post.faqs.length > 0 && (
                  <div className="row mt-50 mb-50 category-faq-section">
                    <div className="col-12">
                      <h3 className="secondry-font text-primary-theme fs-35 mb-30 text-center">Frequently Asked Questions</h3>
                      <div className="accordion" id="blogPostFaqAccordion" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {post.faqs.map((faq, index) => (
                          <div className="accordion-item" key={index}>
                            <h2 className="accordion-header">
                              <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#blog-faq-collapse-${index}`}
                                aria-expanded={false}
                                aria-controls={`blog-faq-collapse-${index}`}
                              >
                                {faq.question}
                              </button>
                            </h2>
                            <div
                              id={`blog-faq-collapse-${index}`}
                              className="accordion-collapse collapse"
                              data-bs-parent="#blogPostFaqAccordion"
                              aria-labelledby={`blog-faq-heading-${index}`}
                            >
                              <div className="accordion-body fs-18 light-black">{faq.answer}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Show;
