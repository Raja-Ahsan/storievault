import React from 'react'
import { Head, Link } from '@inertiajs/react'
import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Icons } from '../../../utils/icons';

const Show = ({ story }) => {
  return (
    <DashboardLayout>
      <Head title={`Story: ${story?.title || 'Untitled'}`} />
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Link href={route('user-dashboard.stories.index')}>
                    <button className="btn btn-outline-primary me-2 arrow-redirect-btn">
                      <Icons.ArrowLeft />
                    </button>
                  </Link>
                  <strong>Story Details</strong>
                </div>
                <div className="d-flex gap-2">
                  <Link href={route('user-dashboard.stories.edit', story?.id)}>
                    <button className="btn btn-primary custom-primary-btn" style={{ backgroundColor: '#fea257', borderColor: '#fea257' }}>
                      <Icons.Edit className="me-1" /> Edit Story
                    </button>
                  </Link>
                </div>
              </div>
              <div className="card-body">
                <h2>{story?.title || 'Untitled Story'}</h2>
                <p><strong>Author:</strong> {story?.author || 'Unknown'}</p>
                <p><strong>Genre:</strong> {story?.genre || 'No genre'}</p>
                <p><strong>Status:</strong> {story?.status || 'Draft'}</p>
                <p><strong>Description:</strong> {story?.description || 'No description available'}</p>
                <p><strong>Type:</strong> {story?.is_community ? 'Community Story' : 'Published Story'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Show
