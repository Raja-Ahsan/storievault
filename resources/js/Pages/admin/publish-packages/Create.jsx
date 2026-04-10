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
} from "@coreui/react";

// Define theme colors
const themeColors = {
    primary: '#FEA257',
    secondary: '#74989E',
};

const Create = ({ flash }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        price: "",
        features: [""],
        stripe_price_id: "",
        is_active: "1",
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
            if (data.name || data.price || data.stripe_price_id) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [data]);

    const addFeature = () => {
        setData("features", [...data.features, ""]);
    };

    const removeFeature = (index) => {
        const newFeatures = data.features.filter((_, i) => i !== index);
        setData("features", newFeatures);
    };

    const updateFeature = (index, value) => {
        const newFeatures = [...data.features];
        newFeatures[index] = value;
        setData("features", newFeatures);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!data.name || data.name.trim() === "") {
            newErrors.name = "Package name is required";
        }

        if (!data.price || isNaN(data.price) || data.price < 0) {
            newErrors.price = "Valid price is required";
        }

        if (
            data.features &&
            Array.isArray(data.features) &&
            data.features.filter((f) => f && f.trim()).length === 0
        ) {
            newErrors.features = "At least one feature is required";
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
            title: 'Creating publish package...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Filter out empty features
        const featuresArray = data.features.filter((f) => f && f.trim());

        // Update the form data with filtered features and other formatted data
        setData("features", featuresArray);
        setData("name", data.name.trim());
        setData("is_active", data.is_active === "1");

        post(route("admin-dashboard.publish-packages.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                Swal.fire({
                    icon: 'success',
                    title: 'Publish Package created successfully!',
                    text: 'Redirecting to packages list...',
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
                if (errors.name) errorMessage = errors.name;
                else if (errors.price) errorMessage = errors.price;
                else if (errors.stripe_price_id) errorMessage = errors.stripe_price_id;
                else if (errors.features) errorMessage = errors.features;
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error creating publish package!',
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

    const statusOptions = [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
    ];

    return (
        <DashboardLayout>
            <Head title="Create Publish Package" />
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <Link
                                    href={route(
                                        "admin-dashboard.publish-packages.index",
                                    )}
                                >
                                    <CButton
                                        className="me-2 arrow-redirect-btn"
                                    >
                                        <Icons.ArrowLeft />
                                    </CButton>
                                </Link>
                                <strong>Create New Publish Package</strong>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            {/* Removed successMessage and validationErrors state */}

                            <CForm onSubmit={handleSubmit}>
                                <CRow className="mb-3">
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="name">
                                            Package Name *
                                        </CFormLabel>
                                        <CFormInput
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            invalid={!!errors.name}
                                            placeholder="Enter package name"
                                        />
                                        {errors.name && (
                                            <div className="text-danger">
                                                {errors.name}
                                            </div>
                                        )}
                                    </CCol>

                                    <CCol md={6}>
                                        <CFormLabel htmlFor="price">
                                            Price ($)
                                        </CFormLabel>
                                        <CInputGroup>
                                            <CInputGroupText>$</CInputGroupText>
                                            <CFormInput
                                                id="price"
                                                type="number"
                                                value={data.price}
                                                onChange={(e) => {
                                                    // typing ke waqt raw value save kar do
                                                    setData(
                                                        "price",
                                                        e.target.value,
                                                    );
                                                }}
                                                onBlur={(e) => {
                                                    // jab user field se bahar nikle tabhi format karo
                                                    if (e.target.value !== "") {
                                                        setData(
                                                            "price",
                                                            parseFloat(
                                                                e.target.value,
                                                            ).toFixed(2),
                                                        );
                                                    }
                                                }}
                                                                                            invalid={!!errors.price}
                                                placeholder="10.30 for $10.30"
                                                min="0"
                                                step="0.01"
                                            />
                                        </CInputGroup>
                                        <small className="text-muted">
                                            Enter price in dollars (e.g., 10.30
                                            for $10.30). Leave empty for free
                                            packages.
                                        </small>
                                        {errors.price && (
                                            <div className="text-danger">
                                                {errors.price}
                                            </div>
                                        )}
                                    </CCol>
                                </CRow>

                                <CRow className="mb-3">
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="is_active">
                                            Status
                                        </CFormLabel>
                                        <CFormSelect
                                            id="is_active"
                                            value={data.is_active}
                                            onChange={(e) =>
                                                setData(
                                                    "is_active",
                                                    e.target.value,
                                                )
                                            }
                                            invalid={!!errors.is_active}
                                            options={statusOptions}
                                        />
                                        <small className="text-muted">
                                            Set package as active or inactive
                                        </small>
                                        {errors.is_active && (
                                            <div className="text-danger">
                                                {errors.is_active}
                                            </div>
                                        )}
                                    </CCol>
                                </CRow>

                                <CRow className="mb-3">
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="features">
                                            Features
                                        </CFormLabel>
                                        {data.features.map((feature, index) => (
                                            <div
                                                key={index}
                                                className="d-flex gap-2 mb-2"
                                            >
                                                <CFormInput
                                                    id={`feature-${index}`}
                                                    value={feature}
                                                    onChange={(e) =>
                                                        updateFeature(
                                                            index,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={`Feature ${index + 1}`}
                                                    className="flex-grow-1"
                                                />
                                                {data.features.length > 1 && (
                                                    <CButton
                                                        color="danger"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            removeFeature(index)
                                                        }
                                                        type="button"
                                                    >
                                                        Remove
                                                    </CButton>
                                                )}
                                            </div>
                                        ))}
                                        <CButton
                                            color="success"
                                            size="sm"
                                            variant="outline"
                                            onClick={addFeature}
                                            type="button"
                                            className="mt-2"
                                        >
                                            + Add More Feature
                                        </CButton>
                                        <small className="text-muted d-block mt-2">
                                            Add features one by one. Each
                                            feature will be displayed as a
                                            bullet point.
                                        </small>
                                        {errors.features && (
                                            <div className="text-danger">
                                                {errors.features}
                                            </div>
                                        )}
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
                                                : "Create Publish Package"}
                                        </CButton>
                                        <Link
                                            href={route(
                                                "admin-dashboard.publish-packages.index",
                                            )}
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
