/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      // Enhanced mobile-first breakpoints
      screens: {
        'xs': '375px',
        // sm: 640px (default)
        // md: 768px (default)
        // lg: 1024px (default)
        // xl: 1280px (default)
        '2xl': '1536px',
      },
      // Mobile-optimized spacing
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Touch-friendly minimum sizes
      minHeight: {
        'touch': '44px',
        'touch-lg': '56px',
      },
      minWidth: {
        'touch': '44px',
        'touch-lg': '56px',
      },
      // Mobile-optimized z-index scale
      zIndex: {
        'mobile-nav': '50',
        'modal': '60',
        'toast': '70',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} 