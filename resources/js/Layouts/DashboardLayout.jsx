import React, { useEffect, useState } from 'react'
import '../assets/admin/scss/style.scss';
import '../assets/dashboard/css/dashboard.css';
import { AppSidebar, AppFooter, AppHeader } from '../Components/admin/index'

import { CContainer } from '@coreui/react';

const DefaultLayout = ({ children }) => {
  const [sidebarShow, setSidebarShow] = useState(true)

  return (
    <div>
      <AppSidebar sidebarShow={sidebarShow} setSidebarShow={setSidebarShow} />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader sidebarShow={sidebarShow} setSidebarShow={setSidebarShow} />
        <div className="body flex-grow-1">
          <CContainer style={{ padding: '16px' }} className="" fluid>
            {children}
          </CContainer>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
