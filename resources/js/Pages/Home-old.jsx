import { Link, Head, usePage } from '@inertiajs/react';
import Layout from '../Layouts/Layout';
import { useEffect, useState } from 'react';
import Slider from "react-slick";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

const Home = () => {

  const NextArrow = (props) => {

    const { onClick } = props;
    return (
      <div
        className="custom-arrow next-arrow"
        style={{
          position: 'absolute',
          top: '36%',
          right: '-17px',
          transform: 'translateY(-36%)',
          zIndex: 1,
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'var(--primary-theme, #3a5a40)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}
        onClick={onClick}
      >
        <FaChevronRight />
      </div>
    );
  };

  const PrevArrow = (props) => {
    const { onClick } = props;
    return (
      <div
        className="custom-arrow prev-arrow"
        style={{
          position: 'absolute',
          top: '36%',
          left: '-17px',
          transform: 'translateY(-36%)',
          zIndex: 1,
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'var(--primary-theme, #3a5a40)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}
        onClick={onClick}
      >
        <FaChevronLeft />
      </div>
    );
  };
  const { props } = usePage();
  const [stories, setStories] = useState([]);

  console.log('Home page props:', props);

  useEffect(() => {
    if (props.latestStories && props.latestStories.length > 0) {
      console.log('Setting stories from props:', props.latestStories);
      setStories(props.latestStories);
    }
  }, [props.latestStories]);

  const storyCount = stories.length;
  const slidesToShow = Math.min(storyCount);
  const infiniteMode = storyCount > slidesToShow;
  const showArrows = storyCount > 1;

  // No automatic refresh on component mount
  return (
    <Layout>
      <Head title="Home" />

      <section className="hero-banner position-relative text-center text-sm-start overflow-hidden">
        <video
          autoPlay
          muted
          loop
          className="position-absolute w-100 h-100 object-fit-cover"
          // className="w-100 h-100 object-fit-cover"
          style={{ top: 0, left: 0, zIndex: -1 }}
        >
          <source src="assets/videos/video-banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div
          className="position-absolute w-100 h-100"
          style={{ top: 0, left: 0, zIndex: -1, backgroundColor: 'rgb(0 0 0 / 77%)' }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="col-lg-9 offset-lg-3 pt-100 hero-banner-content" data-aos-duration="3000" data-aos="fade-down">
              <span className="text-white fs-32 ls-8">Verba aeternum fluentia</span>
              <h1 className="heading text-white"> Where <span>Every Story</span> Leaves a Mark</h1>
              <p className="fs-24 text-white mb-40">
                Join our creative community. Explore, interact, and create your own version of timeless tales.
              </p>
              <div className="d-flex align-items-center flex-column flex-sm-row gap-20">
                <Link href={route('stories.index')} className="btn btn-secondary">View Stories</Link>
                <button className="btn btn-primary">Continue Story At Your Own Way</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <section className='video-banner-sec position-relative'>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <video
                autoPlay
                muted
                loop
                className="w-100 h-100 object-fit-cover"
                // className="w-100 h-100 object-fit-cover"
                style={{ top: 0, left: 0, zIndex: -1 }}
              >
                <source src="assets/videos/video-banner.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div
                className="position-absolute w-100 h-100"
                style={{ top: 0, left: 0, zIndex: -1, backgroundColor: 'rgba(0,0,0,0.6)' }}
              ></div>
            </div>
          </div>
        </div>

      </section> */}

      <section className="sec-2 py-100">
        <div className="container">
          <div className="row align-items-center row-gap-40 flex-column flex-lg-row align-items-center text-center text-lg-start mx-auto mx-lg-0">
            <div className="col-lg-6" data-aos-duration="3000" data-aos="fade-right">
              <div className="circle position-relative mb-30 mx-auto mx-lg-0">
                <img src="/assets/images/logo.webp" className="position-absolute start-0 end-0 mx-auto" alt="" />
              </div>
              <span className="fs-32 light-black ls-8">Featured Story</span>
              <h2 className="heading mb-20">Death at <span className="">Fallow</span> End</h2>
              <h5 className="secondry-font fs-30 light-black mb-20">The Mysterious Murder at Fallow End</h5>
              <p className="fs-20 mb-30">
                A tale wrapped in shadows, where ancient secrets meet modern art in an eerie village. When the Earl of Halverton is found dead in his koi pond, the quiet village of Fallow End is turned upside down. Unveil the mystery with Detective Felix Merton and uncover the dark undercurrents of wealth, power, and love.
              </p>
              <span className="label bg-secondry-theme text-white fs-20 py-10 px-20 radius-60">In Style of : Anne Rice style</span>
            </div>
            <div className="col-lg-6" data-aos-duration="3000" data-aos="fade-left">
              <h3 className="fs-36 text-primary-theme text-end sec-2-right-hd fw-600">Two Main Characters</h3>
              <div className="position-relative">
                <div className="big-img-wrapper">
                  <img src="/assets/images/book-01.png" alt="" />
                </div>
                <div className="position-absolute big-img-cover-wrapper">
                  <img src="/assets/images/cover-01.png" className="" alt="" />
                  <button className="btn btn-primary position-absolute">Read the Full Story</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec-3 position-relative py-40 sec-bg">
        <div className="container">
          <div className="row align-items-center justify-content-between row-gap-80 flex-column flex-lg-row align-items-center text-center text-lg-start mx-auto mx-lg-0">
            <div className="col-lg-5" data-aos-duration="3000" data-aos="fade-right">
              <div className="img-wrapper position-relative">
                <img src="/assets/images/book-02.png" width="600" height="901" alt="" />
                <div className="position-absolute sec-3-cover-1">
                  <img src="/assets/images/cover-02.png" className="" alt="" />
                  <Link href="" className="btn btn-primary position-absolute">Read the Full Story</Link>
                </div>
                <div className="position-absolute sec-3-cover-2">
                  <img src="/assets/images/cover-03.png" className="" alt="" />
                  <Link href="" className="btn btn-primary position-absolute">Read the Full Story</Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6 position-relative sec-3-right-area" data-aos-duration="3000" data-aos="fade-left">
              <div className="circle position-relative mb-30 mx-auto mx-lg-0">
                <img src="/assets/images/logo.webp" className="position-absolute start-0 end-0 mx-auto" alt="" />
              </div>
              <span className="fs-32 light-black ls-8">Featured Story</span>
              <h2 className="heading mb-20" style={{ lineHeight: '.8' }}>Death at Follow End <span className="fs-54">(Romantic Mystery)</span></h2>
              <h5 className="secondry-font fs-30 light-black mb-20">A Love Rekindled in the Darkest of Times</h5>
              <p className="fs-20 mb-30">
                In the quaint village of Fallow End, a murder has shaken the community to its core. But for Detective Sarah Blackwood, the case is more than just a professional challenge—it's a journey back to her roots and a confrontation with her past. As she delves deeper into the investigation, she finds herself working alongside her former flame, now the town's enigmatic doctor, James Harrington. Together, they must navigate not only the web of deceit surrounding the murder but also the unresolved feelings that still simmer between them. Will they solve the case before the killer strikes again? And can they find their way back to each other amidst the chaos?
              </p>
              <span className="label bg-secondry-theme text-white fs-20 py-10 px-20 radius-60">In Style of : Victoria Saccenti style</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec-4 py-100">
        <div className="container">
          <div className="row text-center mb-70">
            <div className="col-12" data-aos-duration="3000" data-aos="fade-down">
              <span className="fs-32 light-black ls-8">Explore</span>
              <h2 className="heading mb-10">Other <span className="">Stories</span></h2>
              <h5 className="secondry-font fs-30 light-black mb-20">Other Dark Tales Await</h5>
              <p className="fs-20 mb-30">
                Our collection of gripping stories are set against richly detailed backdrops of mystery, suspense, and romance. Dive deep into narratives that will keep you at the edge of your seat.
              </p>
            </div>
          </div>
          <div className="story-slider-container">

            {stories.length > 0 && (
              <Slider
                dots={false}
                infinite={stories.length > 3}
                speed={500}
                slidesToShow={3}
                slidesToScroll={1}
                nextArrow={showArrows ? <NextArrow /> : null}
                prevArrow={showArrows ? <PrevArrow /> : null}
                responsive={[
                  {
                    breakpoint: 1024,
                    settings: {
                      slidesToShow: 2,
                    }
                  },
                  {
                    breakpoint: 600,
                    settings: {
                      slidesToShow: 1,
                    }
                  }
                ]}
              >
                {stories.map((story, index) => (
                  

                  <div key={index} className="">
                    <div style={{maxWidth: '450px'  }} className="story-card cards  rounded h-100 text-start" data-aos-duration="3000" data-aos="flip-left">
                      <img src={story.cover_image ? `/storage/${story.cover_image}` : '/assets/images/default-cover.jpg'} 
                      alt={story.title}
                       className="w-100 object-cover rounded mb-2"
                      />
                      
                      <div className="d-flex align-items-center justify-content-between mb-10">
                        <h4 className="light-black fs-36 fw-600">{story.title}</h4>
                        <div className='d-flex align-items-center'>
                          <img src="/assets/images/comments.svg" className="" alt="comments" />
                          <span className="pl-10">{story.comment_count || 0}</span>
                        </div>
                      </div>
                      <h4 className="fs-20 text-primary-theme text-capitalize mb-20 fw-600 pl-10">{story.author}</h4>
                      <div className="d-flex align-items-center mb-20 pl-10">
                        <i className="fas fa-eye text-primary-theme me-2"></i>
                        <h6 className="text-black fs-18 mb-0">{story.read_count || 0} People Read This Story</h6>
                      </div>
                      <Link href={`/stories/${story.id}`} className="btn btn-sm btn-primary mt-3">
                        Read More
                      </Link>
                    </div>
                  </div>
                ))}
              </Slider>
            )}
          </div>
        </div>
      </section>

      <section className="sec-5 pb-100">
        <div className="container">
          <div className="row row-gap-40 align-items-center justify-content-between flex-column flex-lg-row align-items-center text-center text-lg-start mx-auto mx-lg-0">
            <div className="col-lg-7" data-aos-duration="3000" data-aos="fade-right">
              <span className="fs-32 text-white ls-8">Sign In</span>
              <h2 className="heading mb-10 text-white">Sign In to <span>Continue Crafting</span> the Story Your Way</h2>
              <p className="fs-20 mb-20 sec-5-para text-white">
                Take the reins and let your imagination run wild! Log in to pick up where the story left off or create your own twists and turns. Your words, your world—continue the adventure as you see fit.
              </p>
              <p className="fs-24 text-white mb-40">
                Ready to shape the next chapter? Sign in now and bring your unique vision to life.
              </p>
              <div className="d-flex align-items-center gap-60 justify-content-center justify-content-lg-start flex-column flex-sm-row">
                <Link href='login' className="btn btn-secondary">Sign In</Link>
                <p className="fs-20 text-white">Don't have an account?<Link href='register' className="pl-30 text-primary-theme text-white">Sign Up Now</Link></p>
              </div>
            </div>
            <div className="col-lg-5" data-aos-duration="3000" data-aos="fade-left">
              <img src="/assets/images/laptop.png" alt="" />
            </div>
          </div>
        </div>
      </section>
    </Layout >
  );
};

export default Home;
