import React, { useState, useEffect } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import DashboardLayout from "../../../Layouts/DashboardLayout";
import { Icons } from "../../../utils/icons";
import Swal from 'sweetalert2';
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CForm,
    CFormInput,
    CFormLabel,
    CFormTextarea,
    CRow,
    CFormSelect,
    CAlert,
    CInputGroup,
    CInputGroupText,
    CBadge,
    CFormCheck,
} from "@coreui/react";

// Define theme colors
const themeColors = {
    primary: '#FEA257',
    secondary: '#74989E',
};

const Create = ({ users, flash }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: "",
        discount_type: "percentage", // fixed to percentage only
        discount_value: "",
        usage_limit: "",
        expires_at: "",
        is_active: true, // Always active by default
        description: "",
        users: [], // selected users
    });

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

    // Warn user about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (data.code || data.discount_value || data.description) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [data]);

    const validateForm = () => {
        const newErrors = {};

        if (!data.code || data.code.trim() === "") {
            newErrors.code = "Coupon code is required";
        }

        if (!data.discount_value || isNaN(data.discount_value) || data.discount_value <= 0) {
            newErrors.discount_value = "Valid discount value is required";
        }

        if (data.discount_value > 100 || data.discount_value < 0) {
            newErrors.discount_value = "Percentage must be between 0 and 100";
        }

        if (data.users.length === 0) {
            newErrors.users = "Please select at least one user";
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error!',
                text: 'Please check your input and try again.',
                confirmButtonColor: themeColors.primary,
                background: '#fff',
                customClass: {
                    popup: 'swal2-custom-popup',
                    title: 'swal2-custom-title',
                    content: 'swal2-custom-content'
                }
            });
            return;
        }

        // Show loading state
        Swal.fire({
            title: 'Creating coupon...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Update the form data with formatted data
        setData("code", data.code.trim().toUpperCase());
        // is_active is always true, no need to set it

        post(route("admin-dashboard.coupons.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                Swal.fire({
                    icon: 'success',
                    title: 'Coupons created successfully!',
                    text: 'Unique coupon codes have been generated for each selected user.',
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
            },
            onError: (errors) => {
                // Show specific error messages
                let errorMessage = 'Please check your input.';
                if (errors.code) errorMessage = errors.code;
                else if (errors.discount_value) errorMessage = errors.discount_value;
                else if (errors.users) errorMessage = errors.users;
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error creating coupon!',
                    text: errorMessage,
                    showConfirmButton: true,
                    confirmButtonColor: themeColors.primary,
                    background: '#fff',
                    customClass: {
                        popup: 'swal2-custom-popup',
                        title: 'swal2-custom-title',
                        content: 'swal2-custom-content'
                    }
                });
            },
        });
    };

    // Removed discountTypeOptions since we only support percentage

    // Removed statusOptions since coupons are always active by default

    const handleUserSelection = (userId, isChecked) => {
        if (isChecked) {
            setData("users", [...data.users, userId]);
        } else {
            setData("users", data.users.filter(id => id !== userId));
        }
    };

    const selectAllUsers = () => {
        setData("users", users.map(user => user.id));
    };

    const deselectAllUsers = () => {
        setData("users", []);
    };

    const generateCouponCode = () => {
        const prefixes = ['SAVE', 'DISCOUNT', 'OFFER', 'DEAL', 'PROMO', 'SPECIAL'];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomNumber = Math.floor(Math.random() * 9999) + 1000; // 4-digit number
        const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 random letters
        const generatedCode = `${randomPrefix}${randomNumber}${randomSuffix}`;
        setData("code", generatedCode);
    };

    // Auto-generate coupon code on component mount
    useEffect(() => {
        if (!data.code) {
            generateCouponCode();
        }
    }, []);

    return (
        <DashboardLayout>
            <Head title="Create Coupon" />
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <Link
                                    href={route("admin-dashboard.coupons.index")}
                                >
                                   <CButton
                                        className="me-2 arrow-redirect-btn"
                                    >
                                        <Icons.ArrowLeft />
                                    </CButton>
                                </Link>
                                <strong>Create New Coupon</strong>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            <CForm onSubmit={handleSubmit}>
                                <CRow className="mb-3">
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="code">
                                            Coupon Code *
                                        </CFormLabel>
                                        <CInputGroup>
                                            <CFormInput
                                                id="code"
                                                value={data.code}
                                                readOnly
                                                invalid={!!errors.code}
                                                placeholder="Coupon code will be auto-generated"
                                                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                                            />
                                            <CButton
                                                color="info"
                                                variant="outline"
                                                onClick={generateCouponCode}
                                                type="button"
                                                title="Generate new coupon code"
                                            >
                                                <i className="fas fa-sync-alt me-1"></i>
                                                Generate New
                                            </CButton>
                                        </CInputGroup>
                                        <small className="text-muted">
                                            Base coupon code is auto-generated. Each selected user will receive a unique code (e.g., SAVE1234_1, SAVE1234_2).
                                        </small>
                                        {errors.code && (
                                            <div className="text-danger">
                                                {errors.code}
                                            </div>
                                        )}
                                    </CCol>

                                    <CCol md={6}>
                                        <CFormLabel htmlFor="discount_value">
                                            Discount Percentage *
                                        </CFormLabel>
                                        <CInputGroup>
                                            <CInputGroupText>%</CInputGroupText>
                                            <CFormInput
                                                id="discount_value"
                                                type="number"
                                                value={data.discount_value}
                                                onChange={(e) =>
                                                    setData("discount_value", e.target.value)
                                                }
                                                invalid={!!errors.discount_value}
                                                placeholder="20"
                                                min="0"
                                                max="100"
                                                step="1"
                                            />
                                        </CInputGroup>
                                        <small className="text-muted">
                                            Enter percentage (e.g., 20 for 20% discount)
                                        </small>
                                        {errors.discount_value && (
                                            <div className="text-danger">
                                                {errors.discount_value}
                                            </div>
                                        )}
                                    </CCol>

                                </CRow>


                                {/* <CRow className="mb-3">
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="usage_limit">
                                            Usage Limit
                                        </CFormLabel>
                                        <CFormInput
                                            id="usage_limit"
                                            type="number"
                                            value={data.usage_limit}
                                            onChange={(e) =>
                                                setData("usage_limit", e.target.value)
                                            }
                                            placeholder="Leave empty for unlimited"
                                            min="1"
                                        />
                                        <small className="text-muted">
                                            Maximum number of times this coupon can be used
                                        </small>
                                    </CCol>

                                    <CCol md={6}>
                                        <CFormLabel htmlFor="expires_at">
                                            Expiry Date
                                        </CFormLabel>
                                        <CFormInput
                                            id="expires_at"
                                            type="datetime-local"
                                            value={data.expires_at}
                                            onChange={(e) =>
                                                setData("expires_at", e.target.value)
                                            }
                                        />
                                        <small className="text-muted">
                                            Leave empty for no expiry
                                        </small>
                                    </CCol>
                                </CRow> */}

                                {/* <CRow className="mb-3">
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="description">
                                            Description
                                        </CFormLabel>
                                        <CFormTextarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData("description", e.target.value)
                                            }
                                            placeholder="Enter coupon description (optional)"
                                            rows={3}
                                        />
                                        <small className="text-muted">
                                            Optional description for the coupon
                                        </small>
                                    </CCol>
                                </CRow> */}

                                <CRow className="mb-3">
                                    <CCol md={12}>
                                        <CFormLabel>
                                            Select Users to Send Coupons *
                                        </CFormLabel>
                                        <div className="d-flex gap-2 mb-2">
                                            <CButton
                                                color="success"
                                                size="sm"
                                                variant="outline"
                                                onClick={selectAllUsers}
                                                type="button"
                                            >
                                                Select All
                                            </CButton>
                                            <CButton
                                                color="secondary"
                                                size="sm"
                                                variant="outline"
                                                onClick={deselectAllUsers}
                                                type="button"
                                            >
                                                Deselect All
                                            </CButton>
                                        </div>
                                        <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {users.map((user) => (
                                                <div key={user.id} className="mb-2">
                                                    <CFormCheck
                                                        id={`user-${user.id}`}
                                                        label={
                                                            <div className="d-flex justify-content-between align-items-center w-100">
                                                                <div>
                                                                    <strong>{user.name}</strong>
                                                                    <br />
                                                                    <small className="text-muted">{user.email}</small>
                                                                </div>
                                                                <CBadge color="info" className="ms-2">
                                                                    {user.stories_count} featured stories
                                                                </CBadge>
                                                            </div>
                                                        }
                                                        checked={data.users.includes(user.id)}
                                                        onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {errors.users && (
                                            <div className="text-danger">
                                                {errors.users}
                                            </div>
                                        )}
                                        <small className="text-muted d-block mt-2">
                                            Only users with featured stories are shown. Selected users will receive the coupon via email.
                                        </small>
                                    </CCol>
                                </CRow>

                                <CRow>
                                    <CCol md={12} className="d-flex gap-2">
                                        <CButton
                                            type="submit"
                                            color="primary"
                                            disabled={processing}
                                            style={{
                                                backgroundColor: "#fea257",
                                                borderColor: "#fea257",
                                            }}
                                        >
                                            {processing
                                                ? "Creating..."
                                                : "Create Coupon & Send to Users"}
                                        </CButton>
                                        <Link
                                            href={route("admin-dashboard.coupons.index")}
                                        >
                                            <CButton
                                                color="secondary"
                                                variant="outline"
                                            >
                                                Cancel
                                            </CButton>
                                        </Link>
                                    </CCol>
                                </CRow>
                            </CForm>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </DashboardLayout>
    );
};

export default Create;
