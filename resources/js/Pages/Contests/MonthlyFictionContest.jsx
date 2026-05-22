


import React, { useState } from "react";
import Layout from "@/Layouts/Layout";
import { Head, Link, usePage } from "@inertiajs/react";
import Book001 from '@/assets/images/Book-001.webp'
import Book002 from '@/assets/images/Book-002.webp'
import Book003 from '@/assets/images/Book-003.webp'
import Book004 from '@/assets/images/Book-004.webp'


const MonthlyFictionContest = () => {
    const { props } = usePage();
    // try to use server-provided lists if available, otherwise fallbacks
    const oldContests = props.oldContests || props.latestStories || [];
    const ongoing = props.ongoingContests || [];

    // demo data for old contests
    const demoOld = [
        {
            id: 'demo-1',
            type: 'Monthly Fiction Contest',
            title: 'The Lost Lantern',
            author: 'A. Writer',
            cover_image: Book001,
            read_count: 124,
            comment_count: 8,
            created_at: '2025-10-15',
        },
        {
            id: 'demo-2',
            type: 'Monthly Fiction Contest',
            title: 'Moonlit Verses',
            author: 'Poetica',
            cover_image: Book002,
            read_count: 56,
            comment_count: 2,
            created_at: '2025-09-20',
        },
        {
            id: 'demo-3',
              type: 'Monthly Fiction Contest',
            title: 'Across the Silver Sea',
            author: 'R. Marlow',
            cover_image: Book003,
            read_count: 342,
            comment_count: 14,
            created_at: '2025-08-10',
        },
    ];

    const oldToShow = oldContests && oldContests.length > 0 ? oldContests : demoOld;

    // demo data for ongoing contests
    const demoOngoing = [
        {
            id: 'demo-ongoing-1',
            type: 'Monthly Fiction Contest',
            title: 'Winter Story Challenge',
            organizer: 'Editorial Team',
            cover: Book004,
            comment_count: 12,
            participate_until: '2025-12-25',
        },
        {
            id: 'demo-ongoing-2',
            type: 'Monthly Fiction Contest',
            title: 'Poetry Slam 2025',
            organizer: 'Community',
            cover: Book002,
            comment_count: 5,
            participate_until: '2025-12-31',
        },
    ];

    const ongoingToShow = ongoing && ongoing.length > 0 ? ongoing : demoOngoing;

    return (
        <Layout headerClass="inner-header">
            <Head title="Contests" />

            <section className="py-100 " style={{ paddingTop: '180px', backgroundColor: '#F7EEE2' }}>
                <div className="container">
                    <div className="row mb-40">
                        <div className="col-12 text-center " >
                            <h2 className="heading" style={{ lineHeight: '1' }}>Monthly Fiction <br /> Contests</h2>
                            <p className="fs-18">Participate in ongoing contests and see past contests</p>
                        </div>
                    </div>

                    {/* All Contests - Ongoing and Past */}
                    <div className="row">
                        {/* Ongoing Contests */}
                        {ongoingToShow.map((contest, idx) => (
                            <div key={`ongoing-${idx}`} className="col-12 mb-4 d-flex justify-content-center">
                                <Link href="/create-story" className="text-decoration-none d-flex justify-content-center" style={{ width: '100%' }}>
                                    <div className="story-card cards rounded h-100 text-start" data-aos-duration="3000" data-aos="flip-left" style={{ position: 'relative', border: '2px solid #FEA257', padding: '18px', backgroundColor: '#FFF7E6', marginBottom: '40px', maxWidth: '900px', width: '100%' }}>
                                        <div style={{ height: '150px', overflow: 'hidden', borderRadius: '8px', marginBottom: '12px', position: 'relative' }}>
                                            <img src={contest.cover} alt={contest.title || `Contest ${idx+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#FEA257', color: '#fff', padding: '10px 20px', borderRadius: 6, fontSize: '20px', fontWeight: 700 }}>
                                                Ongoing
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center justify-content-between mb-10">
                                            <h4 className="light-black fs-24 fw-600">{contest.title || contest.name || `Ongoing ${idx+1}`}</h4>
                                              <div className="d-flex align-items-center mb-20 pl-10">
                                            <i className="fas fa-calendar text-primary-theme me-2"></i>
                                            <h6 className="text-black fs-14 mb-0">Participate until: {contest.participate_until ? new Date(contest.participate_until).toLocaleDateString() : 'TBA'}</h6>
                                        </div>
                                        </div>

                                        {/* <div className="mb-10 pl-10">
                                            <span className="label bg-primary-theme text-white fs-20 py-10 px-20 radius-20">Ongoing</span>
                                        </div> */}

                                        <h5 className="fs-16 text-primary-theme text-capitalize mb-10 fw-600 pl-10">{contest.organizer || contest.author || 'Organizer'}</h5>
                                           <div className="mb-10 pl-10">
                                            <span className="fs-12 label bg-primary-theme text-white fs-12 py-5 px-10 radius-20 text-primary-theme text-capitalize fw-600">Monthly Fiction Contest</span>
                                        </div>

                                        {/* <div className="d-flex align-items-center mb-20 pl-10">
                                            <i className="fas fa-calendar text-primary-theme me-2"></i>
                                            <h6 className="text-black fs-14 mb-0">Participate until: {contest.participate_until ? new Date(contest.participate_until).toLocaleDateString() : 'TBA'}</h6>
                                        </div> */}

                                        <div className="btn btn-sm btn-primary mt-3" style={{width: '100%'}}>Join</div>
                                    </div>
                                </Link>
                            </div>
                        ))}

                        {/* Past Contests */}
                        {oldToShow.map((item, idx) => {
                            const title = item.title || item.name || `Contest ${idx + 1}`;
                            const author = item.author || item.user_name || item.author_name || "Unknown";
                            const cover = item.cover_image;
                            const readCount = item.read_count || item.reads || item.reads_count || 0;
                            const commentCount = item.comment_count || item.comments_count || 0;
                            const linkTo = item.type === "poem" ? `/poems/${item.id}` : `/stories/${item.id}`;
                            const createdDate = item.created_at ? new Date(item.created_at).toLocaleDateString() : '';

                            return (
                                    <div key={`old-${idx}`} className="col-12 mb-4 d-flex justify-content-center">
                                        <div className="story-card cards rounded h-100 text-start" data-aos-duration="3000" data-aos="flip-left" style={{ position: 'relative', border: '2px solid #FEA257', padding: '18px', backgroundColor: '#FFF7E6', marginBottom: '20px', maxWidth: '900px', width: '100%' }}>
                                            <div style={{ height: '150px', overflow: 'hidden', borderRadius: '8px', marginBottom: '12px', position: 'relative' }}>
                                                <img src={cover} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                {createdDate && (
                                                    <div style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#FEA257', color: '#fff', padding: '10px 20px', borderRadius: 6, fontSize: '20px', fontWeight: 700 }}>
                                                      Past
                                                    </div>
                                                )}
                                            </div>

                                        <div className="d-flex align-items-center justify-content-between mb-10">
                                            <h4 className="light-black fs-24 fw-600">{title}</h4>
                                              {createdDate && (
                                            <div className="d-flex align-items-center mb-20 pl-10">
                                                <i className="fas fa-calendar text-primary-theme me-2"></i>
                                                <h6 className="text-black fs-14 mb-0">{createdDate}</h6>
                                            </div>
                                        )}
                                        </div>

                                       {/* <div className="mb-10 pl-10">
                                            <span className="label bg-secondary-theme text-white fs-12 py-5 px-10 radius-20">Past</span>
                                        </div> */}

                                        <h5 className="fs-16 text-primary-theme text-capitalize mb-10 fw-600 pl-10">{author}</h5>

                                        {item.type && (
                                            <div className="mb-15 pl-10">
                                                <span className="label bg-primary-theme text-white fs-12 py-5 px-10 radius-20">{item.type}</span>
                                            </div>
                                        )}

                                        <div className="d-flex align-items-center mb-20 pl-10">
                                            <i className="fas fa-eye text-primary-theme me-2"></i>
                                            <h6 className="text-black fs-14 mb-0">{readCount} people read</h6>
                                        </div>

                                      

                                        <Link  className="btn btn-sm btn-primary mt-3" style={{width: '100%'}}>
                                            View
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default MonthlyFictionContest;

