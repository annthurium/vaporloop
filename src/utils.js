// like any good utils file, this is basically the junk drawer of the application
const airtable = require("airtable");
const twilio = require("twilio");

// TODO: change this before you merge!!
// this const is so that we can easily read/write from a test table under development
// and not mess with "prod" data.
// change this const to "participants" when you're ready to party.
const tableName = "participants";

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

// returns a map of {"+15556667777", {name: 'tilde', airtableRecordId: '12345'} for all subscribed participants
// phone numbers as always in e.164 format cuz I've got STANDARDS ok
async function getAllSubscribedParticipants(base, tableName) {
  const participants = new Map();

  // TODO: i am not sure .all will work if we get above 100 participants
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
  return participants;
}

const twilioNumber = "+1 415 430 9656";
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSingleSMS(toNumber, messageBody) {
  await twilioClient.messages.create({
    to: toNumber,
    from: twilioNumber,
    body: messageBody,
  });
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
  getAllSubscribedParticipants,
  getBase,
  tableName,
  unsubscribeParticipant,
};
