export default function CustomSecondaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `btn text-white transition-all duration-200 fw-medium secondry-font btn-secondary ${disabled ? 'opacity-50' : ''} ${className}`
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
