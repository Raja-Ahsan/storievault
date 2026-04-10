import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import Swal from 'sweetalert2';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CAlert,
} from '@coreui/react';
import { FaArrowLeft, FaSave, FaUserCircle } from 'react-icons/fa';

// Define theme colors
const themeColors = {
  primary: '#FEA257',
  secondary: '#74989E',
};

const Edit = ({ user, flash }) => {
  const [error, setError] = useState('');
  const { data, setData, put, processing, errors } = useForm({
    full_name: user.full_name || user.name,
    username: user.username || '',
    email: user.email,
    password: '',
  });

  // Handle flash messages with SweetAlert
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        icon: 'success',
        title: flash.success,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }, [flash?.success]);

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (data.full_name !== (user.full_name || user.name) || 
          data.username !== user.username || 
          data.email !== user.email || 
          data.password) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Show loading state
    Swal.fire({
      title: 'Updating user...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    put(route('admin-dashboard.users.update', user.id), {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'User updated successfully!',
          text: 'Redirecting to users list...',
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
        if (Object.keys(errors).length === 0) {
          setError('An unexpected error occurred. Please try again.');
        }
        
        // Show specific error messages
        let errorMessage = 'Please check your input.';
        if (errors.full_name) errorMessage = errors.full_name;
        else if (errors.username) errorMessage = errors.username;
        else if (errors.email) errorMessage = errors.email;
        else if (errors.password) errorMessage = errors.password;
        
        Swal.fire({
          icon: 'error',
          title: 'Error updating user!',
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

  return (
    <DashboardLayout>
      <Head title={`Edit User: ${user.name}`} />
      <CRow>
        <CCol xs={12} md={8} lg={6} className="mx-auto">
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <strong><FaUserCircle className="me-2" /> Edit User</strong>
              </div>
              <Link href={route('admin-dashboard.users.index')}>
                <CButton 
                  color="primary" size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                >
                  <FaArrowLeft className="me-1" /> Back to Users
                </CButton>

                
              </Link>
            </CCardHeader>
            <CCardBody>
              {error && <CAlert color="danger">{error}</CAlert>}

              <CForm onSubmit={handleSubmit}>
                <div className="mb-3">
                  <CFormLabel htmlFor="full_name">Full Name</CFormLabel>
                  <CFormInput
                    id="full_name"
                    value={data.full_name}
                    onChange={(e) => setData('full_name', e.target.value)}
                    invalid={errors.full_name ? true : false}
                  />
                  {errors.full_name && <div className="text-danger">{errors.full_name}</div>}
                </div>

                <div className="mb-3">
                  <CFormLabel htmlFor="username">Username</CFormLabel>
                  <CFormInput
                    id="username"
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value)}
                    invalid={errors.username ? true : false}
                  />
                  {errors.username && <div className="text-danger">{errors.username}</div>}
                </div>

                <div className="mb-3">
                  <CFormLabel htmlFor="email">Email</CFormLabel>
                  <CFormInput
                    type="email"
                    id="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    invalid={errors.email ? true : false}
                  />
                  {errors.email && <div className="text-danger">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <CFormLabel htmlFor="password">
                    Password <small className="text-muted">(Leave blank to keep current password)</small>
                  </CFormLabel>
                  <CFormInput
                    type="password"
                    id="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    invalid={errors.password ? true : false}
                  />
                  {errors.password && <div className="text-danger">{errors.password}</div>}
                </div>

                <div className="d-flex justify-content-end">
                  <CButton 
                    color="primary" size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                    type="submit" 
                    disabled={processing}
                    className="d-flex align-items-center"
                  >
                    <FaSave className="me-1" /> Save Changes
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  );
};

export default Edit; 