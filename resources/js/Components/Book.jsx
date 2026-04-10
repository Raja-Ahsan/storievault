import React, { forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import "../../css/book.css";


const Book = forwardRef(({ pages = [], onInit, onFlip, coverImage, backcoverImage, allowCloseAfterBackCover = true }, bookRef) => {
    
    const allPages = [
        // Front Cover
        // add a background image instead of the image tag
        <div key="front-cover" className="book-cover front-cover">
            <div className="cover-image" style={{ backgroundImage: `url(${coverImage || "/assets/images/default-cover.jpg"})`, backgroundSize: 'cover', }}></div>,
        </div>,

        // Story Pages
        ...pages.map((content, index) => (
            <div key={index} className="demoPage">
                {content}
            </div>
        )),

        // Back Cover
        <div key="back-cover" className="book-cover back-cover">
            <img
                src={backcoverImage || "/assets/images/default-cover.jpg"}
                alt="Back Cover"
                className="cover-image"
            />
        </div>,
    ];

    const handleFlip = (e) => {
        // If we don't allow closing after back cover, prevent going to the last page (back cover)
        if (!allowCloseAfterBackCover && e.data >= allPages.length - 1) {
            // Don't allow navigation to the back cover
            return;
        }
        onFlip?.(e);
    };

    return (
        <div className="turn-book-wrapper">
            <HTMLFlipBook
                ref={bookRef}
                width={460}
                height={600}
                showCover={true}   // covers enable
                mobileScrollSupport={true}
                onInit={onInit}
                onFlip={handleFlip}
                useMouseEvents={true}
                drawShadow={true}
                maxShadowOpacity={0.5}
                flippingTime={1000}
                startPage={1}
                size="stretch"
                minWidth={315}
                maxWidth={1000}
                minHeight={600}
                maxHeight={1536}
                showPageCorners={true}
                disableFlipByClick={false}
            >
                {allPages}
            </HTMLFlipBook>
        </div>
    );
});

export default Book;
