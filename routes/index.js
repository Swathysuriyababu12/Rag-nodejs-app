var express = require("express");
var router = express.Router();
const { createEmbedings } = require("./embeddings");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({ title: "Express" });
});

router.get("/embeddings", async (req, res) => {
  try {
    const embedings = await createEmbedings("Hello World");
    res.json(embedings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ meesage: "Error" });
  }
});
module.exports = router;
