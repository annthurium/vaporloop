if (process.env.NODE_ENV !== "production") {
  // note: dotenv won't override existing environment variables
  require("dotenv").config();
}

const bodyParser = require("body-parser");
const http = require("http");
const express = require("express");
const { getBase, tableName, unsubscribeParticipant } = require("./utils");

const app = express();

app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));

const base = getBase();

// add a new participant to the Airtable base
app.post("/api/participants", (request, response) => {
  base("participants").create(
    [
      {
        fields: request.body,
      },
    ],
    function (error) {
      if (error) {
        console.error("airtable request failed", error);
        response.status(500).send(error);
      } else {
        response.status(200).send("niiice 💟");
      }
    }
  );
});

// this isn't proper RESTful API design
// but you can only GET and POST with twilio studio anyway
// and I'm kind of out of fucks at the moment so YOLO
app.post("/api/participants/unsubscribe", async (request, response) => {
  try {
    await unsubscribeParticipant(request.body.phone, base);
  } catch (error) {
    console.error("airtable request failed", error);
    response.status(500).send(error);
  }
  response.status(200).send("successful unsubscribe");
});

// palindromes aren't loops but at least they take you back to the beginning.
const portNumber = process.env.PORT || 8008;

http.createServer(app).listen(portNumber, () => {
  console.log(`express server listening on port ${portNumber}`);
});
