/** @type {import('tailwindcss').Config} */
export default {
  content: {
    relative: true,
    files: ['./index.html', './src/**/*.{ts,tsx}'],
  },
  theme: {
    extend: {
      colors: {
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          700: '#0369a1',
        },
        // Theme-aware surface tokens
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        'surface-active': 'var(--surface-active)',
        'surface-subtle': 'var(--surface-subtle)',
        'surface-faint': 'var(--surface-faint)',
        'sidebar-bg': 'var(--sidebar-bg)',
      },
      borderColor: {
        theme: 'var(--border)',
        'theme-soft': 'var(--border-soft)',
        'theme-active': 'var(--border-active)',
        'theme-sidebar': 'var(--sidebar-border)',
      },
      textColor: {
        theme: 'var(--text)',
        'theme-secondary': 'var(--text-secondary)',
        'theme-muted': 'var(--text-muted)',
        'theme-faint': 'var(--text-faint)',
        'theme-placeholder': 'var(--text-placeholder)',
      },
    },
  },
  plugins: [],
};
