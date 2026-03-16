const { getDb, getUser } = require('../shared/db');

module.exports = async function (context, req) {
  const user = getUser(req);
  if (!user) {
    context.res = { status: 401, body: { error: 'Not authenticated' } };
    return;
  }

  const { id } = req.body || {};
  if (!id) {
    context.res = { status: 400, body: { error: 'id is required' } };
    return;
  }

  try {
    const db = await getDb();
    const result = await db.collection('templates').deleteOne({ _id: id, userId: user.id });

    if (result.deletedCount === 0) {
      context.res = { status: 404, body: { error: 'Template not found' } };
      return;
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true }
    };
  } catch (err) {
    context.res = { status: 500, body: { error: err.message } };
  }
};
