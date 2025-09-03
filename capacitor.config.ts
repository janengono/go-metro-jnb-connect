import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c8beb46500e9474cad0f2c01a4d02b7c',
  appName: 'go-metro-jnb-connect',
  webDir: 'dist',
  server: {
    url: 'https://c8beb465-00e9-474c-ad0f-2c01a4d02b7c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;