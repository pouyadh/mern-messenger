const Conversation = require("../model/conversationModel");
exports.handleJoin = function () {
  const username = this.data.auth.username;

  const joinUser = async () => {
    const userConversations = await Conversation.find({
      "members.username": username,
    });
    userConversations
      .map((c) => c._id.toString())
      .forEach((convId) => {
        this.join(convId);
      });
  };

  joinUser();

  console.log(`s#(${username}) joined`);
};

exports.handleDisconnect = function () {
  console.log(this.rooms);
  console.log(`user ${this.data?.auth?.username} disconnected`.red);
};

exports.handleMessage = function ({ conversationId, message }) {
  console.log(message);
  this.to(conversationId).emit("msg", message);
  console.log(
    `s#(${this.id}) sent m(${message}) to c#(${conversationId})`.grey
  );
};
