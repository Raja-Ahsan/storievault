import CustomInputError from '@/Components/CustomInputError';
import CustomButton from '@/Components/CustomButton';
import CustomTextInput from '@/Components/CustomTextInput';
import CustomInputLabel from '@/Components/CustomInputLabel';
import CustomAuthLayout from '@/Layouts/CustomAuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <CustomAuthLayout title="Reset Your">
            <Head title="Forgot Password" />

            <div className="mb-4 fs-16 secondry-font">
                Forgot your password? No problem. Just let us know your email
                address and we will email you a password reset link that will
                allow you to choose a new one.
            </div>

            {status && (
                <div className="alert alert-success mb-4 fs-16">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="auth-form">
                <div className="mb-4">
                    <CustomInputLabel htmlFor="email" value="Email Address" />

                    <CustomTextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="form-control mb-2"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <CustomInputError message={errors.email} />
                </div>

                <div className="d-grid gap-2 mb-4">
                    <CustomButton
                        className="btn-lg"
                        disabled={processing}
                    >
                        Email Password Reset Link
                    </CustomButton>
                </div>

                <div className="text-center">
                    <Link
                        href={route('login')}
                        className="text-primary-theme fs-16 fw-bold secondry-font"
                    >
                        Back to Login
                    </Link>
                </div>
            </form>
        </CustomAuthLayout>
    );
}
