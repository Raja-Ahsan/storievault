import React, { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import Swal from 'sweetalert2';
import { CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormLabel, CRow } from '@coreui/react';

const themePrimary = '#FEA257';

const Edit = ({ category, flash }) => {
  const { data, setData, put, processing, errors } = useForm({ name: category.name || '' });

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ icon: 'success', title: flash.success, timer: 1500, showConfirmButton: false });
    }
  }, [flash]);

  return (
    <DashboardLayout>
      <Head title={`Edit: ${category.name}`} />
      <CRow>
        <CCol md={8}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between">
              <strong>Edit blog category</strong>
              <Link href={route('admin-dashboard.blog-categories.index')}>
                <CButton size="sm" color="secondary" variant="ghost">
                  Back
                </CButton>
              </Link>
            </CCardHeader>
            <CCardBody>
              <p className="text-muted small mb-3">
                Current slug: <code>{category.slug}</code> (updates when you change the name)
              </p>
              <CForm
                onSubmit={(e) => {
                  e.preventDefault();
                  put(route('admin-dashboard.blog-categories.update', category.id));
                }}
              >
                <div className="mb-3">
                  <CFormLabel>Name *</CFormLabel>
                  <CFormInput value={data.name} onChange={(e) => setData('name', e.target.value)} invalid={!!errors.name} feedbackInvalid={errors.name} />
                </div>
                <CButton type="submit" color="primary" disabled={processing} style={{ backgroundColor: themePrimary, borderColor: themePrimary }}>
                  Update
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  );
};

export default Edit;
