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
} from '@coreui/react';
import { Icons } from '../../../utils/icons';

const themePrimary = '#FEA257';

const Index = ({ tags, filters, flash }) => {
  const [search, setSearch] = useState(filters?.search || '');

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ icon: 'success', title: flash.success, timer: 1500, showConfirmButton: false, confirmButtonColor: themePrimary });
    }
    if (flash?.error) {
      Swal.fire({ icon: 'error', title: flash.error, confirmButtonColor: '#dc3545' });
    }
  }, [flash]);

  const doSearch = () => {
    router.get(route('admin-dashboard.blog-tags.index'), { search }, { preserveState: true });
  };

  const confirmDelete = (tag) => {
    Swal.fire({
      title: 'Delete tag?',
      text: tag.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
    }).then((r) => {
      if (r.isConfirmed) router.delete(route('admin-dashboard.blog-tags.destroy', tag.id));
    });
  };

  return (
    <DashboardLayout>
      <Head title="Blog tags" />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <strong>Blog tags</strong>
              <Link href={route('admin-dashboard.blog-tags.create')}>
                <CButton color="primary" size="sm" style={{ backgroundColor: themePrimary, borderColor: themePrimary }}>
                  <Icons.Plus className="me-1" /> Add tag
                </CButton>
              </Link>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormInput
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                  />
                </CCol>
                <CCol md={2}>
                  <CButton color="secondary" variant="outline" onClick={doSearch}>
                    Search
                  </CButton>
                </CCol>
              </CRow>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Slug</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {tags.data.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={3} className="text-center text-muted">
                        No tags yet.
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    tags.data.map((t) => (
                      <CTableRow key={t.id}>
                        <CTableDataCell>{t.name}</CTableDataCell>
                        <CTableDataCell>
                          <code>{t.slug}</code>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            <Link href={route('admin-dashboard.blog-tags.edit', t.id)}>
                              <CButton className="btn-icon-size p-0">
                                <Icons.Edit />
                              </CButton>
                            </Link>
                            <CButton className="btn btn-icon-size p-0" onClick={() => confirmDelete(t)}>
                              <Icons.Delete />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
              {tags.data.length > 0 && tags.last_page > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <CPagination>
                    {tags.links.map((link, i) => (
                      <CPaginationItem key={i} active={link.active} disabled={!link.url} onClick={() => link.url && router.visit(link.url)}>
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
