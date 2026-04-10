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
  CTooltip,
} from '@coreui/react';

const Index = ({ categories, filters, flash }) => {
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
    router.get(route('admin-dashboard.categories.index'), { search }, { preserveState: true });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const confirmDelete = (category) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the category "${category.name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      customClass: {
        popup: 'swal2-custom-popup',
        title: 'swal2-custom-title',
        content: 'swal2-custom-content'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin-dashboard.categories.destroy', category.id), {
          onSuccess: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Category has been deleted successfully.',
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
              text: 'Failed to delete category. Please try again.',
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
      <Head title="Category Management" />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Category Management</strong>
              <Link href={route('admin-dashboard.categories.create')}>
                <CButton color="primary" size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}>
                  <Icons.Plus className="me-1" /> Add New Category
                </CButton>
              </Link>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Category Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Created</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {categories.data.length > 0 ? (
                    categories.data.map((category, index) => (
                      <CTableRow key={category.id}>
                        <CTableDataCell>
                          {category.name}
                        </CTableDataCell>
                        <CTableDataCell>
                          {new Date(category.created_at).toLocaleDateString()}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            <Link href={route('admin-dashboard.categories.edit', category.id)}>
                              <CButton className='btn-icon-size p-0'>
                                <Icons.Edit className="me-1" />
                              </CButton>
                            </Link>
                            <CButton className='btn btn-icon-size p-0'
                              onClick={() => confirmDelete(category)}
                            >
                              <Icons.Delete className="me-1" />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="3" className="text-center">
                        No categories found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>

              {/* Pagination */}
              {categories.data.length > 0 && (
                <div className="d-flex justify-content-center mt-3">
                  <CPagination>
                    {categories.links.map((link, index) => (
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

