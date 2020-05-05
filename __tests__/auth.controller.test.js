const request = require('supertest');
const app = require('../src/app');

describe('User Registration', () => {
  it('Should return 201 and confirmation for valid input', async () => {
    // mock valid user input
    const newUser = {
      firstName: 'John',
      lastName: 'Wick',
      username: 'John Wick',
      email: 'ogunfusika64@gmail.com',
      password: '12345678',
      role: 'landowner'
    };
    // send request to the app
    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser);
    // assertions
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual(`A verification email has been sent to ${newUser.email}.`);
    expect(res.body.errors.length).toEqual(0);
  });
});

describe('User Login', () => {
  it('Should return 201 and confirmation for valid input', async () => {
    // mock valid user input
    const user = {
      email: 'ogunfusika64@gmail.com',
      password: '12345678'
    };
    // send request to the app
    const res = await request(app).post('/api/auth/login').send(user);
    // assertions
    expect(res.statusCode).toEqual(200);
  });
});
