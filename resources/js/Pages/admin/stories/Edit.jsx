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
  CFormSelect,
  CAlert,
  CListGroup,
  CListGroupItem,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react';
import ReactQuill from 'react-quill-new';
// import 'react-quill/dist/quill.snow.css';

// Define theme colors
const themeColors = {
  primary: '#FEA257',
  secondary: '#74989E',
};

const Edit = ({ story, flash, ratings = [] }) => {
  const { data, setData, post, processing, errors } = useForm({
    title: story.title || '',
    description: story.description || '',
    author: story.author || '',
    genre: story.genre || '',
    rating: story.rating?.name || '',
    content: story.content || '',
    cover_image: null,
    backcover_image: null,
    _method: 'PUT', // For method spoofing (PUT request)
    characters: story.characters || [],
    character_updates: {}, // To track updates to existing characters
    character_deletes: [], // IDs of characters to delete
  });

  // Add state for new character input
  const [newCharacter, setNewCharacter] = useState({ name: '', description: '' });
  const [preview, setPreview] = useState({
    cover_image: story?.cover_image ? `/storage/${story.cover_image}` : null,
    backcover_image: story?.backcover_image ? `/storage/${story.backcover_image}` : null,
  });
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
      if (data.title !== story.title || data.description !== story.description ||
        data.author !== story.author || data.content !== story.content) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data, story]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Show loading state
    Swal.fire({
      title: 'Updating story...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    post(route('admin-dashboard.stories.update', story.id), {
      preserveScroll: true,
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Story updated successfully!',
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
        else if (errors.genre) errorMessage = errors.genre;
        else if (errors.rating) errorMessage = errors.rating;
        else if (errors.content) errorMessage = errors.content;
        else if (errors.cover_image) errorMessage = errors.cover_image;

        Swal.fire({
          icon: 'error',
          title: 'Error updating story!',
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
    if (e.target.files && e.target.files[0]) {
      setData(field, e.target.files[0]);
      setPreview((prev) => ({
        ...prev,
        [field]: URL.createObjectURL(e.target.files[0]),
      }));
    }
  };

  // Handle adding a new character
  const handleAddCharacter = () => {
    if (newCharacter.name.trim() === '') return;

    setData('characters', [...data.characters, { ...newCharacter, is_new: true }]);
    setNewCharacter({ name: '', description: '' });
  };

  // Handle updating an existing character
  const handleUpdateCharacter = (index, field, value) => {
    const updatedCharacters = [...data.characters];
    updatedCharacters[index][field] = value;

    // Track changes for existing characters
    if (updatedCharacters[index].id) {
      const charUpdates = { ...data.character_updates };
      if (!charUpdates[updatedCharacters[index].id]) {
        charUpdates[updatedCharacters[index].id] = {};
      }
      charUpdates[updatedCharacters[index].id][field] = value;
      setData('character_updates', charUpdates);
    }

    setData('characters', updatedCharacters);
  };

  // Handle removing a character
  const handleRemoveCharacter = (index) => {
    const character = data.characters[index];
    const updatedCharacters = [...data.characters];
    updatedCharacters.splice(index, 1);

    // If it's an existing character, mark it for deletion
    if (character.id) {
      setData('character_deletes', [...data.character_deletes, character.id]);
    }

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
  const ratingOptions = [
    { value: '', label: 'Select a rating' },
    ...ratings.map(rating => ({
      value: rating.name,
      label: rating.name
    }))
  ]

  return (
    <DashboardLayout>
      <Head title="Edit Story" />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Edit Story: {story.title}</strong>
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
                    />
                    {errors.title && (
                      <div className="text-danger">{errors.title}</div>
                    )}
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel htmlFor="author">Author</CFormLabel>
                    <CFormInput
                      id="author"
                      value={data.author}
                      onChange={(e) => setData('author', e.target.value)}
                      invalid={errors.author}
                    />
                    {errors.author && (
                      <div className="text-danger">{errors.author}</div>
                    )}
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="genre">Genre</CFormLabel>
                    <CFormSelect
                      id="genre"
                      value={data.genre}
                      onChange={(e) => setData('genre', e.target.value)}
                      invalid={errors.genre}
                      options={genreOptions}
                    />
                    {errors.genre && (
                      <div className="text-danger">{errors.genre}</div>
                    )}
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel htmlFor="rating">Content Rating</CFormLabel>
                    <CFormSelect
                      id="rating"
                      value={data.rating}
                      onChange={(e) => setData('rating', e.target.value)}
                      invalid={errors.rating}
                      options={ratingOptions}
                    />
                    {errors.rating && (
                      <div className="text-danger">{errors.rating}</div>
                    )}
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
                    />
                    {errors.description && (
                      <div className="text-danger">{errors.description}</div>
                    )}
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="cover_image">Cover</CFormLabel>

                    <CFormInput
                      type="file"
                      id="cover_image"
                      onChange={(e) => handleImageChange(e, 'cover_image')}
                      invalid={errors.cover_image}
                      accept="image/*"
                    />
                    {errors.cover_image && (
                      <div className="text-danger">{errors.cover_image}</div>
                    )}

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
                    <CFormLabel htmlFor="backcover_image">Back Cover</CFormLabel>
                    <CFormInput
                      type="file"
                      id="backcover_image"
                      onChange={(e) => handleImageChange(e, 'backcover_image')}
                      invalid={errors.backcover_image}
                      accept="image/*"
                    />
                    {errors.backcover_image && (
                      <div className="text-danger">{errors.backcover_image}</div>
                    )}

                    {preview.backcover_image && (
                      <div className="mt-2">
                        <img
                          src={preview.backcover_image}
                          alt="Cover preview"
                          style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </CCol>
                </CRow>

                {/* Characters Section */}
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel>Story Characters</CFormLabel>

                    {/* Character Input Form */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>Name</CInputGroupText>
                      <CFormInput
                        value={newCharacter.name}
                        onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                        placeholder="Character name"
                      />
                      <CInputGroupText>Description</CInputGroupText>
                      <CFormInput
                        value={newCharacter.description}
                        onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
                        placeholder="Brief character description"
                      />
                      <CButton
                        color="primary" className='custom-primary-btn' size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                        onClick={handleAddCharacter}
                      >
                        Add Character
                      </CButton>
                    </CInputGroup>

                    {/* Character List */}
                    {data.characters.length > 0 && (
                      <CListGroup className="mb-3">
                        {data.characters.map((char, index) => (
                          <CListGroupItem key={char.id || index} className="d-flex justify-content-between align-items-center">
                            <div className="w-100">
                              <div className="d-flex gap-2 mb-1">
                                <CFormInput
                                  size="sm"
                                  value={char.name}
                                  onChange={(e) => handleUpdateCharacter(index, 'name', e.target.value)}
                                  placeholder="Character name"
                                />
                                <CButton
                                  color="primary" className='custom-primary-btn' size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}
                                  onClick={() => handleRemoveCharacter(index)}
                                >
                                  Remove
                                </CButton>
                              </div>
                              <CFormTextarea
                                size="sm"
                                value={char.description || ''}
                                onChange={(e) => handleUpdateCharacter(index, 'description', e.target.value)}
                                placeholder="Character description"
                                rows={2}
                              />
                            </div>
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
                    
                    {errors.content && (
                      <div className="text-danger">{errors.content}</div>
                    )}
                  </CCol>
                </CRow>

                <CRow>
                  <CCol xs={12} className="d-flex justify-content-end gap-2">
                    <CButton
                      type="button"
                      color="secondary"
                      onClick={() => window.history.back()}
                    >
                      Cancel
                    </CButton>
                    <CButton type="submit" color="primary" className='custom-primary-btn' size="sm" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }} disabled={processing}>
                      {processing ? 'Saving...' : 'Update Story'}
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

export default Edit;