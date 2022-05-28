const mongoose = require("mongoose");
const Conversation = require("../model/conversationModel");
const User = require("../model/userModel");
const CONVERSATION_DEFAULT_SETTINGS = {
  userCanAddMember: true,
};
module.exports.createConversation = async (req, res, next) => {
  try {
    const username = req.user.username;
    let { type, settings, members } = req.body;

    if (!type || !members || typeof members !== "object" || !members.length) {
      return res.json({ msg: "members and type are required" }).status(400);
    }
    members = members.filter((member) => member.username !== username);

    const membersInDB = await User.find({
      username: { $in: members.map((member) => member.username) },
    });
    if (membersInDB.length !== members.length) {
      return res.json({ msg: "one or more members not found" }).status(404);
    }

    settings = settings || CONVERSATION_DEFAULT_SETTINGS;
    let messages = [];
    if (type === "group" || type === "channel") {
      messages = [
        {
          sender: "@@server",
          body: JSON.stringify({
            text: `${username} just create this ${type}`,
          }),
        },
      ];
      members.push({ username, role: "admin" });

      if (members.length < 2) {
        return res
          .json({ msg: `a ${type} should have more than 2 members` })
          .status(400);
      }
    } else {
      members.push({ username, role: "user" });

      if (members.length !== 2) {
        return res
          .json({ msg: `a private conversation should have 2 members` })
          .status(400);
      }

      const memberUsernames = members.map((m) => m.username);
      const thisConv = await Conversation.findOne({
        $and: [
          { type: "private" },
          { "members.username": { $all: memberUsernames } },
        ],
      });

      if (thisConv) {
        return res
          .json({ msg: "this conversation already exists" })
          .status(409);
      }
    }

    const conversation = await Conversation.create({
      type,
      creator: username,
      members,
      settings,
      messages,
    });

    if (!conversation) {
      return res.sendStatus(502);
    }
    return res.json({ conversation_id: conversation._id }).status(201);
  } catch (err) {
    next(err);
  }
};

