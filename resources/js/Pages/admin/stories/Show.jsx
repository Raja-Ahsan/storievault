import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
import DashboardLayout from '../../../Layouts/DashboardLayout'
import Swal from 'sweetalert2'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTooltip,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilTrash } from '@coreui/icons'
import { format } from 'date-fns'

// Define theme colors
const themeColors = {
  primary: '#FEA257',
  secondary: '#74989E',
};

const Show = ({ story, flash }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a')
    } catch (e) {
      return dateString
    }
  }

  const handleDelete = () => {
    Swal.fire({
      title: 'Confirm Delete',
      html: `Are you sure you want to delete: <strong>${story.title}</strong>?<br><br>This action cannot be undone and will remove all associated comments and likes.`,
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
              text: 'Redirecting to stories list...',
              showConfirmButton: false,
              timer: 1500,
              confirmButtonColor: themeColors.primary,
              background: '#fff',
              customClass: {
                popup: 'swal2-custom-popup',
                title: 'swal2-custom-title',
                content: 'swal2-custom-content'
              }
            }).then(() => {
              router.visit(route('admin-dashboard.stories.index'));
            });
          },
          onError: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error deleting story!',
              text: 'An unexpected error occurred.',
              confirmButtonColor: themeColors.primary,
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
  }

  return (
    <DashboardLayout>
      <Head title={`Story: ${story.title}`} />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Link href={route('admin-dashboard.stories.index')}>
                  <CButton className="me-2 arrow-redirect-btn">
                    <CIcon icon={cilArrowLeft} />
                  </CButton>
                </Link>
                <strong>Story Details</strong>
              </div>
              <CTooltip content="Delete Story">
                <CButton color="primary" className='custom-primary-btn' size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }} onClick={handleDelete}>
                  <CIcon icon={cilTrash} className="me-1" /> Delete Story
                </CButton>
              </CTooltip>
            </CCardHeader>
            <CCardBody>
              <div className="mb-4">
                <h2 className="mb-1">{story.title}</h2>
                <div className="text-medium-emphasis mb-3">
                  By {story.author} • {story.genre} • Created {formatDate(story.created_at)}
                </div>
                <CBadge color={story.is_community ? 'info' : 'success'} className="mb-3">
                  {story.is_community ? 'Community Story' : 'Standard Story'}
                </CBadge>
                <div className="d-flex gap-3 mb-4">
                  <div className="text-center">
                    <div className="fs-4 fw-bold">{story.read_count}</div>
                    <div className="text-medium-emphasis">Reads</div>
                  </div>
                  <div className="text-center">
                    <div className="fs-4 fw-bold">{story.likes_count}</div>
                    <div className="text-medium-emphasis">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="fs-4 fw-bold">{story.comment_count}</div>
                    <div className="text-medium-emphasis">Comments</div>
                  </div>
                </div>
              </div>

              <h4>Story Description</h4>
              <p className="mb-4">{story.description || 'No description available.'}</p>

              <h4>Story Content</h4>
              <div className="border rounded p-3 bg-light">
                <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                  {story.content ? (
                    <div className='page-content' dangerouslySetInnerHTML={{ __html: story.content }} />
                  ) : (
                    <p className="text-muted">No content available.</p>
                  )}
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  )
}

export default Show 