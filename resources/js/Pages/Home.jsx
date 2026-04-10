import React from 'react'
import Layout from '@/Layouts/Layout'
import { Link, Head, usePage } from '@inertiajs/react'
import StoryOfTheMonth from '@/Components/StoryOfTheMonth'
import Testimonials from '@/Components/Testimonials';
import HeroBanner from '@/Components/home/HeroBanner'
import Book001 from '@/assets/images/Book-001.webp'
import Book002 from '@/assets/images/Book-002.webp'
import Book003 from '@/assets/images/Book-003.webp'
import Book004 from '@/assets/images/Book-004.webp'

const Home = () => {
  // home page
  const { auth, latestStories } = usePage().props;


  return (
    <Layout headerClass="pt-30 home-page-wrapper" mainClass="home-page-wrapper">
      <Head title="StoryVault | Save Memories & Share Your Story">
        <meta name="description" content="Join StoryVault to save, share & explore personal stories and memories from around the world — a growing archive of human history for families, students & future generations." />
      </Head>
      <HeroBanner />
      <section className='most-popular-genres-sec pt-100 sec-bg' style={{ paddingBottom: '200px' }}>
        <div className="container">
          <h2 className='hd-md fw-500 mb-70 text-center'>Most Popular Genres</h2>
          <div className="row justify-content-center row-gap-30">
            <div className="col-6 col-md-3">
              <Link href="/sci-fi-stories" className="genre-link">
                <div className="genre-link-wrapper">
                  <img src={Book001} alt="Sci-Fi" className="w-100" />
                  <span className="genre-name">Sci-Fi</span>
                </div>
              </Link>
            </div>
            <div className="col-6 col-md-3">
              <Link href="/fantasy-stories" className="genre-link">
                <div className="genre-link-wrapper">
                  <img src={Book002} alt="Fantasy" className="w-100" />
                  <span className="genre-name">Fantasy</span>
                </div>
              </Link>
            </div>
            <div className="col-6 col-md-3">
              <Link href="/fan-fiction-stories" className="genre-link">
                <div className="genre-link-wrapper">
                  <img src={Book003} alt="Fanfiction" className="w-100" />
                  <span className="genre-name">Fanfiction</span>
                </div>
              </Link>
            </div>
            <div className="col-6 col-md-3">
              <Link href="/romance-stories" className="genre-link">
                <div className="genre-link-wrapper">
                  <img src={Book004} alt="Romance" className="w-100" />
                  <span className="genre-name">Romance</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className='collection-sec'>
        <div className="container">
          <h2 className='hd-md fw-500 mb-70 uppercase text-center'>Top Featured Stories</h2>
          <div className="row justify-content-center row-gap-40">
            {latestStories && latestStories.slice(0, 3).map((story, index) => (
              <div key={story.id} className="col-12 col-lg-4 col-xl-4">
                <div className="collection-card d-flex justify-content-center align-items-center gap-20" >
                  <div className="collection-card-img" >
                    <img
                      src={story.cover_image ? `/storage/${story.cover_image}` : `/assets/images/collection-0${index + 1}.png`}
                      alt={story.title}
                    />
                  </div>
                  <div className='collection-card-content'>
                    <h4 className='text-30-bold mb-10' style={{ maxWidth: "195px" }}>{story.title}</h4>
                    {/* {story.author && (
                      <span className="text-primary secondary-font text-20">{story.author}</span>
                    )} */}
                    <p className='text-black secondary-font mb-20 mt-10'>
                      {story.read_count === 0
                        ? 'No one has read this story'
                        : story.read_count === 1
                          ? '1 person has read this story'
                          : `${story.read_count} people have read this story`}
                    </p>
                    {/* {story.genre && (
                      <div className="mb-3">
                        <span className="label bg-secondry-theme text-white fs-16 py-10 px-20 radius-60 d-inline-block">
                          {story.genre}
                        </span>
                      </div>
                    )} */}
                    <Link href={`/stories/${story.id}`} className='btn btn-primary text-white'>Story Detail</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="signin-bg position-relative">
        <div className="container">
          <img src="/assets/images/signin-book.webp" alt="signin-book" className='signin-book position-absolute' />
          <img src="/assets/images/signin-right.webp" alt="signin-right" className='signin-right position-absolute bottom-0 end-0' />
          <div className="row text-center text-lg-start">
            <div className="col-lg-6">
              <h2 className="hd-md mb-20 text-white" style={{ maxWidth: "770px" }}>
                {auth?.user ? (
                  <>
                    {auth.user.is_guest ? (
                      <>Welcome Guest! Craft your story in your own way.</>
                    ) : (
                      <>Welcome back, {auth.user.name}! Craft your story in your own way.</>
                    )}
                  </>
                ) : (
                  <>Sign In to Continue Crafting the Story Your Way</>
                )}
              </h2>

              <p className="text-white fw-400 mb-20" style={{ maxWidth: "840px" }}>
                Take the reins and let your imagination run wild! Log in to pick up where the story left off or create your own twists and turns. Your words, your world—continue the adventure as you see fit.
              </p>

              <div className="d-flex gap-20 justify-content-center justify-content-lg-start">
                {!auth?.user && (
                  <>
                    <Link href="/login" className="btn btn-primary">Sign In</Link>
                    <Link href="/stories" className="btn btn-secondary">Read A Sample</Link>
                  </>
                )}

                {auth?.user?.role === 'admin' && (
                  <a className="btn btn-secondary" href="/admin-dashboard/stories/create">
                    Write A New Story
                  </a>
                )}

                {auth?.user && auth?.user?.role !== 'admin' && (
                  <Link href="/stories" className="btn btn-secondary">Read A Sample</Link>
                )}
              </div>
              {/* <div className="d-flex gap-20 justify-content-center justify-content-lg-start">
                <Button className="btn btn-primary">Sign In</Button>
                <Button className="btn btn-secondary">Read A Sample</Button>
              </div> */}
            </div>
          </div>
        </div>
      </section>
      <section className='collection-sec'>
        <div className="container">
          <h2 className='hd-md fw-500 mb-70 uppercase text-center'>Our Collection</h2>
          <div className="row justify-content-center row-gap-40">
            {latestStories && latestStories.slice(0, 3).map((story, index) => (
              <div key={story.id} className="col-12 col-lg-4 col-xl-4">
                <div className="collection-card d-flex justify-content-center align-items-center gap-20" >
                  <div className="collection-card-img" >
                    <img
                      src={story.cover_image ? `/storage/${story.cover_image}` : `/assets/images/collection-0${index + 1}.png`}
                      alt={story.title}
                    />
                  </div>
                  <div className='collection-card-content'>
                    <h4 className='text-30-bold mb-10' style={{ maxWidth: "195px" }}>{story.title}</h4>
                    {/* {story.author && (
                      <span className="text-primary secondary-font text-20">{story.author}</span>
                    )} */}
                    <p className='text-black secondary-font mb-20 mt-10'>
                      {story.read_count === 0
                        ? 'No one has read this story'
                        : story.read_count === 1
                          ? '1 person has read this story'
                          : `${story.read_count} people have read this story`}
                    </p>
                    {/* {story.genre && (
                      <div className="mb-3">
                        <span className="label bg-secondry-theme text-white fs-16 py-10 px-20 radius-60 d-inline-block">
                          {story.genre}
                        </span>
                      </div>
                    )} */}
                    <Link href={`/stories/${story.id}`} className='btn btn-primary text-white'>Story Detail</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <StoryOfTheMonth />
      <Testimonials />
    </Layout>
  )
}

Home.title = "Home";


export default Home
