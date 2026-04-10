import React, { useState, useEffect } from 'react'
import { Head, router } from '@inertiajs/react'
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
  CTooltip,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
// import { cilTrash, cilEye } from '@coreui/icons'
// import { format } from 'date-fns'

const Community = ({ stories, flash }) => {
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
  }, [flash?.success]);

  const confirmDelete = (story) => {
    Swal.fire({
      title: 'Confirm Delete',
      html: `Are you sure you want to delete the story: <strong>${story.title}</strong>?<br><br>This action cannot be undone and will remove all associated comments and likes.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Delete Story',
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
          title: 'Deleting story...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        router.delete(route('admin-dashboard.stories.destroy', story.id), {
          onSuccess: () => {
            Swal.fire({
              icon: 'success',
              title: 'Story deleted successfully!',
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
              title: 'Error deleting story!',
              text: 'An unexpected error occurred.',
              confirmButtonColor: '#FEA257',
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
    })
  }

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

  // const formatDate = (dateString) => {
  //   if (!dateString) return 'N/A'
  //   try {
  //     return format(new Date(dateString), 'MMM d, yyyy')
  //   } catch (e) {
  //     return dateString
  //   }
  // }

  return (
    <DashboardLayout>
      <Head title="Story Management" />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Community Stories</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Username</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Author</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Genre</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Stats</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Created</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {stories.data.length > 0 ? (
                    stories.data.map((story) => (
                      <CTableRow key={story.id}>
                        <CTableDataCell>
                          <span className="">{story.user?.username || 'N/A'}</span>
                        </CTableDataCell>
                        <CTableDataCell>{story.title}</CTableDataCell>
                        <CTableDataCell>{story.author}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-2 align-items-center">
                            <CBadge color="info">{story.genre}</CBadge>
                            {story.rating && (
                              <CBadge color="warning">{story.rating}</CBadge>
                            )}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={story.is_community ? 'info' : 'success'}>
                            {story.is_community ? 'Community' : 'Standard'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            <CBadge className="d-flex gap-2" color="primary" title="Reads">
                              <Icons.View /> {story.read_count}
                            </CBadge>
                            <CBadge className="d-flex gap-2" color="danger" title="Likes">
                              <Icons.Like /> {story.likes_count}
                            </CBadge>
                            <CBadge className="d-flex gap-2" color="dark" title="Comments">
                              <Icons.Comment /> {story.comment_count}
                            </CBadge>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>{story.created_at_formatted}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            {[
                              <CTooltip key="view" content="View Story">
                                <CButton
                                className='btn-icon-size p-0'
                                  onClick={() => router.visit(route('admin-dashboard.stories.show', story.id))}
                                >
                                  {/* <CIcon icon={cilEye} /> View */}
                                  <Icons.View />
                                </CButton>
                              </CTooltip>,
                              <CTooltip key="edit" content="Edit Story">
                                <CButton
                                  className='btn-icon-size p-0'
                                  onClick={() => router.visit(route('admin-dashboard.stories.edit', story.id))}
                                >
                                  <Icons.Edit />
                                </CButton>
                              </CTooltip>,
                              <CTooltip key="delete" content="Delete Story">
                                <CButton
                                className='btn-icon-size p-0'
                                  onClick={() => confirmDelete(story)}
                                >
                                  <Icons.Delete />
                                </CButton>
                              </CTooltip>,
                              story.is_community && story.status === 'pending' && (
                                <>
                                  <CTooltip key="approve" content="Approve Story">
                                    <CButton
                                      className='btn-icon-size p-0'
                                      onClick={() => handleApprove(story)}
                                    >
                                      <Icons.Check />
                                    </CButton>
                                  </CTooltip>
                                  <CTooltip key="reject" content="Reject Story">
                                    <CButton
                                      className='btn-icon-size p-0'
                                      onClick={() => handleReject(story)}
                                    >
                                      <Icons.Cross2 />
                                    </CButton>
                                  </CTooltip>
                                </>
                              ),
                            ].filter(Boolean)}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="8" className="text-center">
                        No stories found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>

              {stories.data.length > 0 && (
                <CPagination align="center" className="mt-3">
                  {stories.links.map((link, index) => (
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
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Delete Confirmation Modal */}
      {/* This modal is no longer needed as SweetAlert2 handles the confirmation */}
    </DashboardLayout>
  )
}

export default Community;