/* eslint-disable no-underscore-dangle */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable newline-per-chained-call */
const httpStatus = require('http-status-codes');
const request = require('supertest');
const app = require('../src/app');
const { AuctionType, InstallmentType } = require('../src/models/land.model');
const { User } = require('../src/models/user.model');
const { Land } = require('../src/models/land.model');

// mock utility functions
jest.mock('../src/utils/index');

async function getAccessToken(loginDto) {
  const { body } = await request(app).post('/api/auth/login').send(loginDto);
  return body;
}
async function seedLand() {
  const res = await User.findOne({ email: 'landowner@gmail.com' });
  const land = {
    description: 'Lekki',
    price: 34900,
    acres: 35,
    auctionType: AuctionType.Rent,
    installmentType: InstallmentType.Monthly,
    fullLocation: 'Near GRA, Chevron Head Quatres',
    shortLocation: 'Nigeria',
    createdBy: res.id
  };

  const newLand = await new Land(land).save();
  return newLand;
}

describe('LandRequest Controller', () => {
  const userLogin = {
    email: 'farmer@gmail.com',
    password: '123456'
  };

  const newLandRequest = {
    landId: ''
  };
  let seededLand;

  beforeAll(async () => {
    seededLand = await seedLand();
    newLandRequest.landId = seededLand.id;
  });

  beforeEach(() => jest.clearAllMocks());

  let token;
  describe('Create Land Request', () => {
    it(`should return ${httpStatus.UNAUTHORIZED} if user is not signed in`, async () =>
      request(app).post('/api/land_requests').send(newLandRequest).expect(httpStatus.UNAUTHORIZED));

    it(`should return ${httpStatus.FORBIDDEN} if user is NOT a Farmer but trying to make a land request`, async () => {
      // Login as Landowner
      const { accessToken } = await getAccessToken({ ...userLogin, email: 'landowner@gmail.com' });
      await request(app)
        .post('/api/land_requests')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(newLandRequest)
        .expect(httpStatus.FORBIDDEN);
    });
    it(`should return ${httpStatus.CREATED} if user is a Farmer`, async () => {
      // Login as farmer
      const farmerEmail = 'farmer@gmail.com';
      const { accessToken } = await getAccessToken({ ...userLogin, email: farmerEmail });

      const res = await request(app)
        .post('/api/land_requests')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(newLandRequest)
        .expect(httpStatus.CREATED);

      const user = await User.findOne({ email: farmerEmail });
      const { id, createdBy } = res.body;

      expect(user.id).toBe(createdBy);
      expect(id).toBeDefined();
      newLandRequest.id = id;
      token = accessToken;
    });
    it(`should return ${httpStatus.BAD_REQUEST} if input is invalid`, async () => {
      await request(app)
        .post('/api/land_requests')
        .set({ Authorization: `Bearer ${token}` })
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('Get Land Request', () => {
    it(`should return ${httpStatus.FORBIDDEN} if landowner tries to get land request`, async () => {
      const { accessToken } = await getAccessToken({ ...userLogin, email: 'landowner@gmail.com' });
      await request(app)
        .get('/api/land_requests')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(httpStatus.FORBIDDEN);
    });
    it(`should return ${httpStatus.OK} if Farmer gets own land-request`, async () => {
      const { accessToken, id } = await getAccessToken({ ...userLogin, email: 'farmer@gmail.com' });
      await request(app)
        .get(`/api/users/${id}/land_requests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(httpStatus.OK);
    });
  });
});
