import React from 'react'
import Layout from '@/Layouts/Layout'
import { Link, Head } from '@inertiajs/react'
import { Icons } from '@/utils/icons'
import Button from '@/Components/common/Button'
const Publish = () => {
  return (
    <Layout headerClass="inner-header">
      <Head title="Publish" />
      <main className='py-200'>
        <div className="container">
          <div className="row mb-50 flex-column align-items-center text-center">
            <Icons.Magic className='text-black mb-20' size={70} />
            <span className='text-black fs-30 fw-600 mb-20'>Publish</span>
            <h1 className='text-black fs-40 fw-500 mb-20'>Create and Grow Your Story Universe
            </h1>
            <p className='text-black fs-22 fw-400 mb-30' style={{ maxWidth: '800px' }}>
              Turn your story into an immersive multimedia experience. Engage new audiences, expand your reach, and maximize your earnings.
            </p>
          </div>
          <div className="row row-gap-40">
            <div className="col-lg-6">
              <div className="publish-card lh-lg">
                <h2 className='text-black fs-30 fw-700 mb-20 '>1. Start Your Story
                </h2>
                <p className='text-black fs-22 fw-400 mb-20'>
                  Transform your ideas into a multimedia story using our Co/Script tool. Seamlessly add elements like artwork, music, performances, and more using our network of creators or generative AI to help bring your story to life.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="publish-card-img">
                <img src="/assets/images/publish-1-begin-story.webp" alt="publish-1" />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="publish-card-img">
                <img src="/assets/images/publish-2-collaborate.webp" alt="publish-1" />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="publish-card lh-lg">
                <h2 className='text-black fs-30 fw-700 mb-20 '>2. Collaborate with Other Artists
                </h2>
                <p className='text-black fs-22 fw-400 mb-20'>
                Don't let limited skills hold back your incredible story. StoryCo connects you with a vibrant community of writers, artists, musicians, designers, and performers. Find the perfect collaborators to elevate your story through our Co/Create program.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="publish-card lh-lg">
                <h2 className='text-black fs-30 fw-700 mb-20 '>3. Build Your Audience
                </h2>
                <p className='text-black fs-22 fw-400 mb-20'>
                Harness the power of our platform to find and grow your audience. Utilize our tools to share your story with the world on popular social media, webcomic, and podcasting platforms and build a dedicated following.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="publish-card-img">
                <img src="/assets/images/publish-3-build-audience.webp" alt="publish-1" />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="publish-card-img">
                <img src="/assets/images/publish-4-engage-fans.webp" alt="publish-1" />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="publish-card lh-lg">
                <h2 className='text-black fs-30 fw-700 mb-20 '>4. Engage Your Super Fans
                </h2>
                <p className='text-black fs-22 fw-400 mb-20'>
                Engage with your audience in new ways by involving them in the creative process. Let your fans influence, guide, and expand your story universe, creating a deeper connection.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="publish-card lh-lg">
                <h2 className='text-black fs-30 fw-700 mb-20 '>5. Maximize Your Earnings

                </h2>
                <p className='text-black fs-22 fw-400 mb-20'>
                Unlock multiple revenue streams. Our platform provides you with the tools and resources to monetize your story effectively, from subscriptions and ad revenue to merchandise and licensing opportunities.


                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="publish-card-img">
                <img src="/assets/images/publish-5-maximize-earnings.webp" alt="publish-1" />
              </div>
            </div>
            
            
            
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default Publish
