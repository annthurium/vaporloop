if (process.env.NODE_ENV !== "production") {
  // note: dotenv won't override existing environment variables
  require("dotenv").config();
}

const bodyParser = require("body-parser");
const http = require("http");
const express = require("express");
const airtable = require("airtable");

const app = express();

app.use(bodyParser.json());

app.get("/", (request, response) => {
  response.send(
    "hello world. time is a flat circle. the end is the beginning is the end."
  );
});

const base = new airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

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

// palindromes aren't loops but at least they take you back to the beginning.
const portNumber = process.env.PORT || 8008;

http.createServer(app).listen(portNumber, () => {
  console.log(`express server listening on port ${portNumber}`);
});
