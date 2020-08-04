/* THIS WAS THE FIRST JAVASCRIPT SERVICE I EVER WROTE, HENCE THE SPAGHETTI CODE, SORRY
WILL GET ROUND TO REFACTORING WHEN I HAVE TIME, THE MOST NOTABLE ISSUES ARE THE MIX OF VARIOUS
PRE ES6 CONVENTIONS WITH ES7, THAT THERE ARE NO IMPORTS, LOTS OF GLOBALS ETC ETC

THIS PROJECT STARTED OFF AS A SEPERATE BOT AND SCHEDULER CODE, WHICH ARE NOW ENCAPSULATED IN TWO FUNCTIONS
WHICH TO SOME EXTENT EXPLAINS WHY I USED REQUEST_PROMISE AND AXIOS IN THE SAME FILE (??)*/

var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const axios = require("axios");

require("dotenv").config();

const { colours } = require("./constants");
const {
  messageFactory,
  adminFactory,
  resourceFactory,
} = require("./lib/message-factory");
const { wait, errorRespond, todaysDate } = require("./lib/tools");
const { checkIntent, randomPick, makeTelMsg } = require("./lib/bot");
const { playlistFactory } = require("./service/spotify-service");
const { ADMIN_GROUP } = require("./service/room-service");
const { robotHailsIn } = require("./lib/vocab");
const { updateThePlaylist } = require("./api/make-playlist");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const {
  DROPBOX,
  EMAIL_PASSWORD,
  MAIL_DS,
  MAIL_SB,
  REFRESH_TOKEN,
  CLIENT_ID,
  CLIENT_SECRET,
  LABEL_ROOM,
  ADMIN_ROOM,
  ARTIST_ROOM,
  MAIN_ROOM,
  TEST_ROOM,
  BOT_TOKEN,
} = process.env;

console.log(process.env);

console.log("refresh: ", REFRESH_TOKEN);
let updateAlive,
  playlistReport,
  resultArray = [],
  labelsAdded = "",
  oldLabels = "",
  reportWanted = false;

app.get("/diagnostic", function (req, res) {
  console.log("Diagnostic requested at: ", new Date().toUTCString());
  res.status(200).send({ response: "OK" });
});

app.get("/make-playlist", function (req, res) {
  console.log("Lambda playlist requested at ", new Date().toUTCString());
  const resToLambda = res;

  console.log("here");
  updateThePlaylist(resToLambda);
});

app.post("/new-message", function (req, res) {
  const { message } = req.body;
  let toSend,
    resourceType,
    fightMode = false;
  if (!message || typeof message == "undefined") {
    return res.end();
  } else {
    if (typeof message.text !== "undefined") {
      const msgIn = message.text.toLowerCase();
      console.log("new message from room id: ", message.chat.id);
      toSend = { content: null };
      if (checkIntent(msgIn, robotHailsIn) && typeof message !== undefined) {
        /* First check the intent of the message, returns either a message, type,
                or both */
        console.log("Message recieved: ", msgIn);
        const response = messageFactory({
          msgIn,
          oldLabels,
          labelsAdded,
          playlistReport,
          message,
        });
        toSend = response.toSend;
        resourceType = response.resourceType;
        reportWanted = response.reportWanted;
        if (resourceType && typeof message != undefined && fightMode == false) {
          if (ADMIN_GROUP.includes(message.chat.id)) {
            /* if the user is in the Admin group then operate on types accordingly */
            const { tmpMessage, tmpPicture } = adminFactory({
              msgIn,
              oldLabels,
              labelsAdded,
              playlistReport,
              updateThePlaylist,
              resourceType,
              message,
            });
            toSend = tmpMessage;
            pictureWanted = tmpPicture;
          } else {
            /* if the user is not in the Admin group then refuse the request */
            toSend = makeTelMsg(
              "please ask for that in the label or admin rooms."
            );
          }
        }
      }
      if (
        checkIntent(msgIn, "hey hatebot fight luvbot") &&
        typeof message !== undefined
      )
        toSend.type = "fight";
    } else {
      return res.end();
    }
    // Return a message with resources
    console.log("sending: ", toSend);
    resourceFactory({ message, toSend, res });
  }
});

app.listen(3000, function () {
  console.log("LuvBot now listening on port 3000! ok");
});

module.exports = {
  app,
};
