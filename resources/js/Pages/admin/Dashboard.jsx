import React from 'react'
import DashboardLayout from '../../Layouts/DashboardLayout'
import classNames from 'classnames'
import { usePage } from '@inertiajs/react';
import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'
import { Icons } from '../../utils/icons'
import avatar1 from '../../assets/admin/images/avatars/1.jpg'
import avatar2 from '../../assets/admin/images/avatars/2.jpg'
import avatar3 from '../../assets/admin/images/avatars/3.jpg'
import avatar4 from '../../assets/admin/images/avatars/4.jpg'
import avatar5 from '../../assets/admin/images/avatars/5.jpg'
import avatar6 from '../../assets/admin/images/avatars/6.jpg'

import WidgetsBrand from '../../widgets/WidgetsBrand'
import WidgetsDropdown from '../../widgets/WidgetsDropdown'
import MainChart from '../../Components/MainChart'



// const progressGroupExample1 = [
//   { title: 'Monday', value1: 34, value2: 78 },
//   { title: 'Tuesday', value1: 56, value2: 94 },
//   { title: 'Wednesday', value1: 12, value2: 67 },
//   { title: 'Thursday', value1: 43, value2: 91 },
//   { title: 'Friday', value1: 22, value2: 73 },
//   { title: 'Saturday', value1: 53, value2: 82 },
//   { title: 'Sunday', value1: 9, value2: 69 },
// ]






const Dashboard = () => {
  const { metrics, today } = usePage().props;
  const max = Math.max(metrics.visits, metrics.uniqueUsers, metrics.pageviews, metrics.newUsers);
  const getPercentage = (value) => {
    return max ? Math.round((value / max) * 100) : 0;
  };
  const progressExample = [
    { title: 'Visits', value: metrics.visits, getPercentage, color: 'success' },
    { title: 'Unique', value: metrics.uniqueUsers, getPercentage, color: 'info' },
    { title: 'Pageviews', value: metrics.pageviews, getPercentage, color: 'warning' },
    { title: 'New Users', value: metrics.newUsers, getPercentage, color: 'danger' },
  ]
  return (
    <DashboardLayout>


      <>
        {/* <WidgetsDropdown
          className="mb-4"
          communityStoriesCount={metrics.communityStoriesCount}
          usersCount={metrics.totalUsers}
          labels={metrics.userCountsByMonth}
          adminStoriesCount={metrics.adminStoriesCount}
          userCountsByMonth={metrics.userCountsByMonth}
          monthlyIncome={metrics.monthlyIncome}
          totalIncome={metrics.totalIncome}
          monthlyPaymentData={metrics.monthlyPaymentData}
        /> */}
        <div className="row row-gap-3" style={{ marginBottom: '50px' }}>
          <div className="col-md-4 col-lg-3">
            <div className='dashboard-card-wrapper d-flex align-items-center gap-2'>
              <div>
                <div className="dcw-icon">
                  <Icons.Users />
                </div>
              </div>
              <div>
                <h4 id="traffic" className="card-title mb-2 fw-medium">
                  Total Users
                </h4>
                <div className="small text-body-secondary">{metrics?.totalUsers || 0}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-lg-3">
            <div className='dashboard-card-wrapper d-flex align-items-center gap-2'>
              <div>
                <div className="dcw-icon">
                  <Icons.Dollar />
                </div>
              </div>
              <div>
                <h4 id="traffic" className="card-title mb-2 fw-medium">
                  Monthly Income
                </h4>
                <div className="small text-body-secondary">${metrics?.monthlyIncome || 0}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-lg-3">
            <div className='dashboard-card-wrapper d-flex align-items-center gap-2'>
              <div>
                <div className="dcw-icon">
                  <Icons.Book />
                </div>
              </div>
              <div>
                <h4 id="traffic" className="card-title mb-2 fw-medium">
                  Community Stories
                </h4>
                <div className="small text-body-secondary">{metrics?.communityStoriesCount || 0}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-lg-3">
            <div className='dashboard-card-wrapper d-flex align-items-center gap-2'>
              <div>
                <div className="dcw-icon">
                  <Icons.Book />
                </div>
              </div>
              <div>
                <h4 id="traffic" className="card-title mb-2 fw-medium">
                My Stories
                </h4>
                <div className="small text-body-secondary">{metrics?.adminStoriesCount || 0}</div>
              </div>
            </div>
          </div>

        </div>
        <CCard className="mb-4">
          <CCardBody>
            <CRow>
              <CCol sm={5}>
                <h4 id="traffic" className="card-title mb-0">
                  Traffic
                </h4>
                <div className="small text-body-secondary">{today}</div>
              </CCol>
            </CRow>
            <MainChart />
          </CCardBody>
          <CCardFooter>
            <CRow
              xs={{ cols: 1, gutter: 4 }}
              sm={{ cols: 2 }}
              lg={{ cols: 3 }}
              xl={{ cols: 4 }}
              className="mb-2 text-center"
            >
              {progressExample.map((item, index, items) => {
                const percent = getPercentage(item.value)
                return (
                  <CCol
                    className={classNames({
                      'd-none d-xl-block': index + 1 === items.length,
                    })}
                    key={index}
                  >
                    <div className="text-body-secondary">{item.title}</div>
                    <div className="fw-semibold text-truncate">
                      {item.value} ({percent}%)
                    </div>
                    <CProgress thin className="mt-2" color={item.color} value={percent} />
                  </CCol>
                )
              })}
            </CRow>
          </CCardFooter>
        </CCard>
      </>
    </DashboardLayout>
  )
}

export default Dashboard
