const dbHelper = require('./helpers/db-helper');
const { User, UserRole } = require('../src/models/user.model');

jest.setTimeout(15000); // in milliseconds

async function seedDbWithUsers() {
  const landowner = {
    firstName: 'user',
    lastName: 'user',
    role: UserRole.Landowner,
    email: 'landowner@gmail.com',
    password: '123456',
    isVerified: true
  };
  const farmer = { ...landowner, email: 'farmer@gmail.com', role: UserRole.Farmer };
  const admin = { ...landowner, email: 'admin@gmail.com', role: UserRole.Admin };
  await new User(landowner).save();
  await new User(farmer).save();
  await new User(admin).save();
}

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => {
  await dbHelper.connect();
  await seedDbWithUsers();
});

/**
 * Remove and close the db and server.
 */
afterAll(async () => {
  await dbHelper.clearDatabase();
  await dbHelper.closeDatabase();
});
