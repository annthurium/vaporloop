const airtable = require("airtable");

// TODO: change this before you merge!!
const tableName = "test";

// to do:
// consider how code is shared between utils, server, and scripts
// rip out dotenv related code
// TEST SUBSCRIBE FLOW TO MAKE SURE IT STILL WORKS
// test error handling in case of an unsuccessful unsubscribe
// will implement group chat in a separate / future PR

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

// should we have the table name set as an environment variable?
// passing it in is more ~ f U n C T i O N a L ~ I suppose

// returns a map of {phone, {name: 'tilde', airtableRecordId: '12345'} for all subscribed participants
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

async function unsubscribeParticipant(phoneNumber, base, participantMap) {
  if (!participantMap) {
    // the server will have a cached version of the participant map
    // might call this function from offline scripts tho, IDK
    participantMap = await getAllSubscribedParticipants(base, tableName);
  }

  const participant = participantMap.get(phoneNumber);
  const airtableRecordId = participant["airtableRecordId"];
  if (!airtableRecordId) {
    throw new Error(`participant ${phoneNumber} not found`);
  }

  await base(tableName).update(
    airtableRecordId,
    { unsubscribed: true },
    (error, record) => {
      if (error) {
        console.error(error);
      } else {
        console.log(`${record.fields.name} has been unsubscribed`);
        // todo: message the person letting them know their unsubscribe was successful?
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
