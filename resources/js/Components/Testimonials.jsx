import React, { useRef } from 'react'
import Slider from 'react-slick'
import { Icons } from '../utils/icons';
const testimonials = [
  {
    id: 1,
    image: "/assets/images/testi-img-01.webp",
    name: "Eleanor Hart",
    designation: "Mystery Book Club President",
    description: "A chilling, atmospheric mystery that kept me guessing until the final page. 'Death At Fallow End' is a must-read for fans of classic British crime fiction.",
  },
  {
    id: 2,
    image: "/assets/images/testi-img-02.webp",
    name: "James Holloway",
    designation: "Author of The Ashcroft Files",
    description: "I couldn’t put it down. The setting is haunting, the characters are deeply layered, and the twists just keep coming.",
  },
]
// Custom Arrows
const PrevArrow = ({ onClick }) => (
  <div className="testi-arrow custom-prev" onClick={onClick}>
    <Icons.ArrowLeft />
  </div>
);

const NextArrow = ({ onClick }) => (
  <div className="testi-arrow custom-next" onClick={onClick}>
    <Icons.ArrowRight />
  </div>
);
const Testimonials = () => {
  const sliderRef = useRef(null);
  const settings = {
    dots: false,
    arrows: false,
    fade: false,
    infinite: true,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  return (
    <section className='testimonials-sec'>
      <div className='container'>
        <div className='row row-gap-40 justify-content-center justify-content-lg-start'>
          <div className='col-lg-4'>
            <div className='testimonials-title'>
              <h2 className='hd-lg fw-500 fs-60 text-center text-lg-start'>What Our Readers Said About Us</h2>
            </div>
          </div>
          <div className="col-md-8">
            <Slider ref={sliderRef} {...settings}>
              {testimonials.map((testimonial, index) => (
                  <div key={testimonial.id}>
                <div className="testi-card">
                    <div className="d-flex align-items-center mb-10 gap-20">
                      <div>
                        <img src={testimonial.image} alt={testimonial.name} />
                      </div>
                      <div>
                        <h3 className='fs-28 fw-700 secondry-font'>{testimonial.name},</h3>
                        <span className='fs-18 text-light-grey'>{testimonial.designation}</span>
                      </div>
                    </div>
                    <p className='mb-20 fs-16'>
                      {testimonial.description}
                    </p>
                      <img src="/assets/images/ratings.webp" alt="ratings"/>
                  </div>
                </div>
              ))}
            </Slider>
            <div className="testi-custom-arrows mt-30 d-flex justify-content-end gap-20 mb-4">
              <div className="prev-arrow" onClick={() => sliderRef.current.slickPrev()}>
                <Icons.ArrowLeft className=" fs-30 text-black" />
              </div>
              <div className="next-arrow" onClick={() => sliderRef.current.slickNext()}>
                <Icons.ArrowRight className=" fs-30 text-black" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Testimonials
