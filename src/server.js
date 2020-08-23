const http = require("http");
const express = require("express");
const path = require("path");

const app = express();

app.get("/", (request, response) => {
  response.send(
    "hello world. time is a flat circle. the end is the beginning is the end."
  );
});

// palindromes aren't loops but at least they take you back to the beginning.
const portNumber = 8008;

http.createServer(app).listen(8008, () => {
  console.log(`express server listening on port ${portNumber}`);
});
