import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill-new';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
} from '@coreui/react';

const themePrimary = '#FEA257';

const defaultFaq = () => ({ question: '', answer: '' });

function toDatetimeLocalValue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const Edit = ({ post, blogCategories = [], blogTags = [], flash }) => {
  const { data, setData, post: submitPost, processing, errors, transform } = useForm({
    _method: 'put',
    title: post.title || '',
    content: post.content || '',
    excerpt: post.excerpt || '',
    meta_title: post.meta_title || '',
    meta_description: post.meta_description || '',
    meta_tags: post.meta_tags || '',
    facebook_meta: post.facebook_meta || '',
    twitter_meta: post.twitter_meta || '',
    post_type: post.post_type || 'general',
    featured: !!post.featured,
    visibility: post.visibility || 'public',
    status: post.status || 'draft',
    scheduled_publish_at: toDatetimeLocalValue(post.scheduled_publish_at),
    faqs: Array.isArray(post.faqs) && post.faqs.length ? post.faqs : [defaultFaq()],
    image: null,
    remove_image: false,
    blog_category_ids: post.blog_category_ids || [],
    blog_tag_ids: post.blog_tag_ids || [],
  });

  transform((form) => ({
    ...form,
    faqs: JSON.stringify(form.faqs || []),
  }));

  const [preview, setPreview] = useState(post.featured_image_url || null);
  const [showHtml, setShowHtml] = useState(false);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ icon: 'success', title: flash.success, timer: 1500, showConfirmButton: false });
    }
  }, [flash]);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    setData('image', file || null);
    setData('remove_image', false);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(post.featured_image_url || null);
  };

  const clearImage = () => {
    setData('image', null);
    setData('remove_image', true);
    setPreview(null);
  };

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

  const submit = (e) => {
    e.preventDefault();
    submitPost(route('admin-dashboard.blog-posts.update', post.id), {
      forceFormData: true,
      preserveScroll: true,
      onError: () => {
        Swal.fire({ icon: 'error', title: 'Check the form for errors', confirmButtonColor: themePrimary });
      },
    });
  };

  return (
    <DashboardLayout>
      <Head title={`Edit: ${post.title}`} />
      <CRow>
        <CCol lg={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Edit blog post</strong>
              <Link href={route('admin-dashboard.blog-posts.index')}>
                <CButton color="secondary" variant="ghost" size="sm">
                  Back to list
                </CButton>
              </Link>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={submit}>
                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel>Title *</CFormLabel>
                    <CFormInput
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      invalid={!!errors.title}
                      feedbackInvalid={errors.title}
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <CFormLabel>Content *</CFormLabel>
                      <CButton type="button" color="secondary" size="sm" onClick={() => setShowHtml(!showHtml)}>
                        {showHtml ? 'Visual editor' : 'HTML'}
                      </CButton>
                    </div>
                    {showHtml ? (
                      <CFormTextarea
                        rows={14}
                        value={data.content}
                        onChange={(e) => setData('content', e.target.value)}
                        invalid={!!errors.content}
                        feedbackInvalid={errors.content}
                      />
                    ) : (
                      <div className={errors.content ? 'border border-danger rounded' : ''}>
                        <ReactQuill theme="snow" value={data.content} onChange={(v) => setData('content', v)} style={{ minHeight: 280, marginBottom: 48 }} />
                      </div>
                    )}
                    {errors.content && <div className="invalid-feedback d-block">{errors.content}</div>}
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormLabel>Excerpt</CFormLabel>
                    <CFormTextarea rows={3} value={data.excerpt} onChange={(e) => setData('excerpt', e.target.value)} />
                  </CCol>
                </CRow>

                <CCard className="mb-3">
                  <CCardHeader>Meta</CCardHeader>
                  <CCardBody>
                    <CRow className="g-3">
                      <CCol md={6}>
                        <CFormLabel>Meta title</CFormLabel>
                        <CFormInput value={data.meta_title} onChange={(e) => setData('meta_title', e.target.value)} />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Meta tags</CFormLabel>
                        <CFormInput value={data.meta_tags} onChange={(e) => setData('meta_tags', e.target.value)} />
                      </CCol>
                      <CCol md={12}>
                        <CFormLabel>Meta description</CFormLabel>
                        <CFormTextarea rows={3} value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} />
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>

                <CCard className="mb-3">
                  <CCardHeader>Social meta</CCardHeader>
                  <CCardBody>
                    <CRow className="g-3">
                      <CCol md={6}>
                        <CFormLabel>Facebook</CFormLabel>
                        <CFormInput value={data.facebook_meta} onChange={(e) => setData('facebook_meta', e.target.value)} />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Twitter / X</CFormLabel>
                        <CFormInput value={data.twitter_meta} onChange={(e) => setData('twitter_meta', e.target.value)} />
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>

                <CCard className="mb-3">
                  <CCardHeader>Schedule publish</CCardHeader>
                  <CCardBody>
                    <p className="text-muted small mb-3">
                      Optional. Leave empty to show the post on the public blog as soon as it is <strong>Published</strong> and <strong>Public</strong>. If you set a date and time, visitors will not see it until then.
                    </p>
                    <CFormLabel>Go live at</CFormLabel>
                    <CFormInput
                      type="datetime-local"
                      value={data.scheduled_publish_at}
                      onChange={(e) => setData('scheduled_publish_at', e.target.value)}
                      invalid={!!errors.scheduled_publish_at}
                      feedbackInvalid={errors.scheduled_publish_at}
                    />
                  </CCardBody>
                </CCard>

                <CCard className="mb-3">
                  <CCardHeader>FAQs</CCardHeader>
                  <CCardBody>
                    <p className="text-muted small mb-3">
                      Optional Q&amp;A pairs shown below the article on the public blog (accordion). Both question and answer are required for a pair to be saved.
                    </p>
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
                          <CFormLabel htmlFor={`blog-edit-faq-q-${index}`}>Question</CFormLabel>
                          <CFormInput
                            id={`blog-edit-faq-q-${index}`}
                            value={faq.question || ''}
                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                            className="mb-2"
                          />
                          <CFormLabel htmlFor={`blog-edit-faq-a-${index}`}>Answer</CFormLabel>
                          <CFormTextarea
                            id={`blog-edit-faq-a-${index}`}
                            value={faq.answer || ''}
                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                            rows={3}
                          />
                        </CCardBody>
                      </CCard>
                    ))}
                    <CButton type="button" color="secondary" size="sm" onClick={addFaq}>
                      + Add FAQ
                    </CButton>
                    {errors.faqs && <div className="text-danger small mt-2">{errors.faqs}</div>}
                  </CCardBody>
                </CCard>

                <CRow className="mb-3 g-3">
                  <CCol md={4}>
                    <CFormLabel>Post type</CFormLabel>
                    <CFormSelect value={data.post_type} onChange={(e) => setData('post_type', e.target.value)}>
                      <option value="general">General</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Visibility</CFormLabel>
                    <CFormSelect value={data.visibility} onChange={(e) => setData('visibility', e.target.value)}>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Status</CFormLabel>
                    <CFormSelect value={data.status} onChange={(e) => setData('status', e.target.value)}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </CFormSelect>
                  </CCol>
                </CRow>

                <CRow className="mb-3 g-3">
                  <CCol md={6}>
                    <CFormLabel>Blog categories</CFormLabel>
                    <select
                      multiple
                      className="form-select"
                      style={{ minHeight: 140 }}
                      value={data.blog_category_ids}
                      onChange={(e) =>
                        setData(
                          'blog_category_ids',
                          Array.from(e.target.selectedOptions).map((o) => String(o.value)),
                        )
                      }
                    >
                      {blogCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Tags</CFormLabel>
                    <select
                      multiple
                      className="form-select"
                      style={{ minHeight: 140 }}
                      value={data.blog_tag_ids}
                      onChange={(e) =>
                        setData(
                          'blog_tag_ids',
                          Array.from(e.target.selectedOptions).map((o) => String(o.value)),
                        )
                      }
                    >
                      {blogTags.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={12}>
                    <CFormCheck
                      id="featured"
                      label="Featured post"
                      checked={data.featured}
                      onChange={(e) => setData('featured', e.target.checked)}
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-4">
                  <CCol md={6}>
                    <CFormLabel>Featured image</CFormLabel>
                    <CFormInput type="file" accept="image/*" onChange={handleImage} invalid={!!errors.image} feedbackInvalid={errors.image} />
                    {(preview || post.featured_image_url) && (
                      <div className="mt-2 d-flex align-items-start gap-2">
                        <img
                          src={preview || post.featured_image_url}
                          alt=""
                          className="rounded"
                          style={{ maxWidth: 240, maxHeight: 160, objectFit: 'cover' }}
                        />
                        <CButton type="button" color="danger" size="sm" variant="outline" onClick={clearImage}>
                          Remove image
                        </CButton>
                      </div>
                    )}
                  </CCol>
                </CRow>

                <div className="d-flex justify-content-end gap-2">
                  <Link href={route('admin-dashboard.blog-posts.index')}>
                    <CButton color="secondary" variant="outline" type="button">
                      Cancel
                    </CButton>
                  </Link>
                  <CButton type="submit" color="primary" disabled={processing} style={{ backgroundColor: themePrimary, borderColor: themePrimary }}>
                    {processing ? 'Saving…' : 'Update post'}
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
