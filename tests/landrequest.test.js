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
  const landownerEmail = 'landowner@gmail.com';
  const farmerEmail = 'farmer@gmail.com';

  describe('Create Land Request', () => {
    it(`should return ${httpStatus.UNAUTHORIZED} if user is not signed in`, async () =>
      request(app).post('/api/land_requests').send(newLandRequest).expect(httpStatus.UNAUTHORIZED));

    it(`should return ${httpStatus.FORBIDDEN} if user is NOT a Farmer but trying to make a land request`, async () => {
      const { accessToken } = await getAccessToken({ ...userLogin, email: landownerEmail });
      await request(app)
        .post('/api/land_requests')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(newLandRequest)
        .expect(httpStatus.FORBIDDEN);
    });

    it(`should return ${httpStatus.NOT_FOUND} if landId is invalid`, async () => {
      // Login as farmer
      const { accessToken } = await getAccessToken({ ...userLogin, email: farmerEmail });
      const input = { landId: seededLand.createdBy };

      await request(app)
        .post('/api/land_requests')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(input)
        .expect(httpStatus.NOT_FOUND);
    });
    it(`should return ${httpStatus.CREATED} if user is a Farmer`, async () => {
      // Login as farmer
      const { accessToken } = await getAccessToken({ ...userLogin, email: farmerEmail });

      const res = await request(app)
        .post('/api/land_requests')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(newLandRequest)
        .expect(httpStatus.CREATED);

      const user = await User.findOne({ email: farmerEmail });
      const land = await Land.findOne({ _id: newLandRequest.landId });
      const { id, createdBy } = res.body;

      expect(user.id).toBe(createdBy);
      expect(land.requests.length).toBeGreaterThan(0);
      expect(land.requests[0].toString()).toEqual(id.toString());
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
    it(`should return ${httpStatus.FORBIDDEN} if non landowner tries to get request to a land`, async () => {
      const { accessToken } = await getAccessToken({ ...userLogin, email: farmerEmail });
      await request(app)
        .get('/api/land_requests/requests_to_landowner')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(httpStatus.FORBIDDEN);
    });
    it(`should return ${httpStatus.OK} if Landowner gets requests made to their lands`, async () => {
      const { accessToken } = await getAccessToken({ ...userLogin, email: landownerEmail });
      await request(app)
        .get('/api/land_requests/requests_to_landowner')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(httpStatus.OK);
    });

    it(`should return ${httpStatus.OK} if Farmer gets own land requests`, async () => {
      const { accessToken } = await getAccessToken({ ...userLogin, email: farmerEmail });
      await request(app)
        .get('/api/land_requests/farmer_land_requests')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(httpStatus.OK);
    });
    it(`should return ${httpStatus.OK} if farmer deletes request and should also be removed from land`, async () => {
      const { accessToken } = await getAccessToken({ ...userLogin, email: farmerEmail });
      await request(app)
        .delete(`/api/land_requests/farmer_land_requests/${newLandRequest.id}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(httpStatus.OK);
      const land = await Land.findOne({ _id: newLandRequest.landId });
      const index = land.requests.indexOf(newLandRequest.id);

      expect(index).toBe(-1);
    });
  });
});
