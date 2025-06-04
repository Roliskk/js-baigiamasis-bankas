const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  personalId: {
    type: String,
    required: true,
    unique: true
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  passportCopy: {
    type: String
  }
});

module.exports = mongoose.model('Account', AccountSchema);
