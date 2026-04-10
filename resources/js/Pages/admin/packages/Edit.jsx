import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Icons } from '../../../utils/icons';
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
} from '@coreui/react';

// Define theme colors
const themeColors = {
  primary: '#FEA257',
  secondary: '#74989E',
};

const Edit = ({ package: pkg, flash }) => {
  const { data, setData, post, processing, errors } = useForm({
    name: pkg.name || '',
    badge: pkg.badge || '',
    price_cents: pkg.price_cents || '',
    interval: pkg.interval || '',
    features: (() => {
      // Ensure features is always an array
      if (Array.isArray(pkg.features)) {
        return pkg.features.filter(f => f && typeof f === 'string');
      } else if (typeof pkg.features === 'string') {
        return pkg.features.split('\n').filter(f => f && f.trim());
      } else {
        return [''];
      }
    })(),
    stripe_price_id: pkg.stripe_price_id || '',
    words_limit: pkg.words_limit || '',
    stories_limit: pkg.stories_limit || '',
    is_active: pkg.is_active ? '1' : '0',
    _method: 'PUT', // For method spoofing (PUT request)
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
      if (data.name !== pkg.name || data.price_cents !== pkg.price_cents ||
        data.interval !== pkg.interval || data.stripe_price_id !== pkg.stripe_price_id) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data, pkg]);

  const addFeature = () => {
    setData('features', [...data.features, '']);
  };

  const removeFeature = (index) => {
    const newFeatures = data.features.filter((_, i) => i !== index);
    setData('features', newFeatures);
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...data.features];
    newFeatures[index] = value;
    setData('features', newFeatures);
  };

  // Ensure features are properly initialized
  useEffect(() => {
    // If features is not properly set, initialize it
    if (!data.features && pkg.features) {
      if (Array.isArray(pkg.features)) {
        setData('features', pkg.features.filter(f => f && typeof f === 'string'));
      } else if (typeof pkg.features === 'string') {
        setData('features', pkg.features.split('\n').filter(f => f && f.trim()));
      }
    }
  }, [pkg.features]);

  const validateForm = () => {
    const newErrors = {};

    if (!data.name || data.name.trim() === '') {
      newErrors.name = 'Package name is required';
    }

    if (data.price_cents && (isNaN(data.price_cents) || data.price_cents < 0)) {
      newErrors.price_cents = 'Price must be a valid positive number';
    }

    if (data.interval && !['monthly', 'yearly', 'one-time', 'weekly', 'daily'].includes(data.interval)) {
      newErrors.interval = 'Please select a valid interval';
    }

    if (!data.words_limit || isNaN(data.words_limit) || data.words_limit <= 0) {
      newErrors.words_limit = 'Valid words limit is required';
    }

    if (!data.stories_limit || isNaN(data.stories_limit) || data.stories_limit <= 0) {
      newErrors.stories_limit = 'Valid stories limit is required';
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
      title: 'Updating package...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Filter out empty features
    const featuresArray = data.features.filter(f => f && f.trim());
    setData('features', featuresArray);

    post(route('admin-dashboard.packages.update', pkg.id), {
      preserveScroll: true,
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Package updated successfully!',
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
        else if (errors.stripe_price_id) errorMessage = errors.stripe_price_id;
        else if (errors.words_limit) errorMessage = errors.words_limit;
        else if (errors.stories_limit) errorMessage = errors.stories_limit;
        else if (errors.features) errorMessage = errors.features;

        Swal.fire({
          icon: 'error',
          title: 'Error updating package!',
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
    { value: '', label: 'Select an interval' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const statusOptions = [
    { value: '1', label: 'Active' },
    { value: '0', label: 'Inactive' },
  ];

  return (
    <DashboardLayout>
      <Head title="Edit Package" />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Link href={route('admin-dashboard.packages.index')}>
                  <CButton className="me-2 arrow-redirect-btn">
                    <Icons.ArrowLeft />
                  </CButton>
                </Link>
                <strong>Edit Package: {pkg.name}</strong>
              </div>
              <Link href={route('admin-dashboard.packages.show', pkg.id)}>
                {/* <CButton className='custom-outline-btn'>
                  <Icons.View className="me-1" /> View Package
                </CButton> */}

                <CButton color="primary" className='custom-primary-btn' size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}>
                  <Icons.View className="me-1" /> View Package
                </CButton>
              </Link>
            </CCardHeader>
            <CCardBody>
              {/* Removed successMessage and validationErrors state */}

              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="name">Package Name</CFormLabel>
                    <CFormInput
                      id="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      invalid={!!errors.name}
                      placeholder="Enter package name"
                    />
                    {errors.name && (
                      <div className="text-danger">{errors.name}</div>
                    )}
                    {/* Removed validationErrors.name */}
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel htmlFor="price_cents">Price ($)</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText>$</CInputGroupText>
                      <CFormInput
                        id="price_cents"
                        type="number"
                        value={data.price_cents ? (data.price_cents / 100).toFixed(2) : ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || value === '0') {
                            setData('price_cents', '');
                          } else {
                            const cents = Math.round(parseFloat(value) * 100);
                            setData('price_cents', cents);
                          }
                        }}
                        invalid={!!errors.price_cents}
                        placeholder="10.30 for $10.30"
                        min="0"
                        step="0.01"
                        disabled={true}
                      />
                    </CInputGroup>
                    <small className="text-muted">you can't change the price here</small>
                    {errors.price_cents && (
                      <div className="text-danger">{errors.price_cents}</div>
                    )}
                    {/* Removed validationErrors.price_cents */}
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="interval">Billing Interval</CFormLabel>
                    <CFormSelect
                      id="interval"
                      value={data.interval}
                      onChange={(e) => setData('interval', e.target.value)}
                      invalid={!!errors.interval}
                      options={intervalOptions}
                      disabled={true}
                    />
                    {errors.interval && (
                      <div className="text-danger">{errors.interval}</div>
                    )}
                    {/* Removed validationErrors.interval */}
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel htmlFor="is_active">Status</CFormLabel>
                    <CFormSelect
                      id="is_active"
                      value={data.is_active}
                      onChange={(e) => setData('is_active', e.target.value)}
                      invalid={!!errors.is_active}
                      options={statusOptions}
                    />
                    {errors.is_active && (
                      <div className="text-danger">{errors.is_active}</div>
                    )}
                    {/* Removed validationErrors.is_active */}
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel htmlFor="badge">Badge</CFormLabel>
                    <CFormInput
                      id="badge"
                      value={data.badge}
                      onChange={(e) => setData('badge', e.target.value)}
                      invalid={!!errors.badge}
                      placeholder="Enter Badge (optional)"
                    />
                    <small className="text-muted">add the badge for the package like best selling, pro, premium, etc.</small>
                    {errors.stripe_price_id && (
                      <div className="text-danger">{errors.stripe_price_id}</div>
                    )}
                    {/* Removed validationErrors.stripe_price_id */}
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
                      invalid={!!errors.words_limit}
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
                      invalid={!!errors.stories_limit}
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
                    <CFormLabel htmlFor="features">Features</CFormLabel>
                    {data.features.map((feature, index) => (
                      <div key={index} className="d-flex gap-2 mb-2">
                        <CFormInput
                          id={`feature-${index}`}
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder={`Feature ${index + 1}`}
                          className="flex-grow-1"
                        />
                        {data.features.length > 1 && (
                          <CButton
                            color="danger"
                            size="sm"
                            variant="outline"
                            onClick={() => removeFeature(index)}
                            type="button"
                          >
                            Remove
                          </CButton>
                        )}
                      </div>
                    ))}
                    <CButton color="primary" size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                    onClick={addFeature}
                    >
                      <Icons.Plus className="me-1" />Add More Feature
                    </CButton>
                    <small className="text-muted d-block mt-2">Add features one by one. Each feature will be displayed as a bullet point.</small>
                    {errors.features && (
                      <div className="text-danger">{errors.features}</div>
                    )}
                    {/* Removed validationErrors.features */}
                  </CCol>
                </CRow>

                {/* Preview Section */}
                {/* <CRow className="mb-4">
                  <CCol md={12}>
                    <h5>Preview</h5>
                    <div className="border rounded p-3 bg-light">
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Package Name:</strong>
                          <p className="mb-2">{data.name || 'N/A'}</p>
                        </div>
                        <div className="col-md-6">
                          <strong>Price:</strong>
                          <p className="mb-2">
                            {data.price_cents ? `$${(data.price_cents / 100).toFixed(2)}` : 'Free'}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <strong>Interval:</strong>
                          <p className="mb-2">{data.interval || 'N/A'}</p>
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
                      style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                    >
                      {processing ? 'Updating...' : 'Update Package'}
                    </CButton>
                    <Link href={route('admin-dashboard.packages.index')}>
                      <CButton color="secondary" variant="outline">
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
