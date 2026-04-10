import React from 'react'
import Layout from '@/Layouts/Layout';
import { Head } from '@inertiajs/react';

const CommunityGuideLines = () => {
    return (
        <Layout headerClass="inner-header">
            <Head title="Community Guidelines" />
            <main className="">
                <section className='community-guidelines-sec pt-200'>
                    <div className="container">
                        <h1 className="text-black text-center fs-70 fw-500 mb-80">COMMUNITY GUIDELINES</h1>
                        <div className="row">
                            <div className="col-12">
                                <div className="community-guidelines">
                                    <p className="text-black fs-20 fw-500 mb-40 text-center">
                                        At Storie Vault, we’re building a creative, supportive space for writers and readers. To keep it safe and inspiring, please follow these rules:
                                    </p>
                                    <div className="terms-section mb-40">
                                        <h3 className="text-black fs-24 fw-600 mb-30">1- Respect others. No harassment, bullying, or personal attacks.</h3>
                                        <h3 className="text-black fs-24 fw-600 mb-30">2- Stay creative, not cruel. Hate speech, extremist politics, or harmful ideologies are not welcome.</h3>
                                        <h3 className="text-black fs-24 fw-600 mb-30">3- Keep it appropriate. No excessively graphic sexual or violent material. Absolutely no content involving minors in sexual or abusive contexts.</h3>
                                        <h3 className="text-black fs-24 fw-600 mb-30">4- Encourage, don’t discourage. Offer constructive feedback, not insults.</h3>
                                        <h3 className="text-black fs-24 fw-600 mb-30">5- No spam. Don’t flood the site with ads or irrelevant content.</h3>
                                        <h3 className="text-black fs-24 fw-600 mb-30">6- Remember the purpose. Storie Vault is for collaborative storytelling. Keep it fun, respectful, and safe.</h3>
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

export default CommunityGuideLines