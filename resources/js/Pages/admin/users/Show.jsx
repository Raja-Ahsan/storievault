import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import Swal from 'sweetalert2';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CListGroup,
  CListGroupItem,
  CButton,
} from '@coreui/react';
import { FaArrowLeft, FaEdit, FaUserCircle, FaTrash } from 'react-icons/fa';

// Define theme colors
const themeColors = {
  primary: '#FEA257',
  secondary: '#74989E',
};

const Show = ({ user, flash }) => {
  const handleDelete = () => {
    Swal.fire({
      title: 'Confirm Delete',
      html: `Are you sure you want to delete the user: <strong>${user.name}</strong>?<br><br>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Delete User',
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
        router.delete(route('admin-dashboard.users.destroy', user.id), {
          onSuccess: () => {
            Swal.fire({
              icon: 'success',
              title: 'User deleted successfully!',
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
          onError: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error deleting user!',
              text: 'An unexpected error occurred.',
              confirmButtonColor: themeColors.primary,
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

  return (
    <DashboardLayout>
      <Head title={`User: ${user.name}`} />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div className="c">
                <strong className='d-flex align-items-center'><FaUserCircle className="me-2" /> User Details</strong>
              </div>
              <div className="d-flex gap-2">
                <Link href={route('admin-dashboard.users.index')}>
                  <CButton 
                   color="primary" className='custom-primary-btn' size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                  >
                    <FaArrowLeft className="me-1" /> Back to Users
                  </CButton>
                </Link>
                <Link href={route('admin-dashboard.users.edit', user.id)}>
                  <CButton 
                    color="primary" className='custom-primary-btn' size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                  >
                    <FaEdit className="me-1" /> Edit User
                  </CButton>
                </Link>
                <CButton 
                  onClick={handleDelete}
                  color="primary" className='custom-primary-btn' size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                >
                  <FaTrash className="me-1" /> Delete User
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              <CListGroup>
                <CListGroupItem>
                  <strong>ID:</strong> {user.id}
                </CListGroupItem>
                <CListGroupItem>
                  <strong>Name:</strong> {user.name}
                </CListGroupItem>
                <CListGroupItem>
                  <strong>Email:</strong> {user.email}
                </CListGroupItem>
                <CListGroupItem>
                  <strong>Role:</strong> <span className="badge bg-primary-theme">{user.role}</span>
                </CListGroupItem>
                <CListGroupItem>
                  <strong>Status:</strong> <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </CListGroupItem>
                <CListGroupItem>
                  <strong>Created:</strong> {new Date(user.created_at).toLocaleString()}
                </CListGroupItem>
                <CListGroupItem>
                  <strong>Updated:</strong> {new Date(user.updated_at).toLocaleString()}
                </CListGroupItem>
              </CListGroup>

              {/* Subscription Information */}
              {user.subscription && (
                <div className="mt-4">
                  <h6 className="mb-3">Subscription Information</h6>
                  <CListGroup>
                    <CListGroupItem className="d-flex justify-content-between">
                      <span>Subscription Status:</span>
                      <span className={`badge d-flex align-items-center ${
                        user.subscription.stripe_status === 'active' ? 'bg-success' : 
                        user.subscription.stripe_status === 'trialing' ? 'bg-info' : 
                        user.subscription.stripe_status === 'past_due' ? 'bg-warning' : 'bg-danger'
                      }`}>
                        {user.subscription.stripe_status}
                      </span>
                    </CListGroupItem>
                    <CListGroupItem className="d-flex justify-content-between">
                      <span>Package:</span>
                      <strong>{user.subscription.package?.name || 'N/A'}</strong>
                    </CListGroupItem>
                    <CListGroupItem className="d-flex justify-content-between">
                      <span>Billing Cycle:</span>
                      <strong>{user.subscription.package?.interval || 'N/A'}</strong>
                    </CListGroupItem>
                    <CListGroupItem className="d-flex justify-content-between">
                      <span>Words Limit:</span>
                      <strong>{user.subscription.package?.words_limit || 'N/A'}</strong>
                    </CListGroupItem>
                    <CListGroupItem className="d-flex justify-content-between">
                      <span>Stories Limit:</span>
                      <strong>{user.subscription.package?.stories_limit || 'N/A'}</strong>
                    </CListGroupItem>
                    <CListGroupItem className="d-flex justify-content-between">
                      <span>Subscription Created:</span>
                      <strong>{new Date(user.subscription.created_at).toLocaleDateString()}</strong>
                    </CListGroupItem>
                    <CListGroupItem className="d-flex justify-content-between">
                      <span>Expires:</span>
                      <strong className={user.subscription.ends_at && new Date(user.subscription.ends_at) < new Date() ? 'text-danger' : 'text-success'}>
                        {user.subscription.ends_at ? new Date(user.subscription.ends_at).toLocaleDateString() : 'N/A'}
                      </strong>
                    </CListGroupItem>
                  </CListGroup>
                  
                  <div className="mt-3">
                    <Link href={route('admin-dashboard.subscriptions.show', user.subscription.id)}>
                      <CButton 
                      className='btn-primary'
                      >
                        View Full Subscription Details
                      </CButton>
                    </Link>
                  </div>
                </div>
              )}

              {/* No Subscription Message */}
              {!user.subscription && (
                <div className="mt-4">
                  <div className="alert alert-warning">
                    <strong>No Active Subscription:</strong> This user does not have an active subscription.
                  </div>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  );
};

export default Show; 