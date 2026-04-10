import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function CustomTextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'form-control w-100 p-3 rounded-3 border ' +
                'transition-all duration-200 fs-16 secondry-font ' +
                className
            }
            style={{
                boxShadow: 'none'
            }}
            ref={localRef}
        />
    );
});
