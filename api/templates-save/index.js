const { getDb, getUser } = require('../shared/db');

module.exports = async function (context, req) {
  const user = getUser(req);
  if (!user) {
    context.res = { status: 401, body: { error: 'Not authenticated' } };
    return;
  }

  const { id, name, spoken, text, category, status } = req.body || {};

  if (!name || !spoken || !text) {
    context.res = { status: 400, body: { error: 'name, spoken, and text are required' } };
    return;
  }

  try {
    const db = await getDb();
    const collection = db.collection('templates');
    const now = Date.now();
    const docId = id || ('tpl_' + now + '_' + Math.random().toString(36).slice(2, 6));

    // Upsert — create if doesn't exist, update if it does
    const result = await collection.findOneAndUpdate(
      { _id: docId, userId: user.id },
      {
        $set: {
          name,
          spoken,
          text,
          category: category || 'Uncategorised',
          status: status || 'draft',
          updated: now
        },
        $setOnInsert: {
          _id: docId,
          userId: user.id,
          created: now
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { template: result }
    };
  } catch (err) {
    context.res = { status: 500, body: { error: err.message } };
  }
};
