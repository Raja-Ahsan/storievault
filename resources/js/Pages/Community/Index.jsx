import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import LikeCount from '@/Components/stories/LikeCount';
import { debounce } from 'lodash';
import '@/assets/styles/stories.css';

export default function CommunityIndex({ stories, genres, filters, ratings }) {
  const [search, setSearch] = useState(filters.search || '');
  const [genre, setGenre] = useState(filters.genre || 'all');
  const [rating, setRating] = useState(filters.rating || 'all');

  // Debounce the search to avoid too many requests
  const debouncedSearch = debounce((value) => {
    router.get(route('community.index'), { search: value, genre }, { preserveState: true });
  }, 300);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Handle genre filter change
  const handleGenreChange = (e) => {
    const selectedGenre = e.target.value;
    setGenre(selectedGenre);
    router.get(route('community.index'), { search, genre: selectedGenre }, { preserveState: true });
  };
  const handleRatingChange = (e) => {
    const selectedRating = e.target.value;
    setRating(selectedRating);
    router.get(route('community.index'), { search, rating: selectedRating }, { preserveState: true });
  };

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  // No automatic refresh on component mount

  return (
    <Layout headerClass="inner-header">
      <Head title="Community Stories" />

      <section className="community-sec pt-200 pb-100 sec-bg">
        <div className="container">
          <div className="row text-center mb-70">
            <div className="col-12" data-aos-duration="3000" data-aos="fade-down">
              <span className="fs-32 light-black ls-8">Explore</span>
              <h2 className="heading mb-10">Community <span className="">Stories</span></h2>
              <h5 className="secondry-font fs-30 light-black mb-20">Stories Written by Our Community</h5>
              <p className="fs-20 mb-30">
                Discover unique continuations and interpretations of our stories, written by fellow community members.
                Find inspiration, enjoy creative twists, and see how others have expanded on our original tales.
              </p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="row mb-50">
            <div className="col-md-8 col-lg-6 mx-auto">
              <div className="d-flex flex-column flex-md-row gap-10 justify-content-center">
                <div className="flex-grow-1">
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
                <div>
                  <select
                    className="form-select secondry-font"
                    value={genre}
                    onChange={handleGenreChange}
                  >
                    <option value="all">All Genres</option>
                    {genres.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    className="form-select secondry-font"
                    value={rating || 'all'}
                    onChange={handleRatingChange}
                  >
                    <option value="all">All Ratings</option>
                    {ratings.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Spacing */}
          <div className="mb-30"></div>

          {/* Stories Grid */}
          <div className="row row-gap-40 align-items-center justify-content-center">
            {stories.data.length > 0 ? (
              stories.data.map((story) => (
                <div className="col-lg-4 col-md-6" key={story.id}>
                  <div className="cards" data-aos-duration="3000" data-aos="flip-left">
                    <div className="dynamic-cover-wrapper">
                    <img
                      src={story.cover_image ? `/storage/${story.cover_image}` : '/assets/images/book-03.png'}
                      className="mb-20 w-100 story-book-img"
                      alt={story.title}
                      onError={(e) => {
                        const fallbackImages = [
                          "/assets/images/image-not-found.png",
                        ];
                        e.target.src = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
                      }}
                      />
                      </div>
                    <div className="d-flex align-items-center justify-content-between mb-10">
                      <h4 className="light-black story-title">{story.title}</h4>
                      <div className='d-flex align-items-center gap-10'>
                        <span className='fs-18 text-primary-theme'>
                        <i className="fa-solid fa-comment"></i>
                        </span>
                        <span className="pl-10">{story.comment_count || 0}</span>
                      </div>
                    </div>
                    <h4 className="fs-20 text-primary-theme text-capitalize mb-20 fw-600 pl-10">{story.author}</h4>
                    <div className="d-flex justify-content-between align-items-center mb-20 pl-10">
                      <div className='d-flex align-items-center'>

                        <i className="fas fa-eye text-primary-theme me-2"></i>
                        <h6 className="text-black fs-18 mb-0">{story.read_count || 0} People Read This Story</h6>
                      </div>
                      <div>
                        <LikeCount className='gap-10' storyId={story.id} />
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-20 pl-10">
                      <div className="d-flex gap-10 align-items-center">
                        <span className="label bg-secondry-theme text-white fs-16 py-10 px-20 radius-60 d-inline-block">
                          {story.genre}
                        </span>
                        {story.rating && story.rating.name && (
                          <span className="label bg-primary-theme text-white fs-16 py-10 px-20 radius-60 d-inline-block">
                            {story.rating.name.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href={route('community.show', story.id)} className="btn btn-primary">Story Details</Link>
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
            <div className="row mt-50">
              <div className="col-12">
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center">
                    {stories.links.map((link, index) => {
                      // Clean up pagination labels
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
        </div>
      </section>
    </Layout>
  );
}
