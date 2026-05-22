import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Head, useForm } from '@inertiajs/react';
=======
import { Head, useForm, usePage } from '@inertiajs/react';
>>>>>>> live-main
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
<<<<<<< HEAD
  CAlert,
  CListGroup,
  CListGroupItem,
  CInputGroup,
  CInputGroupText,
=======
>>>>>>> live-main
} from '@coreui/react';
import ReactQuill from 'react-quill-new';

// Define theme colors
const themeColors = {
  primary: '#FEA257',
  secondary: '#74989E',
};

<<<<<<< HEAD
const Create = ({ flash, ratings = [] }) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    description: '',
    author: '',
    genre: '',
    rating: '',
    content: '',
    cover_image: null,
    characters: []
  });

  const [newCharacter, setNewCharacter] = useState({ name: '', description: '' });
=======
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

>>>>>>> live-main
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
<<<<<<< HEAD
        else if (errors.genre) errorMessage = errors.genre;
        else if (errors.rating) errorMessage = errors.rating;
=======
        else if (errors.category) errorMessage = errors.category;
>>>>>>> live-main
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

<<<<<<< HEAD
  const handleAddCharacter = () => {
    if (newCharacter.name.trim() === '') return;
    
    setData('characters', [...data.characters, { ...newCharacter }]);
    setNewCharacter({ name: '', description: '' });
  };

  const handleRemoveCharacter = (index) => {
    const updatedCharacters = [...data.characters];
    updatedCharacters.splice(index, 1);
    setData('characters', updatedCharacters);
  };

  const genreOptions = [
    { value: '', label: 'Select a genre' },
    { value: 'Mystery', label: 'Mystery' },
    { value: 'Romance', label: 'Romance' },
    { value: 'Fantasy', label: 'Fantasy' },
    { value: 'Science Fiction', label: 'Science Fiction' },
    { value: 'Thriller', label: 'Thriller' },
    { value: 'Horror', label: 'Horror' },
    { value: 'Historical Fiction', label: 'Historical Fiction' },
  ];
=======
>>>>>>> live-main

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
<<<<<<< HEAD
                      value={data.author}
                      onChange={(e) => setData('author', e.target.value)}
                      invalid={errors.author}
                      feedback={errors.author}
                    />
                   
=======
                      value={auth?.user?.username || ''}
                      disabled
                      readOnly
                      className="bg-light"
                    />
                    <div className="form-text">Author is automatically set to your username</div>
>>>>>>> live-main
                  </CCol>
                </CRow>
                
                <CRow className="mb-3">
<<<<<<< HEAD
                  <CCol md={6}>
                    <CFormLabel htmlFor="genre">Genre</CFormLabel>
                    <CFormSelect
                      id="genre"
                      value={data.genre}
                      onChange={(e) => setData('genre', e.target.value)}
                      invalid={errors.genre}
                      feedback={errors.genre}
                      options={genreOptions}
                    />
                    
                  </CCol>
                  
                  <CCol md={6}>
                     <CFormLabel htmlFor="rating">Content Rating</CFormLabel>
                     <CFormSelect
                       id="rating"
                       value={data.rating}
                       onChange={(e) => setData('rating', e.target.value)}
                       invalid={errors.rating}
                       feedback={errors.rating}
                       options={[
                         { value: '', label: 'Select a rating' },
                         ...ratings.map(rating => ({
                           value: rating.name,
                           label: rating.name
                         }))
                       ]}
                     />
                   
=======
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
>>>>>>> live-main
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
<<<<<<< HEAD
                    <CFormLabel>Story Characters</CFormLabel>
                    
                    <CInputGroup className="mb-3">
                      <CInputGroupText>Name</CInputGroupText>
                      <CFormInput
                        value={newCharacter.name}
                        onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                        placeholder="Character name"
                      />
                      <CInputGroupText>Description</CInputGroupText>
                      <CFormInput
                        value={newCharacter.description}
                        onChange={(e) => setNewCharacter({...newCharacter, description: e.target.value})}
                        placeholder="Brief character description"
                      />
                      <CButton 
                        type="button" 
                        color="primary"
                        onClick={handleAddCharacter}
                      >
                        Add Character
                      </CButton>
                    </CInputGroup>
                    
                    {data.characters.length > 0 && (
                      <CListGroup className="mb-3">
                        {data.characters.map((char, index) => (
                          <CListGroupItem key={index} className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{char.name}</strong>
                              {char.description && (
                                <p className="mb-0 text-muted small">{char.description}</p>
                              )}
                            </div>
                            <CButton 
                              color="danger" 
                              size="sm" 
                              onClick={() => handleRemoveCharacter(index)}
                            >
                              Remove
                            </CButton>
                          </CListGroupItem>
                        ))}
                      </CListGroup>
                    )}
                    
                    {errors.characters && (
                      <div className="text-danger">{errors.characters}</div>
                    )}
                  </CCol>
                </CRow>
                
                <CRow className="mb-3">
                  <CCol md={12}>
=======
>>>>>>> live-main
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