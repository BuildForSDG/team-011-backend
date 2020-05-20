/* eslint-disable no-underscore-dangle */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable newline-per-chained-call */
const httpStatus = require('http-status-codes');
const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models/user.model');

// mock utility functions
jest.mock('../src/utils/index');

async function getAccessToken(loginDto) {
  const { body } = await request(app).post('/api/auth/login').send(loginDto);
  return body.accessToken;
}

describe('LandRequest Controller', () => {
  const userLogin = {
    email: 'farmer@gmail.com',
    password: '123456'
  };

  const newLandRequest = {
    landId: '',
    status: '',
    createdBy: '',
    updatedBy: ''
  };
  beforeEach(() => jest.clearAllMocks());

  describe('Create Land Request', () => {
    let accessToken;

    it(`should return ${httpStatus.UNAUTHORIZED} if user is not signed in`, async () =>
      request(app).post('/api/landrequest').send(newLandRequest).expect(httpStatus.UNAUTHORIZED));

    it(`should return ${httpStatus.FORBIDDEN} if user is NOT a Landowner`, async () => {
      // Login as Farmer
      accessToken = await getAccessToken({ ...userLogin, email: 'farmer@gmail.com' });
      await request(app)
        .post('/api/landrequest')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(newLandRequest)
        .expect(httpStatus.FORBIDDEN);
    });
    it(`should return ${httpStatus.CREATED} if user is a Landowner and uploads photo`, async () => {
      // Login as Landowner
      const farmerEmail = 'farmer@gmail.com';
      accessToken = await getAccessToken({ ...userLogin, email: farmerEmail });

      const res = await request(app)
        .post('/api/landrequest')
        .set({ Authorization: `Bearer ${accessToken}` })
        .field(newLandRequest)
        .expect(httpStatus.CREATED);

      const user = await User.findOne({ email: farmerEmail });
      const { _id, createdBy } = res.body;

      // assertions
      expect(user.id).toBe(createdBy);
      expect(_id).toBeDefined();
      newLandRequest._id = _id;
    });
    it(`should return ${httpStatus.BAD_REQUEST} if input is invalid`, async () => {
      // Still logged in as Landowner
      const res = await request(app)
        .post('/api/landrequest')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send()
        .expect(httpStatus.BAD_REQUEST);

      // assertions
      expect(res.body).toBeTruthy();
      newLandRequest.id = res.body.id;
    });
  });

  // it(`Update: Should return ${httpStatus.UNAUTHORIZED} for unconfirmed email`, async () => {
  //   await request(app).post('/api/auth/login').send(userLogin).expect(httpStatus.UNAUTHORIZED);
  // });
});
