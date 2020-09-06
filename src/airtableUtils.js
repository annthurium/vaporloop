const airtable = require("airtable");

// to do:
// add function for writing an unsubscribe to airtable
// add an api endpoint for the same, and hook it up to the function
// consider how code is shared between utils, server, and scripts
// rip out dotenv related code
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

// returns a map of {phone, name} for all subscribed participants
async function getAllSubscribedParticipants(base, tableName) {
  const participants = new Map();

  const records = await base(tableName).select().all();
  records.map((record) => {
    // airtable doesn't have a boolean field type, which is weaksauce
    // it has a "checkbox". ok sure that works.
    // but. the api only returns the property for rows where the box is checked.

    if (!record.fields.unsubscribed) {
      // using the phone number as a key 'cuz it's guaranteed unique
      // just like you, you special snowflake ❄️
      participants.set(record.fields.phone, record.fields.name);
      console.log(record.fields);
    }
  });
  return participants;
}

module.exports = { getAllSubscribedParticipants, getBase, tableName: "test" };
