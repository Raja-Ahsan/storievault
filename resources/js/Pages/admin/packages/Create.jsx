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
        badge: "",
        price_cents: "",
        interval: "",
        features: [""],
        is_active: "1",
        words_limit: "",
        stories_limit: "",
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
            if (data.name || data.price_cents || data.interval) {
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

        if (!data.price_cents || isNaN(data.price_cents) || data.price_cents <= 0) {
            newErrors.price_cents = "Valid price is required";
        }

        if (!data.interval) {
            newErrors.interval = "Billing interval is required";
        }

        if (
            data.features &&
            Array.isArray(data.features) &&
            data.features.filter((f) => f && f.trim()).length === 0
        ) {
            newErrors.features = "At least one feature is required";
        }

        if (!data.words_limit || isNaN(data.words_limit) || data.words_limit <= 0) {
            newErrors.words_limit = "Valid words limit is required";
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
            title: 'Creating package...',
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

        post(route("admin-dashboard.packages.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                Swal.fire({
                    icon: 'success',
                    title: 'Package created successfully!',
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
                else if (errors.price_cents) errorMessage = errors.price_cents;
                else if (errors.interval) errorMessage = errors.interval;
                else if (errors.words_limit) errorMessage = errors.words_limit;
                else if (errors.stories_limit) errorMessage = errors.stories_limit;
                else if (errors.features) errorMessage = errors.features;
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error creating package!',
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

    const intervalOptions = [
        { value: "", label: "Select an interval" },
        { value: "monthly", label: "Monthly" },
        { value: "yearly", label: "Yearly" },
    ];

    const statusOptions = [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
    ];

    return (
        <DashboardLayout>
            <Head title="Create Package" />
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <Link
                                    href={route(
                                        "admin-dashboard.packages.index",
                                    )}
                                >
                                    <CButton
                                        color="primary"
                                        size="sm"
                                        variant="outline"
                                        className="me-2"
                                    >
                                        <Icons.ArrowLeft />
                                    </CButton>
                                </Link>
                                <strong>Create New Package</strong>
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
                                            invalid={
                                                !!errors.name
                                            }
                                            placeholder="Enter package name"
                                        />
                                        {errors.name && (
                                            <div className="text-danger">
                                                {errors.name}
                                            </div>
                                        )}
                                    </CCol>

                                    <CCol md={6}>
                                        <CFormLabel htmlFor="price_cents">
                                            Price ($)
                                        </CFormLabel>
                                        <CInputGroup>
                                            <CInputGroupText>$</CInputGroupText>
                                            <CFormInput
                                                id="price_cents"
                                                type="number"
                                                value={
                                                    data.price_cents
                                                        ? (
                                                              data.price_cents /
                                                              100
                                                          ).toFixed(2)
                                                        : ""
                                                }
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;
                                                    if (
                                                        value === "" ||
                                                        value === "0"
                                                    ) {
                                                        setData(
                                                            "price_cents",
                                                            "",
                                                        );
                                                    } else {
                                                        const cents =
                                                            Math.round(
                                                                parseFloat(
                                                                    value,
                                                                ) * 100,
                                                            );
                                                        setData(
                                                            "price_cents",
                                                            cents,
                                                        );
                                                    }
                                                }}
                                                invalid={
                                                    !!errors.price_cents
                                                }
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
                                        {errors.price_cents && (
                                            <div className="text-danger">
                                                {errors.price_cents}
                                            </div>
                                        )}
                                    </CCol>
                                </CRow>

                                <CRow className="mb-3">
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="interval">
                                            Billing Interval
                                        </CFormLabel>
                                        <CFormSelect
                                            id="interval"
                                            value={data.interval}
                                            onChange={(e) =>
                                                setData(
                                                    "interval",
                                                    e.target.value,
                                                )
                                            }
                                            invalid={
                                                !!errors.interval
                                            }
                                            options={intervalOptions}
                                        />
                                        <small className="text-muted">
                                            Select billing interval for paid
                                            packages
                                        </small>
                                        {errors.interval && (
                                            <div className="text-danger">
                                                {errors.interval}
                                            </div>
                                        )}
                                    </CCol>

                                    <CCol md={6}>
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
                                            invalid={
                                                !!errors.is_active
                                            }
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
                                        <CFormLabel htmlFor="badge">
                                            Badge
                                        </CFormLabel>
                                        <CFormInput
                                            id="badge"
                                            value={data.badge}
                                            onChange={(e) =>
                                                setData(
                                                    "badge",
                                                    e.target.value,
                                                )
                                            }
                                            invalid={
                                                !!errors.badge
                                            }
                                            placeholder="Enter Badge (optional)"
                                        />
                                        <small className="text-muted">
                                            add the badge for the package like best selling, pro, premium, etc.
                                        </small>
                                        {errors.badge && (
                                            <div className="text-danger">
                                                {errors.badge}
                                            </div>
                                        )}
                                    </CCol>
                                </CRow>
                                {/* <CRow className="mb-3">
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="name">
                                            Words Limit
                                        </CFormLabel>
                                        <CFormInput
                                            id="words_limit"
                                            type="number"
                                            value={data.words_limit}
                                            onChange={(e) =>
                                                setData("words_limit", e.target.value)
                                            }
                                            invalid={
                                                !!errors.words_limit
                                            }
                                            placeholder="Enter words limit"
                                        />
                                        {errors.words_limit && (
                                            <div className="text-danger">
                                                {errors.words_limit}
                                            </div>
                                        )}
                                    </CCol>

                                    <CCol md={6}>
                                        <CFormLabel htmlFor="name">
                                            Strories Limit
                                        </CFormLabel>
                                        <CFormInput
                                            id="stories_limit"
                                            type="number"
                                            value={data.stories_limit}
                                            onChange={(e) =>
                                                setData("stories_limit", e.target.value)
                                            }
                                            invalid={
                                                !!errors.stories_limit
                                            }
                                            placeholder="Enter stories limit"
                                        />
                                        {errors.stories_limit && (
                                            <div className="text-danger">
                                                {errors.stories_limit}
                                            </div>
                                        )}
                                    </CCol>
                                </CRow> */}
                                

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

                                {/* Preview Section */}
                                {/* <CRow className="mb-4">
                                    <CCol md={12}>
                                        <h5>Stories Limit</h5>
                                        <div className="border rounded p-3 bg-light">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <strong>
                                                        Package Name:
                                                    </strong>
                                                    <p className="mb-2">
                                                        {data.name || "N/A"}
                                                    </p>
                                                </div>
                                                <div className="col-md-6">
                                                    <strong>Price:</strong>
                                                    <p className="mb-2">
                                                        {data.price_cents
                                                            ? `$${(data.price_cents / 100).toFixed(2)}`
                                                            : "Free"}
                                                    </p>
                                                </div>
                                                <div className="col-md-6">
                                                    <strong>Interval:</strong>
                                                    <p className="mb-2">
                                                        {data.interval || "N/A"}
                                                    </p>
                                                </div>
                                                <div className="col-md-6">
                                                    <strong>Status:</strong>
                                                    <p className="mb-2">
                                                        {data.is_active ===
                                                        "1" ? (
                                                            <CBadge color="success">
                                                                Active
                                                            </CBadge>
                                                        ) : (
                                                            <CBadge color="secondary">
                                                                Inactive
                                                            </CBadge>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="col-12">
                                                    <strong>Features:</strong>
                                                    {data.features &&
                                                    data.features.length > 0 ? (
                                                        <div className="mt-2">
                                                            {data.features
                                                                .filter(
                                                                    (f) =>
                                                                        f &&
                                                                        f.trim(),
                                                                )
                                                                .map(
                                                                    (
                                                                        feature,
                                                                        index,
                                                                    ) => (
                                                                        <CBadge
                                                                            key={
                                                                                index
                                                                            }
                                                                            color="info"
                                                                            className="me-1 mb-1"
                                                                        >
                                                                            {feature.trim()}
                                                                        </CBadge>
                                                                    ),
                                                                )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted mb-0">
                                                            No features
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CCol>
                                </CRow> */}

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
                                                : "Create Package"}
                                        </CButton>
                                        <Link
                                            href={route(
                                                "admin-dashboard.packages.index",
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
