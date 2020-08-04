const { checkIntent, makeTelMsg } = require("../lib/bot");
const {
  messageFactory,
  adminFactory,
  resourceFactory,
} = require("../lib/message-factory");
const { ADMIN_GROUP } = require("../service/room-service");
const { robotHailsIn } = require("../lib/vocab");

let playlistReport,
  labelsAdded = "",
  oldLabels = "",
  reportWanted = false;

export default (req, res) => {
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
};
