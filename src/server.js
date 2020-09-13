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

// add a new participant to the Airtable base and subscribedParticipants map
app.post("/api/participants", async (request, response, next) => {
  base(tableName).create(
    [
      {
        fields: request.body,
      },
    ],
    async function (error, records) {
      if (error) {
        console.error("airtable request failed", error);
        return /* thank u, */ next(error);
      } else {
        const subscribedParticipants = await getAllSubscribedParticipants(
          base,
          tableName
        );

        records.map((record) => {
          subscribedParticipants.set(record.fields.phone, {
            name: record.fields.name,
            airtableRecordId: record.id,
          });
        });
        response.status(200).send("niiice 💟");
      }
    }
  );
});

app.post("/api/messages", async (request, response, next) => {
  const subscribedParticipants = await getAllSubscribedParticipants(
    base,
    tableName
  );

  const messageBody = request.body.Body;
  try {
    if (messageBody.toLowerCase().includes("unsubscribe")) {
      await unsubscribeParticipant(
        request.body.From,
        base,
        subscribedParticipants
      );
      response.status(200).send("successful unsubscribe");
    } else {
      await broadcastGroupChatMessage(
        request.body.From,
        messageBody,
        subscribedParticipants,
        request.body.MediaUrl0
      );
      response.status(200).send("message broadcasted successfully");
    }
  } catch (error) {
    console.error(error);
    return /* thank u, */ next(error);
  }
});

// this isn't proper RESTful API design
// but you can only GET and POST with twilio anyway
// and I'm kind of out of fucks at the moment so YOLO
app.post("/api/participants/unsubscribe", async (request, response, next) => {
  const subscribedParticipants = await getAllSubscribedParticipants(
    base,
    tableName
  );

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
