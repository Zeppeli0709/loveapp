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
          primary: {
            light: '#ffb6c1', // 浅粉色
            DEFAULT: '#ff6b81', // 粉红色
            dark: '#ff4757', // 深粉色
          },
          love: {
            100: '#ffe0e6',
            200: '#ffb6c1',
            300: '#ff8c9d',
            400: '#ff6b81',
            500: '#ff4757',
            600: '#e83a5a',
            700: '#d42f50',
            800: '#c12646',
            900: '#a91c3c',
          }
        },
      },
    },
    plugins: [require('daisyui')],
    daisyui: {
      themes: [
        {
          loveTheme: {
            primary: '#ff6b81',
            secondary: '#ffe0e6',
            accent: '#d42f50',
            neutral: '#3d4451',
            'base-100': '#ffffff',
            'base-200': '#f9fafb',
            'base-300': '#f3f4f6',
          },
        },
      ],
    },
  }