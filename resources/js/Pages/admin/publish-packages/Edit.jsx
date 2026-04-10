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

const Edit = ({ publishPackage: pkg, flash }) => {
    const { data, setData, post, processing, errors } = useForm({
        name: pkg.name || "",
        price: pkg.price ? parseFloat(pkg.price).toFixed(2) : "",
        features: (() => {
            // Ensure features is always an array
            if (Array.isArray(pkg.features)) {
                return pkg.features.filter((f) => f && typeof f === "string");
            } else if (typeof pkg.features === "string") {
                return pkg.features.split("\n").filter((f) => f && f.trim());
            } else {
                return [""];
            }
        })(),
        stripe_price_id: pkg.stripe_price_id || "",
        is_active: pkg.is_active ? "1" : "0",
        _method: "PUT", // For method spoofing (PUT request)
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
            if (data.name !== pkg.name || data.price !== pkg.price || 
                data.stripe_price_id !== pkg.stripe_price_id) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [data, pkg]);

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

    // Ensure features are properly initialized
    useEffect(() => {
        // If features is not properly set, initialize it
        if (!data.features && pkg.features) {
            if (Array.isArray(pkg.features)) {
                setData(
                    "features",
                    pkg.features.filter((f) => f && typeof f === "string"),
                );
            } else if (typeof pkg.features === "string") {
                setData(
                    "features",
                    pkg.features.split("\n").filter((f) => f && f.trim()),
                );
            }
        }
    }, [pkg.features]);

    const validateForm = () => {
        const newErrors = {};

        if (!data.name || data.name.trim() === "") {
            newErrors.name = "Publish package name is required";
        }

        if (data.price && (isNaN(data.price) || data.price < 0)) {
            newErrors.price = "Price must be a valid positive number";
        }

        if (!data.stripe_price_id || data.stripe_price_id.trim() === "") {
            newErrors.stripe_price_id = "Stripe Price ID is required";
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
            title: 'Updating publish package...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Filter out empty features
        const featuresArray = data.features.filter(f => f && f.trim());
        setData('features', featuresArray);

        post(route('admin-dashboard.publish-packages.update', pkg.id), {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Publish Package updated successfully!',
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
                    title: 'Error updating publish package!',
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
            <Head title="Edit Publish Package" />
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
                                <strong>
                                    Edit Publish Package: {pkg.name}
                                </strong>
                            </div>
                            <Link
                                href={route(
                                    "admin-dashboard.publish-packages.show",
                                    pkg.id,
                                )}
                            >
                                <CButton
                                   color="primary" className='custom-primary-btn' size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                                >
                                    <Icons.View className="me-1" /> View Publish
                                    Package
                                </CButton>
                            </Link>
                        </CCardHeader>
                        <CCardBody>
                            {/* Removed successMessage and validationErrors state */}

                            <CForm onSubmit={handleSubmit}>
                                <CRow className="mb-3">
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="name">
                                            Publish Package Name
                                        </CFormLabel>
                                        <CFormInput
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            invalid={!!errors.name}
                                            placeholder="Enter publish package name"
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
                                                    setData(
                                                        "price",
                                                        e.target.value,
                                                    ); // raw typing
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value !== "") {
                                                        setData(
                                                            "price",
                                                            parseFloat(
                                                                e.target.value,
                                                            ).toFixed(2),
                                                        ); // format only on blur
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
                                            for $10.30)
                                        </small>
                                        {errors.price && (
                                            <div className="text-danger">
                                                {errors.price}
                                            </div>
                                        )}
                                    </CCol>
                                </CRow>

                                <CRow className="mb-3">
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
                                            invalid={!!errors.is_active}
                                            options={statusOptions}
                                        />
                                        {errors.is_active && (
                                            <div className="text-danger">
                                                {errors.is_active}
                                            </div>
                                        )}
                                    </CCol>

                                    <CCol md={6}>
                                        <CFormLabel htmlFor="stripe_price_id">
                                            Stripe Price ID
                                        </CFormLabel>
                                        <CFormInput
                                            id="stripe_price_id"
                                            value={data.stripe_price_id}
                                            onChange={(e) =>
                                                setData(
                                                    "stripe_price_id",
                                                    e.target.value,
                                                )
                                            }
                                            invalid={!!errors.stripe_price_id}
                                            placeholder="Enter Stripe price ID (optional)"
                                        />
                                        <small className="text-muted">
                                            Enter the Stripe price ID if you
                                            have one
                                        </small>
                                        {errors.stripe_price_id && (
                                            <div className="text-danger">
                                                {errors.stripe_price_id}
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

                                {/* Preview Section */}
                                {/* <CRow className="mb-4">
                  <CCol md={12}>
                    <h5>Preview</h5>
                    <div className="border rounded p-3 bg-light">
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Publish Package Name:</strong>
                          <p className="mb-2">{data.name || 'N/A'}</p>
                        </div>
                        <div className="col-md-6">
                          <strong>Price:</strong>
                          <p className="mb-2">
                            {data.price ? `$${parseFloat(data.price).toFixed(2)}` : 'Free'}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <strong>Status:</strong>
                          <p className="mb-2">
                            {data.is_active === '1' ? (
                              <CBadge color="success">Active</CBadge>
                            ) : (
                              <CBadge color="secondary">Inactive</CBadge>
                            )}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <strong>Stripe Price ID:</strong>
                          <p className="mb-2">{data.stripe_price_id || 'N/A'}</p>
                        </div>
                        <div className="col-12">
                          <strong>Features:</strong>
                          {data.features && data.features.length > 0 ? (
                            <div className="mt-2">
                              {data.features.filter(f => f && f.trim()).map((feature, index) => (
                                <CBadge
                                  key={index}
                                  color="info"
                                  className="me-1 mb-1"
                                >
                                  {feature.trim()}
                                </CBadge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted mb-0">No features</p>
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
                                                ? "Updating..."
                                                : "Update Publish Package"}
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

export default Edit;
