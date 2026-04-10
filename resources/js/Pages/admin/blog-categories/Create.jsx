import React, { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import Swal from 'sweetalert2';
import { CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormLabel, CRow } from '@coreui/react';

const themePrimary = '#FEA257';

const Create = ({ flash }) => {
  const { data, setData, post, processing, errors } = useForm({ name: '' });

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ icon: 'success', title: flash.success, timer: 1500, showConfirmButton: false });
    }
  }, [flash]);

  return (
    <DashboardLayout>
      <Head title="New blog category" />
      <CRow>
        <CCol md={8}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between">
              <strong>New blog category</strong>
              <Link href={route('admin-dashboard.blog-categories.index')}>
                <CButton size="sm" color="secondary" variant="ghost">
                  Back
                </CButton>
              </Link>
            </CCardHeader>
            <CCardBody>
              <CForm
                onSubmit={(e) => {
                  e.preventDefault();
                  post(route('admin-dashboard.blog-categories.store'));
                }}
              >
                <div className="mb-3">
                  <CFormLabel>Name *</CFormLabel>
                  <CFormInput
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    invalid={!!errors.name}
                    feedbackInvalid={errors.name}
                    placeholder="Slug is generated automatically from the name"
                  />
                </div>
                <CButton type="submit" color="primary" disabled={processing} style={{ backgroundColor: themePrimary, borderColor: themePrimary }}>
                  Save
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  );
};

export default Create;
