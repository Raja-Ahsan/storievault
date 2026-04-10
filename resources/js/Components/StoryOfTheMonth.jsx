import React, { useRef } from "react";
import Slider from "react-slick";
import { Icons } from '../utils/icons';
const stories = [
  {
    title: "Death at Fallow End",
    subtitle: "In the style of Martha Grimes",
    description:
      "The village of Fallow End never expected to make the papers. It was the sort of place that looked designed for biscuit tins: hedgerows blooming where no one planted them, honey-colored cottages with mossy slate roofs, and a high street so picturesque it was legally impossible to walk it without someone waving. The pub had beams older than the Queen’s English, and the bakery’s scones were the subject of regional debate.",
    image: "/assets/images/story-month-right-01.webp",
  },
  {
    title: "The Fog at Willow Moor",
    subtitle: "In the style of Agatha Christie",
    description:
      "The village of Fallow End never expected to make the papers. It was the sort of place that looked designed for biscuit tins: hedgerows blooming where no one planted them, honey-colored cottages with mossy slate roofs, and a high street so picturesque it was legally impossible to walk it without someone waving. The pub had beams older than the Queen’s English, and the bakery’s scones were the subject of regional debate.",
    image: "/assets/images/story-month-right-01.webp",
  },
];

// Custom Arrows
const PrevArrow = ({ onClick }) => (
  <div className="story-month-custom-arrow custom-prev" onClick={onClick}>
    <Icons.ArrowLeft />
  </div>
);

const NextArrow = ({ onClick }) => (
  <div className="story-month-custom-arrow custom-next" onClick={onClick}>
    <Icons.ArrowRight />
  </div>
);


const StoryOfTheMonth = () => {
  const sliderRef = useRef(null);
  const settings = {
    dots: true,
    arrows: false,
    fade: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    customPaging: i => (
      <span className="dot-number">{i + 1}</span>
    ),
    appendDots: dots => (
      <div className="custom-dots">
        <ul className="story-month-dots d-flex gap-20">{dots}</ul>
      </div>
    ),
  };

  return (
    <section className="story-month">
      <div className="container">
        <div className="col-lg-8">
          <h2 className="hd-lg fw-500 mb-20 text-center text-lg-start text-uppercase">Story of the Month</h2>
        </div>
      </div>

      <div className="story-month-bg">
        <div className="container">
          <div className="row justify-content-between align-items-center row-gap-40">

            {/* Left Column with Text & Arrows */}
            <div className="col-lg-6 position-relative">
              {/* Arrows Positioned Inside the Column */}
              <div className="story-month-custom-arrows d-flex gap-3 mb-4" style={{ top: 0, right: 0 }}>
                <div className="prev-arrow" onClick={() => sliderRef.current.slickPrev()}>
                  <Icons.ArrowLeft className="text-white fs-30" />
                </div>
                <div className="next-arrow" onClick={() => sliderRef.current.slickNext()}>
                  <Icons.ArrowRight className="text-white fs-30" />
                </div>
              </div>

              <Slider ref={sliderRef} {...settings}>
                {stories.map((story, index) => (
                  <div key={index}>
                    <h3 className="mb-20 fw-400 fs-40 secondry-font text-white" style={{ fontWeight: '400' }}>
                      {story.title}
                    </h3>
                    {/* <h5 className="fs-24 text-primary mb-20">{story.subtitle}</h5> */}
                    <p className="text-white mb-30 secondry-font text-20">
                      {story.description}
                    </p>
                  </div>
                ))}
              </Slider>
            </div>

            {/* Right Column with Image */}
            <div className="col-lg-4">
              <div className="story-month-right d-flex justify-content-center justify-content-lg-end">
                {/* You may move image out of the map and show current story based on index if needed */}
                <img src={stories[0]?.image} alt={stories[0]?.title} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default StoryOfTheMonth;
