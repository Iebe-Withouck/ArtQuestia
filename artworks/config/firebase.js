const path = require('path');
const fs = require('fs');

module.exports = ({ env }) => {
  // For local development, try to use service account file
  const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
  
  let config = {
    firebase: {
      projectId: null,
      clientEmail: null,
      privateKey: null,
    },
  };
  
  if (fs.existsSync(serviceAccountPath)) {
    // Local development with service account file
    try {
      const serviceAccount = require(serviceAccountPath);
      config.firebase = {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      };
    } catch (error) {
      console.error('Error loading firebase service account:', error);
    }
  } else {
    // Production/Strapi Cloud - use environment variables
    config.firebase = {
      projectId: env('FIREBASE_PROJECT_ID'),
      clientEmail: env('FIREBASE_CLIENT_EMAIL'),
      privateKey: env('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
    };
  }
  
  return config;
};
