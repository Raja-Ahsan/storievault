import React, { useState, useEffect } from 'react'
import { Head, router, Link } from '@inertiajs/react'
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
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'

const Index = ({ communityStories, publishedStories, publishRequests, flash }) => {
  const [activeTab, setActiveTab] = useState('community');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const confirmDelete = (story, type) => {
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

        router.delete(route('user-dashboard.stories.destroy', story.id), {
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
    });
  };

  const handlePublishStory = (story) => {
    // Store story data in session and redirect to packages
    router.post(route('story.draft.session'), {
      story_id: story.id,
      character_name: story.character || 'HERO',
      content: story.content || story.description || ''
    }, {
      onSuccess: () => {
        // Redirect to packages page
        router.visit(route('stories.publish.packages'));
      },
      onError: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error preparing story for publishing!',
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
  };

  const renderStoryTable = (stories, type) => {
    if (!stories || stories.data.length === 0) {
      return (
        <CTableRow>
          <CTableDataCell colSpan={type === 'community' ? "5" : "4"} className="text-center">
            No {type} stories found
          </CTableDataCell>
        </CTableRow>
      );
    }

    return stories.data.map((story) => (
      <CTableRow key={story.id}>
        <CTableDataCell>
          <div className="d-flex align-items-center">
            {story.cover_image ? (
              <img
                src={`/storage/${story.cover_image}`}
                alt={story.title}
                className="me-3"
                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                onError={(e) => {
                  e.target.src = '/assets/images/book-03.png';
                }}
              />
            ) : (
              <img
                src="/assets/images/book-03.png"
                alt="Default cover"
                className="me-3"
                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
              />
            )}
            <div>
              <div className="fw-bold">{story.title || 'Untitled'}</div>
              <div className="d-flex gap-2 align-items-center mt-1">
                <small className="text-muted">{story.genre || 'No genre'}</small>
                {story.rating && (
                  <CBadge color="warning" size="sm">{story.rating}</CBadge>
                )}
              </div>
            </div>
          </div>
        </CTableDataCell>
        <CTableDataCell>{story.author || 'Unknown'}</CTableDataCell>
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
            {/* <span className="text-muted">Reads: {story.read_count || 0}</span>
            <span className="text-muted">Likes: {story.likes_count || 0}</span>
            <span className="text-muted">Comments: {story.comment_count || 0}</span> */}
          </div>
        </CTableDataCell>
        <CTableDataCell>
          <CBadge color={story.status === 'approved' ? 'success' : story.status === 'pending' ? 'warning' : 'secondary'}>
            {story.status || 'Draft'}
          </CBadge>
        </CTableDataCell>
        {type === 'community' && (
          <CTableDataCell>
            <CButton
              color="primary"
              size="sm"
              onClick={() => handlePublishStory(story)}
              className="d-flex align-items-center gap-1"
              style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
            >
              <Icons.ArrowUp style={{ fontSize: '0.875rem' }} />
              Publish
            </CButton>
          </CTableDataCell>
        )}
        {/* <CTableDataCell>
          <div className="d-flex gap-2">
            <CFormSelect
              size="sm"
              value={story.is_active ? "1" : "0"}
              onChange={(e) => {
                const newStatus = e.target.value === "1";
                router.put(`/user-dashboard/stories/${story.id}/toggle-status`, { 
                  is_active: newStatus 
                }, {
                  onSuccess: () => {
                    Swal.fire({
                      icon: 'success',
                      title: `Story ${newStatus ? 'activated' : 'deactivated'} successfully!`,
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
                      title: 'Error updating story status!',
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
              }}
              style={{ width: '120px' }}
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </CFormSelect>
          </div>
        </CTableDataCell> */}
      </CTableRow>
    ));
  };

  const renderPagination = (stories, type) => {
    if (!stories || stories.last_page <= 1) return null;

    return (
      <CPagination align="center" className="mt-4">
        {stories.links.map((link, index) => (
          <CPaginationItem
            key={index}
            active={link.active}
            disabled={!link.url}
            onClick={() => {
              if (link.url) {
                const url = new URL(link.url);
                const page = url.searchParams.get('page');
                router.visit(route('user-dashboard.stories.index', { page, tab: type }));
              }
            }}
          >
            {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
          </CPaginationItem>
        ))}
      </CPagination>
    );
  };

  const handleViewContent = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'warning', text: 'Pending', icon: 'Clock' },
      'approved': { color: 'success', text: 'Approved', icon: 'Check' },
      'rejected': { color: 'danger', text: 'Rejected', icon: 'X' },
    };

    const config = statusConfig[status] || { color: 'secondary', text: status, icon: 'Question' };
    
    const IconComponent = Icons[config.icon];
    return (
      <CBadge color={config.color} className="">
        <IconComponent style={{ marginRight: '0.25rem', fontSize: '0.875rem' }} />
        {config.text}
      </CBadge>
    );
  };

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Your publish request is currently under review. We will notify you once it has been processed.';
      case 'approved':
        return 'Congratulations! Your publish request has been approved. Your story is now available for publishing.';
      case 'rejected':
        return 'Unfortunately, your publish request was not approved. Please review the feedback and consider resubmitting.';
      default:
        return 'Status information not available.';
    }
  };

  const renderPublishRequestsTable = (requests) => {
    if (!requests || requests.data.length === 0) {
      return (
        <CTableRow>
          <CTableDataCell colSpan="8" className="text-center py-5">
            <div className="d-flex flex-column align-items-center">
              <Icons.FileText className="text-muted mb-3" style={{ fontSize: '3rem' }} />
              <h5 className="text-muted">No Publish Requests Found</h5>
              <p className="text-muted mb-3">You haven't submitted any publish requests yet.</p>
              <a href={route('stories.index')}
                // color="primary" 
                // onClick={() => router.visit(route('stories.index'))}
                className="d-flex  btn btn-primary align-items-center gap-2"
              >
                <Icons.Plus style={{ fontSize: '0.875rem' }} />
                Submit Your First Request
              </a>
            </div>
          </CTableDataCell>
        </CTableRow>
      );
    }

    return requests.data.map((request) => (
      <CTableRow key={request.id}>
        <CTableDataCell>
          <div className="fw-medium">{request.title}</div>
          {request.story && (
            <small className="text-muted">Story ID: {request.story.id}</small>
          )}
        </CTableDataCell>
        <CTableDataCell>
          {request.cover_image ? (
            <img 
              src={`/storage/${request.cover_image}`} 
              alt="Cover" 
              style={{ width: '50px', height: '50px', objectFit: 'cover', objectPosition: 'top', borderRadius: '4px' }}
            />
          ) : (
            <div className="bg-light d-flex align-items-center justify-content-center" 
                 style={{ width: '50px', height: '50px', borderRadius: '4px' }}>
              <Icons.Image className="text-muted" style={{ fontSize: '0.875rem' }} />
            </div>
          )}
        </CTableDataCell>
        <CTableDataCell>
          <CBadge color="info">{request.genre}</CBadge>
        </CTableDataCell>
        <CTableDataCell>{request.character}</CTableDataCell>
        <CTableDataCell>
          <CTooltip content={request.content}>
            <span className="text-muted">{truncateText(request.content, 30)}</span>
          </CTooltip>
        </CTableDataCell>
        <CTableDataCell>
          {getStatusBadge(request.status)}
        </CTableDataCell>
        <CTableDataCell>
          <div className="small text-muted">
            {new Date(request.created_at).toLocaleDateString()}
          </div>
          <div className="small text-muted">
            {new Date(request.created_at).toLocaleTimeString()}
          </div>
        </CTableDataCell>
        <CTableDataCell>
          <CButton
            color="outline-primary"
            size="sm"
            onClick={() => handleViewContent(request)}
            className="d-flex align-items-center gap-1"
          >
            <Icons.Eye style={{ fontSize: '0.875rem' }} />
            View Details
          </CButton>
        </CTableDataCell>
      </CTableRow>
    ));
  };

  const renderPublishRequestsPagination = (requests) => {
    if (!requests || requests.last_page <= 1) return null;

    return (
      <CPagination align="center" className="mt-4">
        {requests.links.map((link, index) => (
          <CPaginationItem
            key={index}
            active={link.active}
            disabled={!link.url}
            onClick={() => {
              if (link.url) {
                const url = new URL(link.url);
                const page = url.searchParams.get('page');
                router.visit(route('user-dashboard.stories.index', { page, tab: 'publish-requests' }));
              }
            }}
          >
            {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
          </CPaginationItem>
        ))}
      </CPagination>
    );
  };

  return (
    <DashboardLayout>
      <Head title="My Stories" />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>My Stories</strong>
              <Link href={route('user-dashboard.stories.create')}>
                <CButton className='custom-primary-btn' color="primary" size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}>
                  <Icons.Plus className="me-1" /> Create New Story
                </CButton>
              </Link>
            </CCardHeader>
            <CCardBody>
              <CNav variant="tabs" className="mb-4">
                {/* <CNavItem>
                  <CNavLink
                    active={activeTab === 'published'}
                    onClick={() => setActiveTab('published')}
                    style={{ cursor: 'pointer' }}
                  >
                    Published Stories ({publishedStories?.total || 0})
                  </CNavLink>
                </CNavItem> */}
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'community'}
                    onClick={() => setActiveTab('community')}
                    style={{ cursor: 'pointer' }}
                  >
                    Community Stories ({communityStories?.total || 0})
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'publish-requests'}
                    onClick={() => setActiveTab('publish-requests')}
                    style={{ cursor: 'pointer' }}
                  >
                    Publish Requests ({publishRequests?.total || 0})
                  </CNavLink>
                </CNavItem>
              </CNav>

              <CTabContent>
                {/* <CTabPane visible={activeTab === 'published'}>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Story</CTableHeaderCell>
                        <CTableHeaderCell>Author</CTableHeaderCell>
                        <CTableHeaderCell>Stats</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {renderStoryTable(publishedStories, 'published')}
                    </CTableBody>
                  </CTable>
                  {renderPagination(publishedStories, 'published')}
                </CTabPane> */}

                <CTabPane visible={activeTab === 'community'}>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Story</CTableHeaderCell>
                        <CTableHeaderCell>Author</CTableHeaderCell>
                        <CTableHeaderCell>Stats</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {renderStoryTable(communityStories, 'community')}
                    </CTableBody>
                  </CTable>
                  {renderPagination(communityStories, 'community')}
                </CTabPane>

                <CTabPane visible={activeTab === 'publish-requests'}>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Title</CTableHeaderCell>
                        <CTableHeaderCell>Cover Image</CTableHeaderCell>
                        <CTableHeaderCell>Genre</CTableHeaderCell>
                        <CTableHeaderCell>Character</CTableHeaderCell>
                        <CTableHeaderCell>Content Preview</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Submitted On</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {renderPublishRequestsTable(publishRequests)}
                    </CTableBody>
                  </CTable>
                  {renderPublishRequestsPagination(publishRequests)}
                </CTabPane>
              </CTabContent>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Content Modal */}
      <CModal 
        visible={showModal} 
        onClose={() => setShowModal(false)}
        size="lg"
      >
        <CModalHeader onClose={() => setShowModal(false)}>
          <CModalTitle>Publish Request Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedRequest && (
            <div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Title:</strong> {selectedRequest.title}
                </div>
                <div className="col-md-6">
                  <strong>Genre:</strong> 
                  <CBadge color="info" className="ms-2">{selectedRequest.genre}</CBadge>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Character:</strong> {selectedRequest.character}
                </div>
                <div className="col-md-6">
                  <strong>Status:</strong> {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Submitted:</strong> {new Date(selectedRequest.created_at).toLocaleString()}
                </div>
                <div className="col-md-6">
                  <strong>Last Updated:</strong> {new Date(selectedRequest.updated_at).toLocaleString()}
                </div>
              </div>
              
              {/* Status Message */}
              <div className="alert alert-info mb-3">
                <Icons.Info className="me-2" />
                <strong>Status Update:</strong> {getStatusMessage(selectedRequest.status)}
              </div>
              
              {selectedRequest.cover_image && (
                <div className="mb-3">
                  <strong>Cover Image:</strong>
                  <div className="mt-2">
                    <img 
                      src={`/storage/${selectedRequest.cover_image}`} 
                      alt="Cover" 
                      style={{ maxWidth: '200px', height: 'auto', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              )}
              <div className="mb-3">
                <strong>Content:</strong>
                <div className="mt-2 p-3 bg-light rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedRequest.content}
                </div>
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </DashboardLayout>
  );
};

export default Index;
