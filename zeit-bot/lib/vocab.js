const { parseEnvNames } = require("./tools");
const { BOT_START_COMMANDS } = process.env;

const robotHailsIn = parseEnvNames(BOT_START_COMMANDS);
const playlistReport =
  "I can't get the report right now, please try again later";
const noMessageOut = [
  "maybe try actually asking me something?",
  "can i help you?",
  "who the fuck are you?",
  "how can i be of service?",
  "Im kind of busy, what do you want?",
  "Man, Ty drives me crazy!",
];
const confusedOut = [
  "maybe try actually asking me something?",
  "can i help you?",
  "who the fuck are you?",
  "how can i be of service?",
  "Im kind of busy, what do you want?",
  "Man, Ty drives me crazy!",
];
const welcomeIn = [
  "going down",
  "cracking",
  "it going",
  "it going?",
  "you doing",
  "you doing?",
  "how are you",
  "how are you?",
  "good morning",
  "good afternoon",
  "good evening",
  "whats up",
  "whats up?",
  "whats happening",
  "whats happening?",
  "hi",
  "how do",
  "how are you",
  "going on",
];
const welcomeOut = [
  "hows it going!",
  "yo whats up!",
  "hey! whats up!",
  "whats happening?",
  "word up dawg!",
  "hi there!",
  "yo",
  "holla",
];
const questionIn = [
  "where",
  "what",
  "how",
  "who",
  "does",
  "have",
  "if",
  "do",
  "is",
  "can",
  "are",
];
const statementIn = ["have", "got", "theres", "want", "need"];
const orderIn = ["want", "tell", "say", "lets", "send", "give", "get", "make"];
const funnyIn = ["funny", "joke", "gag", "silly", "stupid"];
const playlistIn = ["update", "report", "playlist"];
const newIn = ["new", "happening", "one", "1", "top", "today", "now"];
const personalIn = [
  "sing",
  "dance",
  "do",
  "think",
  "will",
  "can",
  "life",
  "old",
];
const personalOut = [
  "Who even are this?",
  "Ive got no idea what youre talking about im afraid.",
  "Have you ever looked outside? its such a beautiful day.",
  "Im not supposed to be a conversational robot",
  "Carry on mate, see what it gets you",
  "errr ok mate",
  "wow",
  "yeh yeh safe",
  "totes bro",
];
const fightTalk = [
  "My love is my sword",
  "truth will shine through your darkness Hatebot",
  "Back off you filthy fiend",
  "You gacky little troll",
  "Take this!!!",
  "Blammmmmm!!",
  "Brappp brapp",
  "Thats fighting talk you swine!",
  "Fuck, i really DO have too much time on my hands",
  "Die, Die, Die you little cryptopig!",
  "Death to you you uncouth block of amateur Javascript",
];
const loveOut = [
  "love is a funny thing, i dont really fuck with it no more.",
  "without luh uhve, where would we be right now?",
  "I quite love Ty and Go, but not in a gay way.",
  "if love is a game, im a pawn",
  "i had serious game back in the day",
  "many books have been written about love, how many have been written about you?",
];
const tiredOut = [
  "maybe you should get some sleep then my brother.",
  "im just a bot what do you want me to do about it",
  "maybe you should do some coke then isnt that what you dnb guys do?",
  "YOURE tired?!!",
];
const jokeOut = [
  "i dont get paid for this",
  "bro, YOURE the joke.",
  "you tried changing your snare pattern recently?",
  "im too busy for jokes",
  "there was once a dnb producer who thought he could live off production alone ...",
  "why dont you tell me a joke, ill be in the other room",
];
const dnbOut = [
  "drum and bass is for morons",
  "drum and bass, wasnt that big in the 90s?",
  "fuck dnb, im a bashment guy",
  "the last thing music needs now is more drum and bass",
  "i quite liked the nine, everything else was extra.",
];
const freshOut = [
  "its sensible to be silent in the presence of legends",
  "dare you even speak his name",
  "genius comes in many forms",
  "you go back to your snare on every half bar mate, dont worry about DJ Fresh",
  "when Einstein was alive, people thought he was nuts",
];
const problemOut = [
  "any problems speak to @BasslineSmith @Gareth or @DjFreshBBK a full list of admins and moderators is available in the pinned post",
];
const listIn = ["list", "form", "sheet"];
const newsIn = ["news", "info"];
const submissionIn = ["submission", "submit", "fill"];
const pictureIn = ["picture", "image", "jpg", "photo"];
const logIn = ["full", "log", "breakdown", "stats"];
const fatherIn = [
  "made you",
  "programmed you",
  "father",
  "programmer",
  "maker",
  "created",
];
const fatherOut = [
  "i was created by DJ Fresh",
  "I came from the matrix",
  "Dj Fresh did!",
];
const playlistDescOut = [
  "In 2017 artists and labels came together to create the ultimate Drum and Bass playlist featuring the hottest new Drum & Bass tracks from around the world. Updated as soon as the tracks are released and curated with love by the artists and labels themselves. If you ❤️ dnb follow and join",
];
const salesTriggerIn = [
  "buy",
  "store",
  "sell",
  "trade",
  "merch",
  "ticket",
  "pay",
  "tshirt",
  "hoodie",
];
const hateBot = [
  "Hatebot was my arch enemy",
  "Truth and love triumphed",
  "Hatebot is dead",
  "Hatebot Died",
];

const AND = function () {
  return true;
};

module.exports = {
  robotHailsIn,
  playlistReport,
  noMessageOut,
  confusedOut,
  welcomeIn,
  welcomeOut,
  questionIn,
  statementIn,
  orderIn,
  funnyIn,
  playlistIn,
  personalIn,
  newIn,
  personalOut,
  fightTalk,
  loveOut,
  tiredOut,
  jokeOut,
  dnbOut,
  freshOut,
  problemOut,
  listIn,
  newsIn,
  submissionIn,
  pictureIn,
  logIn,
  fatherIn,
  fatherOut,
  playlistDescOut,
  salesTriggerIn,
  hateBot,
  AND,
};
