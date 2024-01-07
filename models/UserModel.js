const mongoose = require('mongoose');

userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'User must have a name'] },
  email: {
    type: String,
    required: [true, 'User must have a email'],
    unique: [true, 'Same is already exist'],
    lowercase: true,
  },
  photo: { type: String },
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: 8,
  },
  confirmPassword: {
    type: String,
    required: [true, 'User must confirm its password'],
    minlength: 8,
    //This is only works on create() and save() methods
    validate:{
      validator: function(el){
        return el === this.password
      }
    }
  },
});

module.exports = {
  schema: userSchema,
  UserModel: mongoose.model('Users', userSchema),
};
