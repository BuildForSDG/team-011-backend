const request = require('supertest');
const app = require('../src/app');

describe('Recover Password', () => {
  it('Should return 200 and confirmation for valid input', async () => {
    // mock valid user input
    const newUser = {
      email: 'john@wick.com',
    };
    // send request to the app
    const res = await request(app).post('api/auth/recover').send(newUser);
    // assertions
    expect(res).to.have.status(200);
    expect(res.body.message).to.be.equal(`A reset email has been sent to ${newUser.email}.`);
    expect(res.body.errors.length).to.be.equal(0);
  }).catch((err) => {
    console.log(err.message);
  });
});

describe('Get all Users', () => {
  it('Should return 200 and confirmation for valid input', async () => {
    // mock valid user input
    const user = {
      username: 'John Wick',
      password: 'secret'
    };
    // send request to the app
    const res = await request(app).post('api/admin/user').send(user);
    // assertions
    expect(res).to.have.status(200);
  }).catch((err) => {
    console.log(err.message);
  });
});
