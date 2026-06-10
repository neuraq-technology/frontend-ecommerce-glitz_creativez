/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary brand colors - Pink/Magenta palette (#FF64B4)
                primary: {
                    50: '#fff0f7',
                    100: '#ffe3f1',
                    200: '#ffc7e4',
                    300: '#ff9bcb',
                    400: '#ff64b4',
                    500: '#ff389a',
                    600: '#e61d7e',
                    700: '#c20e64',
                    800: '#a10b52',
                    900: '#850d45',
                },
                // Secondary - Cyan/Sky Blue palette (#4cc9f0)
                secondary: {
                    50: '#ecfafd',
                    100: '#d0f3fc',
                    200: '#a6e8fa',
                    300: '#6dd5f6',
                    400: '#4cc9f0',
                    500: '#00aeeb',
                    600: '#008bc4',
                    700: '#006f9d',
                    800: '#005d84',
                    900: '#004d6e',
                },
                // Accent colors
                accent: {
                    gold: '#4cc9f0', // mapped to brand cyan for backward compatibility in styles
                    champagne: '#fff0f7',
                    bronze: '#ff64b4',
                    rose: '#ffc7e4',
                    cream: '#fafcff',
                    honey: '#d0f3fc',
                },
                // Light theme backgrounds - Cool & Modern
                light: {
                    bg: '#fafcff',
                    card: '#ffffff',
                    border: '#e8f7fd',
                    surface: '#fbfdff',
                    hover: '#f3faff',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
                serif: ['Playfair Display', 'Georgia', 'serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.5s ease-out',
                'fade-in': 'fadeIn 0.5s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
                'pulse-gold': 'pulseGold 2s ease-in-out infinite',
                'gradient': 'gradient 8s linear infinite',
                'sparkle': 'sparkle 1.5s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.9)', opacity: 0 },
                    '100%': { transform: 'scale(1)', opacity: 1 },
                },
                bounceSubtle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                pulseGold: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(255, 100, 180, 0.2)' },
                    '50%': { boxShadow: '0 0 40px rgba(255, 100, 180, 0.4)' },
                },
                gradient: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                sparkle: {
                    '0%, 100%': { opacity: 0.5, transform: 'scale(0.8)' },
                    '50%': { opacity: 1, transform: 'scale(1.2)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
                'shimmer': 'linear-gradient(90deg, transparent, rgba(255, 100, 180, 0.15), transparent)',
                'gold-gradient': 'linear-gradient(135deg, #FF64B4, #4cc9f0)',
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 10px 20px -2px rgba(0, 0, 0, 0.03)',
                'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 2px 10px -2px rgba(0, 0, 0, 0.03)',
                'soft-xl': '0 20px 50px -12px rgba(0, 0, 0, 0.12)',
                'gold': '0 4px 20px rgba(255, 100, 180, 0.15)',
                'gold-lg': '0 10px 40px rgba(255, 100, 180, 0.2)',
                'glow-gold': '0 0 30px rgba(76, 201, 240, 0.25)',
                'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                'card-gold': '0 4px 20px rgba(255, 100, 180, 0.08), 0 0 0 1px rgba(255, 100, 180, 0.05)',
            },
        },
    },
    plugins: [],
}
