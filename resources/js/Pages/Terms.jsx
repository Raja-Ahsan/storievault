import React from 'react'
import Layout from '@/Layouts/Layout';
import { Head } from '@inertiajs/react';
const PrivacyPolicy = () => {
    return (
        <Layout headerClass="inner-header">
            <Head title="Terms & Conditions" />
            <main className="">
                <section className='privacy-policy-sec pt-200'>
                    <div className="container">
                        <h1 className="text-black text-center fs-70 fw-500 mb-80">TERMS & CONDITIONS</h1>
                        <div className="row">
                            <div className="col-12">
                                <div className="privacy-content">
                                    <p className="text-black fs-20 fw-500 mb-40">
                                        Welcome to Storie Vault. By accessing or using this website, you agree to
                                        comply with the following Terms and Conditions. If you do not agree, please do
                                        not use the site.
                                    </p>
                                    
                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">1. User Responsibilities</h3>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">You are responsible for the stories, comments, and content you post.</li>
                                            <li className="mb-15 fs-16">You may not harass, abuse, or threaten other members.</li>
                                            <li className="mb-15 fs-16">You may not post unlawful, defamatory, hateful, discriminatory, or sexually explicit material.</li>
                                            <li className="mb-15 fs-16">You may not post spam, advertisements, or malicious content.</li>
                                        </ul>
                                    </div>

                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">2. Creative Expression</h3>
                                        <p className="fs-16 mb-20">We encourage creativity and free expression, but certain content is prohibited, including:</p>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">Hate speech or targeted harassment</li>
                                            <li className="mb-15 fs-16">Extremist or harmful political propaganda</li>
                                            <li className="mb-15 fs-16">Pornographic or excessively graphic sexual material</li>
                                            <li className="mb-15 fs-16">Content involving minors in sexual or violent contexts</li>
                                            <li className="mb-15 fs-16">Calls for violence or illegal activity</li>
                                        </ul>
                                    </div>

                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">3. Intellectual Property</h3>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">You retain ownership of your stories.</li>
                                            <li className="mb-15 fs-16">By posting, you grant Storie Vault a non-exclusive, royalty-free license to display, share, and allow other users to branch from your stories.</li>
                                        </ul>
                                    </div>

                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">4. Moderation and Enforcement</h3>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">We may review, edit, or remove content that violates these Terms.</li>
                                            <li className="mb-15 fs-16">Accounts may be suspended or banned for repeated or serious violations.</li>
                                            <li className="mb-15 fs-16">Moderation decisions are final.</li>
                                        </ul>
                                    </div>

                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">5. Disclaimer and Liability</h3>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">Storie Vault is not responsible for user-generated content.</li>
                                            <li className="mb-15 fs-16">We provide the platform "as is" without guarantees of accuracy, safety, or reliability.</li>
                                            <li className="mb-15 fs-16">Users participate at their own risk.</li>
                                        </ul>
                                    </div>

                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">6. Changes to Terms</h3>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">We may update these Terms at any time. Continued use of Storie Vault means you accept the revised terms.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </Layout>
    )
}

export default PrivacyPolicy