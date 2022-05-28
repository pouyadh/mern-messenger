const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  userCanAddMember: { type: Boolean, default: true },
});

const memberSchema = new mongoose.Schema({
  username: { type: String, required: true },
  role: { type: String, required: true, default: "user" },
});

const messageSchema = new mongoose.Schema(
  {
    body: { type: String, required: true },
    sender: { type: String, required: true },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    settings: { type: settingsSchema },
    members: { type: [memberSchema], required: true },
    messages: { type: [messageSchema] },
    creator: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);
