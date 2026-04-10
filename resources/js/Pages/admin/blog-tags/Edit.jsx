import React, { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import Swal from 'sweetalert2';
import { CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormLabel, CRow } from '@coreui/react';

const themePrimary = '#FEA257';

const Edit = ({ tag, flash }) => {
  const { data, setData, put, processing, errors } = useForm({ name: tag.name || '' });

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ icon: 'success', title: flash.success, timer: 1500, showConfirmButton: false });
    }
  }, [flash]);

  return (
    <DashboardLayout>
      <Head title={`Edit: ${tag.name}`} />
      <CRow>
        <CCol md={8}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between">
              <strong>Edit blog tag</strong>
              <Link href={route('admin-dashboard.blog-tags.index')}>
                <CButton size="sm" color="secondary" variant="ghost">
                  Back
                </CButton>
              </Link>
            </CCardHeader>
            <CCardBody>
              <p className="text-muted small mb-3">
                Current slug: <code>{tag.slug}</code>
              </p>
              <CForm
                onSubmit={(e) => {
                  e.preventDefault();
                  put(route('admin-dashboard.blog-tags.update', tag.id));
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
