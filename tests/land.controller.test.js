/* eslint-disable no-underscore-dangle */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable newline-per-chained-call */
const httpStatus = require('http-status-codes');
const request = require('supertest');
const fs = require('fs').promises;
const { AuctionType, InstallmentType } = require('../src/models/land.model');
const app = require('../src/app');
const util = require('../src/utils/index');
const { User } = require('../src/models/user.model');
const { Land } = require('../src/models/land.model');
const { LandRequest } = require('../src/models/landrequest.model');

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
    installmentType: InstallmentType.Monthly,
    fullLocation: 'Near GRA, Chevron Head Quatres',
    shortLocation: 'Nigeria'
  };
  beforeEach(() => jest.clearAllMocks());

  describe('Create Land', () => {
    let accessToken;

    it(`should return ${httpStatus.UNAUTHORIZED} if user is not signed in`, async () =>
      request(app).post('/api/lands').send(newLand).expect(httpStatus.UNAUTHORIZED));

    it(`should return ${httpStatus.FORBIDDEN} if user is NOT a Landowner posting`, async () => {
      // Login as Farmer
      accessToken = await getAccessToken({ ...userLogin, email: 'farmer@gmail.com' });
      await request(app)
        .post('/api/lands')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(newLand)
        .expect(httpStatus.FORBIDDEN);
    });
    it(`should return ${httpStatus.CREATED} if user is a Landowner and uploads photo`, async () => {
      const filePath = `${__dirname}/../docs/use-case.jpg`;
      const file = await fs.readFile(filePath);

      // Login as Landowner
      const landownerEmail = 'landowner@gmail.com';
      accessToken = await getAccessToken({ ...userLogin, email: landownerEmail });

      // mock this utility method because we don't want
      // to actually upload files to cloud during test
      const imgUrlAfterUpload = 'https://www.image_url.com';
      const photoRes = {
        secure_url: imgUrlAfterUpload,
        url: imgUrlAfterUpload
      };
      util.uploadImgAndReturnUrl.mockReturnValueOnce(photoRes);

      const res = await request(app)
        .post('/api/lands')
        .attach('photo', file, { filename: 'user-case.jpg' })
        .set({ Authorization: `Bearer ${accessToken}` })
        .field(newLand)
        .expect(httpStatus.CREATED);

      const user = await User.findOne({ email: landownerEmail });
      const { photo, id, createdBy } = res.body;

      // assertions
      expect(util.uploadImgAndReturnUrl).toBeCalledTimes(1);
      expect(photo).toBe(imgUrlAfterUpload);
      expect(user.id).toBe(createdBy);
      expect(id).toBeDefined();
      newLand.id = id;
      newLand.createdBy = createdBy;
    });
    it(`should return ${httpStatus.BAD_REQUEST} if a Landowner uploads non-image file`, async () => {
      const filePath = `${__dirname}/../README.md`;
      const file = await fs.readFile(filePath);

      await request(app)
        .post('/api/lands')
        .attach('photo', file, { filename: 'README.md' })
        .set({ Authorization: `Bearer ${accessToken}` })
        .field(newLand)
        .expect(httpStatus.BAD_REQUEST);
    });
    it(`should return ${httpStatus.BAD_REQUEST} if a Landowner does not upload photo`, async () => {
      await request(app)
        .post('/api/lands')
        .set({ Authorization: `Bearer ${accessToken}` })
        .field(newLand)
        .expect(httpStatus.BAD_REQUEST);
    });
    it(`should return ${httpStatus.BAD_REQUEST} if input is invalid`, async () => {
      // Still logged in as Landowner
      await request(app)
        .post('/api/lands')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
    it("should delete land and all it's associating request", async () => {
      await request(app)
        .delete(`/api/users/${newLand.createdBy}/lands/${newLand.id}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send()
        .expect(httpStatus.OK);

      const land = await Land.findOne({ _id: newLand.id });
      const reqs = await LandRequest.find({ landId: newLand.id });

      expect(land).toBeFalsy();
      expect(reqs.length).toBe(0);
    });
  });
});
