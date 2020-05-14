const app = require('./app.js');

const port = process.env.NODE_ENV || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
