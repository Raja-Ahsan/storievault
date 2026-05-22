import React from 'react';
import Layout from '@/Layouts/Layout';
import { Head, Link } from '@inertiajs/react';
import '@/assets/styles/stories.css';

const DEFAULT_COVER = '/assets/images/default-cover.jpg';

const Index = ({ posts }) => {
  return (
    <Layout headerClass="inner-header">
      <Head title="Blog | StoriVault">
        <meta
          name="description"
          content="News, writing tips, community updates, and publishing guides from StoriVault."
        />
      </Head>
      <section className="stories-sec padding-section py-200 sec-bg">
        <div className="container">
          <div className="row text-center mb-70">
            <div className="col-12" data-aos-duration="3000" data-aos="fade-down">
              <span className="fs-32 light-black ls-8">Explore</span>
              <h2 className="heading mb-10">
                Our <span>Blog</span>
              </h2>
              <h5 className="secondry-font fs-30 light-black mb-20">Ideas for Writers &amp; Readers</h5>
              <p className="fs-20 mb-30 mx-auto" style={{ maxWidth: 720 }}>
                News, craft tips, community highlights, and publishing guidance—everything we share to help your
                StoriVault journey.
              </p>
            </div>
          </div>

          <div className="row mb-50 row-gap-40 align-items-stretch justify-content-center">
            {posts.data.length === 0 ? (
              <div className="col-12 text-center">
                <h3 className="secondry-font fs-24 mb-4">No posts yet</h3>
                <p className="fs-18 light-black">Published articles will appear here. Check back soon.</p>
              </div>
            ) : (
              posts.data.map((post) => (
                <div className="col-lg-4 col-md-6" key={post.id}>
                  <div className="cards h-100 d-flex flex-column" data-aos-duration="3000" data-aos="flip-left">
                    <div className="position-relative">
                      {post.featured && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            zIndex: 10,
                          }}
                        >
                          <span className="label bg-secondry-theme text-white fs-14 py-10 px-20 radius-60 d-inline-block">
                            Featured
                          </span>
                        </div>
                      )}
                      <Link href={route('blog.show', post.slug)} className="d-block text-black">
                        <img
                          src={post.featured_image || DEFAULT_COVER}
                          className="mb-20 w-100 story-book-img"
                          alt=""
                          onError={(e) => {
                            e.target.src = DEFAULT_COVER;
                          }}
                        />
                      </Link>
                    </div>
                    <h4 className="light-black fs-36 fw-600 mb-10">
                      <Link href={route('blog.show', post.slug)} className="text-decoration-none text-reset">
                        {post.title}
                      </Link>
                    </h4>
                    {post.excerpt && <p className="para-mid mb-20 flex-grow-1">{post.excerpt}</p>}
                    <div className="d-flex flex-wrap gap-10 mb-20">
                      {post.categories?.map((c) => (
                        <span key={c.id} className="label bg-secondry-theme text-white fs-16 py-10 px-20 radius-60 d-inline-block">
                          {c.name}
                        </span>
                      ))}
                    </div>
                    <Link href={route('blog.show', post.slug)} className="btn btn-primary mt-auto align-self-start">
                      Read article
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {posts.data.length > 0 && posts.last_page > 1 && (
            <div className="row mt-50">
              <div className="col-12">
                <nav aria-label="Blog pagination">
                  <ul className="pagination justify-content-center">
                    {posts.links.map((link, index) => {
                      let label = link.label;
                      if (label === '&laquo; Previous') {
                        label = '<i class="fas fa-chevron-left"></i>';
                      } else if (label === 'Next &raquo;') {
                        label = '<i class="fas fa-chevron-right"></i>';
                      }

                      return (
                        <li key={index} className={`page-item ${link.active ? 'active' : ''} ${link.url ? '' : 'disabled'}`}>
                          <Link
                            className="page-link secondry-font"
                            href={link.url || '#'}
                            preserveState
                            dangerouslySetInnerHTML={{ __html: label }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
