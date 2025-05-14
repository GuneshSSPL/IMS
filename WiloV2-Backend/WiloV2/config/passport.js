import express from 'express'; // Keep if express.Router() was used, but it will be removed.
import passport from 'passport';
import { Strategy as Auth0Strategy } from 'passport-auth0';
import { findOrCreateUser, findUserById } from '../services/userService.js';
// import dotenv from 'dotenv'; // Remove this line

// dotenv.config({ path: process.cwd() + '/WiloV2/.env' }); // Remove this line

const configurePassport = () => {
  // passport.serializeUser and deserializeUser are more for session-based auth.
  // If you're only using JWTs for Auth0 flow, they might not be strictly necessary for /auth/auth0 routes
  // if session: false is used. However, they don't hurt to keep for general passport setup.
  passport.serializeUser((user, done) => {
    done(null, user.id); // Assuming user object from findOrCreateUser has an 'id'
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await findUserById(id); // findUserById should return your app user model
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  passport.use(new Auth0Strategy({
    domain: process.env.AUTH0_DOMAIN, // This should now be populated
    clientID: process.env.AUTH0_CLIENT_ID, // This should now be populated
    clientSecret: process.env.AUTH0_SECRET, // This should now be populated
    callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:5000/auth/auth0/callback',
    state: true
  }, async (accessToken, refreshToken, extraParams, profile, done) => {
    try {
      const userProfileData = { // Map Auth0 profile to your expected structure for findOrCreateUser
        provider: 'auth0',
        providerId: profile.id, // or profile.user_id
        email: profile.emails && profile.emails[0] && profile.emails[0].value,
        name: profile.displayName || (profile.name ? `${profile.name.givenName} ${profile.name.familyName}` : null),
        picture: profile.picture || (profile.photos && profile.photos[0] && profile.photos[0].value)
      };

      if (!userProfileData.email) {
        console.error("Auth0 Profile missing email:", profile);
        return done(new Error("Email not provided by Auth0 profile."), null);
      }
      
      // findOrCreateUser should return your application's user object,
      // including id, email, and RoleName or roleId.
      const appUser = await findOrCreateUser(userProfileData);
      return done(null, appUser); // Pass your application's user object to the callback route
    } catch (err) {
      console.error("Error in Auth0 strategy processing:", err);
      return done(err, null);
    }
  }));
};

export default configurePassport;

// Remove the old router definition from the bottom of this file.
// const router = express.Router(); // REMOVE THIS LINE

// router.get('/auth0/callback', passport.authenticate('auth0', { // REMOVE THIS BLOCK
//   failureRedirect: '/login' 
// }), (req, res) => {
//   res.redirect('http://localhost:4200/dashboard');
// }); // REMOVE THIS BLOCK