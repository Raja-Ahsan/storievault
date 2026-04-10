import React from 'react'
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';

const PendingApproval = ({story}) => {
  return (
    <Layout headerClass="inner-header">
      <Head title="Pending Approval Stories" />
      <section className="py-200 ">
        <div className="container mx-auto">
          <div className="mt-16 px-4 text-center under-review-wrapper">
            <h1 className="text-[60px] font-bold text-primary-theme ur-title">Story Under Review</h1>
            <p className="text-[25px] text-gray-700 primary-font max-w-[590px] mx-auto">
              Hi <span className="font-semibold text-[30px] primary-font text-primary-theme">{story.author}</span>, your story titled
              <span className="font-semibold text-[30px] primary-font text-primary-theme"> "{story.title}"</span> is currently under review.
              Once it is approved by our admin team, it will appear on the Community page.
            </p>
          </div>

        </div>
      </section>
    </Layout>
  );
};

export default PendingApproval;
