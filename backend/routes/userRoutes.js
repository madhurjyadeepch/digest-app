const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router
  .route("/bookmarks")
  .get(userController.getBookmarks)
  .post(userController.saveBookmark);

router.delete("/bookmarks/:bookmarkId", userController.removeBookmark);

router
  .route("/preferences")
  .get(userController.getPreferences)
  .put(userController.updatePreferences);

module.exports = router;
