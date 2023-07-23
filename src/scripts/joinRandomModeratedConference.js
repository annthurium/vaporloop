/* this serverless function handles two moderated conferences
    if you're a moderator, you join your specific conference.
    if you're a participant, you join a random one, whee.
*/ 

const moderatorInfo = [
    // phone numbers have been changed to protect the guilty parties
  { name: "randall", number: "+12345678900" },
  { name: "jemma", number: "+19876543210" },
];

// a little light hold music 🎶 or a personalized greeting for mods
const looperWaitUrl =
  "https://handler.twilio.com/twiml/EHda8529556c6a4b5e2f023b41af5d6724";

const moderatorWaitUrl =
  "https://handler.twilio.com/twiml/EH7571e0cfd713cc79a7bc6cc283a6df26";


exports.handler = function (context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  moderatorInfo.forEach((mod) => {
    // if the moderator is calling, join their specific conference
    if (event.From === mod.number) {
      moderatorPhoneNumber = mod.number;
      twiml.dial().conference(mod.name, {
        // the party don't start till you walk in
        // but please don't brush your teeth with a bottle of jack, this is a family game.
        startConferenceOnEnter: true,
        endConferenceOnExit: true,
        waitUrl: moderatorWaitUrl,
      });
      callback(null, twiml);
    }
  });
  // rollin the dice 🎲 to see which moderator you're gonna get
  const moderator =
    moderatorInfo[Math.floor(Math.random() * Math.floor(moderatorInfo.length))];
  const conferenceName = moderator.name;

  twiml.dial().conference(conferenceName, {
    startConferenceOnEnter: false,
    waitUrl: looperWaitUrl,
  });
  callback(null, twiml);
};