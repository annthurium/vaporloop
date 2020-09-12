const bodyParser = require("body-parser");
const http = require("http");
const express = require("express");
const {
  broadcastGroupChatMessage,
  getAllSubscribedParticipants,
  getBase,
  tableName,
  unsubscribeParticipant,
} = require("./utils");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));

const base = getBase();
let subscribedParticipants;

// add a new participant to the Airtable base
app.post("/api/participants", (request, response) => {
  base(tableName).create(
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

app.post("/api/messages", async (request, response, next) => {
  console.log(request.body);
  response.status(200).send("successful unsubscribe");

  if (!subscribedParticipants) {
    subscribedParticipants = await getAllSubscribedParticipants(
      base,
      tableName
    );
  }
  const messageBody = request.body.Body;
  // should this be .contains? probablyyyyyyy
  if (messageBody.toLowerCase() === "unsubscribe") {
    try {
      await unsubscribeParticipant(
        request.body.phone,
        base,
        subscribedParticipants
      );
    } catch (error) {
      console.error("unsubscribe request failed", error);
      return next(error);
    }
    response.status(200).send("successful unsubscribe");
  } else {
    await broadcastGroupChatMessage(
      request.body.From,
      messageBody,
      subscribedParticipants,
      request.body.MediaUrl0
    );
  }
});

// this isn't proper RESTful API design
// but you can only GET and POST with twilio studio anyway
// and I'm kind of out of fucks at the moment so YOLO
app.post("/api/participants/unsubscribe", async (request, response, next) => {
  // TODO: get the subscribed participants
  try {
    await unsubscribeParticipant(
      request.body.phone,
      base,
      subscribedParticipants
    );
  } catch (error) {
    console.error("airtable request failed", error);
    return next(error);
  }
  response.status(200).send("successful unsubscribe");
});

// palindromes aren't loops but at least they take you back to the beginning.
const portNumber = process.env.PORT || 8008;

http.createServer(app).listen(portNumber, () => {
  console.log(`express server listening on port ${portNumber}`);
});
