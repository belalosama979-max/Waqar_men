import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.waqar.app',
  appName: 'وقار',
  webDir: 'out',
  backgroundColor: '#050a07',
  android: {
    // keeps the WebView dark while it boots, no white flash
    backgroundColor: '#050a07',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2500, // safety net; the app hides it as soon as the first screen paints
      backgroundColor: '#050a07',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    SystemBars: {
      style: 'DARK', // light status/navigation icons over the dark app
      insetsHandling: 'css', // exposes --safe-area-inset-* to the page
    },
  },
};

export default config;
