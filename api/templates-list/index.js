const { getDb, getUser } = require('../shared/db');

module.exports = async function (context, req) {
  const user = getUser(req);
  if (!user) {
    context.res = { status: 401, body: { error: 'Not authenticated' } };
    return;
  }

  try {
    const db = await getDb();
    const templates = await db.collection('templates')
      .find({ userId: user.id })
      .sort({ updated: -1 })
      .toArray();

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { templates }
    };
  } catch (err) {
    context.res = { status: 500, body: { error: err.message } };
  }
};
