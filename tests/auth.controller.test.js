const httpStatus = require('http-status-codes');
const request = require('supertest');
const app = require('../src/app');
const dbHelper = require('./db-helper');
const Token = require('../src/models/token');

const util = require('../src/utils/index');

jest.mock('../src/utils/index');
/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => dbHelper.connect());

/**
 * Remove and close the db and server.
 */
afterAll(async () => {
  await dbHelper.clearDatabase();
  await dbHelper.closeDatabase();
});

describe('Auth Controller', () => {
  const userLogin = {
    email: 'ogunfusika64@gmail.com',
    password: '12345678'
  };
  let newUser = {
    firstName: 'John',
    lastName: 'Wick',
    role: 'landowner'
  };

  it(`Register: Should return ${httpStatus.CREATED} and confirmation for valid input`, async () => {
    // mock valid user input

    newUser = { ...userLogin, ...newUser };
    // send request to the app
    util.sendEmail = jest.fn();

    const res = await request(app).post('/api/auth/register').send(newUser).expect(httpStatus.CREATED);
    // assertions
    expect(res.body.id).toBeDefined();
    newUser.id = res.body.id;
  });
  it(`Register2: Should return ${httpStatus.CONFLICT} if user already exist`, async () => {
    // mock valid user input

    newUser = { ...userLogin, ...newUser };
    util.sendEmail = jest.fn();

    await request(app).post('/api/auth/register').send(newUser).expect(httpStatus.CONFLICT);
  });
  it(`Login: Should return ${httpStatus.UNAUTHORIZED} for unconfirmed email`, async () => {
    await request(app).post('/api/auth/login').send(userLogin).expect(httpStatus.UNAUTHORIZED);
  });

  it(`VerifyEmail: Should return ${httpStatus.BAD_REQUEST} for incorrect token`, async () => {
    await request(app).get('/api/auth/verify/12345').expect(httpStatus.BAD_REQUEST);
  });

  it(`VerifyEmail: Should return ${httpStatus.OK} for correct token`, async () => {
    const { token } = await Token.findOne({ userId: newUser.id });
    await request(app).get(`/api/auth/verify/${token}`).expect(httpStatus.OK);
  });

  it(`Login: Should return ${httpStatus.OK} confirmed email`, async () => {
    const res = await request(app).post('/api/auth/login').send(userLogin).expect(httpStatus.OK);
    expect(res.body.token).toBeDefined();
    expect(res.body.expiresInMins).toBeDefined();
  });
});
