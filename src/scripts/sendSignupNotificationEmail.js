/** A serverless function that sends an email to event organizers to notify them of new signups. 
*/

exports.handler = function (context, event, callback) {
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(context.SENDGRID_API_KEY);
    const text = getMessageText();
  
    const message = {
      // If you are reading this, you can look at our Git commit history and find our email addresses
      // so I don't see the point in obscuring them here.
      // if I cared, I could parameterize these or pass them in via context or something. 
      to: ["tilde@thuryism.net", "katekz@gmail.com"],
      from: "tilde@thuryism.net",
      subject: `${event.participantName} has signed up for vaporloop!`,
      text,
    };
    sgMail
      .send(message)
      .then(() => {
        callback(null, "Email sent successfully");
      })
      .catch((e) => {
        console.log(e);
      });
  };
  
  const getMessageText = () => {
    const vaporwaveEmoji = [
      "💙",
      "💜",
      "💖",
      "😎",
      "🦕",
      "🍕",
      "🛹",
      "🎶",
      "🎛",
      "🎚",
      "➰",
      "🦝",
      "🔥",
      "💟",
      "▶",
    ];
    const congratsText = [
      "wooohooo!",
      "NOICE",
      "well done",
      "hell yeah",
      "this is so exciting",
    ];
    const emoji = vaporwaveEmoji
      .sort(() => Math.random() - Math.random())
      .slice(0, 3)
      .join(" ");
    const text =
      congratsText[Math.floor(Math.random() * Math.floor(congratsText.length))];
    return `${text} ${emoji}`;
  };