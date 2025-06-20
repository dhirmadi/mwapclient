# OAuth Setup Guide for MWAP Cloud Provider Integrations

This guide explains how to set up OAuth for cloud provider integrations in the MWAP application.

## Implementation Details

The OAuth flow in MWAP works as follows:

1. User initiates the OAuth flow by clicking on a cloud provider integration
2. The application redirects to the OAuth provider's authorization page
3. User grants permission to the application
4. OAuth provider redirects back to our callback URL with an authorization code
5. The application creates a new integration with the authorization code and other OAuth-related information stored in the metadata
6. In a production environment, the backend would exchange the authorization code for access and refresh tokens

### Data Structure

When creating a cloud provider integration, the OAuth-related information is stored in the metadata object with the following structure:

```typescript
{
  providerId: string,     // Required: ID of the cloud provider
  status: 'active' | 'expired' | 'revoked' | 'error', // Default: 'active'
  scopesGranted: string[], // Optional: Granted OAuth scopes
  metadata: {
    oauth: {
      accessToken: string,
      refreshToken: string,
      tokenExpiresAt: string, // ISO date string
      authorizationCode: string,
      redirectUri: string
    }
    // Other metadata fields
  }
}
```

This structure ensures that sensitive information is properly stored and can be extracted by the backend as needed.

**Note:** The current implementation simulates token exchange on the frontend. In a production environment, this should be done securely on the backend.

## Dropbox OAuth Configuration

To configure Dropbox OAuth integration:

1. Go to the [Dropbox Developer Console](https://www.dropbox.com/developers/apps)
2. Create a new app or select an existing one
3. Under "OAuth 2", add the following Redirect URI:
   ```
   http://localhost:5173/oauth/callback
   ```
4. Make sure the app has the required permissions (files.content.read, files.content.write, etc.)
5. Copy the App Key (Client ID) and App Secret (Client Secret) to your cloud provider configuration

## Google Drive OAuth Configuration

To configure Google Drive OAuth integration:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Create an OAuth 2.0 Client ID
5. Add the following Authorized Redirect URI:
   ```
   http://localhost:5173/oauth/callback
   ```
6. Make sure the app has the required scopes (https://www.googleapis.com/auth/drive.file, etc.)
7. Copy the Client ID and Client Secret to your cloud provider configuration

## OneDrive OAuth Configuration

To configure OneDrive OAuth integration:

1. Go to the [Microsoft Azure Portal](https://portal.azure.com/)
2. Navigate to "App registrations"
3. Create a new registration or select an existing one
4. Under "Authentication", add a platform and configure the Redirect URI:
   ```
   http://localhost:5173/oauth/callback
   ```
5. Make sure the app has the required API permissions (Files.ReadWrite, etc.)
6. Copy the Application (client) ID and Client Secret to your cloud provider configuration

## Production Configuration

For production environments, update the `.env` file with the appropriate redirect URI:

```
VITE_OAUTH_REDIRECT_URI=https://your-production-domain.com/oauth/callback
```

Make sure to update the redirect URI in each OAuth provider's developer console to match your production URL.