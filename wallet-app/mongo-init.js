db.createUser({
  user: 'wallet',
  pwd: 'wallet',
  roles: [
    {
      role: 'dbOwner',
      db: 'wallet-api',
    },
  ],
});
