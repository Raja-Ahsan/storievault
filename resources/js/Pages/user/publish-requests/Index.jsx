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
} from '@coreui/react'

function Index({ publishRequests, flash }) {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);

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
        
        return (
            <CBadge color={config.color} className="d-flex align-items-center gap-1">
                {/* <Icons[config.icon] size="sm" /> */}
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

    return (
        <DashboardLayout>
            <Head title="My Publish Requests" />
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>My Publish Requests</strong>
                                <p className="text-muted mb-0 small">Track the status of your story publish requests</p>
                            </div>
                            <CButton 
                                color="primary" 
                                onClick={() => router.visit(route('community.index'))}
                                className="d-flex align-items-center gap-2"
                            >
                                {/* <Icons.Plus size="sm" /> */}
                                Submit New Request
                            </CButton>
                        </CCardHeader>
                        
                        {flash?.success && (
                            <div className="alert alert-success alert-dismissible fade show m-3" role="alert">
                                {/* <Icons.Check className="me-2" /> */}
                                {flash.success}
                                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>
                        )}
                        {flash?.error && (
                            <div className="alert alert-danger alert-dismissible fade show m-3" role="alert">
                                {/* <Icons.X className="me-2" /> */}
                                {flash.error}
                                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>
                        )}
                        
                        <CCardBody>
                            <CTable hover responsive>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Cover Image</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Genre</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Character</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Content Preview</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Submitted On</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {publishRequests.data && publishRequests.data.length > 0 ? (
                                        publishRequests.data.map((request) => (
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
                                                            {/* <Icons.Image className="text-muted" size="sm" /> */}
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
                                                        {/* <Icons.Eye size="sm" /> */}
                                                        View Details
                                                    </CButton>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    ) : (
                                        <CTableRow>
                                            <CTableDataCell colSpan="8" className="text-center py-5">
                                                <div className="d-flex flex-column align-items-center">
                                                    {/* <Icons.FileText className="text-muted mb-3" size="3x" /> */}
                                                    <h5 className="text-muted">No Publish Requests Found</h5>
                                                    <p className="text-muted mb-3">You haven't submitted any publish requests yet.</p>
                                                    <CButton 
                                                        color="primary" 
                                                        onClick={() => router.visit(route('community.index'))}
                                                        className="d-flex align-items-center gap-2"
                                                    >
                                                        {/* <Icons.Plus size="sm" /> */}
                                                        Submit Your First Request
                                                    </CButton>
                                                </div>
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
                                {/* <Icons.Info className="me-2" /> */}
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
    )
}

export default Index;
