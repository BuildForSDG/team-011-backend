const httpStatus = require('http-status-codes');
const request = require('supertest');
const app = require('../src/app');
const dbHelper = require('./db-helper');

const util = require('../src/utils/index');

jest.mock('../src/utils/index');
/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => dbHelper.connect());

/**
 * Clear all test data after every test.
 */
// afterEach(async () => dbHelper.clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => {
  await dbHelper.clearDatabase();
  await dbHelper.closeDatabase();
});

describe('Land Controller', () => {
  const userLogin = {
    email: 'g.t.devguy001@gmail.com',
    password: 'test@12345'
  };
  let newLand = {
    descriptionOfLand: 'Lekki',
    locationOfLand: 'Ajah',
    imageUrl: 'John Wick',
    userId: '5eb94bab920a8122009a9664',
    priceOfLand: 300,
    auctionType: 'Rent',
    currency: 'USD',
    titleOfLand: 'Lekki Gardens'
  };

  it('Create Land: Should return 201', async () => {
    // and a success message, when only authorized role creats a new land
    newLand = { ...userLogin, ...newLand };
    // send request to the app
    util.sendEmail = jest.fn();

    const res = await request(app).post('/api/land').send(newLand).expect(httpStatus.CREATED);
    // assertions
    expect(res.body).toBeTruthy();
    newLand.id = res.body.id;
  });
  it(`Update: Should return ${httpStatus.UNAUTHORIZED} for unconfirmed email`, async () => {
    await request(app).post('/api/auth/login').send(userLogin).expect(httpStatus.UNAUTHORIZED);
  });

  // it(`VerifyEmail: Should return ${httpStatus.BAD_REQUEST} for incorrect token`, async () => {
  //   await request(app).get('/api/auth/verify/12345').expect(httpStatus.BAD_REQUEST);
  // });

  // it(`VerifyEmail: Should return ${httpStatus.OK} for correct token`, async () => {
  //   const { token } = await Token.findOne({ userId: newLand.id });
  //   await request(app).get(`/api/auth/verify/${token}`).expect(httpStatus.OK);
  // });

  // it(`Login: Should return ${httpStatus.OK} confirmed email`, async () => {
  //   const res = await request(app).post('/api/auth/login').send(userLogin).expect(httpStatus.OK);
  //   expect(res.body).toBeDefined();
  // });
});
