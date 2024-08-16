var express = require("express");
var router = express.Router();
const { createEmbedings } = require("./embeddings");
const Doc = require("../models/docSchema");
const Session = require("../models/sessionSchema");
const Conversation = require("../models/conversationSchema");
var PDFParser = require("pdf2json");
const parser = new PDFParser(this, 1);
const fs = require("fs");
const { MongoClient, ObjectId } = require("mongodb");
const { OpenAI } = require("openai");

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
router.post("/load-document", async (req, res) => {
  try {
    parser.loadPDF("./docs/swathy.pdf");
    parser.on("pdfParser_dataReady", async (data) => {
      await fs.writeFileSync("./context.txt", parser.getRawTextContent());

      const content = await fs.readFileSync("./context.txt", "utf-8");
      const splitContent = content.split("\n");

      console.log(splitContent);

      // for (line of splitContent) {
      //   const embedings = await createEmbedings(line);
      //   await Doc.create({
      //     text: line,
      //     embedding: embedings.data[0].embedding,
      //   });

      // }

      res.json("Done");
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error" });
  }
});

router.post("/conversation", async (req, res) => {
  try {
    let sessionId = req.body.sessionId;

    if (!sessionId) {
      const sessionData = await Session.create({ createdAt: new Date() });
      sessionId = sessionData._id;
    }

    if (sessionId) {
      const sessionData = await Session.findOne({
        _id: new ObjectId(sessionId),
      });
      if (sessionData) {
        sessionId = sessionData._id;
      } else {
        return res.json({
          message: "Session Not Found",
        });
      }
    }

    // Lets work conversation
    const message = req.body.message;
    await Conversation.create({
      sessionId: sessionId, // sessionId should be defined before this
      message: message, // message should be defined before this
      role: "USER", // defaults to "USER", but included for clarity
      createdAt: new Date(), // automatically handled by default
    });

    // Convert message to vector
    console.log(req.body.message);
    const messageVector = await createEmbedings(req.body.message);

    const vectorSearch = await Doc.aggregate([
      {
        $vectorSearch: {
          index: "default",
          path: "embedding",
          queryVector: messageVector.data[0].embedding,
          numCandidates: 150,
          limit: 10,
        },
      },
      {
        $project: {
          _id: 0,
          text: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ]);

    let finalResult = [];

    for await (let doc of vectorSearch) {
      finalResult.push(doc);
    }

    const ai = new OpenAI({
      apiKey: process.env.OPENAIKEY,
    });

    const chat = await ai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a humble helper who can answer for questions asked by users from the given context.",
        },
        {
          role: "user",
          content: `${finalResult.map((doc) => doc.text + "\n")}
          \n
          From the above context, answer the following question: ${message}`,
        },
      ],
    });

    console.log(`${finalResult.map((doc) => doc.text + "\n")}
    \n
    From the above context, answer the following question: ${message}`);

    return res.json(chat.choices[0].message.content);
  } catch (error) {
    res.json({ message: "Something went wrong" });
    console.log(error);
  }
});

module.exports = router;
