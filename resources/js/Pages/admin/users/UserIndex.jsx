import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
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
  CPagination,
  CPaginationItem,
  CButton,
  CTooltip,
} from '@coreui/react'
import { FaEye, FaEdit, FaUserCircle, FaTrash, FaUserPlus } from 'react-icons/fa'

// Define theme colors
const themeColors = {
  primary: '#fea257',
  secondary: '#74989E',
}

const UserIndex = ({ users, flash }) => {
  const toggleUserStatus = (userId) => {
    if (confirm('Are you sure you want to toggle this user\'s status?')) {
      router.post(route('admin-dashboard.users.toggle-status', userId), {}, {
        preserveScroll: true,
      });
    }
  };

  const confirmDelete = (user) => {
    Swal.fire({
      title: 'Confirm Delete',
      html: `Are you sure you want to delete the user: <strong>${user.name}</strong>?<br><br>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fea257',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin-dashboard.users.destroy', user.id))
      }
    })
  }

  return (
    <DashboardLayout>
      <Head title="User Management" />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong className="d-flex align-items-center">
                 Users
              </strong>
              <Link className='text-decoration-none' href={route('admin-dashboard.users.create')}>
                <CButton
                  color="primary" className='custom-primary-btn' size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                >
                  <FaUserPlus className="me-2" /> <span>Create User</span>
                </CButton>
              </Link>
            </CCardHeader>
            <CCardBody>
              {flash?.success && (
                <div className="alert alert-success mb-3">{flash.success}</div>
              )}
              {flash?.error && (
                <div className="alert alert-danger mb-3">{flash.error}</div>
              )}

              {/* Search Bar */}
              <div className="mb-3">
                <div className="row">
                  <div className="col-md-6">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by username, name, or email..."
                        id="userSearch"
                        onChange={(e) => {
                          const searchTerm = e.target.value;
                          if (searchTerm.length > 2 || searchTerm.length === 0) {
                            router.get(route('admin-dashboard.users.index'),
                              { search: searchTerm },
                              { preserveState: true, preserveScroll: true }
                            );
                          }
                        }}
                      />
                      <button className="btn btn-outline-secondary" type="button">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Username</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Full Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Role</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Subscription</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Created</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {users.data.length > 0 ? (
                    users.data.map((user) => (
                      <CTableRow key={user.id}>
                        <CTableDataCell>
                          <span className="">{user.username || 'N/A'}</span>
                        </CTableDataCell>
                        <CTableDataCell>{user.full_name || user.name}</CTableDataCell>
                        <CTableDataCell>{user.email}</CTableDataCell>
                        <CTableDataCell>
                          <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>
                          {user.subscription ? (
                            <div>
                              <span className={`badge ${user.subscription.stripe_status === 'active' ? 'bg-success' :
                                  user.subscription.stripe_status === 'trialing' ? 'bg-info' :
                                    user.subscription.stripe_status === 'past_due' ? 'bg-warning' : 'bg-danger'
                                }`}>
                                {user.subscription.stripe_status}
                              </span>
                              <br />
                              {/* <small className="text-muted">{user.subscription.package?.name || 'N/A'}</small> */}
                            </div>
                          ) : (
                            <span className="badge bg-secondary">No Subscription</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>{new Date(user.created_at).toLocaleDateString()}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center gap-2">
                            <CTooltip content="View User">
                              <Link href={route('admin-dashboard.users.show', user.id)}>
                                <CButton
                                  className="p-0 d-flex align-items-center justify-content-center"
                                >
                                  <Icons.View />
                                </CButton>
                              </Link>
                            </CTooltip>
                            <CTooltip content="Edit User">
                              <Link href={route('admin-dashboard.users.edit', user.id)}>
                                <CButton

                                  size="sm"
                                  className="p-0 d-flex align-items-center justify-content-center"
                                >
                                  <Icons.Edit />
                                </CButton>
                              </Link>
                            </CTooltip>
                            <CTooltip content="Delete User">
                              <CButton
                                onClick={() => confirmDelete(user)}
                                className="p-0 d-flex align-items-center justify-content-center"
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
                      <CTableDataCell colSpan="7" className="text-center">
                        No users found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>

              {users.data.length > 0 && (
                <CPagination align="center" className="mt-3">
                  {users.links.map((link, index) => (
                    <CPaginationItem
                      key={index}
                      active={link.active}
                      style={link.active ? {
                        backgroundColor: themeColors.primary,
                        borderColor: themeColors.primary
                      } : {}}
                      disabled={!link.url}
                      onClick={() => link.url && router.visit(link.url)}
                    >
                      <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    </CPaginationItem>
                  ))}
                </CPagination>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  )
}

export default UserIndex 