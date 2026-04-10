export default function CustomButton({
    className = '',
    disabled,
    children,
    variant = 'primary',
    ...props
}) {
    const baseClass = 'btn text-white transition-all duration-200 fw-medium secondry-font';
    const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

    return (
        <button
            {...props}
            className={
                `${baseClass} ${variantClass} ${disabled ? 'opacity-50' : ''} ${className}`
            }
            disabled={disabled}
            style={{
                boxShadow: disabled ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                padding: '0.5rem 1.25rem',
                fontSize: 'var(--text-16)'
            }}
        >
            {children}
        </button>
    );
}
