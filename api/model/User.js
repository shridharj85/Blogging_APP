const mongoose = require('mongoose');
const validator = require('validator');
const UserSchemma = new mongoose.Schema({
    username:{type:String,required:true,minLength:4,unique:true},
    password:{type:String,required:true},

});
const UserModel = mongoose.model('User',UserSchemma);
module.exports = UserModel;