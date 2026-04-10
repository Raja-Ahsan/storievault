import React from "react";

const Faqs = ({ title, faqs }) => {
  return (
    <div className="container py-5">
      <h2 className="text-black text-center fs-70 fw-500 mb-80">{title}</h2>

      <div className="accordion" id="faqAccordion">
        {faqs.map((faq, index) => (
          <div className="accordion-item" key={index}>
            <h2 className="accordion-header" id={`faqHeading${index}`}>
              <button
                className={`accordion-button ${index !== 0 ? "collapsed" : ""}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#faqCollapse${index}`}
                aria-expanded={index === 0 ? "true" : "false"}
                aria-controls={`faqCollapse${index}`}
              >
                {faq.question}
              </button>
            </h2>
            <div
              id={`faqCollapse${index}`}
              className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
              aria-labelledby={`faqHeading${index}`}
              data-bs-parent="#faqAccordion"
            >
              <div className="accordion-body"><p className="fs-18">{faq.answer}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Faqs;