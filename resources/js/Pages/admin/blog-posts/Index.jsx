import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import Swal from 'sweetalert2';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CPagination,
  CPaginationItem,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CFormSelect,
  CBadge,
} from '@coreui/react';

const themePrimary = '#FEA257';

const Index = ({ posts, filters, flash }) => {
  const [search, setSearch] = useState(filters?.search || '');
  const [status, setStatus] = useState(filters?.status || '');

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        icon: 'success',
        title: flash.success,
        showConfirmButton: false,
        timer: 1500,
        confirmButtonColor: themePrimary,
      });
    }
    if (flash?.error) {
      Swal.fire({ icon: 'error', title: flash.error, confirmButtonColor: themePrimary });
    }
  }, [flash]);

  const applyFilters = () => {
    router.get(route('admin-dashboard.blog-posts.index'), { search, status }, { preserveState: true });
  };

  const isScheduledFuture = (p) =>
    p.status === 'published' && p.scheduled_publish_at && new Date(p.scheduled_publish_at) > new Date();

  const confirmDelete = (post) => {
    Swal.fire({
      title: 'Delete post?',
      text: post.title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
    }).then((r) => {
      if (r.isConfirmed) {
        router.delete(route('admin-dashboard.blog-posts.destroy', post.id));
      }
    });
  };

  return (
    <DashboardLayout>
      <Head title="Blog posts" />
      <CRow className="mb-4">
        <CCol>
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <strong>Blog posts</strong>
              <Link href={route('admin-dashboard.blog-posts.create')}>
                <CButton color="primary" style={{ backgroundColor: themePrimary, borderColor: themePrimary }}>
                  New post
                </CButton>
              </Link>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3 g-2">
                <CCol md={4}>
                  <CFormInput
                    placeholder="Search title / excerpt..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All statuses</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </CFormSelect>
                </CCol>
                <CCol md={2}>
                  <CButton color="secondary" variant="outline" onClick={applyFilters}>
                    Filter
                  </CButton>
                </CCol>
              </CRow>

              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Title</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Visibility</CTableHeaderCell>
                    <CTableHeaderCell>Featured</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {posts.data.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan={5} className="text-center text-muted py-4">
                        No posts yet.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                  {posts.data.map((post) => (
                    <CTableRow key={post.id}>
                      <CTableDataCell>
                        <div className="fw-semibold">{post.title}</div>
                        <small className="text-muted">{post.slug}</small>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex flex-wrap gap-1 align-items-center">
                          <CBadge color={post.status === 'published' ? 'success' : 'secondary'}>
                            {post.status}
                          </CBadge>
                          {isScheduledFuture(post) && (
                            <CBadge color="warning" className="text-dark">
                              Scheduled
                            </CBadge>
                          )}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>{post.visibility}</CTableDataCell>
                      <CTableDataCell>{post.featured ? 'Yes' : 'No'}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        <Link href={route('admin-dashboard.blog-posts.show', post.id)} className="me-2">
                          <CButton size="sm" color="info" variant="ghost">
                            View
                          </CButton>
                        </Link>
                        <Link href={route('admin-dashboard.blog-posts.edit', post.id)} className="me-2">
                          <CButton size="sm" color="warning" variant="ghost">
                            Edit
                          </CButton>
                        </Link>
                        <CButton size="sm" color="danger" variant="ghost" onClick={() => confirmDelete(post)}>
                          Delete
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              {posts.data.length > 0 && posts.last_page > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <CPagination>
                    {posts.links.map((link, i) => (
                      <CPaginationItem
                        key={i}
                        active={link.active}
                        disabled={!link.url}
                        onClick={() => link.url && router.visit(link.url)}
                      >
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                      </CPaginationItem>
                    ))}
                  </CPagination>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  );
};

export default Index;
