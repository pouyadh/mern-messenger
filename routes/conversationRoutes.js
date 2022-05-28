const {
  createConversation,
  removeConversation,
  editConversation,
  getConversations,
  getConversation,
  addMember,
  removeMember,
  editMember,
  addMessage,
  removeMessage,
  updateMessage,
} = require("../controllers/conversationController");

const router = require("express").Router();

router.post("/", createConversation);
router.delete("/:conversation_id", removeConversation);
router.patch("/:conversation_id", editConversation);
router.get("/", getConversations);
router.get("/:conversation_id", getConversation);

router.post("/:conversation_id/member/:member_username", addMember);
router.delete("/:conversation_id/member/:member_username", removeMember);
router.patch("/:conversation_id/member/:member_username", editMember);

router.post("/:conversation_id/message", addMessage);
router.delete("/:conversation_id/message/:message_id", removeMessage);
router.put("/:conversation_id/message/:message_id", updateMessage);

module.exports = router;
