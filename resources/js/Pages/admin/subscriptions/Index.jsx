import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import DashboardLayout from '../../../Layouts/DashboardLayout'
import { Icons } from '../../../utils/icons'
import Swal from 'sweetalert2'
import axios from 'axios'
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
  CBadge,
} from '@coreui/react'

const Index = ({ subscriptions, stats, filters }) => {
  // State for tracking toggle states
  const [toggleStates, setToggleStates] = useState({});

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { color: 'success', text: 'Active' },
      'trialing': { color: 'info', text: 'Trial' },
      'past_due': { color: 'warning', text: 'Past Due' },
      'canceled': { color: 'danger', text: 'Canceled' },
      'incomplete': { color: 'secondary', text: 'Incomplete' },
      'incomplete_expired': { color: 'danger', text: 'Expired' },
      'unpaid': { color: 'danger', text: 'Unpaid' },
    }
    
    const config = statusConfig[status] || { color: 'secondary', text: status }
    return <CBadge color={config.color}>{config.text}</CBadge>
  }

  const getStatusFilterUrl = (status) => {
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    return `/admin-dashboard/subscriptions?${params.toString()}`
  }

  const handleToggleRenewal = async (subscriptionId, currentState) => {
    const newState = !currentState;

    // Show loading toast
    const loadingToast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 0,
      didOpen: (toast) => {
        Swal.showLoading();
      }
    });
    
    loadingToast.fire({
      title: 'Updating auto-renewal...'
    });

    try {
      // Make API call directly
      const response = await axios.post(route('subscription.toggle-renewal', subscriptionId));
      
      // Close loading toast
      Swal.close();
      
      if (response.data.success) {
        // Update the toggle state
        setToggleStates(prev => ({
          ...prev,
          [subscriptionId]: newState
        }));
        
        // Show success toast
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        
        Toast.fire({
          icon: 'success',
          title: response.data.message || 'Auto-renewal updated successfully!'
        });
      }
    } catch (error) {
      // Close loading toast
      Swal.close();
      
      const errorMessage = error.response?.data?.error || 'Failed to update auto-renewal settings';
      
      // Show error toast
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      
      Toast.fire({
        icon: 'error',
        title: errorMessage
      });
    }
  };

  const getToggleState = (subscription) => {
    // Check if we have a state for this subscription, otherwise use the default
    if (toggleStates.hasOwnProperty(subscription.id)) {
      return toggleStates[subscription.id];
    }
    // Default state based on cancel_at_period_end
    return !subscription.cancel_at_period_end;
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
          
          .toggle-switch.disabled .toggle-label {
            background-color: #e9ecef;
            cursor: not-allowed;
            opacity: 0.6;
          }
          
          .toggle-switch.disabled input:checked + .toggle-label {
            background-color: #e9ecef;
          }
          
          .toggle-switch.disabled .toggle-label:before {
            background-color: #adb5bd;
          }
          
          /* Hover effects */
          .toggle-switch:not(.disabled):hover .toggle-label {
            box-shadow: 0 0 0 3px rgba(254, 162, 87, 0.1);
          }
        `}
      </style>
      <DashboardLayout>
        <Head title="Subscription Management" />
      
      {/* Statistics Cards */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <div className="flex-grow-1">
          <CCard className="text-center" style={{ minWidth: '120px' }}>
            <CCardBody>
              <h4 className="text-primary">{stats.total}</h4>
              <small className="text-muted">Total Subscriptions</small>
            </CCardBody>
          </CCard>
        </div>
        <div className="flex-grow-1">
          <CCard className="text-center" style={{ minWidth: '120px' }}>
            <CCardBody>
              <h4 className="text-success">{stats.active}</h4>
              <small className="text-muted">Active</small>
            </CCardBody>
          </CCard>
        </div>
        <div className="flex-grow-1">
          <CCard className="text-center" style={{ minWidth: '120px' }}>
            <CCardBody>
              <h4 className="text-info">{stats.trialing}</h4>
              <small className="text-muted">Trial</small>
            </CCardBody>
          </CCard>
        </div>
        <div className="flex-grow-1">
          <CCard className="text-center" style={{ minWidth: '120px' }}>
            <CCardBody>
              <h4 className="text-warning">{stats.past_due}</h4>
              <small className="text-muted">Past Due</small>
            </CCardBody>
          </CCard>
        </div>
        <div className="flex-grow-1">
          <CCard className="text-center" style={{ minWidth: '120px' }}>
            <CCardBody>
              <h4 className="text-danger">{stats.expired}</h4>
              <small className="text-muted">Expired</small>
            </CCardBody>
          </CCard>
        </div>
        {/* <div className="flex-shrink-0">
          <CCard className="text-center" style={{ minWidth: '120px' }}>
            <CCardBody>
              <Link to={route('admin-dashboard.subscriptions.users.with')} className="text-decoration-none">
                <h4 className="text-primary">View Users</h4>
                <small className="text-muted">With Subscriptions</small>
              </Link>
            </CCardBody>
          </CCard>
        </div> */}
      </div>

      {/* Filter Buttons */}
      <CRow className="mb-3">
        <CCol xs={12}>
          <div className="d-flex gap-2 flex-wrap">
            <CButton 
              color={!filters.status || filters.status === 'all' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => router.visit(getStatusFilterUrl('all'))}
            >
              All
            </CButton>
            <CButton 
              color={filters.status === 'active' ? 'success' : 'outline-success'}
              size="sm"
              onClick={() => router.visit(getStatusFilterUrl('active'))}
            >
              Active
            </CButton>
            <CButton 
              color={filters.status === 'trialing' ? 'info' : 'outline-info'}
              size="sm"
              onClick={() => router.visit(getStatusFilterUrl('trialing'))}
            >
              Trial
            </CButton>
            <CButton 
              color={filters.status === 'past_due' ? 'warning' : 'outline-warning'}
              size="sm"
              onClick={() => router.visit(getStatusFilterUrl('past_due'))}
            >
              Past Due
            </CButton>
            <CButton 
              color={filters.status === 'expired' ? 'danger' : 'outline-danger'}
              size="sm"
              onClick={() => router.visit(getStatusFilterUrl('expired'))}
            >
              Expired
            </CButton>
          </div>
        </CCol>
      </CRow>

      {/* Subscriptions Table */}
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong className="d-flex align-items-center">
                <Icons.Subscription className="me-2" /> Subscriptions
              </strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">User Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">User</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Package</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Auto Renewal</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Created</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Expires</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {subscriptions.data.length > 0 ? (
                    subscriptions.data.map((subscription) => (
                      <CTableRow key={subscription.id}>
                        <CTableDataCell>{subscription.user?.username || 'N/A'}</CTableDataCell>
                        <CTableDataCell>
                          <div>
                          {/* <div className="fw-medium">{subscription.user?.name || 'N/A'}</div> */}
                            <small className="text-muted">{subscription.user?.email || 'N/A'}</small>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {subscription.package?.name || 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {getStatusBadge(subscription.stripe_status)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center gap-2">
                            <div className="toggle-switch">
                              <input 
                                type="checkbox" 
                                id={`toggle-${subscription.id}`} 
                                checked={getToggleState(subscription)} 
                                onChange={() => handleToggleRenewal(subscription.id, getToggleState(subscription))} 
                              />
                              <label htmlFor={`toggle-${subscription.id}`} className="toggle-label">
                                <span className="toggle-slider"></span>
                              </label>
                            </div>
                            <small className="text-muted">
                              {getToggleState(subscription) ? 'Enabled' : 'Disabled'}
                            </small>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {subscription.created_at ? new Date(subscription.created_at).toLocaleDateString() : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString() : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center gap-2">
                            <CTooltip content="View Subscription">
                              <Link href={route('admin-dashboard.subscriptions.show', subscription.id)}>
                                <CButton 
                                  className="p-0 d-flex align-items-center justify-content-center"
                                  size="sm"
                                >
                                  <Icons.View />
                                </CButton>
                              </Link>
                            </CTooltip>
                            <CTooltip content="View User">
                              <Link href={route('admin-dashboard.users.show', subscription.user_id)}>
                                <CButton 
                                  className="p-0 d-flex align-items-center justify-content-center"
                                  size="sm"
                                >
                                  <Icons.Profile />
                                </CButton>
                              </Link>
                            </CTooltip>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="8" className="text-center">
                        No subscriptions found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>

              {/* Pagination */}
              {subscriptions.data.length > 0 && (
                <CPagination align="center" className="mt-3">
                  {subscriptions.links.map((link, index) => (
                    <CPaginationItem
                      key={index}
                      active={link.active}
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
    </>
  )
}

export default Index
