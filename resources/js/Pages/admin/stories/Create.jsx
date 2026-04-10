import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
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
  CFormSelect,
} from '@coreui/react';
import ReactQuill from 'react-quill-new';

// Define theme colors
const themeColors = {
  primary: '#FEA257',
  secondary: '#74989E',
};

const Create = ({ flash, categories = [] }) => {
  const { auth } = usePage().props;
  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    description: '',
    author: auth?.user?.username || '',
    category: '',
    content: '',
    cover_image: null,
    backcover_image: null,
  });

  const [preview, setPreview] = useState({ cover_image: null, backcover_image: null });
  const [showHtml, setShowHtml] = useState(false);

  // Handle flash messages with SweetAlert
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        icon: 'success',
        title: flash.success,
        showConfirmButton: false,
        timer: 1500,
        confirmButtonColor: themeColors.primary,
        background: '#fff',
        customClass: {
          popup: 'swal2-custom-popup',
          title: 'swal2-custom-title',
          content: 'swal2-custom-content'
        }
      });
    }
  }, [flash?.success]);

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (data.title || data.description || data.author || data.content) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Show loading state
    Swal.fire({
      title: 'Creating story...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    post(route('admin-dashboard.stories.store'), {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setPreview(null);
        Swal.fire({
          icon: 'success',
          title: 'Story created successfully!',
          text: 'Redirecting to stories list...',
          showConfirmButton: false,
          timer: 1500,
          confirmButtonColor: themeColors.primary,
          background: '#fff',
          customClass: {
            popup: 'swal2-custom-popup',
            title: 'swal2-custom-title',
            content: 'swal2-custom-content'
          }
        });
      },
      onError: (errors) => {
        // Show specific error messages
        let errorMessage = 'Please check your input.';
        if (errors.title) errorMessage = errors.title;
        else if (errors.description) errorMessage = errors.description;
        else if (errors.author) errorMessage = errors.author;
        else if (errors.category) errorMessage = errors.category;
        else if (errors.content) errorMessage = errors.content;
        else if (errors.cover_image) errorMessage = errors.cover_image;
        else if (errors.backcover_image) errorMessage = errors.backcover_image;
        
        Swal.fire({
          icon: 'error',
          title: 'Error creating story!',
          text: errorMessage,
          showConfirmButton: true,
          confirmButtonColor: themeColors.primary,
          background: '#fff',
          customClass: {
            popup: 'swal2-custom-popup',
            title: 'swal2-custom-title',
            content: 'swal2-custom-content'
          }
        });
      },
    });
  };

  const handleContentChange = (content) => {
    setData('content', content);
  };

  const handleImageChange = (e, field) => {
    if (e.target.files[0]) {
      setData(field, e.target.files[0]);
      setPreview((prev) => ({ ...prev, [field]: URL.createObjectURL(e.target.files[0]) }));
    }
  };


  return (
    <DashboardLayout>
      <Head title="Create Story" />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Create New Story</strong>
            </CCardHeader>
            <CCardBody>
              
              <CForm onSubmit={handleSubmit} encType="multipart/form-data">
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="title">Title</CFormLabel>
                    <CFormInput
                      id="title"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      invalid={errors.title}
                      feedback={errors.title}
                    />
                   
                  </CCol>
                  
                  <CCol md={6}>
                    <CFormLabel htmlFor="author">Author</CFormLabel>
                    <CFormInput
                      id="author"
                      value={auth?.user?.username || ''}
                      disabled
                      readOnly
                      className="bg-light"
                    />
                    <div className="form-text">Author is automatically set to your username</div>
                  </CCol>
                </CRow>
                
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel htmlFor="category">Category</CFormLabel>
                    <CFormSelect
                      id="category"
                      value={data.category}
                      onChange={(e) => setData('category', e.target.value)}
                      invalid={errors.category}
                      feedback={errors.category}
                      options={[
                        { value: '', label: 'Select a category' },
                        ...categories.map(category => ({
                          value: category.id,
                          label: category.name
                        }))
                      ]}
                    />
                  </CCol>
                </CRow>
                
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel htmlFor="description">Description</CFormLabel>
                    <CFormTextarea
                      id="description"
                      rows={3}
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      invalid={errors.description}
                      feedback={errors.description}
                    />
                   
                  </CCol>
                </CRow>
                
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="cover_image">Cover Image</CFormLabel>
                    <CFormInput
                      type="file"
                      id="cover_image"
                      onChange={(e) => handleImageChange(e, 'cover_image')}
                      invalid={errors.cover_image}
                      feedback={errors.cover_image}
                      accept="image/*"
                    />
                   
                    
                    {preview.cover_image && (
                      <div className="mt-2">
                        <img 
                          src={preview.cover_image} 
                          alt="Cover preview" 
                          style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} 
                        />
                      </div>
                    )}
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="backcover_image">Back Cover Image</CFormLabel>
                    <CFormInput
                      type="file"
                      id="backcover_image"
                      onChange={(e) => handleImageChange(e, 'backcover_image')}
                      invalid={errors.backcover_image}
                      feedback={errors.backcover_image}
                      accept="image/*"
                    />
                   
                    
                    {preview.backcover_image && (
                      <div className="mt-2">
                        <img 
                          src={preview.backcover_image} 
                          alt="Back Cover preview" 
                          style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} 
                        />
                      </div>
                    )}
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <CFormLabel htmlFor="content">Story Content</CFormLabel>
                      <CButton
                        type="button"
                        color="secondary"
                        size="sm"
                        onClick={() => setShowHtml(!showHtml)}
                      >
                        {showHtml ? 'Hide HTML' : 'Show HTML'}
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
                    
                  </CCol>
                </CRow>
                
                <CRow>
                  <CCol xs={12} className="d-flex justify-content-end">
                    <CButton type="submit" color="primary" disabled={processing}>
                      {processing ? 'Saving...' : 'Create Story'}
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </DashboardLayout>
  );
};

export default Create;