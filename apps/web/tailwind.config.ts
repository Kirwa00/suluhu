import type { Config } from 'tailwindcss';
import { suluhuPreset } from '@suluhu/ui/tailwind-preset';

const config: Config = {
  presets: [suluhuPreset as Partial<Config>],
  content: [
    './src/**/*.{ts,tsx}',
    // Allow shared UI components (added in later milestones) to be scanned.
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  plugins: [require('tailwindcss-animate')],
};

export default config;
