const { getUser } = require('../shared/db');

module.exports = async function (context, req) {
  const user = getUser(req);

  if (!user) {
    context.res = { status: 401, body: { error: 'Not authenticated' } };
    return;
  }

  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: { user }
  };
};
