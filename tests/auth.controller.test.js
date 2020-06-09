const httpStatus = require("http-status-codes");
const request = require("supertest");
const app = require("../src/app");
const Token = require("../src/models/token");
const util = require("../src/utils/index");

// mock utility functions
jest.mock("../src/utils/index");

describe("Auth Controller", () => {
  const userLogin = {
    email: "ogunfusika64@gmail.com",
    password: "12345678"
  };
  let newUser = {
    firstName: "John",
    lastName: "Wick",
    role: "Landowner"
  };
  beforeEach(() => jest.clearAllMocks());
  // tests
  describe("Registration", () => {
    it(`fresh user: should return ${httpStatus.CREATED} and confirmation for valid input`, async () => {
      newUser = { ...userLogin, ...newUser };
      const res = await request(app).post("/api/auth/register").send(newUser).expect(httpStatus.CREATED);

      expect(res.body.canLogin).toBeDefined();
      // email sending should be called once at most
      expect(util.sendEmail).toBeCalledTimes(1);

      newUser.id = res.body.id;
    });
    it(`existing user: should return ${httpStatus.CONFLICT} and confirmation for valid input`, async () => {
      const input = { ...userLogin, ...newUser };
      delete input.id;

      await request(app).post("/api/auth/register").send(input).expect(httpStatus.CONFLICT);
      // email sending should never be called!
      expect(util.sendEmail).toBeCalledTimes(0);
    });
  });

  it(`Login: Should return ${httpStatus.UNAUTHORIZED} for unconfirmed email`, async () => {
    await request(app).post("/api/auth/login").send(userLogin).expect(httpStatus.UNAUTHORIZED);
  });

  describe("Email verification", () => {
    it(`Should return ${httpStatus.UNAUTHORIZED} for incorrect token`, async () => {
      await request(app).get("/api/auth/verify/12345").expect(httpStatus.UNAUTHORIZED);
    });
    it(`Should resend email verification and return ${httpStatus.OK}`, async () => {
      const { token } = await Token.findOne({ userId: newUser.id });
      await request(app)
        .get("/api/auth/resend")
        .query({ clientUrl: "http://www.google.com", email: newUser.email })
        .expect(httpStatus.OK);

      expect(util.sendEmail).toBeCalledTimes(1);
      const exist = await Token.findOne({ token });
      expect(exist).toBeTruthy();
    });
    it(`Should return ${httpStatus.OK} for correct token`, async () => {
      const { token } = await Token.findOne({ userId: newUser.id });
      await request(app).get(`/api/auth/verify/${token}`).expect(httpStatus.OK);

      const exist = await Token.findOne({ token });
      expect(exist).toBeFalsy();
    });
  });

  it(`Login: Should return ${httpStatus.OK} confirmed email`, async () => {
    const res = await request(app).post("/api/auth/login").send(userLogin).expect(httpStatus.OK);
    expect(res.body.accessToken).toBeDefined();
  });
});
