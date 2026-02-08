import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Reply Guy',
    description: 'AI-powered outreach for any page',
    version: '0.1.0',
    action: {},  // REQUIRED: empty action enables openPanelOnActionClick
    permissions: [
      'activeTab',
      'storage',
    ],
  },
});
