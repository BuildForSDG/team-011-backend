const AccessControl = require('accesscontrol');

const ac = new AccessControl();

exports.roles = (function grantAccess() {
  ac.grant('landowner').readOwn('profile').updateOwn('profile');

  ac.grant('farmer').extend('landowner').readAny('profile');

  ac.grant('admin')
    .extend('landowner')
    .extend('farmer')
    .updateAny('profile')
    .deleteAny('profile');

  return ac;
}());
