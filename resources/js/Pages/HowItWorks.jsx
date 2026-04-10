import React from 'react'
import Layout from '@/Layouts/Layout'
import { Head } from '@inertiajs/react'
import { Icons } from '@/utils/icons'
import { howItWorksData } from '@/utils/statics'
import hiwVideo from '@/assets/videos/howitworks.mp4'
import thumbnail from '@/assets/videos/hiw-thumbnail.png'

const HowItWorks = () => {
    return (
        <Layout headerClass="inner-header">
            <Head title="How It Works" />
            <section className='hiw-video-sec'>
                <div className="container">

                </div>
            </section>
            <section className='pt-200 pb-100'>
                <div className="container">
                    <h1 className='text-black text-center fs-70 fw-500 mb-80'>How It Works</h1>
                <div className="hiw-video-content mb-100">
                    <video src={hiwVideo} autoPlay muted controls loop 
                    poster={thumbnail} 
                    />
                </div>
                </div>
                <section className='hiw-sec-01'>
                    <div className="container">
                        <div className="row justify-content-center text-center row-gap-60">
                            {howItWorksData.map((item) => {
                                const Icon = Icons[item.icon];
                                return (
                                    <div className="col-lg-4 col-md-6" key={item.id}>
                                        <div className="hiw-sec-01-card d-flex flex-column align-items-center">
                                            <div className="hiw-step-card-icon mb-20">
                                                <Icon size={30} />
                                            </div>
                                            <div className="hiw-step-card-content">
                                                <h3 className="hiw-step-card-title text-black fs-25 fw-600 mb-10">{item.title}</h3>
                                                <p className="hiw-step-card-description fs-16">{item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </section>
        </Layout>
    )
}

export default HowItWorks