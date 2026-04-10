import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Icons } from '../../../utils/icons';
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
  CInputGroup,
  CInputGroupText,
} from '@coreui/react';

const Index = ({ ratings, filters, flash }) => {
  const [search, setSearch] = useState(filters.search || '');

  // Handle flash messages with SweetAlert
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        icon: 'success',
        title: flash.success,
        showConfirmButton: false,
        timer: 1500,
        confirmButtonColor: '#FEA257',
        background: '#fff',
        customClass: {
          popup: 'swal2-custom-popup',
          title: 'swal2-custom-title',
          content: 'swal2-custom-content'
        }
      });
    }
    if (flash?.error) {
      Swal.fire({
        icon: 'error',
        title: flash.error,
        showConfirmButton: false,
        timer: 2000,
        confirmButtonColor: '#dc3545',
        background: '#fff',
        customClass: {
          popup: 'swal2-custom-popup',
          title: 'swal2-custom-title',
          content: 'swal2-custom-content'
        }
      });
    }
  }, [flash]);

  const handleSearch = () => {
    router.get(route('admin-dashboard.ratings.index'), { search }, { preserveState: true });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const confirmDelete = (rating) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the rating "${rating.name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      background: '#fff',
      customClass: {
        popup: 'swal2-custom-popup',
        title: 'swal2-custom-title',
        content: 'swal2-custom-content'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin-dashboard.ratings.destroy', rating.id), {
          onSuccess: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Rating has been deleted successfully.',
              showConfirmButton: false,
              timer: 1500,
              confirmButtonColor: '#FEA257',
              background: '#fff',
              customClass: {
                popup: 'swal2-custom-popup',
                title: 'swal2-custom-title',
                content: 'swal2-custom-content'
              }
            });
          },
          onError: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed to delete rating. Please try again.',
              confirmButtonColor: '#dc3545',
              background: '#fff',
              customClass: {
                popup: 'swal2-custom-popup',
                title: 'swal2-custom-title',
                content: 'swal2-custom-content'
              }
            });
          }
        });
      }
    });
  };

  return (
    <DashboardLayout>
      <Head title="Rating Management" />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Rating Management</strong>
              <Link href={route('admin-dashboard.ratings.create')}>
                <CButton color="primary" size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}>
                  <Icons.Plus className="me-1" /> Add New Rating
                </CButton>
              </Link>
            </CCardHeader>
            <CCardBody>
              {/* Search Section */}
              <div className="row mb-4">
                {/* <div className="col-md-6">
                  <CInputGroup>
                    <CInputGroupText>
                      <i className="fas fa-search"></i>
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      placeholder="Search ratings..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <CButton color="outline-secondary" onClick={handleSearch}>
                      Search
                    </CButton>
                  </CInputGroup>
                </div> */}
                {/* <div className="col-md-6 text-end">
                  <small className="text-muted">
                    Total: {ratings.total} ratings
                  </small>
                </div> */}
              </div>

              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    {/* <CTableHeaderCell scope="col">#</CTableHeaderCell> */}
                    <CTableHeaderCell scope="col">Rating Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Created</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {ratings.data.length > 0 && (
                    ratings.data.map((rating, index) => (
                      <CTableRow key={rating.id}>
                        {/* <CTableHeaderCell scope="row">
                          {ratings.from + index}
                        </CTableHeaderCell> */}
                        <CTableDataCell>
                          {rating.name}
                        </CTableDataCell>
                        <CTableDataCell>
                          {new Date(rating.created_at).toLocaleDateString()}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            <Link href={route('admin-dashboard.ratings.edit', rating.id)}>
                              <CButton className='btn-icon-size p-0'>
                                <Icons.Edit className="me-1" />
                              </CButton>
                            </Link>
                            <CButton className='btn btn-icon-size p-0'
                              onClick={() => confirmDelete(rating)}
                            >
                              <Icons.Delete className="me-1" />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>

              {/* Pagination */}
              {ratings.data.length > 0 && (
                <div className="d-flex justify-content-center mt-3">
                  <CPagination>
                    {ratings.links.map((link, index) => (
                      <CPaginationItem
                        key={index}
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
