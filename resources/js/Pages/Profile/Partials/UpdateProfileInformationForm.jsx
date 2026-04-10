import CustomInputError from '@/Components/CustomInputError';
import CustomInputLabel from '@/Components/CustomInputLabel';
import CustomButton from '@/Components/CustomButton';
import CustomTextInput from '@/Components/CustomTextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section>
            <header>
                <h2 className="profile-section-title primary-font">
                    Profile <span>Information</span>
                </h2>

                <p className="profile-section-description secondry-font">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="profile-form">
                <div className="form-group">
                    <CustomInputLabel htmlFor="name" value="Full Name" />

                    <CustomTextInput
                        id="name"
                        className="form-control"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <CustomInputError message={errors.name} />
                </div>

                <div className="form-group">
                    <CustomInputLabel htmlFor="email" value="Email Address" />

                    <CustomTextInput
                        id="email"
                        type="email"
                        className="form-control"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <CustomInputError message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="alert alert-warning mb-4 fs-16 secondry-font">
                        <p className="mb-2">
                            Your email address is unverified.
                        </p>
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="text-primary-theme fw-bold secondry-font border-0 bg-transparent p-0"
                        >
                            Click here to re-send the verification email.
                        </Link>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 alert alert-success fs-16">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="d-flex align-items-center mt-4">
                    <CustomButton disabled={processing}>
                        Save Changes
                    </CustomButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="profile-success-message secondry-font ms-3 mb-0">
                            Saved successfully!
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
