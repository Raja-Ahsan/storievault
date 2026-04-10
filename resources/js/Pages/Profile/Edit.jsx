import CustomAuthenticatedLayout from '@/Layouts/CustomAuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import '../../assets/styles/profile.css';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <CustomAuthenticatedLayout>
            <Head title="Profile" />

            <div className="row">
                <div className="col-lg-8 mx-auto">
                    <div className="profile-card mb-4">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    <div className="profile-card mb-4">
                        <UpdatePasswordForm />
                    </div>

                    <div className="profile-card">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </CustomAuthenticatedLayout>
    );
}
