export default function CustomInputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-danger fs-16 mt-2 secondry-font ' + className}
        >
            {message}
        </p>
    ) : null;
}
