import React, { useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Icons } from '../../../utils/icons';
import Swal from 'sweetalert2';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CFormInput,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react';

function Index({ subscribers, filters = {}, flash }) {
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        icon: 'success',
        title: flash.success,
        showConfirmButton: false,
        timer: 1500,
        confirmButtonColor: '#FEA257',
      });
    }
  }, [flash?.success]);

  const confirmDelete = (subscriber) => {
    Swal.fire({
      title: 'Remove subscriber?',
      html: `Remove <strong>${subscriber.email}</strong> from the newsletter list?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Remove',
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin-dashboard.newsletter.destroy', subscriber.id));
      }
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    router.get(route('admin-dashboard.newsletter.index'), {
      search: formData.get('search') || '',
    }, { preserveState: true });
  };

  return (
    <DashboardLayout>
      <Head title="Newsletter Subscribers" />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <strong>Newsletter Subscribers</strong>
              <form onSubmit={handleSearch} className="d-flex gap-2">
                <CInputGroup>
                  <CFormInput
                    name="search"
                    placeholder="Search email…"
                    defaultValue={filters.search || ''}
                  />
                  <CInputGroupText>
                    <CButton type="submit" color="primary" size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}>
                      Search
                    </CButton>
                  </CInputGroupText>
                </CInputGroup>
              </form>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Subscribed At</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {subscribers.data?.length > 0 ? (
                    subscribers.data.map((sub, index) => (
                      <CTableRow key={sub.id}>
                        <CTableDataCell>
                          {(subscribers.from || 1) + index}
                        </CTableDataCell>
                        <CTableDataCell>{sub.email}</CTableDataCell>
                        <CTableDataCell>
                          {sub.created_at
                            ? new Date(sub.created_at).toLocaleString()
                            : '—'}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="danger"
                            size="sm"
                            variant="outline"
                            onClick={() => confirmDelete(sub)}
                          >
                            Remove
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={4} className="text-center text-muted">
                        No newsletter subscribers yet.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>

              {subscribers.links?.length > 3 && (
                <div className="d-flex gap-2 flex-wrap mt-3">
                  {subscribers.links.map((link, i) => (
                    <CButton
                      key={i}
                      size="sm"
                      color={link.active ? 'primary' : 'secondary'}
                      variant={link.active ? undefined : 'outline'}
                      disabled={!link.url}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                      onClick={() => link.url && router.visit(link.url)}
                    />
                  ))}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  );
}

export default Index;
