import Button from '../common/Button'
import React, { useRef } from "react";
import Slider from "react-slick";
const heroSlides = [
    {
        title: "Where Every Story Leaves a Mark",
        description: "Join our creative community. Explore, interact, and create your own version of timeless tales.",
        imageCard1: "/assets/images/banner-card-01.webp",
        imageCard2: "/assets/images/banner-card-02.webp",
        imageCard3: "/assets/images/banner-card-03.webp",
    },
    {
        title: "Unleash Your Creativity",
        description: "Embrace your imagination and craft stories that resonate for generations to come.",
        imageCard1: "/assets/images/banner-card-01.webp",
        imageCard2: "/assets/images/banner-card-02.webp",
        imageCard3: "/assets/images/banner-card-03.webp",
    },
    {
        title: "Craft Your Story, in Your own Way",
        description: "Dive into a world of possibilities. Share your unique narrative with the world and leave your mark.",
        imageCard1: "/assets/images/banner-card-01.webp",
        imageCard2: "/assets/images/banner-card-02.webp",
        imageCard3: "/assets/images/banner-card-03.webp",
    },
];
const HeroBanner = () => {
    const sliderRef = useRef(null);
    const settings = {
        dots: false,
        arrows: false,
        fade: true,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 2000,
        pauseOnHover: false,
        pauseOnFocus: false,
        pauseOnDotsHover: false,
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
        <section className='hero-banner overflow-hidden z-2'>
            <div className="container-xxl">
                <Slider ref={sliderRef} {...settings}>
                    {heroSlides.map((heroSlide, index) => {
                        const isMainHeading = heroSlide.title === "Craft Your Story, in Your own Way";
                        return (
                            <div key={index}>
                                <div className="d-flex justify-content-center align-items-center flex-column">

                                    {isMainHeading ? (
                                        <h1 className='hd-lg fw-500 mb-20 text-center text-white'>
                                            {heroSlide.title}
                                        </h1>
                                    ) : (
                                        <h2 className='hd-lg fw-500 mb-20 text-center text-white'>
                                            {heroSlide.title}
                                        </h2>
                                    )}
                                    <p className='para-dark mb-20 text-center'>
                                        {heroSlide.description}
                                    </p>
                                    <div className="d-flex flex-column flex-md-row gap-20 mb-20 ">
                                        <a href='/stories' className="btn btn-primary">Continue Your Story in Your Own Way</a>
                                        <a href='/stories' className="btn btn-secondary">View Stories</a>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center justify-content-center position-relative">
                                    <div className="image-center-container image-container position-relative z-1">
                                        <div className="image-left-container position-absolute image-container-xxl">
                                            <img src={heroSlide.imageCard1} alt="banner-image" />
                                        </div>
                                        <img src={heroSlide.imageCard2} className='hero-banner-center-img' alt="banner-image" />
                                        <div className="image-right-container position-absolute image-container-xxl">
                                            <img src={heroSlide.imageCard3} alt="banner-image" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Slider>
            </div>
        </section>
    )
}

export default HeroBanner