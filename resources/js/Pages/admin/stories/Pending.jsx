import React, { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import Swal from 'sweetalert2';
import {
  CButton,
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
  CTooltip,
  CBadge,
} from '@coreui/react';
import { Icons } from '../../../utils/icons';

// Define theme colors
const themeColors = {
  primary: '#FEA257',
  secondary: '#74989E',
};

const Pending = ({ stories, flash }) => {
  // Handle flash messages with SweetAlert
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        icon: 'success',
        title: flash.success,
        showConfirmButton: false,
        timer: 1500,
        confirmButtonColor: themeColors.primary,
        background: '#fff',
        customClass: {
          popup: 'swal2-custom-popup',
          title: 'swal2-custom-title',
          content: 'swal2-custom-content'
        }
      });
    }
  }, [flash?.success]);

  const handleApprove = (story) => {
    Swal.fire({
      title: 'Approve Story',
      html: `Are you sure you want to approve: <strong>${story.title}</strong>?<br><br>This will make the story visible to all users.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Approve Story',
      cancelButtonText: 'Cancel',
      background: '#fff',
      customClass: {
        popup: 'swal2-custom-popup',
        title: 'swal2-custom-title',
        content: 'swal2-custom-content',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading state
        Swal.fire({
          title: 'Approving story...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        router.post(route('admin-dashboard.stories.approve', story.id), {}, {
          onSuccess: () => {
            Swal.fire({
              icon: 'success',
              title: 'Story approved successfully!',
              showConfirmButton: false,
              timer: 1500,
              confirmButtonColor: '#28a745',
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
              title: 'Error approving story!',
              text: 'An unexpected error occurred.',
              confirmButtonColor: '#28a745',
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

  const handleReject = (story) => {
    Swal.fire({
      title: 'Reject Story',
      html: `Are you sure you want to reject: <strong>${story.title}</strong>?<br><br>This will remove the story from the community.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Reject Story',
      cancelButtonText: 'Cancel',
      background: '#fff',
      customClass: {
        popup: 'swal2-custom-popup',
        title: 'swal2-custom-title',
        content: 'swal2-custom-content',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading state
        Swal.fire({
          title: 'Rejecting story...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        router.post(route('admin-dashboard.stories.reject', story.id), {}, {
          onSuccess: () => {
            Swal.fire({
              icon: 'success',
              title: 'Story rejected successfully!',
              showConfirmButton: false,
              timer: 1500,
              confirmButtonColor: '#dc3545',
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
              title: 'Error rejecting story!',
              text: 'An unexpected error occurred.',
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
      <Head title="Pending Stories" />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Pending Stories for Approval</strong>
            </CCardHeader>
            <CCardBody>
              {stories.data.length === 0 ? (
                <div className="text-center py-5">
                  <h4 className="text-muted">No pending stories</h4>
                  <p className="text-muted">All community stories have been reviewed.</p>
                </div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Author</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Genre</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Created</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {stories.data.map((story) => (
                      <CTableRow key={story.id}>
                        <CTableHeaderCell scope="row">{story.id}</CTableHeaderCell>
                        <CTableDataCell>
                          <strong>{story.title}</strong>
                        </CTableDataCell>
                        <CTableDataCell>{story.author}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="info">{story.genre}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="text-truncate" style={{ maxWidth: '200px' }} title={story.description}>
                            {story.description}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>{story.created_at_formatted}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            <CTooltip content="View Story">
                              <CButton 
                                color="info" 
                                size="sm"
                                onClick={() => router.visit(route('admin-dashboard.stories.show', story.id))}
                              >
                                <Icons.View />
                              </CButton>
                            </CTooltip>
                            <CTooltip content="Approve Story">
                              <CButton 
                                color="success" 
                                size="sm"
                                onClick={() => handleApprove(story)}
                              >
                                ✅ Approve
                              </CButton>
                            </CTooltip>
                            <CTooltip content="Reject Story">
                              <CButton 
                                color="danger" 
                                size="sm"
                                onClick={() => handleReject(story)}
                              >
                                ❌ Reject
                              </CButton>
                            </CTooltip>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  );
};

export default Pending;