module.exports.removeConversation = async (req, res, next) => {
  try {
    const username = req.user.username;
    const conversation_id = req.params.conversation_id;
    if (!conversation_id) {
      return res.json({ msg: "conversation id needed" }).status(400);
    }

    const conversation = await Conversation.findOne({ _id: conversation_id });
    if (!conversation) {
      return res.json({ msg: "conversation not found" }).status(404);
    }

    if (conversation.type === "private") {
      return res
        .json({ msg: "a private conversation cannot be removed" })
        .status(405);
    } else {
      const userAsMember = conversation.members.find(
        (member) => member.username === username
      );
      if (userAsMember.role !== "admin") {
        return res
          .json({
            msg: `only admins can remove a ${conversation.type}`,
          })
          .status(403);
      }
    }

    const { acknowledged, deletedCount } = await Conversation.deleteOne({
      _id: conversation_id,
    });
    if (!acknowledged || !deletedCount) {
      res.sendStatus(502);
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    next(err);
  }
};

module.exports.editConversation = async (req, res, next) => {
  try {
    const username = req.user.username;
    let { type, settings } = req.body;
    const conversation_id = req.params.conversation_id;
    if (!conversation_id) {
      return res.json({ msg: "conversation id needed" }).status(400);
    }

    const conversation = await Conversation.findOne({ _id: conversation_id });
    if (!conversation) {
      return res.json({ msg: "conversation not found" }).status(404);
    }

    settings = settings || conversation.settings;

    if (conversation.type === "private") {
      return res
        .json({ msg: "a private conversation is not editable" })
        .status(405);
    } else {
      const userAsMember = conversation.members.find(
        (member) => member.username === username
      );
      if (userAsMember.role !== "admin") {
        return res
          .json({ msg: `only admins allowd to edit this ${type}` })
          .status(403);
      }
      if (type === "private") {
        return res
          .json({
            msg: `A ${conversation.type} cannot be converted to a private converstaion`,
          })
          .status(405);
      }
    }

    const { acknowledged, modifiedCount } = await Conversation.updateOne(
      {
        _id: conversation_id,
      },
      { type, settings },
      { upsert: true }
    );
    if (!acknowledged || !modifiedCount) {
      res.sendStatus(502);
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    next(err);
  }
};

module.exports.getConversations = async (req, res, next) => {
  try {
    const username = req.user.username;
    const conversations = await Conversation.find(
      {
        "members.username": username,
      },
      { messages: { $slice: -1 } }
    );
    return res.json(conversations).status(200);
  } catch (err) {
    next(err);
  }
};

module.exports.getConversation = async (req, res, next) => {
  try {
    const username = req.user.username;
    const { conversation_id } = req.params;
    const conversation = await Conversation.findOne({ _id: conversation_id });
    const userAsMember = conversation.members.find(
      (member) => member.username === username
    );
    if (!userAsMember) {
      return res
        .json({ msg: "you are not a member of this conversation" })
        .status(403);
    }
    return res.json(conversation).status(200);
  } catch (err) {
    next(err);
  }
};

module.exports.addMember = async (req, res, next) => {
  try {
    const username = req.user.username;
    const { conversation_id, member_username } = req.params;

    if (!conversation_id || !member_username) {
      return res
        .json({ msg: "conversation_id and member_username required" })
        .status(400);
    }
    const conversation = await Conversation.findOne({
      _id: conversation_id,
    });
    if (!conversation) {
      return res.json({ msg: "conversation not found" }).status(404);
    }

    if (conversation.type === "private") {
      return res
        .json({ msg: "adding member to a private conversation in not allowed" })
        .status(405);
    }

    if (
      conversation.settings.userCanAddMember === false &&
      userAsMember.role !== "admin"
    ) {
      return res.json({
        msg: `only admins can add member to this ${conversation.type}`,
      });
    }

    const memberExists = conversation.members.find(
      (member) => member.username === member_username
    );
    if (memberExists) {
      return res
        .json({ msg: `'${member_username}' is already a member` })
        .status(409);
    }

    const member = await User.findOne({ username: member_username });
    if (!member) {
      return res
        .json({ msg: `username '${member_username}' does not exist` })
        .status(404);
    }

    await Conversation.updateOne(
      { _id: conversation_id },
      { $push: { members: { username: member_username, role: "user" } } }
    );
    return res
      .json({
        msg: "member joined the conversation",
      })
      .status(200);
  } catch (err) {
    next(err);
  }
};

module.exports.removeMember = async (req, res, next) => {
  try {
    const username = req.user.username;
    const { conversation_id, member_username } = req.params;

    if (!conversation_id || !member_username) {
      return res
        .json({ msg: "conversation_id and member_username required" })
        .status(400);
    }
    const conversation = await Conversation.findOne({
      _id: conversation_id,
    });
    if (!conversation) {
      return res.json({ msg: "conversation not found" }).status(404);
    }

    if (conversation.type === "private") {
      return res
        .json({
          msg: "removing member to a private conversation in not allowed",
        })
        .status(405);
    }

    const userAsMember = conversation.members.find(
      (member) => member.username === username
    );
    if (!userAsMember) {
      return res
        .json({ msg: "you are not a member of this conversation" })
        .status(403);
    }

    if (userAsMember.role !== "admin") {
      return res.json({ msg: `only admins can remove a member` }).status(403);
    }

    const memberExists = conversation.members.find(
      (member) => (member.username = member_username)
    );
    if (!memberExists) {
      return res.json({ msg: "member not found" }).status(404);
    }

    await Conversation.updateOne(
      { _id: conversation_id },
      { $pull: { members: { username: member_username } } }
    );
    return res
      .json({
        msg: "member removed",
      })
      .status(200);
  } catch (err) {
    next(err);
  }
};

module.exports.editMember = async (req, res, next) => {
  try {
    const username = req.user.username;
    const { conversation_id, member_username } = req.params;
    const { role } = req.body;

    if (!conversation_id || !member_username) {
      return res
        .json({ msg: "conversation_id and member_username required" })
        .status(400);
    }

    if (!["user", "admin"].includes(role)) {
      return res.json({ msg: "invalid role" }).status(400);
    }

    const conversation = await Conversation.findOne({
      _id: conversation_id,
    });
    if (!conversation) {
      return res.json({ msg: "conversation not found" }).status(404);
    }

    if (conversation.type === "private") {
      return res
        .json({
          msg: "editing member of a private conversation in not allowed",
        })
        .status(405);
    }

    const userAsMember = conversation.members.find(
      (member) => member.username === username
    );
    if (!userAsMember) {
      return res
        .json({ msg: "you are not a member of this conversation" })
        .status(403);
    }

    if (userAsMember.role !== "admin") {
      return res.json({ msg: `only admins can edit a member` }).status(403);
    }

    const memberExists = conversation.members.find(
      (member) => member.username === member_username
    );
    if (!memberExists) {
      return res
        .json({
          msg: `'${member_username}' in not a member of this conversation`,
        })
        .status(404);
    }

    await Conversation.updateOne(
      { _id: conversation_id, "members.username": member_username },
      { $set: { "members.$.role": role } }
    );
    return res
      .json({
        msg: "member edited",
      })
      .status(200);
  } catch (err) {
    next(err);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const username = req.user.username;
    const { conversation_id } = req.params;
    const message = {
      body: JSON.stringify(req.body),
      sender: username,
    };
    if (!conversation_id || !message.body) {
      return res
        .json({ msg: "conversation_id and message are required" })
        .status(400);
    }
    const conversation = await Conversation.findOne({
      _id: conversation_id,
    });
    if (!conversation) {
      return res.json({ msg: "conversation not found" }).status(404);
    }
    const userAsMember = conversation.members.find(
      (member) => member.username === username
    );
    if (!userAsMember) {
      return res
        .json({ msg: "you are not a member of this conversation" })
        .status(403);
    }
    if (conversation.type === "channel" && userAsMember.role !== "admin") {
      return res
        .json({ msg: "only admins can add message to a channel" })
        .status(403);
    }

    const { messages } = await Conversation.findOneAndUpdate(
      { _id: conversation_id },
      { $push: { messages: message } },
      { new: true }
    );
    return res
      .json({ message_id: messages[messages.length - 1]._id })
      .status(200);
  } catch (err) {
    next(err);
  }
};

module.exports.removeMessage = async (req, res, next) => {
  try {
    const username = req.user.username;
    const { conversation_id, message_id } = req.params;
    if (!conversation_id || !message_id) {
      return res
        .json({ msg: "conversation_id and message_id are required" })
        .status(400);
    }
    const conversation = await Conversation.findOne({
      _id: conversation_id,
    });
    if (!conversation) {
      return res.json({ msg: "conversation not found" }).status(404);
    }
    const userAsMember = conversation.members.find(
      (member) => member.username === username
    );
    if (!userAsMember) {
      return res
        .json({ msg: "you are not a member of this conversation" })
        .status(403);
    }

    const message = conversation.messages.find((message) =>
      message._id.equals(message_id)
    );
    if (!message) {
      return res.json({ msg: "message not found" }).status(404);
    }

    if (conversation.type === "private") {
      if (message.sender !== username) {
        return res
          .json({ msg: "you are not allowed to remove this message" })
          .status(403);
      }
    } else {
      if (message.sender !== username && userAsMember.role !== "admin") {
        return res
          .json({ msg: "only admins can remove other's message" })
          .status(403);
      }
    }

    const { acknowledged, modifiedCount } = await Conversation.updateOne(
      { _id: conversation_id },
      { $pull: { messages: { _id: message_id } } }
    );
    if (!acknowledged || !modifiedCount) {
      return res.sendStatus(502);
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

module.exports.updateMessage = async (req, res, next) => {
  try {
    const username = req.user.username;
    const { conversation_id, message_id } = req.params;
    if (!conversation_id || !message_id || !req.body) {
      return res
        .json({
          msg: "conversation_id and message_id and message are required",
        })
        .status(400);
    }
    const conversation = await Conversation.findOne({
      _id: conversation_id,
    });
    if (!conversation) {
      return res.json({ msg: "conversation not found" }).status(404);
    }
    const userAsMember = conversation.members.find(
      (member) => member.username === username
    );
    if (!userAsMember) {
      return res
        .json({ msg: "you are not a member of this conversation" })
        .status(403);
    }
    const message = conversation.messages.find((message) =>
      message._id.equals(message_id)
    );

    if (message.sender !== username) {
      return res
        .json({ msg: "you are not allowed to edit this message" })
        .status(403);
    }

    const { acknowledged, modifiedCount } = await Conversation.updateOne(
      { _id: conversation_id, "messages._id": message_id },
      {
        $set: {
          "messages.$.body": JSON.stringify(req.body),
          "messages.$.edited": true,
        },
      }
    );
    if (!acknowledged || !modifiedCount) {
      return res.sendStatus(502);
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
