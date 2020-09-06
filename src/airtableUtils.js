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

// other questions:
// to remove participants, for unsubscribe purposes, do we actually remove them from the base?
// or do we want to keep them around but add a column for deletion?
// i don't knowwwwww
// i guess we can keep people around just to have a historical record

function getAllSubscribedParticipants(base, tableName) {
  return base(tableName)
    .select({
      view: "Grid view",
    })
    .eachPage(
      function page(records, fetchNextPage) {
        // toDo: filter unsubscribed participants

        records.forEach(function (record) {
          console.log("Retrieved", record.get("name"), record.get("phone"));
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
}

(async function () {
  await getAllSubscribedParticipants(base, "test");
})();
