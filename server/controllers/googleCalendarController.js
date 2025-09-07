import User from '../models/User.js';

// Step 1: Get authorization URL with user state
export const getGoogleCalendarAuthURL = async (req, res) => {
  try {
    // Use the same approach as the working test function
    const { google } = await import('googleapis');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const scopes = ['https://www.googleapis.com/auth/calendar'];
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
    
    // Add user ID to state parameter for callback
    const authUrlWithState = `${authUrl}&state=${req.user.id}`;
    
    res.json({ authUrl: authUrlWithState });
  } catch (error) {
    res.status(500).json({ message: 'Error generating auth URL', error: error.message });
  }
};

// Step 2: Handle OAuth callback
export const handleGoogleCalendarCallback = async (req, res) => {
  try {
    const { code, state } = req.query; // state contains user ID
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Create OAuth client (same as working test)
    const { google } = await import('googleapis');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save tokens to user (state contains user ID)
    await User.findByIdAndUpdate(state, {
      'googleCalendar.connected': true,
      'googleCalendar.accessToken': tokens.access_token,
      'googleCalendar.refreshToken': tokens.refresh_token,
      'googleCalendar.tokenExpiry': new Date(tokens.expiry_date),
    });

    // Redirect back to frontend
    res.redirect(`${process.env.CORS_ORIGIN}/settings?calendar=connected`);
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect(`${process.env.CORS_ORIGIN}/settings?calendar=error`);
  }
};

// Check connection status
export const getGoogleCalendarStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('googleCalendar');
    
    res.json({
      connected: user.googleCalendar?.connected || false,
      connectedAt: user.googleCalendar?.tokenExpiry || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking calendar status' });
  }
};

// Disconnect Google Calendar
export const disconnectGoogleCalendar = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      'googleCalendar.connected': false,
      'googleCalendar.accessToken': null,
      'googleCalendar.refreshToken': null,
      'googleCalendar.tokenExpiry': null,
    });

    res.json({ message: 'Google Calendar disconnected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error disconnecting calendar' });
  }
};

// Add to your googleCalendarController.js temporarily
// export const testGoogleAuth = async (req, res) => {
//   try {
//     // Create a simple auth URL without user state
//     const { google } = await import('googleapis');
    
//     const oauth2Client = new google.auth.OAuth2(
//       process.env.GOOGLE_CLIENT_ID,
//       process.env.GOOGLE_CLIENT_SECRET,
//       process.env.GOOGLE_REDIRECT_URI
//     );

//     const scopes = ['https://www.googleapis.com/auth/calendar'];
    
//     const authUrl = oauth2Client.generateAuthUrl({
//       access_type: 'offline',
//       scope: scopes,
//       prompt: 'consent'
//     });

//     res.json({ 
//       testAuthUrl: authUrl,
//       clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + "...",
//       redirectUri: process.env.GOOGLE_REDIRECT_URI
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };