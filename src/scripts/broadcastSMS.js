const twilio = require("twilio");
const {
  getAllSubscribedParticipants,
  getBase,
  tableName,
} = require("../utils");

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const twilioNumber = "+1 415 430 9656";

async function broadcastSMS() {
  const participants = await getAllSubscribedParticipants(getBase(), tableName);
  for (const [phoneNumber, name] of participants) {
    // replace this with whatever message text you wanna send
    const body = `hay hay ${name}`;
    await twilioClient.messages.create({
      to: phoneNumber,
      from: twilioNumber,
      body,
    });
    console.log(`message sent to ${name}`);
  }
}

(async function () {
  await broadcastSMS();
})();
