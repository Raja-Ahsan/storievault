export default function CustomInputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `d-block mb-2 fs-16 fw-medium light-black secondry-font ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
