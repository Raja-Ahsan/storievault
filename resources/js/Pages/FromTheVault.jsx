import React, { useRef } from 'react'
import Layout from '@/Layouts/Layout'
import { Link, Head, usePage } from '@inertiajs/react'
import Slider from 'react-slick'
import { Icons } from '../utils/icons'

// Custom Arrows for Featured Stories
const PrevArrow = ({ onClick }) => (
  <div className="featured-arrow custom-prev" onClick={onClick}>
    <Icons.ArrowLeft />
  </div>
);

const NextArrow = ({ onClick }) => (
  <div className="featured-arrow custom-next" onClick={onClick}>
    <Icons.ArrowRight />
  </div>
);

const FromTheVault = () => {
  const { featuredStories } = usePage().props;
  const featuredSliderRef = useRef(null);

  // Featured Stories Slider Settings
  const featuredSliderSettings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplaySpeed: 2000,
    pauseOnDotsHover: false,
    customPaging: i => (
      <span className="dot-number">{i + 1}</span>
    ),
    appendDots: dots => (
      <div className="custom-dots">
        <ul className="featured-stories-dots">{dots}</ul>
      </div>
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <Layout headerClass="inner-header">
      <Head title="From the Vault" />
      <section className='pt-200 pb-100 sec-bg'>
        <div className="container text-center">
        <span class="fs-32 light-black ls-8">Explore</span>
          <h2 class="heading mb-10 text-center"> <span class="">From The Vault</span></h2>
        </div>
      </section>
      <section className='fearured-stories pb-100 sec-bg'>
        <div className="container">
          <div className="row row-gap-40">
            <div className="col-lg-6">
              <h2 className='hd-lg fw-500 mb-40 text-center text-lg-start'>Featured Stories</h2>
              <div className="fearured-stories-card overflow-hidden">
                {featuredStories && featuredStories.length > 0 ? (
                  <>
                    <Slider ref={featuredSliderRef} {...featuredSliderSettings}>
                      {featuredStories.map((story, index) => (
                        <div key={story.id} className="fearured-stories-card-inner">
                          <Link href={`/stories/${story.id}`} className=' text-black'>
                            <img style={{ minHeight: '180px' }}
                              src={story.cover_image ? `/storage/${story.cover_image}` : `/assets/images/image-not-found.png`}
                              className='mb-10 fsc-image'
                              alt={story.title}
                            />
                            <h6 className='text-sm text-uppercase mb-5'>{story.title}</h6>
                            <h6 className='fs-20 fw-400  mb-5' style={{ color: '#fea257' }}> <span className='text-black fw-500'>By</span> {story.author}</h6>
                            Read More
                          </Link>
                        </div>
                      ))}
                    </Slider>

                    {/* Custom Navigation Arrows */}
                    <div className="featured-custom-arrows mt-30 d-flex justify-content-start gap-20">
                    </div>
                  </>
                ) : (
                  <div className="col-12">
                    <p className="text-muted">No featured stories found. Be the first to share your story!</p>
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="mt-20 text-center text-lg-start">
                <h2 className='hd-md fw-700 mb-20 text-uppercase'>Death at Fallow End</h2>
                <h4 className='text-primary font-medium featured-sub-title secondry-font mb-20'>Fallow End had the perfume of rot beneath roses.</h4>
                <p className='para-mid mb-30'>
                  It masqueraded as a village of perfect English serenity—an illusion spun from moss-draped eaves, honeyed stone walls, and the gentle sigh of hedgerows whispering against flaking garden gates. But if one stayed still long enough in its meadows, one would hear it: the creak of something ancient refusing to die, and the hush of secrets wound tight as ivy around the bones of Halverton House.
                </p>
                <p className='para-mid mb-20'>
                  The Earl of Halverton, Crispin Forsythe, last of his line, had once been beautiful in the way marble statues are beautiful—cold, aloof, untouched by sweat or consequence. But that was a long time ago. Now, he was a man crumbling under the weight of heritage and debt, inviting strangers to drink champagne in his ancestral gallery while the floorboards moaned beneath them like weary ghosts.
                </p>
                <Link href="/" className='btn btn-primary text-white'>Read More</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default FromTheVault

