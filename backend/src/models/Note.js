const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanApplication',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
      maxlength: [2000, 'Note cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
