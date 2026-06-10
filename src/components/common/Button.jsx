import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    icon = null,
    iconPosition = 'left',
    className = '',
    ...props
}, ref) => {

    const variants = {
        primary: 'bg-gradient-to-r from-primary-400 via-primary-300 to-primary-400 text-white shadow-gold hover:shadow-gold-lg',
        secondary: 'bg-white text-primary-700 border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300',
        ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 hover:text-primary-700',
        danger: 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/25',
        success: 'bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/25',
        outline: 'bg-transparent border-2 border-primary-500 text-primary-600 hover:bg-primary-50',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl',
    };

    return (
        <motion.button
            ref={ref}
            whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
            disabled={disabled || isLoading}
            className={`
        relative inline-flex items-center justify-center gap-2
        font-semibold rounded-xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            {...props}
        >
            {/* Shimmer effect for primary variant */}
            {variant === 'primary' && !disabled && !isLoading && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'linear', repeatDelay: 2 }}
                />
            )}

            {/* Loading spinner */}
            {isLoading && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}

            {/* Icon left */}
            {icon && iconPosition === 'left' && !isLoading && (
                <span className="flex-shrink-0">{icon}</span>
            )}

            {/* Children */}
            <span className={isLoading ? 'opacity-0' : 'relative z-10'}>{children}</span>

            {/* Icon right */}
            {icon && iconPosition === 'right' && !isLoading && (
                <span className="flex-shrink-0">{icon}</span>
            )}
        </motion.button>
    );
});

Button.displayName = 'Button';

export default Button;
