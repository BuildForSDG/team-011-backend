const app = require('./app.js');

const server = app.listen(process.env.PORT || 1234, () => {
  const { port } = server.address();
  // eslint-disable-next-line no-console
  console.log(`App running on port ${port}`);
});
