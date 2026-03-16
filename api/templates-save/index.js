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

    if (id) {
      // Update existing — only if it belongs to this user
      const result = await collection.findOneAndUpdate(
        { _id: id, userId: user.id },
        { $set: { name, spoken, text, category: category || 'Uncategorised', status: status || 'draft', updated: now } },
        { returnDocument: 'after' }
      );

      if (!result) {
        context.res = { status: 404, body: { error: 'Template not found' } };
        return;
      }

      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { template: result }
      };
    } else {
      // Create new
      const newId = 'tpl_' + now + '_' + Math.random().toString(36).slice(2, 6);
      const template = {
        _id: newId,
        userId: user.id,
        name,
        spoken,
        text,
        category: category || 'Uncategorised',
        status: status || 'draft',
        created: now,
        updated: now
      };

      await collection.insertOne(template);

      context.res = {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: { template }
      };
    }
  } catch (err) {
    context.res = { status: 500, body: { error: err.message } };
  }
};
