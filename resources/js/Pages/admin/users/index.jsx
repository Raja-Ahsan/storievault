import React from 'react'
import { Head } from '@inertiajs/react'
import DashboardLayout from '../../../Layouts/DashboardLayout'
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
} from '@coreui/react'

const Index = () => {
  // Dummy placeholder data
  const users = {
    data: [] // Empty data array for now
  };

  return (
    <DashboardLayout>
      <Head title="User Management" />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Users</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Role</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {users.data.length > 0 ? (
                    users.data.map((user) => (
                      <CTableRow key={user.id}>
                        <CTableHeaderCell scope="row">{user.id}</CTableHeaderCell>
                        <CTableDataCell>{user.name}</CTableDataCell>
                        <CTableDataCell>{user.email}</CTableDataCell>
                        <CTableDataCell>{user.role}</CTableDataCell>
                        <CTableDataCell>
                          {/* Actions will go here */}
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="5" className="text-center">
                        No users found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  )
}

export default Index
