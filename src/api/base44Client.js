import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "69026449f166a85ad347d73b", 
  requiresAuth: true // Ensure authentication is required for all operations
});
