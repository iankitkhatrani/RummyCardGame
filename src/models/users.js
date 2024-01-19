const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'game_users';

const GameUserSchema = new Schema(
  {
    id: { type: Number },
    name: { type: String },
    username: { type: String },
    deviceId: { type: String },
    mobileNumber: { type: String, required: true },
    uniqueId: { type: String },
    email: { type: String, default: '' },
    password: { type: String, default: '' },
    chips: { type: Number },
    winningChips: { type: Number },
    bonusChips: { type: Number },
    referralCode: { type: String },
    profileUrl: { type: String, default: 'upload/avatar/1.jpg' },
    deviceType: { type: String, default: 'Android' },
    loginType: { type: String, default: 'phone' },
    flags: {
      isOnline: { type: Number, default: 0 }
    },
    counters: {
      gameWin: { type: Number, default: 0 },
      gameLoss: { type: Number, default: 0 },
      totalMatch: { type: Number, default: 0 },
    },
    blackandwhite: {
      gameWin: { type: Number, default: 0 },
      gameLoss: { type: Number, default: 0 },
      totalMatch: { type: Number, default: 0 },
    },
    aviator: {
      gameWin: { type: Number, default: 0 },
      gameLoss: { type: Number, default: 0 },
      totalMatch: { type: Number, default: 0 },
    },
    tableId: { type: String, default: '' },
    sckId: { type: String },
    status: { type: String, default: '' },
    lastLoginDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now },
    Iscom: { type: Number, default: 0 },
    fcmToken: { type: String, default: '' },
    type: { type: String, default: 'free' },
    verify:{
      mobileno:{ type: Boolean, default: false }
    },
    DOB:{ type: String, default: '' },
    Gender:{ type: String, default: '' },
    Country:{type: String, default: ''}
  },
  { versionKey: false }
);

module.exports = mongoose.model(collectionName, GameUserSchema, collectionName);
