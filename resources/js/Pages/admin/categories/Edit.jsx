import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import Swal from 'sweetalert2';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
} from '@coreui/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const defaultFaq = () => ({ question: '', answer: '' });

const Edit = ({ category, flash }) => {
  const initialFaqs = (category.faqs && category.faqs.length > 0)
    ? category.faqs.map((f) => ({ question: f.question || '', answer: f.answer || '' }))
    : [defaultFaq()];
  const { data, setData, post, processing, errors } = useForm({
    name: category.name || '',
    slug: category.slug || '',
    meta_title: category.meta_title || '',
    meta_description: category.meta_description || '',
    content: category.content || '',
    faqs: initialFaqs,
    _method: 'PUT',
  });
  const [showHtml, setShowHtml] = useState(false);

  const updateFaq = (index, field, value) => {
    const next = [...(data.faqs || [])];
    if (!next[index]) next[index] = defaultFaq();
    next[index][field] = value;
    setData('faqs', next);
  };
  const addFaq = () => setData('faqs', [...(data.faqs || []), defaultFaq()]);
  const removeFaq = (index) => {
    const next = (data.faqs || []).filter((_, i) => i !== index);
    setData('faqs', next.length ? next : [defaultFaq()]);
  };

  const handleContentChange = (value) => setData('content', value);

  // Handle flash messages with SweetAlert
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        icon: 'success',
        title: flash.success,
        showConfirmButton: false,
        timer: 1500,
        confirmButtonColor: '#FEA257',
        background: '#fff',
        customClass: {
          popup: 'swal2-custom-popup',
          title: 'swal2-custom-title',
          content: 'swal2-custom-content'
        }
      });
    }
    if (flash?.error) {
      Swal.fire({
        icon: 'error',
        title: flash.error,
        showConfirmButton: false,
        timer: 2000,
        confirmButtonColor: '#dc3545',
        background: '#fff',
        customClass: {
          popup: 'swal2-custom-popup',
          title: 'swal2-custom-title',
          content: 'swal2-custom-content'
        }
      });
    }
  }, [flash]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin-dashboard.categories.update', category.id), {
      onSuccess: () => {
        // Form will redirect on success
      },
    });
  };

  return (
    <DashboardLayout>
      <Head title="Edit Category" />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Edit Category</strong>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel htmlFor="name">Category Name *</CFormLabel>
                    <CFormInput
                      type="text"
                      id="name"
                      name="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="e.g., Sci-Fi, Fantasy, Mystery"
                      className={errors.name ? 'is-invalid' : ''}
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                    <div className="form-text">
                      Enter the category name (e.g., Sci-Fi, Fantasy, Mystery)
                    </div>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel htmlFor="slug">Slug (optional)</CFormLabel>
                    <CFormInput
                      type="text"
                      id="slug"
                      name="slug"
                      value={data.slug}
                      onChange={(e) => setData('slug', e.target.value)}
                      placeholder="e.g., fan-fiction, sci-fi (leave empty to auto-generate from name)"
                      className={errors.slug ? 'is-invalid' : ''}
                    />
                    {errors.slug && (
                      <div className="invalid-feedback">{errors.slug}</div>
                    )}
                    <div className="form-text">
                      URL slug for the category page. Frontend link will be: /<strong>{data.slug || 'your-slug'}</strong>-stories
                    </div>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel htmlFor="meta_title">Meta Title (SEO)</CFormLabel>
                    <CFormInput
                      type="text"
                      id="meta_title"
                      value={data.meta_title}
                      onChange={(e) => setData('meta_title', e.target.value)}
                      placeholder="e.g., Best Adventure Stories | Storie Vault"
                      className={errors.meta_title ? 'is-invalid' : ''}
                    />
                    {errors.meta_title && <div className="invalid-feedback">{errors.meta_title}</div>}
                    <div className="form-text">Page title for search engines and browser tab.</div>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel htmlFor="meta_description">Meta Description (SEO)</CFormLabel>
                    <CFormTextarea
                      id="meta_description"
                      value={data.meta_description}
                      onChange={(e) => setData('meta_description', e.target.value)}
                      rows={3}
                      placeholder="Short description for search results"
                      className={errors.meta_description ? 'is-invalid' : ''}
                    />
                    {errors.meta_description && <div className="invalid-feedback">{errors.meta_description}</div>}
                    <div className="form-text">Brief description shown in search results (recommended 150–160 chars).</div>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel>Category Page Content</CFormLabel>
                    <div className="d-flex justify-content-end mb-2">
                      <CButton
                        type="button"
                        color="secondary"
                        size="sm"
                        onClick={() => setShowHtml(!showHtml)}
                      >
                        {showHtml ? 'Switch to Rich Editor' : 'Switch to HTML'}
                      </CButton>
                    </div>
                    {showHtml ? (
                      <CFormTextarea
                        value={data.content}
                        onChange={(e) => setData('content', e.target.value)}
                        rows={15}
                        placeholder="HTML content..."
                        className={errors.content ? 'is-invalid' : ''}
                      />
                    ) : (
                      <div className={errors.content ? 'is-invalid' : ''}>
                        <ReactQuill
                          theme="snow"
                          value={data.content}
                          onChange={handleContentChange}
                          style={{ minHeight: '300px', marginBottom: '50px' }}
                        />
                      </div>
                    )}
                    {errors.content && <div className="invalid-feedback d-block">{errors.content}</div>}
                    <div className="form-text">Rich text shown on the category page above the story list. Do not put FAQs here — use the section below.</div>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel className="d-block">Category FAQs</CFormLabel>
                    <p className="form-text mb-2">FAQs appear in a separate section below the content on the category page (Bootstrap accordion). Add question and answer for each.</p>
                    {(data.faqs || []).map((faq, index) => (
                      <CCard key={index} className="mb-3">
                        <CCardBody className="pb-2">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>FAQ #{index + 1}</strong>
                            <CButton
                              type="button"
                              color="danger"
                              size="sm"
                              onClick={() => removeFaq(index)}
                              disabled={(data.faqs || []).length <= 1}
                            >
                              Remove
                            </CButton>
                          </div>
                          <CFormLabel htmlFor={`faq-q-${index}`}>Question</CFormLabel>
                          <CFormInput
                            id={`faq-q-${index}`}
                            value={faq.question || ''}
                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                            placeholder="e.g. What kinds of adventure stories are available?"
                            className="mb-2"
                          />
                          <CFormLabel htmlFor={`faq-a-${index}`}>Answer</CFormLabel>
                          <CFormTextarea
                            id={`faq-a-${index}`}
                            value={faq.answer || ''}
                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                            placeholder="Short answer..."
                            rows={3}
                          />
                        </CCardBody>
                      </CCard>
                    ))}
                    <CButton type="button" color="secondary" size="sm" onClick={addFaq}>
                      + Add FAQ
                    </CButton>
                  </CCol>
                </CRow>

                <div className="d-flex justify-content-end gap-3">
                  <CButton
                    color="secondary"
                    onClick={() => window.history.back()}
                    disabled={processing}
                  >
                    Cancel
                  </CButton>
                  <CButton
                    type="submit"
                    color="primary"
                    disabled={processing}
                    style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                  >
                    {processing ? 'Updating...' : 'Update Category'}
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  );
};

export default Edit;

