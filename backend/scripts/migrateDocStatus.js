const mongoose = require('mongoose');
const config = require('../src/config');

async function migrate() {
  await mongoose.connect(config.mongodbUri);
  console.log('Connected to DB');

  const result = await mongoose.connection.db.collection('documents').updateMany(
    { status: 'pending_analysis' },
    { $set: { status: 'pending_review' } }
  );

  console.log('Updated', result.modifiedCount, 'documents from pending_analysis to pending_review');
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
