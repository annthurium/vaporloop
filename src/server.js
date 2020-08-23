if (process.env.NODE_ENV !== "production") {
  // note: dotenv won't override existing environment variables
  require("dotenv").config();
}

const http = require("http");
const express = require("express");
const airtable = require("airtable");

const app = express();

// you don't actually need body-parser to parse url encoded bodies these days. dope!
app.use(express.urlencoded());

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
        fields: {
          Phone: request.body.phoneNumber,
          Name: request.body.name,
        },
      },
    ],
    function (error) {
      if (error) {
        console.log(error);
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
