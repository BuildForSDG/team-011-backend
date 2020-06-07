/* eslint-disable no-underscore-dangle */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable newline-per-chained-call */
const httpStatus = require('http-status-codes');
const request = require('supertest');
const app = require('../src/app');
const { AuctionType, InstallmentType } = require('../src/models/land.model');
const { LandRequest } = require('../src/models/landrequest.model');
const { User } = require('../src/models/user.model');
const { Land, LandStatus } = require('../src/models/land.model');

async function getAccessToken(loginDto) {
  const { body } = await request(app).post('/api/auth/login').send(loginDto);
  return body;
}
async function seedLand(createdBy) {
  return new Land({
    description: 'Lekki',
    price: 34900,
    acres: 35,
    auctionType: AuctionType.Rent,
    installmentType: InstallmentType.Monthly,
    fullLocation: 'Near GRA, Chevron Head Quatres',
    shortLocation: 'Nigeria',
    createdBy
  }).save();
}

describe('Payment Controller', () => {
  const farmerEmail = 'farmer@gmail.com';
  const landownerEmail = 'landowner@gmail.com';
  const userLogin = {
    email: farmerEmail,
    password: '123456'
  };

  let seededLand;
  let farmerToken;
  let seededLandReq;
  let landownerToken;

  beforeAll(async () => {
    const landowner = await User.findOne({ email: 'landowner@gmail.com' });
    const farmer = await User.findOne({ email: 'farmer@gmail.com' });
    seededLand = await seedLand(landowner._id);

    const landReq = await new LandRequest({
      landId: seededLand._id,
      landownerId: landowner._id,
      status: LandStatus.PENDING_PAYMENT,
      createdBy: farmer._id
    }).save();

    seededLandReq = landReq;
    let token = await getAccessToken({ ...userLogin, email: landownerEmail });
    landownerToken = token.accessToken;
    token = await getAccessToken({ ...userLogin, email: farmerEmail });
    farmerToken = token.accessToken;
  });

  beforeEach(() => jest.clearAllMocks());

  const paymentInput = {
    requestId: null,
    metadata: {}
  };
  it(`should return ${httpStatus.BAD_REQUEST} input is invalid`, async () => {
    await request(app)
      .post('/api/payments')
      .set({ Authorization: `Bearer ${farmerToken}` })
      .send(paymentInput)
      .expect(httpStatus.BAD_REQUEST);
  });

  it(`should return ${httpStatus.NOT_FOUND} if land request with ID not found`, async () => {
    paymentInput.requestId = seededLand._id;
    await request(app)
      .post('/api/payments')
      .set({ Authorization: `Bearer ${farmerToken}` })
      .send(paymentInput)
      .expect(httpStatus.NOT_FOUND);
  });
  it(`should return ${httpStatus.FORBIDDEN} if it's a landowner`, async () => {
    paymentInput.requestId = seededLandReq._id;

    await request(app)
      .post('/api/payments')
      .set({ Authorization: `Bearer ${landownerToken}` })
      .send(paymentInput)
      .expect(httpStatus.FORBIDDEN);
  });

  it(`should return ${httpStatus.NOT_ACCEPTABLE} if land status is NOT "PENDING_PAYMENT"`, async () => {
    await request(app)
      .post('/api/payments')
      .set({ Authorization: `Bearer ${farmerToken}` })
      .send(paymentInput)
      .expect(httpStatus.NOT_ACCEPTABLE);
  });
  it(`should return ${httpStatus.CREATED} if land does not exist`, async () => {
    await Land.findOneAndUpdate(
      { _id: seededLand._id },
      { $set: { status: 'PENDING_PAYMENT' } },
      { useFindAndModify: false }
    );
    await request(app)
      .post('/api/payments')
      .set({ Authorization: `Bearer ${farmerToken}` })
      .send(paymentInput)
      .expect(httpStatus.CREATED);
  });
  it(`should return ${httpStatus.NOT_FOUND} if land does not exist`, async () => {
    Land.findOne = jest.fn().mockResolvedValue(null);
    await request(app)
      .post('/api/payments')
      .set({ Authorization: `Bearer ${farmerToken}` })
      .send(paymentInput)
      .expect(httpStatus.NOT_FOUND);
  });
});
