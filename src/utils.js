// like any good utils file, this is basically the junk drawer of the application
const airtable = require("airtable");
const twilio = require("twilio");


// this const is so that we can easily read/write from a test table under development
// and not mess with "prod" data.
// change this const to "participants" when you're ready to party.
// could have made this an enviornment variable, I guess? 🤷🏻‍♂️
const tableName = "test";

// memoize this because why the fuck not
//  THERE CAN BE ONLY ONE BASE
let base = null;
const getBase = () => {
  base
    ? null
    : (base = new airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
        process.env.AIRTABLE_BASE_ID
      ));
  return base;
};

// the revolution will not be memoized
// i mean will! it will be memoized!
// for real tho, lookin up all the participants is expensive.
let subscribedParticipants = null;

// returns a map of {"+15556667777", {name: 'tilde', airtableRecordId: '12345'} for all subscribed participants
// phone numbers in e.164 format cuz I've got STANDARDS
const getAllSubscribedParticipants = async (base, tableName) => {
  if (subscribedParticipants !== null) {
    return subscribedParticipants;
  }
  const participants = new Map();

  // TODO: i am not sure .all will work if we get above 100 participants
  // airtable docs says that's the max page size??
  // if we get that far let's make sure to test it out
  const records = await base(tableName).select().all();
  records.map((record) => {
    // airtable doesn't have a boolean field type, which is weaksauce
    // it has a "checkbox". ok sure that works.
    // but. the api only returns the property for rows where the box is checked.

    if (!record.fields.unsubscribed) {
      // using the phone number as a key 'cuz it should be guaranteed unique
      // just like you, you special snowflake ❄️
      participants.set(record.fields.phone, {
        name: record.fields.name,
        airtableRecordId: record.id,
      });
    }
  });
  subscribedParticipants = participants;
  return participants;
};

const twilioGroupChatNumber = "+1 806 666 1001";
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSingleSMS(toNumber, messageBody, mediaURL = null) {
  if (mediaURL !== null) {
    // ugh why doesn't twilio capitalize URL correctly in their API?
    // if only I knew somebody who worked there so I could complain
    // parameters.mediaUrl = [mediaURL];
    await twilioClient.messages.create({
      to: toNumber,
      from: twilioGroupChatNumber,
      body: messageBody,
      mediaUrl: [mediaURL],
    });
  }

  await twilioClient.messages.create({
    to: toNumber,
    from: twilioGroupChatNumber,
    body: messageBody,
  });
}

async function broadcastGroupChatMessage(
  senderPhoneNumber,
  messageBody,
  participantMap,
  mediaURL = null
) {
  const trimmedNumber = senderPhoneNumber.trim();

  const participant = participantMap.get(trimmedNumber);
  if (!participant) {
    // if a participant unsubscribes but tries to broadcast a message, we could end up here.
    // no need to throw an error 'cuz it may happen, just don't pass their message through.
    console.log(`participant ${trimmedNumber} not found`);
  }

  const participantName = participant["name"];

  const messageBodyWithName = `${participantName}: ${messageBody}`;

  for (const phoneNumber of participantMap.keys()) {
    if (phoneNumber === trimmedNumber) {
      // we don't need to send the sender a copy of their own message.
      continue;
    } else {
      await sendSingleSMS(phoneNumber, messageBodyWithName, mediaURL);
    }
  }
}

async function unsubscribeParticipant(phoneNumber, base, participantMap) {
  if (!participantMap) {
    // the server will have a cached version of the participant map
    // might call this function from offline scripts tho, IDK
    participantMap = await getAllSubscribedParticipants(base, tableName);
  }

  const trimmedNumber = phoneNumber.trim();

  const participant = participantMap.get(trimmedNumber);
  if (!participant) {
    throw new Error(`participant ${trimmedNumber} not found`);
  }

  const airtableRecordId = participant["airtableRecordId"];

  await base(tableName).update(
    airtableRecordId,
    { unsubscribed: true },
    async (error, record) => {
      if (error) {
        console.error(error);
        await sendSingleSMS(
          trimmedNumber,
          "sorry, the unsubscribe failed. Mind trying again in a few minutes?"
        );
        throw error;
      } else {
        participantMap.delete(trimmedNumber);
        console.log(`${record.fields.name} has been unsubscribed`);
        const participantName = participant["name"];
        await sendSingleSMS(
          phoneNumber,
          `Thanks ${participantName}, you have been unsubscribed and we won't message you again.`
        );
      }
    }
  );
}

module.exports = {
  broadcastGroupChatMessage,
  getAllSubscribedParticipants,
  getBase,
  tableName,
  unsubscribeParticipant,
};
