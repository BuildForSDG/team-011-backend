/* eslint-disable newline-per-chained-call */
/* eslint-disable wrap-iife */
const AccessControl = require("accesscontrol");
const { UserRole } = require("../models/user.model");

const ac = new AccessControl();

exports.roles = (function grantAccess() {
  ac.grant(UserRole.Landowner).readOwn("profile").updateOwn("profile").deleteOwn("profile");
  ac.grant(UserRole.Farmer).extend(UserRole.Landowner);
  ac.grant(UserRole.Admin).extend(UserRole.Landowner).updateAny("profile").deleteAny("profile");

  return ac;
})();
