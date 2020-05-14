/* eslint-disable newline-per-chained-call */
/* eslint-disable wrap-iife */
const AccessControl = require('accesscontrol');
const { UserRole } = require('../models/user.model');

const ac = new AccessControl();

exports.roles = (function grantAccess() {
  ac.grant(UserRole.Landowner).readOwn('profile').updateOwn('profile');
  ac.grant(UserRole.Farmer).extend(UserRole.Landowner).readAny('profile');
  ac.grant(UserRole.Admin).extend(UserRole.Landowner).extend(UserRole.Farmer).updateAny('profile').deleteAny('profile');

  return ac;
})();
