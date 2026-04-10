import { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import LikeCount from '@/Components/stories/LikeCount';
import { debounce } from 'lodash';
import Swal from 'sweetalert2';
import '@/assets/styles/stories.css';

const FAQ_ITEMS = [
  {
    question: 'What makes Storie Vault different from other reading platforms?',
    answer: 'Storie Vault offers a curated reading experience with a custom prompt story generator that lets readers shape narratives. It prioritizes quality over volume, offering diverse genres with intentional organization and a community that values the craft of storytelling.',
  },
  {
    question: 'How does the custom prompt story generator work?',
    answer: 'You input a mood, theme, character type, or scenario and the generator crafts a story tailored to those parameters. It blends your inputs with genre conventions to produce original, readable narratives every time.',
  },
  {
    question: 'Is Storie Vault free to use?',
    answer: 'Yes, Storie Vault is accessible to all readers. You can browse the best online stories to read across all genres without any paywall blocking your access to great fiction.',
  },
  {
    question: 'Can I publish my own stories on Storie Vault?',
    answer: 'Yes. Storie Vault welcomes writers who want their work to reach a serious, engaged readership. The platform is built equally for creators and consumers of great stories.',
  },
];

const DEFAULT_PAGE_TITLE = 'Custom Prompt Story Generator | Best Online Stories';
const DEFAULT_META_DESCRIPTION =
  'Explore the best online stories to read with our custom prompt story generator. Discover unique tales, fresh writers, and personalized storytelling at Storie Vault.';
const FALLBACK_INTRO_TEXT =
  'Browse our collection of gripping stories set against richly detailed backdrops of mystery, suspense, and romance. Find your next literary adventure.';

export default function Index({ stories, filters, flash, categoryPage = null }) {
  const [search, setSearch] = useState(filters.search || '');

  const pageTitle = categoryPage?.meta_title || DEFAULT_PAGE_TITLE;
  const pageDescription = categoryPage?.meta_description || DEFAULT_META_DESCRIPTION;

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        const url = filters.category
          ? `/${filters.category}-stories`
          : route('stories.index');
        router.get(url, { search: value }, { preserveState: true });
      }, 300),
    [filters.category]
  );

  // Function to render stars only (without number)
  const renderStarsOnly = (rating) => {
    if (!rating) return null;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="d-flex align-items-center gap-2" style={{
        background: '#000000',
        padding: '8px 12px',
        borderRadius: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="fas fa-star" style={{ color: '#CEA212', fontSize: '14px' }}></i>
        ))}
        {hasHalfStar && (
          <i className="fas fa-star-half-alt" style={{ color: '#CEA212', fontSize: '14px' }}></i>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="far fa-star" style={{ color: '#CEA212', fontSize: '14px', opacity: 0.5 }}></i>
        ))}
      </div>
    );
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Clean up debounce on unmount / when debounced handler changes
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Show success message with SweetAlert2 if flash success exists
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        title: 'Success!',
        text: flash.success,
        icon: 'success',
        confirmButtonText: 'Continue',
        confirmButtonColor: '#fea257',
        background: '#fff',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          content: 'swal-custom-content'
        },
        didOpen: () => {
          // Replace the icon with a proper success checkmark
          setTimeout(() => {
            const iconElement = document.querySelector('.swal2-icon');
            if (iconElement) {
              // Clear existing content
              iconElement.innerHTML = '';
              iconElement.className = 'swal2-icon';

              // Create custom success icon
              const successIcon = document.createElement('div');
              successIcon.style.cssText = `
                width: 100%;
                height: 100%;
                border: 4px solid #fea257;
                border-radius: 50%;
                position: relative;
                margin: 0 auto;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;

              `;

              // Create checkmark
              const checkmark = document.createElement('div');
              checkmark.style.cssText = `
                width: 30px;
                height: 20px;
                border: 4px solid #fea257;
                border-top: none;
                border-right: none;
                transform: rotate(-45deg);
                margin-top: -5px;
              `;

              successIcon.appendChild(checkmark);
              iconElement.appendChild(successIcon);
            }
          }, 50);
        }
      });
    }
  }, [flash?.success]);

  // No automatic refresh on component mount

  return (
    <Layout headerClass="inner-header">
      <Head title={pageTitle}>
        <meta name="description" content={pageDescription} />
      </Head>
      <section className="stories-sec padding-section py-200 sec-bg">
        <div className="container">
          <div className="row mb-20">
            <div className="col-12 d-flex justify-content-end">
              <Link href={route('stories.create')} className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>Create Story
              </Link>
            </div>
          </div>
          <div className="row text-center mb-70">
            <div className="col-12" data-aos-duration="3000" data-aos="fade-down">
              <span className="fs-32 light-black ls-8">Explore</span>
              <h2 className="heading mb-10">Our <span className="">Stories</span></h2>
              <h5 className="secondry-font fs-30 light-black mb-20">Discover Tales That Captivate</h5>
              <p className="fs-20 mb-30">
                {categoryPage?.meta_description || FALLBACK_INTRO_TEXT}
              </p>
            </div>
          </div>



          {/* Search Section */}
          <div className="row mb-50">
            <div className="col-md-8 col-lg-6 mx-auto">
              <div className="d-flex justify-content-center">
                <div className="flex-grow-1" style={{ maxWidth: '500px' }}>
                  <div className="input-group">
                    <span className="input-group-text text-white">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control secondry-font"
                      placeholder="Search stories..."
                      value={search}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spacing */}
          <div className="mb-30"></div>

          {/* Stories Grid */}
          <div className="row mb-50 row-gap-40 align-items-center justify-content-center">
            {stories.data.length > 0 ? (
              stories.data.map((story) => (
                <div className="col-lg-4 col-md-6" key={story.id}>
                  <div className="cards" data-aos-duration="3000" data-aos="flip-left">
                    <div className="position-relative">
                      {/* Rating Stars - Top Right */}
                      {story.average_rating && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          zIndex: 10
                        }}>
                          {renderStarsOnly(parseFloat(story.average_rating))}
                        </div>
                      )}
                      <img
                        src={story.cover_image_url || (story.cover_image ? `/storage/${story.cover_image}` : '/assets/images/default-cover.jpg')}
                        className="mb-20 w-100 story-book-img"
                        alt={story.title}
                        onError={(e) => {
                          e.target.src = '/assets/images/default-cover.jpg';
                        }}
                      />
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-10">
                      <h4 className="light-black fs-36 fw-600">{story.title}</h4>
                      <div className='d-flex align-items-center gap-10'>
                        <span className='fs-18 text-primary-theme'>
                          <i className="fas fa-comment me-2 text-primary-theme"></i>
                        </span>
                        <span className="">{story.comment_count}</span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-20">
                      <div className='d-flex align-items-center gap-10'>
                        <i className="fas fa-eye text-primary-theme"></i>
                        <h6 className="text-black fs-18 mb-0">{story.read_count} {story.read_count > 1 ? 'Reads' : 'Read'}</h6>
                      </div>
                      <LikeCount className='gap-10' storyId={story.id} />
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-20">
                      <div className="d-flex gap-10 align-items-center">
                        {story.genre && (
                          <span className="label bg-secondry-theme text-white fs-16 py-10 px-20 radius-60 d-inline-block">
                            {story.genre}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href={route('stories.show', story.id)} className="btn btn-primary">Story Details</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <h3 className="secondry-font fs-24 mb-4">No stories found</h3>
                <p className="fs-18">Try adjusting your search or filter to find what you're looking for.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {stories.data.length > 0 && (
            <div className="row mt-50 ">
              <div className="col-12">
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center">
                    {stories.links.map((link, index) => {
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
          {/* Category page content (admin-editable) — space below pagination / above block */}
          {categoryPage?.content && (
            <div className="row mb-50 mt-20">
              <div className="col-12">
                <div
                  className="category-page-content fs-18 light-black"
                  style={{ maxWidth: '900px', margin: '0 auto' }}
                  dangerouslySetInnerHTML={{ __html: categoryPage.content }}
                />
              </div>
            </div>
          )}
          {/* FAQs section - below content & story list, Bootstrap accordion */}
          {categoryPage?.faqs && categoryPage.faqs.length > 0 && (
            <div className="row mt-50 mb-50 category-faq-section">
              <div className="col-12">
                <h3 className="secondry-font text-primary-theme fs-35 mb-30 text-center">Frequently Asked Questions</h3>
                <div className="accordion" id="categoryFaqAccordion" style={{ maxWidth: '800px', margin: '0 auto' }}>
                  {categoryPage.faqs.map((faq, index) => (
                    <div className="accordion-item" key={index}>
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#faq-collapse-${index}`}
                          aria-expanded={index === 0}
                          aria-controls={`faq-collapse-${index}`}
                        >
                          {faq.question}
                        </button>
                      </h2>
                      <div
                        id={`faq-collapse-${index}`}
                        className="accordion-collapse collapse"
                        data-bs-parent="#categoryFaqAccordion"
                        aria-labelledby={`#faq-heading-${index}`}
                      >
                        <div className="accordion-body fs-18 light-black">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Marketing content block + FAQ (FAQ_ITEMS): only on main /stories — hide on category URLs (/adventure-stories) */}
      {!filters?.category && (
        <>
          {/* Reusable content block – global classes in content-block.css */}
          <section className="content-block-sec">
            <div className="content-block__inner">
              <h2 className="content-block__title">
                Every Story Worth Telling Lives Here 
              </h2>
              <p className="content-block__subtitle">
                Some stories arrive and change you permanently. Storie Vault is the home for those stories.
              </p>
              <div className="content-block__body">
                <p className="content-block__p">
                  It is a reading platform built for people who demand more than the ordinary, and it is powered by a custom prompt story generator that brings narrative to life on demand.
                </p>
                <p className="content-block__p">
                  Storie Vault is designed with intentionality. Every category, every tale, every word has a place. Whether you stumble upon it by accident or seek it with purpose, the best online stories to read are waiting right here.
                </p>
                <h3 className="content-block__heading">The Architecture of a Story That Breathes</h3>
                <p className="content-block__p">
                  Most reading platforms scatter their content without direction. Storie Vault organizes stories the way a great library organizes its shelves. You move through genres with clarity, and each click leads you deeper into a world that feels designed just for you.
                </p>
                <p className="content-block__p">
                  The custom prompt story generator on Storie Vault lets you shape the kind of narrative you crave. Whether you want heartbreak wrapped in fantasy or comedy stitched into suspense, the platform responds. It is not just a catalog. It is an engine.
                </p>
                <h3 className="content-block__heading">Why Readers Keep Coming Back</h3>
                <p className="content-block__p">
                  Readers return to Storie Vault because the best online stories to read are constantly refreshed. New voices appear daily. Emerging writers publish with confidence, and seasoned authors find a platform worthy of their craft. Perhaps what sets it apart is the community built around each story.
                </p>
                <p className="content-block__p">
                  Adding more to this, Storie Vault does not rely on algorithmic popularity contests. Discovery here is organic, honest, and layered. The stories surface because they deserve to, not because someone paid for placement.
                </p>
                <h3 className="content-block__heading">Stories Shaped by You, Not the Algorithm</h3>
                <p className="content-block__p">
                  The custom prompt story generator gives readers something no other platform offers. You describe a scenario, a mood, a character, and the platform constructs narrative that matches your imagination. It is storytelling democratized without sacrificing quality.
                </p>
                <p className="content-block__p">
                  Start your reading journey today at Storie Vault, where every story finds its reader.
                </p>
          
              </div>
            </div>
          </section>

          {/* Main /stories FAQs — tight spacing vs content above (no .padding-section: it adds 200px top) */}
          <section className="sec-bg stories-index-faq-sec">
            <div className="container">
              <div className="row mt-0 mb-30 category-faq-section">
                <div className="col-12">
                  <h3 className="secondry-font text-primary-theme fs-35 mb-20 text-center">
                    Frequently Asked Questions
                  </h3>
                  <div
                    className="accordion"
                    id="storiesIndexFaqAccordion"
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                  >
                    {FAQ_ITEMS.map((faq, index) => (
                      <div className="accordion-item" key={index}>
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#stories-index-faq-collapse-${index}`}
                            aria-expanded={false}
                            aria-controls={`stories-index-faq-collapse-${index}`}
                          >
                            {faq.question}
                          </button>
                        </h2>
                        <div
                          id={`stories-index-faq-collapse-${index}`}
                          className="accordion-collapse collapse"
                          data-bs-parent="#storiesIndexFaqAccordion"
                        >
                          <div className="accordion-body fs-18 light-black">{faq.answer}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </Layout>
  );
}
