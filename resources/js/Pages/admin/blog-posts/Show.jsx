import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import { CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CBadge } from '@coreui/react';

const themePrimary = '#FEA257';

const Show = ({ post }) => {
  return (
    <DashboardLayout>
      <Head title={post.title} />
      <CRow>
        <CCol lg={10}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <strong>{post.title}</strong>
              <div className="d-flex gap-2">
                <Link href={route('admin-dashboard.blog-posts.edit', post.id)}>
                  <CButton size="sm" color="warning">
                    Edit
                  </CButton>
                </Link>
                <Link href={route('admin-dashboard.blog-posts.index')}>
                  <CButton size="sm" color="secondary" variant="outline">
                    List
                  </CButton>
                </Link>
              </div>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3 d-flex flex-wrap gap-2">
                <CBadge color={post.status === 'published' ? 'success' : 'secondary'}>{post.status}</CBadge>
                <CBadge color="info">{post.visibility}</CBadge>
                {post.featured && <CBadge color="warning">Featured</CBadge>}
                {post.scheduled_publish_at && (
                  <CBadge color="dark">
                    Go live:{' '}
                    {new Date(post.scheduled_publish_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </CBadge>
                )}
              </div>
              {post.featured_image_url && (
                <img src={post.featured_image_url} alt="" className="img-fluid rounded mb-4" style={{ maxHeight: 320, objectFit: 'cover' }} />
              )}
              {post.excerpt && (
                <p className="lead text-muted border-start border-4 ps-3 mb-4" style={{ borderColor: themePrimary }}>
                  {post.excerpt}
                </p>
              )}
              <div className="blog-admin-html" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
              <hr className="my-4" />
              <p className="text-muted small mb-1">
                <strong>Slug:</strong> {post.slug}
              </p>
              {post.categories?.length > 0 && (
                <p className="text-muted small mb-1">
                  <strong>Categories:</strong> {post.categories.map((c) => c.name).join(', ')}
                </p>
              )}
              {post.tags?.length > 0 && (
                <p className="text-muted small mb-1">
                  <strong>Tags:</strong> {post.tags.map((t) => t.name).join(', ')}
                </p>
              )}
              {post.faqs && post.faqs.length > 0 && (
                <>
                  <hr className="my-4" />
                  <h6 className="mb-3">FAQs ({post.faqs.length})</h6>
                  <ul className="list-unstyled small">
                    {post.faqs.map((faq, i) => (
                      <li key={i} className="mb-3 pb-3 border-bottom">
                        <strong className="d-block">{faq.question}</strong>
                        <span className="text-muted">{faq.answer}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  );
};

export default Show;
