import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Reply Guy',
    description: 'AI-powered outreach messages for any profile or page',
    version: '0.1.0',
    permissions: [
      'sidePanel',
      'activeTab',
      'storage',
      'clipboardWrite',
    ],
    side_panel: {
      default_path: 'sidepanel.html',
    },
    action: {
      default_title: 'Open Reply Guy',
    },
  },
});
