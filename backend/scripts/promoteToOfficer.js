const mongoose = require('mongoose');
const User = require('../src/models/User');
const config = require('../src/config');

const promoteUser = async () => {
  try {
    const email = process.argv[2];
    if (!email) {
      console.log('Please provide an email. Usage: node promoteToOfficer.js <email>');
      process.exit(1);
    }

    await mongoose.connect(config.mongodbUri);
    console.log('Connected to DB');

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found with email: ${email}`);
      process.exit(1);
    }

    user.role = 'officer';
    await user.save();

    console.log(`Successfully promoted ${user.name} (${user.email}) to officer role.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

promoteUser();
