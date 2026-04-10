import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FaBook, FaUser, FaTag, FaImage, FaFileImage, FaAlignLeft, FaSave, FaTimes } from 'react-icons/fa';

const CreateStory = ({ categories = [], flash }) => {
  const { auth } = usePage().props;
  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    description: '',
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
        confirmButtonColor: '#fea257',
        background: '#fff',
      });
    }
    if (flash?.error) {
      Swal.fire({
        icon: 'error',
        title: flash.error,
        showConfirmButton: true,
        confirmButtonColor: '#fea257',
        background: '#fff',
      });
    }
  }, [flash?.success, flash?.error]);

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (data.title || data.description || data.content) {
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
    
    post(route('stories.store'), {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setPreview({ cover_image: null, backcover_image: null });
      },
      onError: (errors) => {
        // Show specific error messages
        let errorMessage = 'Please check your input.';
        if (errors.title) errorMessage = errors.title;
        else if (errors.description) errorMessage = errors.description;
        else if (errors.category) errorMessage = errors.category;
        else if (errors.content) errorMessage = errors.content;
        else if (errors.cover_image) errorMessage = errors.cover_image;
        else if (errors.backcover_image) errorMessage = errors.backcover_image;
        
        Swal.fire({
          icon: 'error',
          title: 'Error creating story!',
          text: errorMessage,
          showConfirmButton: true,
          confirmButtonColor: '#fea257',
          background: '#fff',
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
    <Layout headerClass="inner-header">
      <Head title="Create Story">
        <style>{`
          input::placeholder,
          textarea::placeholder,
          select option:first-child {
            color: #999;
            opacity: 0.8;
            font-weight: 400;
          }
          input:focus::placeholder,
          textarea:focus::placeholder {
            opacity: 0.5;
          }
        `}</style>
      </Head>
      <section className="stories-sec py-200 sec-bg" style={{ 
 backgroundColor: '#F7EEE2',
        minHeight: '100vh',
        padding: '60px 0'
      }}>
        <div className="container">
          {/* Header Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="text-center mb-5">
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fea257 0%, #ff8c42 100%)',
                  marginBottom: '25px',
                  boxShadow: '0 10px 30px rgba(254, 162, 87, 0.3)'
                }}>
                  <FaBook size={50} color="#fff" />
                </div>
                <h2 className="heading mb-3" style={{ 
                  color: '#fff', 
                  fontSize: '3.5rem',
                  fontWeight: '800',
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  letterSpacing: '-0.5px',
                  lineHeight: '1.2'
                }}>
                  Create Your Story
                </h2>
                <p style={{ 
                  color: 'rgba(255,255,255,0.95)', 
                  fontSize: '1.4rem',
                  fontWeight: '400',
                  marginTop: '10px',
                  letterSpacing: '0.3px'
                }}>
                  Share your imagination with the world
                </p>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-11 col-xl-10">
              <div className="card" style={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                background: '#fff'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #fea257 0%, #ff8c42 100%)',
                  padding: '25px 30px',
                  color: '#fff'
                }}>
                  <h3 style={{ margin: 0, fontSize: '30px', fontWeight: '700' }}>
                    Story Details
                  </h3>
                  <p style={{ margin: '8px 0 0 0', opacity: 0.95, fontSize: '1.7rem' , fontWeight: '500' }}>
                    Fill in the information below to create your story
                  </p>
                </div>

                <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ padding: '40px' }}>
                  {/* Title and Author Row */}
                  <div className="row mb-4">
                    <div className="col-md-8 mb-3 mb-md-0">
                      <label htmlFor="title" className="form-label secondry-font" style={{
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '10px',
                        fontSize: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaBook size={16} color="#fea257" />
                        Story Title <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control secondry-font ${errors.title ? 'is-invalid' : ''}`}
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Enter your story title..."
                        style={{
                          padding: '14px 18px',
                          borderRadius: '10px',
                          border: errors.title ? '2px solid #dc3545' : '2px solid #e0e0e0',
                          fontSize: '1.5rem',
                          fontWeight: '500',
                          color: '#333',
                          transition: 'all 0.3s ease',
                          background: '#fafafa',
                          lineHeight: '1.5'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#fea257';
                          e.target.style.background = '#fff';
                          e.target.style.boxShadow = '0 0 0 3px rgba(254, 162, 87, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.title ? '#dc3545' : '#e0e0e0';
                          e.target.style.background = '#fafafa';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      {errors.title && (
                        <div className="invalid-feedback" style={{ display: 'block', marginTop: '5px' }}>
                          {errors.title}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-4">
                      <label htmlFor="author" className="form-label secondry-font" style={{
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '10px',
                        fontSize: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaUser size={16} color="#fea257" />
                        Author
                      </label>
                      <input
                        type="text"
                        className="form-control secondry-font"
                        id="author"
                        value={auth?.user?.username || ''}
                        disabled
                        readOnly
                        style={{
                          padding: '14px 18px',
                          borderRadius: '10px',
                          border: '2px solid #e0e0e0',
                          fontSize: '1.5rem',
                          fontWeight: '500',
                          background: '#f5f5f5',
                          color: '#666',
                          cursor: 'not-allowed',
                          lineHeight: '1.5'
                        }}
                      />
                      <div className="form-text" style={{ 
                        marginTop: '5px', 
                        fontSize: '1.5rem',
                        color: '#171717',
                        fontWeight: '500'
                      }}>
                        Automatically set to your username
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Row */}
                  <div className="row mb-4">
                    <div className="col-md-12">
                      <label htmlFor="category" className="form-label secondry-font" style={{
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '10px',
                        fontSize: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaTag size={16} color="#fea257" />
                        Category <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <select
                        className={`form-select secondry-font ${errors.category ? 'is-invalid' : ''}`}
                        id="category"
                        value={data.category}
                        onChange={(e) => setData('category', e.target.value)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '10px',
                          border: errors.category ? '2px solid #dc3545' : '2px solid #e0e0e0',
                          fontSize: '1.5rem',
                          fontWeight: '500',
                          color: '#333',
                          transition: 'all 0.3s ease',
                          background: '#fafafa',
                          cursor: 'pointer',
                          lineHeight: '1.5'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#fea257';
                          e.target.style.background = '#fff';
                          e.target.style.boxShadow = '0 0 0 3px rgba(254, 162, 87, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.category ? '#dc3545' : '#e0e0e0';
                          e.target.style.background = '#fafafa';
                          e.target.style.boxShadow = 'none';
                          fontSize: '1.5rem';
                        }}
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <div className="invalid-feedback" style={{ display: 'block', marginTop: '5px' }}>
                          {errors.category}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Description Row */}
                  <div className="row mb-4">
                    <div className="col-md-12">
                      <label htmlFor="description" className="form-label secondry-font" style={{
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '10px',
                        fontSize: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaAlignLeft size={16} color="#fea257" />
                        Description <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <textarea
                        className={`form-control secondry-font ${errors.description ? 'is-invalid' : ''}`}
                        id="description"
                        rows={4}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Write a brief description of your story..."
                        style={{
                          padding: '14px 18px',
                          borderRadius: '10px',
                          border: errors.description ? '2px solid #dc3545' : '2px solid #e0e0e0',
                          fontSize: '1.5rem',
                          fontWeight: '500',
                          color: '#333',
                          transition: 'all 0.3s ease',
                          background: '#fafafa',
                          resize: 'vertical',
                          lineHeight: '1.6'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#fea257';
                          e.target.style.background = '#fff';
                          e.target.style.boxShadow = '0 0 0 3px rgba(254, 162, 87, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.description ? '#dc3545' : '#e0e0e0';
                          e.target.style.background = '#fafafa';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      {errors.description && (
                        <div className="invalid-feedback" style={{ display: 'block', marginTop: '5px' }}>
                          {errors.description}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Image Upload Section */}
                  <div className="row mb-4">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <label className="form-label secondry-font" style={{
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '10px',
                        fontSize: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaImage size={16} color="#fea257" />
                        Cover Image <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <div style={{
                        border: errors.cover_image ? '2px dashed #dc3545' : '2px dashed #e0e0e0',
                        borderRadius: '15px',
                        padding: '20px',
                        textAlign: 'center',
                        background: preview.cover_image ? 'transparent' : '#fafafa',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!preview.cover_image) {
                          e.currentTarget.style.borderColor = '#fea257';
                          e.currentTarget.style.background = '#fff5eb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!preview.cover_image) {
                          e.currentTarget.style.borderColor = errors.cover_image ? '#dc3545' : '#e0e0e0';
                          e.currentTarget.style.background = '#fafafa';
                        }
                      }}
                      onClick={() => document.getElementById('cover_image').click()}>
                        {preview.cover_image ? (
                          <div>
                            <img 
                              src={preview.cover_image} 
                              alt="Cover preview" 
                              style={{ 
                                maxWidth: '100%',
                                maxHeight: '250px',
                                borderRadius: '10px',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                objectFit: 'cover'
                              }} 
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setData('cover_image', null);
                                setPreview(prev => ({ ...prev, cover_image: null }));
                                document.getElementById('cover_image').value = '';
                              }}
                              style={{
                                marginTop: '10px',
                                padding: '5px 15px',
                                background: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              <FaTimes size={10} style={{ marginRight: '5px' }} />
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <FaImage size={40} color="#fea257" style={{ marginBottom: '10px' }} />
                            <p style={{ margin: '10px 0 5px 0', color: '#666', fontSize: '0.95rem' }}>
                              Click to upload cover image
                            </p>
                            <p style={{ margin: 0, color: '#999', fontSize: '0.85rem' }}>
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          className="d-none"
                          id="cover_image"
                          onChange={(e) => handleImageChange(e, 'cover_image')}
                          accept="image/*"
                        />
                      </div>
                      {errors.cover_image && (
                        <div className="invalid-feedback" style={{ display: 'block', marginTop: '5px' }}>
                          {errors.cover_image}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label secondry-font" style={{
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '10px',
                        fontSize: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaFileImage size={16} color="#fea257" />
                        Back Cover Image
                      </label>
                      <div style={{
                        border: errors.backcover_image ? '2px dashed #dc3545' : '2px dashed #e0e0e0',
                        borderRadius: '15px',
                        padding: '20px',
                        textAlign: 'center',
                        background: preview.backcover_image ? 'transparent' : '#fafafa',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!preview.backcover_image) {
                          e.currentTarget.style.borderColor = '#fea257';
                          e.currentTarget.style.background = '#fff5eb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!preview.backcover_image) {
                          e.currentTarget.style.borderColor = errors.backcover_image ? '#dc3545' : '#e0e0e0';
                          e.currentTarget.style.background = '#fafafa';
                        }
                      }}
                      onClick={() => document.getElementById('backcover_image').click()}>
                        {preview.backcover_image ? (
                          <div>
                            <img 
                              src={preview.backcover_image} 
                              alt="Back Cover preview" 
                              style={{ 
                                maxWidth: '100%',
                                maxHeight: '250px',
                                borderRadius: '10px',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                objectFit: 'cover'
                              }} 
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setData('backcover_image', null);
                                setPreview(prev => ({ ...prev, backcover_image: null }));
                                document.getElementById('backcover_image').value = '';
                              }}
                              style={{
                                marginTop: '10px',
                                padding: '5px 15px',
                                background: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              <FaTimes size={10} style={{ marginRight: '5px' }} />
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <FaFileImage size={40} color="#fea257" style={{ marginBottom: '10px' }} />
                            <p style={{ margin: '10px 0 5px 0', color: '#666', fontSize: '0.95rem' }}>
                              Click to upload back cover image
                            </p>
                            <p style={{ margin: 0, color: '#999', fontSize: '0.85rem' }}>
                              PNG, JPG up to 5MB (Optional)
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          className="d-none"
                          id="backcover_image"
                          onChange={(e) => handleImageChange(e, 'backcover_image')}
                          accept="image/*"
                        />
                      </div>
                      {errors.backcover_image && (
                        <div className="invalid-feedback" style={{ display: 'block', marginTop: '5px' }}>
                          {errors.backcover_image}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Content Editor Section */}
                  <div className="row mb-4">
                    <div className="col-md-12">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label htmlFor="content" className="form-label secondry-font" style={{
                          fontWeight: '600',
                          color: '#333',
                          margin: 0,
                          fontSize: '2rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <FaAlignLeft size={16} color="#fea257" />
                          Story Content <span style={{ color: '#dc3545' }}>*</span>
                        </label>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => setShowHtml(!showHtml)}
                          style={{
                            background: showHtml ? '#fea257' : '#6c757d',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 15px',
                            fontSize: '1.5rem',
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          {showHtml ? 'Switch to Rich Editor' : 'Switch to HTML'}
                        </button>
                      </div>
                      
                      {showHtml ? (
                        <textarea
                          className={`form-control secondry-font ${errors.content ? 'is-invalid' : ''}`}
                          value={data.content}
                          onChange={(e) => setData('content', e.target.value)}
                          rows={15}
                          placeholder="Enter your HTML content here..."
                          style={{
                            padding: '16px 18px',
                            borderRadius: '10px',
                            border: errors.content ? '2px solid #dc3545' : '2px solid #e0e0e0',
                            fontSize: '1.05rem',
                            fontWeight: '500',
                            fontFamily: 'monospace',
                            color: '#333',
                            transition: 'all 0.3s ease',
                            background: '#fafafa',
                            resize: 'vertical',
                            lineHeight: '1.6'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#fea257';
                            e.target.style.background = '#fff';
                            e.target.style.boxShadow = '0 0 0 3px rgba(254, 162, 87, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = errors.content ? '#dc3545' : '#e0e0e0';
                            e.target.style.background = '#fafafa';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      ) : (
                        <div className={errors.content ? 'is-invalid' : ''} style={{
                          borderRadius: '10px',
                          border: errors.content ? '2px solid #dc3545' : '2px solid #e0e0e0',
                          overflow: 'hidden',
                          background: '#fff'
                        }}>
                          <ReactQuill
                            theme="snow"
                            value={data.content}
                            onChange={handleContentChange}
                            style={{ minHeight: '350px' }}
                          />
                        </div>
                      )}
                      {errors.content && (
                        <div className="invalid-feedback" style={{ display: 'block', marginTop: '5px' }}>
                          {errors.content}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="row">
                    <div className="col-12">
                      <div className="d-flex justify-content-end gap-3">
                        <button 
                          type="button"
                          className="btn"
                          onClick={() => router.visit(route('stories.index'))}
                          style={{
                            padding: '12px 20px',
                            borderRadius: '10px',
                            border: '2px solid #6c757d',
                            background: 'transparent',
                            color: '#6c757d',
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#6c757d';
                            e.target.style.color = '#fff';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 5px 15px rgba(108, 117, 125, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = '#6c757d';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn" 
                          disabled={processing}
                          style={{
                            padding: '12px 40px',
                            borderRadius: '10px',
                            background: processing ? '#ccc' : 'linear-gradient(135deg, #fea257 0%, #ff8c42 100%)',
                            border: 'none',
                            color: '#fff',
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            cursor: processing ? 'not-allowed' : 'pointer',
                            boxShadow: processing ? 'none' : '0 5px 20px rgba(254, 162, 87, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => {
                            if (!processing) {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 8px 25px rgba(254, 162, 87, 0.5)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!processing) {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 5px 20px rgba(254, 162, 87, 0.4)';
                            }
                          }}
                        >
                          <FaSave size={16} />
                          {processing ? 'Creating...' : 'Create Story'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CreateStory;

