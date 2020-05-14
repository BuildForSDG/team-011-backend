const app = require('./app.js');

const port = process.env.NODE_ENV || 1234;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
