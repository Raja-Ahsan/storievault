import CustomInputError from '@/Components/CustomInputError';
import CustomInputLabel from '@/Components/CustomInputLabel';
import CustomButton from '@/Components/CustomButton';
import CustomTextInput from '@/Components/CustomTextInput';
import CustomAuthLayout from '@/Layouts/CustomAuthLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <CustomAuthLayout title="Confirm Your">
            <Head title="Confirm Password" />

            <div className="mb-4 fs-16 secondry-font">
                This is a secure area of the application. Please confirm your
                password before continuing.
            </div>

            <form onSubmit={submit} className="auth-form">
                <div className="mb-4">
                    <CustomInputLabel htmlFor="password" value="Password" />

                    <CustomTextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="form-control mb-2"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <CustomInputError message={errors.password} />
                </div>

                <div className="d-grid gap-2">
                    <CustomButton
                        className="btn-lg"
                        disabled={processing}
                    >
                        Confirm
                    </CustomButton>
                </div>
            </form>
        </CustomAuthLayout>
    );
}
