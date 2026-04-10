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
    CFormSelect,
    CTooltip,
    CButton
} from '@coreui/react';

function Index({ packages, flash }) {
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

    const handleStatusChange = (id, value) => {
        router.put(`/admin/packages/${id}`, { is_active: value === "1" });
    };

    const confirmDelete = (pkg) => {
        Swal.fire({
            title: 'Confirm Delete',
            html: `Are you sure you want to delete the package: <strong>${pkg.name}</strong>?<br><br>This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Delete Package',
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
                    title: 'Deleting package...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                router.delete(route('admin-dashboard.packages.destroy', pkg.id), {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Package deleted successfully!',
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
                            title: 'Error deleting package!',
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

    return (
        <DashboardLayout>
            <Head title="Packages Management" />
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <strong>Packages</strong>
                            <Link href={route('admin-dashboard.packages.create')}>
                                <CButton color="primary" size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}>
                                    <Icons.Plus className="me-1" /> Create Package
                                </CButton>
                            </Link>
                        </CCardHeader>

                        <CCardBody>
                            <CTable hover responsive>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell>Name</CTableHeaderCell>
                                        <CTableHeaderCell>Price ($)</CTableHeaderCell>
                                        <CTableHeaderCell>Interval</CTableHeaderCell>
                                        <CTableHeaderCell>Features</CTableHeaderCell>
                                        <CTableHeaderCell>Status</CTableHeaderCell>
                                        <CTableHeaderCell>Actions</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {packages.data && packages.data.length > 0 ? (
                                        packages.data.map((pkg) => (
                                            <CTableRow key={pkg.id}>
                                                <CTableDataCell>{pkg.name || 'N/A'}</CTableDataCell>
                                                <CTableDataCell>
                                                    {pkg.price_cents !== null
                                                        ? `$${(pkg.price_cents / 100).toFixed(2)}`
                                                        : 'Free'}
                                                </CTableDataCell>
                                                <CTableDataCell>{pkg.interval || '-'}</CTableDataCell>
                                                <CTableDataCell>
                                                    {pkg.features && pkg.features.length > 0 ? (
                                                        <span className="text-muted">Has Features</span>
                                                    ) : (
                                                        <span className="text-muted">No features</span>
                                                    )}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="mt-1">
                                                        {pkg.is_active ? (
                                                            <CBadge color="success">Active</CBadge>
                                                        ) : (
                                                            <CBadge color="secondary">Inactive</CBadge>
                                                        )}
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex gap-2">
                                                        {[
                                                            <CTooltip key="view" content="View Package">
                                                                <CButton className='btn-icon-size p-0'
                                                                    onClick={() => router.visit(route('admin-dashboard.packages.show', pkg.id))}
                                                                >
                                                                    <Icons.View />
                                                                </CButton>
                                                            </CTooltip>,
                                                            <CTooltip key="edit" content="Edit Package">
                                                                <CButton className='btn-icon-size p-0'
                                                                    onClick={() => router.visit(route('admin-dashboard.packages.edit', pkg.id))}
                                                                >
                                                                    <Icons.Edit />
                                                                </CButton>
                                                            </CTooltip>,
                                                            <CTooltip key="delete" content="Delete Package">
                                                                <CButton className='btn-icon-size p-0'  
                                                                    onClick={() => confirmDelete(pkg)}
                                                                >
                                                                    <Icons.Delete />
                                                                </CButton>
                                                            </CTooltip>,
                                                        ].filter(Boolean)}
                                                    </div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    ) : (
                                        <CTableRow>
                                            <CTableDataCell colSpan="7" className="text-center">
                                                No packages found
                                            </CTableDataCell>
                                        </CTableRow>
                                    )}
                                </CTableBody>
                            </CTable>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </DashboardLayout>
    );
}

export default Index;
