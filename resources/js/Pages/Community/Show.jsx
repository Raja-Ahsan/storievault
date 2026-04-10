import { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import Layout from '@/Layouts/Layout';
import CommentSection from '@/Components/comments/CommentSection';
import '@/assets/styles/stories.css';
import '@/assets/styles/story-read.css';
import '@/assets/styles/comments.css';
import LikeCount from '@/Components/stories/LikeCount';


export default function CommunityShow({ story }) {
  const { auth } = usePage().props;
  const [commentCount, setCommentCount] = useState(story.comment_count || 0);

  // Fetch the latest comment count when the page loads
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await axios.get(route('comments.get', story.id));
        const comments = response.data.comments;

        // Count top-level comments and all replies
        let totalCount = comments.length;
        comments.forEach(comment => {
          if (comment.replies && comment.replies.length > 0) {
            totalCount += comment.replies.length;
          }
        });

        setCommentCount(totalCount);
      } catch (error) {
        console.error('Error fetching comment count:', error);
      }
    };

    fetchCommentCount();
  }, [story.id]);

  return (
    <Layout headerClass="inner-header">
      <Head title={story.title} />

      <section className="py-200 sec-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm">
                <div className="row">
                  <div className="col-md-4 mb-4 mb-md-0">
                    <img
                      src={story.cover_image ? `/storage/${story.cover_image}` : '/assets/images/book-03.png'}
                      alt={story.title}
                      className="img-fluid w-100 rounded-3 mb-3"
                      onError={(e) => {
                        e.target.src = "/assets/images/book-03.png";
                      }}
                    />
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fs-14 secondry-font">
                        <i className="fas fa-eye me-2 text-primary-theme"></i> {story.read_count} reads
                      </span>
                      <span className="fs-14 secondry-font">
                        <i className="fas fa-comment me-2 text-primary-theme"></i> {commentCount} comments
                      </span>
                    <span className="fs-14 secondry-font">
                      <LikeCount className='gap-10' storyId={story.id} likeText={true} likecountnumberClass='fs-14' />
                      </span>
                    </div>
                    {/* <div className="d-flex justify-content-between align-items-center mb-3">
                    </div> */}
                    <div className="mb-3 d-flex gap-3 align-items-center">
                      <span className="label bg-secondry-theme text-white fs-16 py-10 px-20 radius-60 d-inline-block">
                        {story.genre}
                      </span>
                      {story.rating && story.rating.name && (
                          <span className="label bg-primary-theme text-white fs-16 py-10 px-20 radius-60 d-inline-block">
                            {story.rating.name.charAt(0)}
                          </span>
                        )}                   
                    </div>
                    <div className="mb-3">
                      <span className="label bg-success text-white fs-16 py-10 px-20 radius-60 d-inline-block">
                        <i className="fas fa-users me-2"></i> Community Story
                      </span>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <h1 className="mb-3" style={{ fontSize: '5rem' }}>{story.title}</h1>
                    <h4 className="fs-24 text-primary-theme mb-3">By {story.author}</h4>
                    <div className="story-description secondry-font fs-20 mb-4">
                      {story.description.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-3">{paragraph}</p>
                      ))}
                    </div>
                    <div className="story-content mb-4 line-clamp-3">
                      {story.content ? (
                        <div dangerouslySetInnerHTML={{ __html: story.content }} />
                      ) : (
                        <p className="text-muted">No content available for this story.</p>
                      )}
                    </div>
                    <div className="d-flex flex-wrap gap-3 mt-4">
                      <Link href={route('community.index')} className="btn btn-secondary d-flex align-items-center gap-1 story-btn back-btn">
                        <i className="fas fa-arrow-left me-2"></i> Back to Stories
                      </Link>
                      <Link
                        href={route('stories.read', story.id)}
                        className="btn btn-primary d-flex align-items-center gap-1 story-btn read-btn"
                      >
                        <i className="fas fa-book me-2"></i> Read Story
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment Section */}
              <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm mt-4">
                <h3 className="mb-4 secondry-font fs-24">
                  <i className="fas fa-comments me-2 text-primary-theme"></i>
                  Comments ({commentCount})
                </h3>
                <CommentSection
                  storyId={story.id}
                  currentUser={auth.user}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}