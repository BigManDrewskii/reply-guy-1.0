import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Reply Guy',
    description: 'AI-powered outreach for any page',
    version: '0.3.0',
    action: {
      default_icon: {
        '16': 'icon-16.png',
        '48': 'icon-48.png',
        '128': 'icon-128.png',
      },
    },
    icons: {
      '16': 'icon-16.png',
      '48': 'icon-48.png',
      '128': 'icon-128.png',
    },
    permissions: [
      'activeTab',
      'storage',
      'sidePanel',
      'alarms',
      'notifications',
    ],
  },
});
