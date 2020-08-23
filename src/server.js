const http = require("http");
const express = require("express");

const app = express();

// you don't actually need body-parser to parse url encoded bodies these days. dope!
app.use(express.urlencoded());

app.get("/", (request, response) => {
  response.send(
    "hello world. time is a flat circle. the end is the beginning is the end."
  );
});

// add a new participant to the Airtable base
app.post("/api/participants", (request, response) => {
  console.log(request.body);
  response.status(200).send("niiice 💟");
});

// palindromes aren't loops but at least they take you back to the beginning.
const portNumber = 8008;

http.createServer(app).listen(8008, () => {
  console.log(`express server listening on port ${portNumber}`);
});
