import CustomInputError from '@/Components/CustomInputError';
import CustomInputLabel from '@/Components/CustomInputLabel';
import CustomButton from '@/Components/CustomButton';
import CustomTextInput from '@/Components/CustomTextInput';
import CustomAuthLayout from '@/Layouts/CustomAuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <CustomAuthLayout title="Reset Your">
            <Head title="Reset Password" />

            <form onSubmit={submit} className="auth-form">
                <div className="mb-3">
                    <CustomInputLabel htmlFor="email" value="Email Address" />

                    <CustomTextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="form-control mb-2"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <CustomInputError message={errors.email} />
                </div>

                <div className="mb-3">
                    <CustomInputLabel htmlFor="password" value="New Password" />

                    <CustomTextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="form-control mb-2"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <CustomInputError message={errors.password} />
                </div>

                <div className="mb-4">
                    <CustomInputLabel
                        htmlFor="password_confirmation"
                        value="Confirm New Password"
                    />

                    <CustomTextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="form-control mb-2"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />

                    <CustomInputError message={errors.password_confirmation} />
                </div>

                <div className="d-grid gap-2 mb-4">
                    <CustomButton
                        className="btn-lg"
                        disabled={processing}
                    >
                        Reset Password
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
