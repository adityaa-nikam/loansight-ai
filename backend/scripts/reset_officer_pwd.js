const mongoose = require('mongoose');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

async function syncPasswords() {
  await connectDB();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const res = await User.updateMany({ role: 'officer' }, { $set: { passwordHash } });
  console.log(`✅ Updated ${res.modifiedCount || res.matchedCount} officer accounts with password 'Password123!'`);

  const officers = await User.find({ role: 'officer' });
  console.log('\n--- Active Loan Officer Accounts ---');
  officers.forEach((o, i) => {
    console.log(`${i + 1}. Name: ${o.name} | Email: ${o.email} | Role: ${o.role}`);
  });
  console.log('Password for all above accounts: Password123!\n');
  process.exit(0);
}

syncPasswords().catch((err) => {
  console.error(err);
  process.exit(1);
});
