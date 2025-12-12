module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/firebase',
      handler: 'firebase.authenticate',
      config: {
        policies: [],
        middlewares: [],
        auth: false, // Public endpoint
      },
    },
  ],
};
