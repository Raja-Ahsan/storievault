export default function CustomCheckbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'form-check-input ' +
                'border-1 rounded-1 ' +
                'checked:bg-primary-theme checked:border-primary-theme ' +
                'focus:ring-primary-theme focus:ring-offset-0 ' +
                className
            }
            style={{ 
                width: '1.2em', 
                height: '1.2em',
                cursor: 'pointer',
                borderColor: '#e2e8f0'
            }}
        />
    );
}
