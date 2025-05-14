import express from 'express';
import { login, register } from '../controllers/userController.js'; // Add register here
import passport from 'passport';
import jwt from 'jsonwebtoken';
// Potentially import userService if findOrCreateUser is not handled solely in passport strategy
// import { findOrCreateUser } from '../services/userService.js';


const router = express.Router();

router.post('/login', login);
router.post('/register', register); // Add this line for the registration endpoint

// Auth0 Login Route - Initiates the Auth0 login flow
router.get('/auth0', passport.authenticate('auth0', {
  scope: ['openid', 'email', 'profile'] // Request necessary scopes from Auth0
}));

// Auth0 Callback Route - Auth0 redirects here after successful authentication
router.get('/auth0/callback',
  passport.authenticate('auth0', { 
    failureRedirect: 'http://localhost:4200/login?error=auth0_failed', // Full frontend URL for failure
    session: false // Recommended if you primarily use JWTs for your API
  }),
  (req, res) => {
    // Authentication successful. req.user contains the Auth0 profile (or your mapped user object).
    // Generate a JWT for your application.
    const userPayload = {
      // Adjust payload based on what's in req.user from Auth0 strategy
      userId: req.user.id || req.user._json?.sub, // Auth0 user ID
      email: req.user.emails && req.user.emails[0] ? req.user.emails[0].value : 'no-email@example.com',
      name: req.user.displayName || req.user.nickname,
      // Add any other relevant user details or roles from your system
    };

    const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Redirect to a frontend route that can handle the token
    // For example, a dedicated callback component or the dashboard.
    // Passing token in URL query is common but consider security implications.
    res.redirect(`http://localhost:4200/auth-callback?token=${token}`); 
    // Ensure you have a frontend route like /auth-callback to process this token.
  }
);

export default router;
