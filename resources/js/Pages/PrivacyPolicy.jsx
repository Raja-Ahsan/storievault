import React from 'react'
import Layout from '@/Layouts/Layout';
import { Head } from '@inertiajs/react';

const PrivacyPolicy = () => {
  return (
        <Layout headerClass="inner-header">
            <Head title="Privacy Policy" />
            <main className="">
                <section className='privacy-policy-sec pt-200'>
                    <div className="container">
                        <h1 className="text-black text-center fs-70 fw-500 mb-80">PRIVACY POLICY</h1>
                        <div className="row">
                            <div className="col-12">
                                <div className="privacy-content">
                                    <p className="text-black fs-20 fw-500 mb-40">
                                        At Storie Vault, your privacy is important to us. This policy explains how we collect, use, and protect your information.
                                    </p>
                                    
                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">1. Information We Collect</h3>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">Account info: Name, email, login details</li>
                                            <li className="mb-15 fs-16">Content: Stories, comments, and posts you create</li>
                                            <li className="mb-15 fs-16"><strong>Usage data:</strong> Pages visited, features used</li>
                                            <li className="mb-15 fs-16"><strong>Cookies:</strong> To improve performance and remember your preferences</li>
                                        </ul>
                                    </div>

                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">2. How We Use Your Information</h3>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">To provide and improve the platform</li>
                                            <li className="mb-15 fs-16">To allow you to write, read, and interact with stories</li>
                                            <li className="mb-15 fs-16">To enforce our Terms and keep the site safe</li>
                                            <li className="mb-15 fs-16">To notify you about updates or important changes</li>
                                        </ul>
                                    </div>

                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">3. Sharing of Information</h3>
                                        <p className="fs-16 mb-20">We never sell your data. We may share information only with:</p>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">Trusted service providers (hosting, analytics)</li>
                                            <li className="mb-15 fs-16">Legal authorities, if required</li>
                                            <li className="mb-15 fs-16">To protect the rights and safety of users and the platform</li>
                                        </ul>
                                    </div>

                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">4. User-Generated Content</h3>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">Anything you publish (stories, comments, usernames) may be visible to others.</li>
                                            <li className="mb-15 fs-16">Avoid posting personal details.</li>
                                        </ul>
                                    </div>

                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">5. Data Security</h3>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">We use reasonable safeguards, but no system is 100% secure.</li>
                                        </ul>
                                    </div>

                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">6. Children's Privacy</h3>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">Storie Vault is not for users under 13.</li>
                                            <li className="mb-15 fs-16">If we learn we've collected data from a child under 13, we will delete it.</li>
                                        </ul>
                                    </div>

                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">7. Your Choice</h3>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">You may update or delete your account anytime</li>
                                            <li className="mb-15 fs-16">You may request deletion of your data</li>
                                            <li className="mb-15 fs-16">You can control cookies through your browser</li>
                                        </ul>
                                    </div>

                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">8. Changes to This Policy</h3>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">We may update this policy. Changes will be posted on the site.</li>
                                        </ul>
                                    </div>

                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-20">9. Contact Us</h3>
                                        <ul className="terms-list">
                                            <li className="mb-15 fs-16">
                                                <a href="mailto:StorieVault@yahoo.com">StorieVault@yahoo.com</a>
                                            </li>
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