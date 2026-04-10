import CustomButton from '@/Components/CustomButton';
import CustomAuthLayout from '@/Layouts/CustomAuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <CustomAuthLayout title="Verify Your">
            <Head title="Email Verification" />

            <div className="mb-4 fs-16 secondry-font">
                Thanks for signing up! Before getting started, could you verify
                your email address by clicking on the link we just emailed to
                you? If you didn't receive the email, we will gladly send you
                another.
            </div>

            {status === 'verification-link-sent' && (
                <div className="alert alert-success mb-4 fs-16">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="auth-form">
                <div className="d-grid gap-2 mb-4">
                    <CustomButton
                        className="btn-lg"
                        disabled={processing}
                    >
                        Resend Verification Email
                    </CustomButton>
                </div>

                <div className="text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-primary-theme fs-16 fw-bold border-0 bg-transparent secondry-font"
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </CustomAuthLayout>
    );
}
