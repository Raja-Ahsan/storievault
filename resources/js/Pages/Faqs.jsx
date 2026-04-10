import React from 'react';
import FaqsComponent from '@/Components/Faqs';
import Layout from '@/Layouts/Layout'
import { Head } from '@inertiajs/react'
const Faqs = () => {
    return (
        <Layout headerClass="inner-header">
            <Head title="Faqs" />
                <section className='faq-sec pt-200 pb-100'>
                    <div className="container">
                        <FaqsComponent
                            title="Faqs"
                            faqs={[
                                {
                                    question: "How do I get started with Storie Vault?",
                                    answer: "Just create a free account to begin your storytelling journey."
                                },
                                {
                                    question: "Can I rewrite existing stories?",
                                    answer: "Yes! Browse our story library, pick one you like, and reimagine it in your own style or genre."
                                },
                                {
                                    question: "Where do I write my story?",
                                    answer: "Use our built-in editor to write, customize, and format your story easily."
                                },
                                {
                                    question: "Can I choose who sees my story?",
                                    answer: "Yes. You can publish your story publicly or keep it private within the Storie Vault community."
                                },
                                {
                                    question: "How do I share my story with others?",
                                    answer: "After publishing, you'll get a shareable link. Send it to friends, readers, or post it online."
                                },
                                {
                                    question: "Can I get feedback on my writing?",
                                    answer: "Definitely. Other users can read your story and leave feedback to help you grow as a writer."
                                },
                                {
                                    question: "Can my story be published outside the Storie Vault?",
                                    answer: "Yes. We can help you distribute your work to global platforms like Amazon, Barnes & Noble, and HarperCollins."
                                },
                            ]}
                        />
                    </div>
                </section>
        </Layout>
    )
}

export default Faqs