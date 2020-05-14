/* eslint-disable no-underscore-dangle */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable newline-per-chained-call */
const httpStatus = require('http-status-codes');
const request = require('supertest');
const fs = require('fs').promises;
const { AuctionType, Currency, InstallmentType } = require('../src/models/land.model');
const app = require('../src/app');
const util = require('../src/utils/index');
const { User } = require('../src/models/user.model');

// mock utility functions
jest.mock('../src/utils/index');

async function getAccessToken(loginDto) {
  const { body } = await request(app).post('/api/auth/login').send(loginDto);
  return body.accessToken;
}

describe('Land Controller', () => {
  const userLogin = {
    email: 'landowner@gmail.com',
    password: '123456'
  };

  const newLand = {
    description: 'Lekki',
    price: 34900,
    acres: 35,
    auctionType: AuctionType.Rent,
    currency: Currency.NGN,
    installmentType: InstallmentType.Monthly,
    title: 'Lekki Gardens',
    fullLocation: 'Near GRA, Chevron Head Quatres',
    shortLocation: 'Nigeria'
  };
  beforeEach(() => jest.clearAllMocks());

  describe('Create Land', () => {
    let accessToken;

    it(`should return ${httpStatus.UNAUTHORIZED} if user is not signed in`, async () =>
      request(app).post('/api/land').send(newLand).expect(httpStatus.UNAUTHORIZED));

    it(`should return ${httpStatus.FORBIDDEN} if user is NOT a Landowner`, async () => {
      // Login as Farmer
      accessToken = await getAccessToken({ ...userLogin, email: 'farmer@gmail.com' });
      await request(app)
        .post('/api/land')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(newLand)
        .expect(httpStatus.FORBIDDEN);
    });
    it(`should return ${httpStatus.CREATED} if user is a Landowner and uploads image file`, async () => {
      const filePath = `${__dirname}/../docs/use-case.jpg`;
      const file = await fs.readFile(filePath);

      // Login as Landowner
      const landownerEmail = 'landowner@gmail.com';
      accessToken = await getAccessToken({ ...userLogin, email: landownerEmail });

      // mock this utility method because we don't want
      // to actually upload files to cloud during test
      const imgUrlAfterUpload = 'https://www.image_url.com';
      util.uploadImgAndReturnUrl.mockReturnValueOnce(imgUrlAfterUpload);

      const res = await request(app)
        .post('/api/land')
        .attach('landImage', file, { filename: 'user-case.jpg' })
        .set({ Authorization: `Bearer ${accessToken}` })
        .field(newLand)
        .expect(httpStatus.CREATED);

      const user = await User.findOne({ email: landownerEmail });
      const { imageUrl, _id, createdBy } = res.body;

      // assertions
      expect(util.uploadImgAndReturnUrl).toBeCalledTimes(1);
      expect(imageUrl).toBe(imgUrlAfterUpload);
      expect(user.id).toBe(createdBy);
      expect(_id).toBeDefined();
      newLand._id = _id;
    });
    it(`should return ${httpStatus.BAD_REQUEST} if a Landowner uploads non-image file`, async () => {
      const filePath = `${__dirname}/../README.md`;
      const file = await fs.readFile(filePath);
      const wrongImageLand = { ...newLand };
      delete wrongImageLand.id;
      await request(app)
        .post('/api/land')
        .attach('landImage', file, { filename: 'README.md' })
        .set({ Authorization: `Bearer ${accessToken}` })
        .field(wrongImageLand)
        .expect(httpStatus.BAD_REQUEST);
    });
    it(`should return ${httpStatus.BAD_REQUEST} if input is invalid`, async () => {
      // Still logged in as Landowner
      const res = await request(app)
        .post('/api/land')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send()
        .expect(httpStatus.BAD_REQUEST);

      // assertions
      expect(res.body).toBeTruthy();
      newLand.id = res.body.id;
    });
  });

  // it(`Update: Should return ${httpStatus.UNAUTHORIZED} for unconfirmed email`, async () => {
  //   await request(app).post('/api/auth/login').send(userLogin).expect(httpStatus.UNAUTHORIZED);
  // });
});
