if (process.env.NODE_ENV !== "production") {
  // note: dotenv won't override existing environment variables
  require("dotenv").config();
}

const airtable = require("airtable");

// do i need to memoize this const?
// idk how computationally expensive it is, or if having multiple base instances causes problems.
// it probably doesn't matter and i am over thinking it 🤷🏻‍♂️
const base = new airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

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

(async function () {
  const participants = await getAllSubscribedParticipants(base, "test");
  for (let [key, value] of participants) {
    console.log(key, value);
  }
})();
