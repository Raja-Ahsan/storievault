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
    CBadge,
    CTooltip,
    CButton
} from '@coreui/react';

function Index({ coupons, flash }) {
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

    const confirmDelete = (coupon) => {
        Swal.fire({
            title: 'Confirm Delete',
            html: `Are you sure you want to delete the coupon: <strong>${coupon.code}</strong>?<br><br>This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Delete Coupon',
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
                    title: 'Deleting coupon...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                router.delete(route('admin-dashboard.coupons.destroy', coupon.id), {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Coupon deleted successfully!',
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
                            title: 'Error deleting coupon!',
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
    };

    const toggleUsageStatus = (coupon) => {
        const newStatus = !coupon.is_used;
        const action = newStatus ? 'mark as used' : 'mark as unused';
        
        Swal.fire({
            title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            html: `Are you sure you want to ${action} the coupon: <strong>${coupon.code}</strong>?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#FEA257',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Yes, ${action}`,
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
                router.put(route('admin-dashboard.coupons.update', coupon.id), {
                    is_used: newStatus
                }, {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: `Coupon ${action} successfully!`,
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
                });
            }
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <DashboardLayout>
            <Head title="Coupons Management" />
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <strong>Coupons</strong>
                            <Link href={route('admin-dashboard.coupons.create')}>
                                <CButton color="primary" size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}>
                                    <Icons.Plus className="me-1" /> Create Coupon
                                </CButton>
                            </Link>
                        </CCardHeader>

                        <CCardBody>
                            <CTable hover responsive>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell>Code</CTableHeaderCell>
                                        <CTableHeaderCell>User</CTableHeaderCell>
                                        <CTableHeaderCell>Discount</CTableHeaderCell>
                                        <CTableHeaderCell>Status</CTableHeaderCell>
                                        <CTableHeaderCell>Created At</CTableHeaderCell>
                                        <CTableHeaderCell>Actions</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {coupons.length > 0 ? (
                                        coupons.map((coupon) => (
                                            <CTableRow key={coupon.id}>
                                                <CTableDataCell>
                                                    <code className="bg-light px-2 py-1 rounded">
                                                        {coupon.code}
                                                    </code>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div>
                                                        <div className="fw-medium">{coupon.user?.name || 'N/A'}</div>
                                                        <small className="text-muted">{coupon.user?.email || 'N/A'}</small>
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color="info" className="fs-6">
                                                        {coupon.discount}%
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="mt-1">
                                                        {coupon.is_used ? (
                                                            <CBadge color="success">Used</CBadge>
                                                        ) : (
                                                            <CBadge color="warning">Available</CBadge>
                                                        )}
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <small className="text-muted">
                                                        {formatDate(coupon.created_at)}
                                                    </small>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex gap-2">
                                                        <CTooltip content={coupon.is_used ? "Mark as Unused" : "Mark as Used"}>
                                                            <CButton 
                                                                className=' p-0'
                                                                onClick={() => toggleUsageStatus(coupon)}
                                                                // color={coupon.is_used ? "warning" : "success"}
                                                            >
                                                                {coupon.is_used ? <Icons.Refresh /> : <Icons.Check />}
                                                            </CButton>
                                                        </CTooltip>
                                                        <CTooltip content="Delete Coupon">
                                                            <CButton 
                                                                className=' p-0'  
                                                                onClick={() => confirmDelete(coupon)}
                                                            >
                                                                <Icons.Delete />
                                                            </CButton>
                                                        </CTooltip>
                                                    </div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    ) : (
                                        <CTableRow>
                                            <CTableDataCell colSpan="6" className="text-center py-4">
                                                <div className="text-muted">
                                                    <Icons.Gift className="fs-1 mb-2" />
                                                    <div>No coupons found</div>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    )}
                                </CTableBody>
                            </CTable>

                            {/* Pagination */}
                            {/* {coupons.data && coupons.data.length > 0 && coupons.links && (
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div className="text-muted">
                                        Showing {coupons.from} to {coupons.to} of {coupons.total} coupons
                                    </div>
                                    <div className="d-flex gap-2">
                                        {coupons.links.map((link, index) => (
                                            <CButton
                                                key={index}
                                                size="sm"
                                                variant={link.active ? "solid" : "outline"}
                                                color={link.active ? "primary" : "secondary"}
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )} */}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </DashboardLayout>
    );
}

export default Index;
