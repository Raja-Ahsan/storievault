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
import { FaArrowLeft, FaSave, FaUserPlus } from 'react-icons/fa';

// Define theme colors
const themeColors = {
  primary: '#FEA257',
  secondary: '#74989E',
};

const Create = ({ flash }) => {
  const [error, setError] = useState('');
  const { data, setData, post, processing, errors, reset } = useForm({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: 'user',
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
      if (data.full_name || data.username || data.email || data.password) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Show loading state
    Swal.fire({
      title: 'Creating user...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    post(route('admin-dashboard.users.store'), {
      onSuccess: () => {
        reset();
        Swal.fire({
          icon: 'success',
          title: 'User created successfully!',
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
          title: 'Error creating user!',
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
    <>
      <style>
        {`
          /* Toggle Switch Styles */
          .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
          }
          
          .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .toggle-label {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 24px;
            display: flex;
            align-items: center;
            padding: 2px;
          }
          
          .toggle-label:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          .toggle-switch input:checked + .toggle-label {
            background-color: #fea257;
          }
          
          .toggle-switch input:checked + .toggle-label:before {
            transform: translateX(26px);
          }
          
          .toggle-switch input:focus + .toggle-label {
            box-shadow: 0 0 0 3px rgba(254, 162, 87, 0.25);
          }
          
          /* Hover effects */
          .toggle-switch:hover .toggle-label {
            box-shadow: 0 0 0 3px rgba(254, 162, 87, 0.1);
          }
        `}
      </style>
      <DashboardLayout>
        <Head title="Create User" />
        <CRow>
        <CCol xs={12} md={8} lg={6} className="mx-auto">
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <strong className='d-flex align-items-center'> Create New User</strong>
              </div>
              <Link href={route('admin-dashboard.users.index')}>
                <CButton 
                  color="primary" className='custom-primary-btn' size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
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
                  <CFormLabel htmlFor="password">Password</CFormLabel>
                  <CFormInput
                    type="password"
                    id="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    invalid={errors.password ? true : false}
                  />
                  {errors.password && <div className="text-danger">{errors.password}</div>}
                </div>

                <div className="mb-3">
                  <CFormLabel htmlFor="role">User Role</CFormLabel>
                  <div className="d-flex align-items-center gap-3">
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="role-toggle" 
                        checked={data.role === 'admin'} 
                        onChange={(e) => setData('role', e.target.checked ? 'admin' : 'user')} 
                      />
                      <label htmlFor="role-toggle" className="toggle-label">
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <div>
                      <small className="text-muted">
                        {data.role === 'admin' ? 'Admin User' : 'Regular User'}
                      </small>
                    </div>
                  </div>
                  {errors.role && <div className="text-danger">{errors.role}</div>}
                </div>

                <div className="d-flex justify-content-end">
                  <CButton 
                   color="primary" className='custom-primary-btn' size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                    type="submit" 
                    disabled={processing}
                  >
                    <FaSave className="me-1" /> Create User
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
    </>
  );
};

export default Create; 