const {
  register,
  login,
  updateAvatarImage,
  addContact,
  removeContact,
  getContacts,
} = require("../controllers/userController");

const router = require("express").Router();
const auth = require("../middleware/auth");

router.post("/", register);
router.post("/:username", login);

router.put("/me/avatar", auth, updateAvatarImage);
router.post("/me/contact/:contact_username", auth, addContact);
router.delete("/me/contact/:contact_username", auth, removeContact);
router.get("/me/contact", auth, getContacts);

module.exports = router;
