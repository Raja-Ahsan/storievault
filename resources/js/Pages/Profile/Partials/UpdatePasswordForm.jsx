import CustomInputError from '@/Components/CustomInputError';
import CustomInputLabel from '@/Components/CustomInputLabel';
import CustomButton from '@/Components/CustomButton';
import CustomTextInput from '@/Components/CustomTextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section>
            <header>
                <h2 className="profile-section-title primary-font">
                    Update <span>Password</span>
                </h2>

                <p className="profile-section-description secondry-font">
                    Ensure your account is using a long, random password to stay
                    secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="profile-form">
                <div className="form-group">
                    <CustomInputLabel
                        htmlFor="current_password"
                        value="Current Password"
                    />

                    <CustomTextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        type="password"
                        className="form-control"
                        autoComplete="current-password"
                    />

                    <CustomInputError message={errors.current_password} />
                </div>

                <div className="form-group">
                    <CustomInputLabel htmlFor="password" value="New Password" />

                    <CustomTextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="form-control"
                        autoComplete="new-password"
                    />

                    <CustomInputError message={errors.password} />
                </div>

                <div className="form-group">
                    <CustomInputLabel
                        htmlFor="password_confirmation"
                        value="Confirm New Password"
                    />

                    <CustomTextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password"
                        className="form-control"
                        autoComplete="new-password"
                    />

                    <CustomInputError message={errors.password_confirmation} />
                </div>

                <div className="d-flex align-items-center mt-4">
                    <CustomButton disabled={processing}>
                        Update Password
                    </CustomButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="profile-success-message secondry-font ms-3 mb-0">
                            Password updated!
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
