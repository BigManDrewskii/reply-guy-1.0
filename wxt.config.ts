import {defineConfig} from 'wxt';
import react from '@vitejs/plugin-react';

// See https://wxt.dev/api/config.html
export default defineConfig({
    manifest: {
        permissions: ["activeTab", "scripting", "sidePanel", "storage", "tabs"],
        host_permissions: ["https://x.com/*", "https://twitter.com/*", "https://www.linkedin.com/*"],
        action: {},
        name: '__MSG_extName__',
        description: '__MSG_extDescription__',
        default_locale: "en",
        commands: {
            "toggle-side-panel": {
                suggested_key: {
                    default: "Ctrl+Shift+R",
                    mac: "Command+Shift+R"
                },
                description: "Toggle Reply Guy side panel"
            }
        }
    },
    vite: () => ({
        plugins: [react()],
    }),
});
