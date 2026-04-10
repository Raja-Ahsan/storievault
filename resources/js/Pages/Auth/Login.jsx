import CustomCheckbox from '@/Components/CustomCheckbox';
import CustomInputError from '@/Components/CustomInputError';
import CustomInputLabel from '@/Components/CustomInputLabel';
import CustomButton from '@/Components/CustomButton';
import CustomTextInput from '@/Components/CustomTextInput';
import CustomAuthLayout from '@/Layouts/CustomAuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
// import route from 'ziggy-js';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => {
                reset('password');
                window.location(route('dashboard'));
            },
        });
    };

    return (
        <CustomAuthLayout title="Login to Your">
            <Head title="Log in" />

            {status && (
                <div className="alert alert-success mb-4 fs-18">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="auth-form">
                {/* add back button */}
                {/* the back button should be back to the page where the user came from */}
                {/* <div className="mb-4">
                    <Link href="/" className="btn btn-secondary">Back</Link>
                </div> */}

                <div className="mb-4">
                    <CustomInputLabel htmlFor="email" value="Email Address" />

                    <CustomTextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="form-control mb-2"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <CustomInputError message={errors.email} />
                </div>

                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <CustomInputLabel htmlFor="password" value="Password" />

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-primary-theme fs-16"
                                style={{ fontFamily: 'var(--secondry-font)' }}
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <CustomTextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="form-control mb-2"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <CustomInputError message={errors.password} />
                </div>

                <div className="mb-4">
                    <div className="d-flex align-items-center">
                        <CustomCheckbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 fs-16 secondry-font">
                            Remember me
                        </span>
                    </div>
                </div>

                <div className="d-grid gap-2 mb-4">
                    <CustomButton
                        disabled={processing}
                        className="btn-lg"
                    >
                        Log in
                    </CustomButton>
                </div>

                <div className="text-center">
                    <p className="fs-16 mb-0 secondry-font">
                        Don't have an account?
                        <Link href={route('register')} className="text-primary-theme ms-2 fw-bold">
                            Sign Up
                        </Link>
                    </p>
                </div>
                <div className="text-center my-4">
                    <div className="d-flex align-items-center mb-3">
                        <hr className="flex-grow-1" />
                        <span className="px-3 fs-16 secondry-font text-muted">OR</span>
                        <hr className="flex-grow-1" />
                    </div>
                    <a
                        href={route('google.redirect')}
                        className="google-signin-btn d-flex align-items-center justify-content-center text-decoration-none"
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f8f9fa';
                            e.target.style.borderColor = '#dadce0';
                            e.target.style.boxShadow = '0 1px 1px 0 rgba(65,69,73,.3), 0 1px 3px 1px rgba(65,69,73,.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#fff';
                            e.target.style.borderColor = '#dadce0';
                            e.target.style.boxShadow = 'none';
                        }}
                        onMouseDown={(e) => {
                            e.target.style.backgroundColor = '#f1f3f4';
                            e.target.style.borderColor = '#dadce0';
                        }}
                        onMouseUp={(e) => {
                            e.target.style.backgroundColor = '#f8f9fa';
                            e.target.style.borderColor = '#dadce0';
                        }}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            style={{ marginRight: '8px' }}
                        >
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Sign in with Google
                    </a>
                </div>
            </form>
        </CustomAuthLayout>
    );
}
