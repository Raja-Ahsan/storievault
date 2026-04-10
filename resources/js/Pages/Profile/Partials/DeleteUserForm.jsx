import CustomDangerButton from '@/Components/CustomDangerButton';
import CustomInputError from '@/Components/CustomInputError';
import CustomInputLabel from '@/Components/CustomInputLabel';
import CustomModal from '@/Components/CustomModal';
import CustomSecondaryButton from '@/Components/CustomSecondaryButton';
import CustomTextInput from '@/Components/CustomTextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section>
            <header>
                <h2 className="profile-section-title primary-font">
                    Delete <span>Account</span>
                </h2>

                <p className="profile-section-description secondry-font">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <div className="mt-4">
                <CustomDangerButton onClick={confirmUserDeletion}>
                    Delete Account
                </CustomDangerButton>
            </div>

            <CustomModal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="profile-form">
                    <h2 className="profile-section-title primary-font text-center mb-3">
                        Delete <span>Confirmation</span>
                    </h2>

                    <p className="profile-section-description secondry-font">
                        Once your account is deleted, all of its resources and
                        data will be permanently deleted. Please enter your
                        password to confirm you would like to permanently delete
                        your account.
                    </p>

                    <div className="form-group mt-4">
                        <CustomInputLabel
                            htmlFor="password"
                            value="Password"
                        />

                        <CustomTextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="form-control"
                            isFocused
                            placeholder="Enter your password to confirm"
                        />

                        <CustomInputError message={errors.password} />
                    </div>

                    <div className="d-flex justify-content-end gap-3 mt-4">
                        <CustomSecondaryButton onClick={closeModal}>
                            Cancel
                        </CustomSecondaryButton>

                        <CustomDangerButton disabled={processing}>
                            Delete Account
                        </CustomDangerButton>
                    </div>
                </form>
            </CustomModal>
        </section>
    );
}
