const request = require('supertest');
const app = require('../src/app');

describe('User Registration', () => {
  it('Should return 201 and confirmation for valid input', async () => {
    // mock valid user input
    const newUser = {
      firstName: 'John',
      lastName: 'Wick',
      username: 'John Wick',
      email: 'john@wick.com',
      password: 'secret',
      role: 'landowner'
    };
    // send request to the app
    const res = await request(app)
      .post('api/auth/register')
      .send(newUser);
    // assertions
    expect(res).to.have.status(201);
    expect(res.body.message).to.be.equal(`A verification email has been sent to ${newUser.email}.`);
    expect(res.body.errors.length).to.be.equal(0);
  }).catch((err) => {
    console.log(err.message);
  });
});

describe('User Login', () => {
  it('Should return 201 and confirmation for valid input', async () => {
    // mock valid user input
    const user = {
      username: 'John Wick',
      password: 'secret'
    };
    // send request to the app
    const res = await request(app).post('api/auth/login').send(user);
    // assertions
    expect(res).to.have.status(200);
  }).catch((err) => {
    console.log(err.message);
  });
});
