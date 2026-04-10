import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Icons } from '../../../utils/icons';
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CBadge,
  CFormSelect,
} from '@coreui/react'

function Index({ publishRequests, flash }) {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState({});

    const handleViewContent = (request) => {
        setSelectedRequest(request);
        setShowModal(true);
    };

    const handleStatusChange = (requestId, newStatus) => {
        setUpdatingStatus(prev => ({ ...prev, [requestId]: true }));
        
        router.patch(route('admin-dashboard.admin.publish-requests.update-status', requestId), {
            status: newStatus
        }, {
            onSuccess: () => {
                setUpdatingStatus(prev => ({ ...prev, [requestId]: false }));
                // The page will refresh automatically due to Inertia redirect
            },
            onError: (errors) => {
                setUpdatingStatus(prev => ({ ...prev, [requestId]: false }));
                console.error('Error updating status:', errors);
            }
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'warning', text: 'Pending' },
            'approved': { color: 'success', text: 'Approved' },
            'rejected': { color: 'danger', text: 'Rejected' },
        };

        const config = statusConfig[status] || { color: 'secondary', text: status };
        
        return <CBadge color={config.color}>{config.text}</CBadge>;
    };

    const truncateText = (text, maxLength = 50) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <DashboardLayout>
            <Head title="Publish Requests Management" />
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <strong>Publish Requests</strong>
                        </CCardHeader>
                        {flash?.success && (
                            <div className="alert alert-success alert-dismissible fade show m-3" role="alert">
                                <i className="fas fa-check-circle me-2"></i>
                                {flash.success}
                                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>
                        )}
                        {flash?.error && (
                            <div className="alert alert-danger alert-dismissible fade show m-3" role="alert">
                                <i className="fas fa-exclamation-circle me-2"></i>
                                {flash.error}
                                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>
                        )}
                        <CCardBody>
                            <CTable hover responsive>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell scope="col">Username</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Cover Image</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Genre</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Rating</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Character</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Content</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Author</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Submitted By</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Submitted On</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {publishRequests.data && publishRequests.data.length > 0 ? (
                                        publishRequests.data.map((request) => (
                                            <CTableRow key={request.id}>
                                                <CTableDataCell>{request.user?.username || 'N/A'}</CTableDataCell>
                                                <CTableDataCell>{request.title}</CTableDataCell>
                                                <CTableDataCell>
                                                    {request.cover_image ? (
                                                        <img 
                                                            src={`/storage/${request.cover_image}`} 
                                                            alt="Cover" 
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover', objectPosition: 'top' }}
                                                        />
                                                    ) : (
                                                        <span className="text-muted">No image</span>
                                                    )}
                                                </CTableDataCell>
                                                <CTableDataCell>{request.genre}</CTableDataCell>
                                                <CTableDataCell>
                                                    {request.rating ? (
                                                        <CBadge color="warning">{request.rating}</CBadge>
                                                    ) : (
                                                        <span className="text-muted">Not set</span>
                                                    )}
                                                </CTableDataCell>
                                                <CTableDataCell>{request.character}</CTableDataCell>
                                                <CTableDataCell>
                                                    <CTooltip content={request.content}>
                                                        <span>{truncateText(request.content, 30)}</span>
                                                    </CTooltip>
                                                </CTableDataCell>
                                                <CTableDataCell>{request.user?.name || 'N/A'}</CTableDataCell>
                                                <CTableDataCell>{request.user?.name || 'N/A'}</CTableDataCell>
                                                <CTableDataCell>
                                                    {new Date(request.created_at).toLocaleDateString()}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex flex-column gap-2">
                                                        <CFormSelect
                                                            size="sm"
                                                            value={request.status}
                                                            onChange={(e) => handleStatusChange(request.id, e.target.value)}
                                                            style={{ minWidth: '120px' }}
                                                            disabled={updatingStatus[request.id]}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="approved">Approved</option>
                                                            <option value="rejected">Rejected</option>
                                                        </CFormSelect>
                                                        <div className="mt-1">
                                                            {updatingStatus[request.id] ? (
                                                                <CBadge color="info">Updating...</CBadge>
                                                            ) : (
                                                                ''
                                                            )}
                                                        </div>
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <button className='btn py-11 px-32 radius-60 btn' style={{ backgroundColor: '#fea257', color: '#fff' }} onClick={() => handleViewContent(request)}>
                                                    View Content
                                                    </button>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    ) : (
                                        <CTableRow>
                                            <CTableDataCell colSpan="12" className="text-center">
                                                No publish requests found
                                            </CTableDataCell>
                                        </CTableRow>
                                    )}
                                </CTableBody>
                            </CTable>

                            {/* Pagination */}
                            {publishRequests.data && publishRequests.data.length > 0 && (
                                <div className="d-flex justify-content-center mt-3">
                                    <CPagination>
                                        {publishRequests.links.map((link, index) => (
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
                                    <strong>Genre:</strong> {selectedRequest.genre}
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <strong>Rating:</strong> {selectedRequest.rating ? (
                                        <CBadge color="warning">{selectedRequest.rating}</CBadge>
                                    ) : (
                                        <span className="text-muted">Not set</span>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <strong>Character:</strong> {selectedRequest.character}
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <strong>Status:</strong> {getStatusBadge(selectedRequest.status)}
                                </div>
                                <div className="col-md-6">
                                    <strong>Submitted:</strong> {new Date(selectedRequest.created_at).toLocaleString()}
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <strong>Author:</strong> {selectedRequest.user?.name || 'N/A'} (@{selectedRequest.user?.username || 'N/A'})
                                </div>
                                <div className="col-md-6">
                                    <strong>Submitted:</strong> {new Date(selectedRequest.created_at).toLocaleString()}
                                </div>
                            </div>
                            {selectedRequest.cover_image && (
                                <div className="mb-3">
                                    <strong>Cover Image:</strong>
                                    <div className="mt-2">
                                        <img 
                                            src={`/storage/${selectedRequest.cover_image}`} 
                                            alt="Cover" 
                                            style={{ maxWidth: '200px', height: 'auto' }}
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
    )
}

export default Index;