/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // 新海诚风格的天空色
                sky: {
                    light: '#E8F4F8',
                    DEFAULT: '#B8E1F5',
                    dark: '#89C4E1',
                },
                // 柔和的紫色
                lavender: {
                    light: '#E8D5F2',
                    DEFAULT: '#D4B5E8',
                    dark: '#B895D4',
                },
                // 淡橙色
                peach: {
                    light: '#FFE5D9',
                    DEFAULT: '#FFCDB2',
                    dark: '#FFB088',
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
            },
        },
    },
    plugins: [],
}
