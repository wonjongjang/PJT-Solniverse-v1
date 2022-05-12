const { Schema } = require("mongoose");

const RankSchema = new Schema(
  {
    walletAddress: { type: String, required: true, unique: true },
    sendCount: { type: Number, required: true, default: 0 },
    sendTotal: { type: Number, required: true, default: 0 },
    sendRank: { type: String, required: true, default: "b" },
    receiveCount: { type: Number, required: true, default: 0 },
    receiveTotal: { type: Number, required: true, default: 0 },
    receiveRank: { type: String, required: true, default: "b" },
  },
  { _id: false },
);
module.exports = RankSchema;
