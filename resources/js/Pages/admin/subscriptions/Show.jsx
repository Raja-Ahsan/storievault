import React from 'react'
import { Head, Link } from '@inertiajs/react'
import DashboardLayout from '../../../Layouts/DashboardLayout'
import { Icons } from '../../../utils/icons'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CListGroup,
  CListGroupItem,
  CButton,
  CBadge,
} from '@coreui/react'

const Show = ({ subscription }) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const isExpired = () => {
    if (subscription.ends_at) {
      return new Date(subscription.ends_at) < new Date()
    }
    return subscription.stripe_status === 'canceled' || subscription.stripe_status === 'incomplete_expired'
  }

  return (
    <DashboardLayout>
      <Head title={`Subscription: ${subscription.id}`} />
      
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <strong className='d-flex align-items-center'>
                  <Icons.Subscription className="me-2" /> Subscription Details
                </strong>
              </div>
              <div className="d-flex gap-2">
                <Link href={route('admin-dashboard.subscriptions.index')}>
                  <CButton 
                    color="primary" 
                    className='custom-primary-btn' 
                    size="sm" 
                    style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                  >
                    <Icons.ArrowLeft className="me-1" /> Back to Subscriptions
                  </CButton>
                </Link>
                <Link href={route('admin-dashboard.users.show', subscription.user_id)}>
                  <CButton 
                    color="primary" 
                    className='custom-primary-btn' 
                    size="sm" 
                    style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                  >
                    <Icons.Profile className="me-1" /> View User
                  </CButton>
                </Link>
              </div>
            </CCardHeader>
            <CCardBody>
              <CRow>
                {/* Subscription Information */}
                <CCol md={6}>
                  <CCard className="mb-3">
                    <CCardHeader>
                      <strong>Subscription Information</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CListGroup>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>ID:</span>
                          <strong>{subscription.id}</strong>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Status:</span>
                          <span className='d-flex align-items-center'>{getStatusBadge(subscription.stripe_status)}</span>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Type:</span>
                          <strong>{subscription.type}</strong>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Stripe ID:</span>
                          <code>{subscription.stripe_id}</code>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Quantity:</span>
                          <strong>{subscription.quantity || 'N/A'}</strong>
                        </CListGroupItem>
                      </CListGroup>
                    </CCardBody>
                  </CCard>
                </CCol>

                {/* Package Information */}
                <CCol md={6}>
                  <CCard className="mb-3">
                    <CCardHeader>
                      <strong>Package Information</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CListGroup>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Package:</span>
                          <strong>{subscription.package?.name || 'N/A'}</strong>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Stripe Price:</span>
                          <code>{subscription.stripe_price || 'N/A'}</code>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Words Limit:</span>
                          <strong>{subscription.package?.words_limit || 'N/A'}</strong>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Stories Limit:</span>
                          <strong>{subscription.package?.stories_limit || 'N/A'}</strong>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Billing Cycle:</span>
                          <strong>{subscription.package?.interval || 'N/A'}</strong>
                        </CListGroupItem>
                      </CListGroup>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>

              <CRow>
                {/* Dates */}
                <CCol md={6}>
                  <CCard className="mb-3">
                    <CCardHeader>
                      <strong>Important Dates</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CListGroup>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Created:</span>
                          <strong>{formatDate(subscription.created_at)}</strong>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Updated:</span>
                          <strong>{formatDate(subscription.updated_at)}</strong>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Trial Ends:</span>
                          <strong>{formatDate(subscription.trial_ends_at)}</strong>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Expires:</span>
                          <strong className={isExpired() ? 'text-danger' : 'text-success'}>
                            {formatDate(subscription.ends_at)}
                          </strong>
                        </CListGroupItem>
                      </CListGroup>
                    </CCardBody>
                  </CCard>
                </CCol>

                {/* User Information */}
                <CCol md={6}>
                  <CCard className="mb-3">
                    <CCardHeader>
                      <strong>User Information</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CListGroup>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>User ID:</span>
                          <strong>{subscription.user?.id || 'N/A'}</strong>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Name:</span>
                          <strong>{subscription.user?.name || 'N/A'}</strong>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Email:</span>
                          <strong>{subscription.user?.email || 'N/A'}</strong>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Role:</span>
                          <CBadge className='bg-primary-theme d-flex align-items-center'>{subscription.user?.role || 'N/A'}</CBadge>
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between">
                          <span>Active:</span>
                          <CBadge color={subscription.user?.is_active ? 'success' : 'danger'}>
                            {subscription.user?.is_active ? 'Yes' : 'No'}
                          </CBadge>
                        </CListGroupItem>
                      </CListGroup>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>

              {/* Subscription Status Summary */}
              {/* <CRow>
                <CCol xs={12}>
                  <CCard className="mb-3">
                    <CCardHeader>
                      <strong>Status Summary</strong>
                    </CCardHeader>
                    <CCardBody>
                      <div className="alert alert-info">
                        <strong>Current Status:</strong> {getStatusBadge(subscription.stripe_status)}
                        {isExpired() && (
                          <div className="mt-2">
                            <CBadge color="danger">This subscription has expired</CBadge>
                          </div>
                        )}
                        {subscription.stripe_status === 'active' && (
                          <div className="mt-2">
                            <CBadge color="success">This subscription is currently active</CBadge>
                          </div>
                        )}
                        {subscription.stripe_status === 'trialing' && (
                          <div className="mt-2">
                            <CBadge color="info">This subscription is in trial period</CBadge>
                          </div>
                        )}
                        {subscription.stripe_status === 'past_due' && (
                          <div className="mt-2">
                            <CBadge color="warning">This subscription has past due payments</CBadge>
                          </div>
                        )}
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow> */}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  )
}

export default Show
