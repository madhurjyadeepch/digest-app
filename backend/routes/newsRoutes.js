const express = require("express");
const newsController = require("../controllers/newsController");

const router = express.Router();

router.get("/", newsController.getArticles);
router.get("/trending", newsController.getTrending);
router.get("/search", newsController.searchArticles);
router.get("/categories", newsController.getCategories);

router.get("/:id", newsController.getArticleById);

module.exports = router;
