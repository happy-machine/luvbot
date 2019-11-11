/* THIS WAS THE FIRST JAVASCRIPT SERVICE I EVER WROTE, HENCE THE SPAGHETTI CODE, SORRY
WILL GET ROUND TO REFACTORING WHEN I HAVE TIME, THE MOST NOTABLE ISSUES ARE THE MIX OF VARIOUS
PRE ES6 CONVENTIONS WITH ES7, THAT THERE ARE NO IMPORTS, LOTS OF GLOBALS ETC ETC

THIS PROJECT STARTED OFF AS A SEPERATE BOT AND SCHEDULER CODE, WHICH ARE NOW ENCAPSULATED IN TWO FUNCTIONS
WHICH TO SOME EXTENT EXPLAINS WHY I USED REQUEST_PROMISE AND AXIOS IN THE SAME FILE (??)*/

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request=require('request');
var fs = require('fs')
const axios = require('axios')
const os = require('os')

require('dotenv').config()

import { checkIntent, randomPick, makeTelMsg } from './lib/bot';
import * as vocab from './lib/vocab';

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
    LABEL_UPDATE_FORM_LINK,
    LABEL_NEWS_LINK,
    LABEL_SUBMISSION_FORM_LINK,
    UPDATE_COMMAND
} = process.env;

var destUrl="", replUrl="", workData, endUrl, chatObject = {}, updateAlive, labelsAdded='', oldLabels='';

// THIS USED TO SCHEDULE THE PLAYLIST AS IS NOW TAKEN CARE OF BY THE LAMBDA
// YOU COULD DO IT ON NOW BUT THEN YOUD HAVE TO PAY FOR IT - GOD FORBID.

/*
if( new Date().getDay()> 1 && new Date().getDay()<6 ) {
    console.log('Going to Update: '+new Date().toUTCString())
    setInterval(updateThePlaylist, 1000 * 60 * 60);
}
else if ( new Date().getDay() == 6 && new Date().getHours () <= 20){
    console.log('Going to Update during weekend: '+new Date().toUTCString())
    setInterval(updateThePlaylist, 1000 * 60 * 60)
}
else {updateAlive=false}
*/

app.get('/make-playlist', function (req,res) {
    console.log('Lambda playlist requested at ', new Date().toUTCString())
    const resToLambda = res
    updateThePlaylist(resToLambda)
});

// BOT CODE BELOW            
app.post('/new-message', function (req, res) {
    const { message } = req.body
    if (!message || typeof message == "undefined") {
        return res.end();
    } else {
        //START
        if (typeof message.text!=="undefined") {
            var msgIn=message.text.toLowerCase()
            var userName = message.from.first_name
            var id = message.chat.id
            var messageId = message.message_id;
            var labelRoom = LABEL_ROOM,
                adminRoom = ADMIN_ROOM,
                artistRoom = ARTIST_ROOM, 
                mainRoom = MAIN_ROOM,
                testRoom = TEST_ROOM;
            var notResponded = true,
                toSend = {
                    content: null
                },
                reportWanted = false,
                pictureWanted = false,
                labelResource = null,
                fightMode=false,
                statusMode=false,
                outMsg = {};
            if (checkIntent(msgIn, vocab.robotHailsIn)&&typeof message!==undefined) {
                console.log('Message recieved: ',msgIn);
                switch (true) {
                    /*  case checkIntent(msgIn.substr(0,19), 'add url'):
                        //toSend = makeTelMsg('not sure thats a great idea!')
                        labelResource="add";
                        break;    
                    case checkIntent(msgIn.substr(0,23), 'replace url'):
                        labelResource="replace";
                        break;   
                    case checkIntent(msgIn.substr(0,22), 'remove url'):
                        labelResource="remove"
                        break;  */
                    case checkIntent(msgIn, vocab.orderIn, 'label urls'):
                        toSend = makeTelMsg('Here is the list of Playlist URLs ' + DROPBOX);
                        break; 

                    case checkIntent(msgIn, 'not','added',vocab.AND):
                        toSend=makeTelMsg('These are the labels not added in the last update: '+oldLabels.substring(0,oldLabels.length-1))
                        break;

                    case checkIntent(msgIn, 'were','added',vocab.AND):
                    toSend=makeTelMsg('These are the labels added in the last update: '+labelsAdded.substring(0,labelsAdded.length-2))
                    break;

                    case checkIntent(msgIn, 'whats happening'):
                    toSend.type="status";
                    break;

                    case checkIntent(msgIn, UPDATE_COMMAND):
                    labelResource="update";
                    break;

                    case checkIntent(msgIn, 'link','playlist'):
                        toSend = makeTelMsg('Sure it\'s ' + MAIN_PLAYLIST_LINK);
                        break;

                    case checkIntent(msgIn, 'love'):
                        toSend = makeTelMsg(randomPick(vocab.loveOut));
                        break;

                    case checkIntent(msgIn, vocab.questionIn,'room'):
                        var room;
                        switch (true) {
                            case id == labelRoom: room = "Label Room"; break;
                            case id == adminRoom: room = "Admin Room"; break;
                            case id == artistRoom: room = "Artist Room"; break;
                            case id == mainRoom: room = "Main Room"; break;
                            case id == testRoom: room = "Test Room"; break;
                        };
                        toSend = makeTelMsg('Hey '+userName+' you are in the '+room+'. Have fun!');
                        break;

                    case checkIntent(msgIn,vocab.questionIn,'hatebot'):
                        toSend = makeTelMsg(randomPick(vocab.hatebot));
                        break;

                    case checkIntent(msgIn,vocab.questionIn,'updater'):
                        updateAlive==true?toSend = makeTelMsg('The playlist updater is currently up and running.'):toSend = makeTelMsg('The playlist updater is currently off.')
                        break;

                    case checkIntent(msgIn, vocab.playlistIn, 'how',vocab.AND):
                        toSend = makeTelMsg('you can update your playlist up to once a week with a new track, it must be no more than a week old, if its an album track it can be UPTO a month old');
                        break;

                    case checkIntent(msgIn, vocab.playlistIn, vocab.questionIn,vocab.AND):
                        toSend = makeTelMsg('to add your 1 track a week to the playlist you need to fill out the label submission form here: ' + LABEL_SUBMISSION_FORM_LINK);
                        break;
                    /*  HATEBOT CODE!
                    case checkIntent(msgIn, 'fight','hatebot'):
                    if (fightMode==true){fightMode=false; toSend = makeTelMsg(randomPick(vocab.fightTalk))}
                    else{toSend = makeTelMsg('hey Hatebot, lets have it.. with honour');fightMode=true}
                    toSend.type="fight"
                    break;*/

                    case checkIntent(msgIn, 'tired'):
                        toSend = makeTelMsg(randomPick(vocab.tiredOut));
                        break;

                    case checkIntent(msgIn, 'fight hatebot'):
                        toSend = makeTelMsg(randomPick(vocab.tiredOut));
                        break;

                    case checkIntent(msgIn, 'kill hatebot'):
                        toSend = makeTelMsg(randomPick(vocab.tiredOut));
                        break;

                    case msgIn.indexOf("say")!=-1:
                        toSend = makeTelMsg(msgIn.substr(14));
                        break;

                    case msgIn.indexOf("repeat")!=-1:
                        toSend = makeTelMsg(msgIn.substr(18));
                        break;

                    case checkIntent(msgIn, 'fresh'):
                        toSend = makeTelMsg(randomPick(vocab.freshOut));
                        break;

                    case checkIntent(msgIn, 'favourite'):
                        toSend = makeTelMsg('my favourite track is Messiah by Konflict, my favourite person is Dj Fresh');
                        break;

                    case checkIntent(msgIn, 'name', vocab.questionIn):
                        toSend = makeTelMsg('my name is LuvBot.. remember that human');
                        break;

                    case checkIntent(msgIn, 'joke', vocab.orderIn):
                        toSend = makeTelMsg(randomPick(vocab.jokeOut));
                        break;

                    case checkIntent(msgIn, 'drum', 'bass'):
                        toSend = makeTelMsg(randomPick(vocab.dnbOut));
                        break;

                    case checkIntent(msgIn, vocab.fatherIn):
                        toSend = makeTelMsg(randomPick(vocab.fatherOut));
                        break;

                    case checkIntent(msgIn, 'right', 'correct'):
                        toSend = makeTelMsg('i would always defer to Dj Fresh on matters of judgement');
                        break;

                    case checkIntent(msgIn, 'sell', vocab.questionIn):
                        toSend = makeTelMsg('Im not programmed to sell things yet, but let me know what youd be interested in and ill let my humans know');
                        console.log("Sales Inquiry: " + message.text);
                        break;

                    case checkIntent(msgIn, 'problem', vocab.statementIn):
                        toSend = makeTelMsg(randomPick(vocab.problemOut));
                        console.log("Problem: " + message.text);
                        break;

                    case checkIntent(msgIn, 'logo'):
                        toSend = makeTelMsg('/Users/lionheart/CODE/APPS/BOTS/LUVBOT/Resources/IluvDNBlogoweb.jpg');
                        break;

                    case checkIntent(msgIn, vocab.pictureIn):
                        toSend = makeTelMsg("Here you go!");
                        labelResource = "picture";
                        break;

                    case checkIntent(msgIn, vocab.submissionIn):
                        toSend = makeTelMsg('here is the label submission form: ' + LABEL_SUBMISSION_FORM_LINK);
                        console.log("Submission Form Requested");
                        break;

                    case checkIntent(msgIn, 'put', vocab.questionIn):
                        toSend = makeTelMsg('here is the label submission form: ' + LABEL_SUBMISSION_FORM_LINK);
                        console.log("Submission Form Requested");
                        break;

                    case checkIntent(msgIn, 'label', 'playlist'):
                        toSend = makeTelMsg('you can fill in the label submission form here: ' + LABEL_SUBMISSION_FORM_LINK);
                        console.log("Submission Form Requested");
                        break;

                    case checkIntent(msgIn, 'label', 'news', 'info'):
                        labelResource = "news";
                        console.log("Label News Requested");
                        break;

                    case checkIntent(msgIn, 'label', vocab.listIn):
                        labelResource = "form";
                        break;

                    case checkIntent(msgIn, vocab.logIn):
                        labelResource = "log";
                        break;

                    case checkIntent(msgIn, 'own', vocab.questionIn):
                        toSend = makeTelMsg('when it comes to the playlist, we all own it together');
                        break;

                    case checkIntent(msgIn, 'time'):
                        var time = new Date();
                        toSend = makeTelMsg("Its " + time.toUTCString());
                        break;

                    case checkIntent(msgIn, vocab.playlistIn, vocab.orderIn):
                        toSend = makeTelMsg(vocab.playlistReport);
                        reportWanted = true;
                        console.log("Report requested");
                        break;

                    case checkIntent(msgIn, vocab.playlistIn, vocab.newIn):
                        toSend = makeTelMsg(vocab.playlistReport);
                        reportWanted = true;
                        console.log("Report requested");
                        break; 

                    case checkIntent(msgIn, vocab.questionIn, 'you do'):
                        toSend = makeTelMsg('I can send you logos, forms or playlist updates, for anything else youre probably better talking to yourself');
                        break;

                    case checkIntent(msgIn, vocab.questionIn, 'purpose'):
                        toSend = makeTelMsg('I can send you logos, forms or playlist updates, for anything else youre probably better talking to yourself');
                        break;

                    case checkIntent(msgIn, vocab.personalIn, vocab.questionIn):
                        toSend = makeTelMsg(randomPick(vocab.personalOut));
                        break;

                    case checkIntent(msgIn, vocab.welcomeIn):
                        toSend.type="status";
                        break;

                    case msgIn == 'hey luvbot' || msgIn == 'hey lovbot' || msgIn == 'hey lvbot' || msgIn == 'hey lubot':
                        toSend = makeTelMsg(randomPick(vocab.welcomeOut));
                        break;

                    default:
                        toSend = makeTelMsg(randomPick(vocab.confusedOut));
                        break;
                };
                notResponded = false;
                if (labelResource&&typeof message!=undefined&&fightMode==false) {
                    if (id == testRoom || id == adminRoom || id == labelRoom) {
                        msgIn=message.text;
                        switch (true) {
                            case labelResource == "news":
                                toSend = makeTelMsg('Latest label News: ' + LABEL_NEWS_LINK);
                                break;

                            case labelResource == "add":
                            fs.readFile ('/tmp/PlayBoyLabelUrls.txt', 'utf8', function (err, data) {
                                if (err) {
                                    toSend=makeTelMsg('I\'m afraid there was an Error reading the URL list.')
                                    console.log("Error reading URL list.");
                                    throw err;
                                } else { 
                                    if (data.indexOf(msgIn.substr(23))!== -1) {
                                        toSend = makeTelMsg('That Url has already been added to the playlist')
                                    } else {
                                        workData=data;workData=workData+"\n"+msgIn.substr(23);
                                        fs.writeFile ('/tmp/PlayBoyLabelUrls.txt', workData, function(err) {
                                        if (err) {
                                            throw err;
                                            toSend = makeTelMsg('Error adding url.');console.log('Error adding:'+msgIn.substr(23));
                                        } else {
                                            toSend=makeTelMsg('Url:'+msgIn.substr(23)+' sucessfully added!')}});
                                    };
                                    console.log('URL:'+msgIn.substr(23)+' added successfully');
                                };
                            });    
                            break;

                            case labelResource == "replace":
                                console.log("in replace " + os.tmpdir())
                                fs.readFile ('/tmp/PlayBoyLabelUrls.txt', 'utf8', function (err, data) {
                                    console.log(data)                       
                                    if (err) {
                                        toSend=makeTelMsg('I\'m afraid there was an Error.');
                                        console.log("Error reading file"+err);
                                        throw err; 
                                    } else { 
                                        destUrl=msgIn.substr(23).split(' ');
                                        repUrl=destUrl[1];
                                        console.log(destUrl[0]);
                                        if (data.indexOf(destUrl[0]) !== -1) {
                                            workData = data;
                                            workData = data.replace(destUrl[0],repUrl);
                                            fs.writeFile ('/tmp/PlayBoyLabelUrls.txt', workData, function(err) {
                                                if (err) {
                                                    toSend=makeTelMsg('Error adding url.');
                                                    console.log('Error adding:'+repUrl);
                                                    throw err;
                                                } else {
                                                    toSend=makeTelMsg('Url:'+destUrl[0]+' sucessfully replaced with\n'+repUrl);
                                                    console.log('Url:'+destUrl[0]+' sucessfully replaced with\n'+repUrl);
                                                }
                                            });
                                        } else {
                                            toSend=makeTelMsg('Url:'+destUrl[0]+' Not found!');
                                            console.log('Url:'+destUrl[0]+' Not found!');
                                        };
                                    };
                                });
                                break;

                            case labelResource == "remove":
                                fs.readFile ('/tmp/PlayBoyLabelUrls.txt', 'utf8', function (err, data) {
                                    if (err) {
                                        toSend=makeTelMsg('I\'m afraid there was an Error.');
                                        throw err;
                                    } else { 
                                        if (data.indexOf(msgIn.substr(26)) !== -1) {
                                            workData=data;
                                            workData=data.replace(msgIn.substr(26),'');
                                            fs.writeFile ('/tmp/PlayBoyLabelUrls.txt', workData, function(err) {
                                                if (err) {
                                                    toSend = makeTelMsg('Error removing url.');
                                                    console.log('Error removing:' + msgIn.substr(26))
                                                    throw err;   
                                                } else {
                                                    toSend = makeTelMsg('Url:' + msgIn.substr(26) + ' sucessfully removed!');
                                                    console.log('Url:'+msgIn.substr(26)+' sucessfully removed!');
                                                };
                                            });
                                        } else {
                                            toSend=makeTelMsg('Url:'+msgIn.substr(26)+' Not found!');
                                        };
                                    };
                                });
                                toSend.type="message";
                                break;

                            case labelResource == "form":
                                toSend = makeTelMsg('here is the label update form: ' + LABEL_UPDATE_FORM_LINK);
                                break;

                            case labelResource == "log":
                                toSend = makeTelMsg('The log is no longer available, please speak to Dan Fresh for access');
                                break;

                            case labelResource == "picture":
                                toSend = makeTelMsg("I am a new version in testing i cannot send pictures yet.");
                                pictureWanted = true;
                                break;
                                
                            case labelResource == "update":
                                toSend = makeTelMsg("Updating the playlist, report will be available soon.");
                                res.end('ok');
                                updateThePlaylist(null, id);
                        }
                    } else {
                        toSend = makeTelMsg('please ask for that in the label or admin rooms.');
                    }
                }           
            };
            if (checkIntent(msgIn,'hey hatebot fight luvbot') && typeof message !== undefined) toSend.type="fight";
        } else {
            return res.end();
        };

        switch (toSend.type) {
            case "message":
            console.log(id)
                axios.post('https://api.telegram.org/' + BOT_TOKEN + '/sendMessage', {
                    chat_id: id,
                    status: 200,
                    text: toSend.content 
                })
                .then(response => {
                    console.log('Message posted')
                    res.end('ok')
                })
                .catch(err => {
                    console.log('Error :', err)
                    res.end('Error :' + err)
                })
                break;

            case "photo":
                axios.post('https://api.telegram.org/' + BOT_TOKEN + '/sendPhoto', {
                    chat_id: id,
                    type: 'photo',
                    photo: 'https://imgur.com/Mk2MvBQ',
                    status: 200,
                    caption: 'I ❤️ D&B Logo: https://imgur.com/Mk2MvBQ'   
                })
                .then(response => {
                    console.log('Message posted');
                    res.end('ok');
                })
                .catch(err => {
                    console.log('Error :', err);
                    res.end('Error :' + err);
                })
                break;

            case "fight":
                console.log(id)
                for (ft=0;ft<14;ft++){
                    axios.post('https://api.telegram.org/' + BOT_TOKEN + '/sendMessage', {
                        chat_id: id,
                        status: 200,
                        text: randomPick(vocab.fightTalk)    
                    })
                    .then(response => {
                        var start = new Date().getTime();
                        var end = start;
                        while (end < start + 250) {
                            end = new Date().getTime();
                        }
                        console.log('Message posted')
                        res.end('ok')
                    })
                    .catch(err => {
                        console.log('Error :', err)
                        res.end('Error :' + err)
                    })
                }
                break;

            case "status":
                /* THIS SHIT IS FUCKING MENTAL.. SORRY, DONT KNOW WHAT I WAS THINKING HERE!
                THIS IS LIKE CALLBACK AND NEWBIE HELL ROLLED INTO ONE lolz */
                var time = new Date();
                var chatSize="Hey " + userName + " It\'s "+ time.toUTCString() + " There are ";
                request.get({
                    url:'https://api.telegram.org/' + BOT_TOKEN + '/getChatMembersCount?chat_id=' + MAIN_ROOM
                }, 
                function (error1, responseB, response1) {
                    chatSize += (JSON.parse(response1).result) + " People in the Main Room, ";
                    request.get({
                        url:'https://api.telegram.org/' + BOT_TOKEN + '/getChatMembersCount?chat_id=' + ARTIST_ROOM
                    }, 
                    function (error1, responseB, response1) {
                        chatSize += (JSON.parse(response1).result) + " People in the Artist Room and ";
                        request.get({
                            url:'https://api.telegram.org/' + BOT_TOKEN + '/getChatMembersCount?chat_id=' + LABEL_ROOM
                        }, 
                        function (error1, responseB, response1) {
                            chatSize += (JSON.parse(response1).result) + " People in the Label Room. Have a nice day!"
                            axios.post('https://api.telegram.org/' + BOT_TOKEN + '/sendMessage', {
                                chat_id: id,
                                status: 200,
                                text: chatSize
                            })
                            .then(response => {
                                // word?
                                var start = new Date().getTime();
                                var end = start;
                                while (end < start + 250) {
                                    end = new Date().getTime();
                                }
                                console.log('Message posted')
                                res.end('ok')
                            })
                            .catch(err => {
                                console.log('Error :', err)
                                res.end('Error :' + err)
                            })
                        })
                    })
                });       
                break;
            default: return res.end('ok')
        }
    }
});

function updateThePlaylist(resToLambda, room = 459812199){
    var SpotifyWebApi = require('spotify-web-api-node');
    var rp = require('request-promise');
    var nodemailer = require('nodemailer');
    var PromiseThrottle = require('promise-throttle');
    var promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 3,
        promiseImplementation: Promise
    });
    var TRANSPORTER = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: MAIL_DS,
            pass: EMAIL_PASSWORD
        }
    });

    var idName = [], i = -1, tokenExpiry, searchString = '', globalToken = "", errorLog = '';
    const colours = {
        Reset: "\x1b[0m%s\x1b[0m",
        Bright: "\x1b[1m%s\x1b[0m",
        Dim: "\x1b[2m%s\x1b[0m",
        Underscore: "\x1b[4m%s\x1b[0m",
        Blink: "\x1b[5m%s\x1b[0m",
        Reverse: "\x1b[7m%s\x1b[0m",
        Hidden: "\x1b[8m%s\x1b[0m",
        FgBlack: "\x1b[30m%s\x1b[0m",
        FgRed: "\x1b[31m%s\x1b[0m",
        FgGreen: "\x1b[32m%s\x1b[0m",
        FgYellow: "\x1b[33m%s\x1b[0m",
        FgBlue: "\x1b[34m%s\x1b[0m",
        FgMagenta: "\x1b[35m%s\x1b[0m",
        FgCyan: "\x1b[36m%s\x1b[0m",
        FgWhite: "\x1b[37m%s\x1b[0m",
        BgBlack: "\x1b[40m%s\x1b[0m",
        BgRed: "\x1b[41m%s\x1b[0m",
        BgGreen: "\x1b[42m%s\x1b[0m",
        BgYellow: "\x1b[43m%s\x1b[0m",
        BgBlue: "\x1b[44m%s\x1b[0m",
        BgMagenta: "\x1b[45m%s\x1b[0m",
        BgCyan: "\x1b[46m%s\x1b[0m",
        BgWhite: "\x1b[47m%s\x1b[0m",
    }

    const mailOptions = (err) => {
        return {
            from : 'Luvbot',
            to : [MAIL_DS, MAIL_SB],
            subject : 'I can\'t update the playlist!',
            text : `Word up son,\n\nThere\'s a problem with the playlist updater, and i can\'t do SHIT about it!\nHere\'s the error log: \n${err}`
        };
    };

    const sendEmail = (contents) => {
        TRANSPORTER.sendMail(mailOptions(contents), function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            };
        });
    };

    function wait(time) {
        return new Promise((resolve, fail) => {
            var start = new Date().getTime();
            var end = start;
            while (end < start + time) {
                end = new Date().getTime();
            }
            resolve()
        })
    }
    
    function errorRespond(err) {
        if (err.statusCode !== undefined) {
            if (err.statusCode == '429') {
                return function () {
                    console.log(colours.FgRed, "Error 429, Waiting for " + JSON.stringify(err.response.headers["retry-after"]) + ' Seconds..');
                    wait((err.response.headers["retry-after"] * 1000) + 1000);
                }();
            } else {
                return function () {
                    console.log(colours.FgRed, "Error : " + err.statusCode);
                    wait(3000)
                }();
            };
        } else {
            return console.log(colours.FgRed, 'Error: undefined ' + err)
        }
    }

    function todaysDate(){
        var q = new Date(), m = q.getMonth(), d = q.getDate(), y = q.getFullYear()
        return new Date(y, m, d)
    }
    
    function spotObj (status,track_name,artist_name,uri,album_id) {
        this.artist_name= artist_name;
        this.track_name= track_name;
        this.album_id= album_id;
        this.uri= uri;
        this.label=null;
        this.tracks_total=null;
        this.release_date= null;
        this.added_date='';
        this.status= { text:null , colour:null };
        this.res = {};
        this.to_be_added=null;
        this.to_be_logged=null;
        this.check_within_month = () => this.release_date + this.added_date,
        this.check_added_within_week = () => this.release_date + this.added_date,
        this.checkthis = (arg) => {
            this.uri=arg; 
            return this.uri;
        };
        this.set_status = () => {
            results=[]
            if ((todaysDate() > this.release_date) && (todaysDate() - this.release_date) >= 2505600000) { 
                // CHECK IF OVER A MONTH OLD
               this.status.text = "Older than a month";
               this.status.colour = colours.FgRed;
               this.to_be_added = false;
               this.to_be_logged = false;
               oldLabels += `${this.label}, Added: ${this.added_date.toString().substring(0,10)}, Released: ${this.release_date.toString().substring(0,10)}. `;
            } else if (this.added_date - this.release_date > 1866240000) {
                // IS THERE OVER A WEEK BETWEEN ADDED AND RELEASE DATE?
                if(this.tracks_total >= 8) {
                    this.status.text = "Older than 1 Week but added as Album Track.";
                    this.status.colour = colours.FgGreen;
                    this.to_be_added = true;
                    this.to_be_logged = 5;
                } else if (this.added_date  == todaysDate()) {
                    this.status.text = "Added today but over a week old so not added.";
                    this.status.colour = colours.FgRed;
                    this.to_be_logged = 3;
                    this.to_be_added =false;
                };
                  //WAS IT ADDED TODAY?      
            } else  if (this.added_date >= todaysDate()) {
                this.status.text = "ADDED TODAY.";
                this.status.colour = colours.FgGreen;
                this.to_be_added = true;
                this.to_be_logged = 2;
                if (this.added_date == this.release_date){
                    this.status.text = "NEW TODAY!";
                    this.status.colour = colours.FgGreen;
                    this.to_be_added = true;
                    this.to_be_logged = 1;
                };
            } else if (this.release_date > todaysDate()) {
                this.status.text = "Date field incorrectly shows "+this.release_date.toString().substring(0,10)+".";
                this.status.colour = colours.FgRed;
                this.to_be_added = true;
                this.to_be_logged = 5 ; 
            } else {
                this.status.text = "Within a month old";
                this.status.colour = colours.FgWhite;
                this.to_be_added = true;
                this.to_be_logged = false;
            };

            if (!this.label && this.status.text !== 'undefined') {
                this.status.text = "No label Metadata";
                this.status.colour = colours.FgRed;
                this.to_be_logged = 6;
            };

            if (this.status.text && (!this.status.text == 'Empty' || this.status.text.indexOf('error') !== -1 || this.status.text.indexOf('Error') !== -1)) {
                this.status.colour=colours.FgRed;
                this.to_be_added=false;
                this.to_be_logged=7;
            };

            if ((!this.track_name || !this.artist_name || !this.uri || !this.album_id) && this.status.text !=='undefined') {
                this.status.text="MetaData filed incorrectly";
                this.to_be_logged=8;
                this.status.colour = colours.FgRed
            }; 
        };
    };
    
    function spotifyCall(option, searchTerm) {
        this.searchTerm = searchTerm;
        this.option = option;
        this.urls = [];
        var that = this, ref = [];

        this.rpSafe = function(options) {
            return new Promise((resolve, fail) => {
                var newTime = new Date().getTime();
                if (tokenExpiry - newTime <= 3000) {
                    rp.post({
                        url: 'https://accounts.spotify.com/api/token',
                        headers: {
                            'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
                        },
                        form: {
                            grant_type: 'refresh_token',
                            refresh_token: REFRESH_TOKEN
                        },
                        json: true
                    }, 
                    function (error, response, body) {
                        if (!error && response.statusCode === 200) {
                            console.log(colours.BgRed, "Refreshed Token, Will expire in: " + body.expires_in);
                            globalToken = body.access_token;
                            var newTime2 = new Date().getTime();
                            var exp = (Math.floor(body.expires_in / 60) * 7000);
                            tokenExpiry = newTime2 + exp;
                            resolve(rp(options));
                        } else {
                            console.log(colours.FgRed, '\nError in refresh call\n');
                        };
                    })
                } else {
                    resolve(rp(options));
                };
            });
        };
    
        this.getUrls = () => this.urls;
    
        this.optionsGetAlbums = id => {
            var options = {
                url: 'https://api.spotify.com/v1/albums/'+id,
                resolveWithFullResponse: true,
                headers: {
                    'Authorization': 'Bearer ' + globalToken,
                },
                json: true
            };
            return options;
        };
    
        this.optionsGetTotal = letter => {
            var options = {
                url: 'https://api.spotify.com/v1/search?q=' + that.searchTerm + ' ' + letter + '*&type=playlist&limit=50&offset=0',
                resolveWithFullResponse: true,
                headers: {
                    'Authorization': 'Bearer ' + globalToken,
                },
                json: true
            };
            return options
        };

        this.optionsGetUrls = (letter, offset) => {
            var options = {
                url: 'https://api.spotify.com/v1/search?q=' + that.searchTerm + ' ' + letter + '*&type=playlist&limit=50&offset=' + offset,
                headers: {
                    'Authorization': 'Bearer ' + globalToken,
                },
                json: true
            }
            return options;
        };

        this.optionsGetPlaylistsTracks = splitUrl => {       
            var options = {
                url: 'https://api.spotify.com/v1/users/' + splitUrl[4] + '/playlists/' + splitUrl[6] + '/tracks',
                headers: {
                    'Authorization': 'Bearer ' + globalToken
                },
                json: true
            };
            return options;
        };

        this.optionsGetPlaylists = (href) => {
            var options = {
                url: 'https://api.spotify.com/v1/users/' + href.split('/')[5] + '/playlists/' + href.split('/')[7],
                headers: {
                    'Authorization': 'Bearer ' + globalToken
                },
                json: true
            };
            return options
        };
    
        this.optionsGetTrackNames = (id) => {
            var options = {
                url: 'https://api.spotify.com/v1/tracks/' + id,
                headers: {
                    'Authorization': 'Bearer ' + globalToken
                },
                json: true
            }
            return options;
        };
    
        this.multiCall = (array, total) => {
            switch (that.option) {
                case 'getSearchResultTotal':
                    array.forEach((letter2, i) => {
                        ref[i] = rp(that.optionsGetTotal(letter2));
                    });
                    return new Promise((resolve, fail) => {
                        var remaining, resArray = [];
                        remaining = ref.length;
                        ref.forEach((call, i) => {
                            call
                            .then(result => {
                                resArray[i] = result.body.playlists.total;
                                remaining -= 1;
                                !remaining ? resolve(resArray) : null;
                            })
                            .then(() => wait(300))
                        });
                    });
    
                case 'getTrackNames':
                    var throt3 = function (i) {
                        var resArray = [];
                        return new Promise(function (resolve, reject) {
                            that.rpSafe(that.optionsGetTrackNames(i))
                            .then(res => {
                                resArray.push(i, res.name);
                                resolve(resArray);
                            }).catch(e => {
                                errorLog += '\n' + e;
                                return errorRespond(e);
                            })
                        });
                    };

                    return new Promise((resolve, fail) => {
                        array.forEach((id, i) => {
                            ref.push(promiseThrottle.add(throt3.bind(this, id.split(':')[2])));
                        })
                        Promise.all(ref)
                        .then(function (r) {
                            r.forEach((item) => {
                                idName.push(item);
                                console.log(item);
                            });
                            resolve(idName);
                        })
                        .then(function (idName) {
                            return idName;
                        })
                        .catch(e => {
                            errorLog += '\n' + e;
                            console.log(colours.FgRed, 'Error searching ' + i + '* at Offset ' + j);
                            return errorRespond(e)
                        })
                    });

                case 'getUrls':
                    var throt2 = function (i, j) {
                        var resArray = []
                        return new Promise(function (resolve, reject) {
                            that.rpSafe(that.optionsGetUrls(i, j))
                            .then(res => {
                                console.log('url ' + i + ' ' + j)
                                if (typeof res.playlists.items != "undefined") {
                                    res.playlists.items.forEach((playlist) => {
                                        resArray.push(playlist.tracks.href);
                                    });
                                };
                                resolve(resArray);
                            })
                            .catch(e => {
                                errorLog += '\n' + e;
                                errorRespond(e);
                                resolve(resArray);
                                console.log(colours.FgRed, 'Error searching ' + i + '* at Offset ' + j); 
                            })
                        });
                    };

                    return new Promise((resolve, fail) => {
                        array.forEach((letter, i) => {
                            for (offset = 0; offset < Math.min(total[i], 10000); offset++) {
                                if (offset % 50 == 0) ref.push(promiseThrottle.add(throt2.bind(this, letter, offset)));
                            };
                        });
                        Promise.all(ref)
                        .then(function (r) {
                            console.log('got urls');
                            var sendArray = [];
                            r.forEach((item) => {
                                if (typeof item != "undefined") {
                                    item.forEach((url) => {
                                        sendArray.indexOf(url) == -1 ? sendArray.push(url) : null
                                    });
                                };
                            });
                            resolve(sendArray);
                        })
                        .then(function (sendArray) {
                            return sendArray;
                        })
                        .catch(e => {
                            errorLog += '\n' + e;
                            console.log(colours.FgRed, 'Error resolving .all getting search results');
                            errorRespond(e);
                            resolve(sendArray);
                            return sendArray;
                        })
                    });
    
                case 'getAlbums':
                    var throt = function (spotObj) {
                        return new Promise(function(resolve, reject) {
                            if (spotObj.album_id!=null && (typeof spotObj && typeof spotObj.album_id)!='undefined') {
                                that.rpSafe(that.optionsGetAlbums(spotObj.album_id))
                                .then(res => {
                                    spotObj.res=res.body;
                                    resolve(spotObj);
                                })
                                .catch(e => {
                                    errorLog += '\n' + e;
                                    resolve(e);
                            })} else {
                                resolve(spotObj);
                            };
                        });
                    };

                    return new Promise((resolve, fail) => {
                        array.forEach((spotObj) => {
                            ref.push(promiseThrottle.add(throt.bind(this, spotObj)));
                        });

                        Promise.all(ref)
                        .then(function (r) {       
                            resolve(r);
                        })
                        .catch(e => {
                            errorLog += '\n' + e;
                            errorRespond(e);
                            resolve(e);
                        })
                    })
    
                case 'getPlaylistsTracks':
                    var throt3 = function (i) {
                        return new Promise(function (resolve, reject) {
                            that.rpSafe(that.optionsGetPlaylistsTracks(i))
                            .then(res => {
                                resolve(res);
                            })
                            .catch(e => {
                                errorLog += '\n' + e;
                                console.log(colours.FgRed, 'Error  with ' + JSON.stringify(i));
                                errorRespond(e);
                                resolve(e);
                            })
                        });
                    };

                    return new Promise((resolve, fail) => {
                        array.forEach((url, i) => {
                            ref.push(promiseThrottle.add(throt3.bind(this, url.split('/'))))
                        });
                        Promise.all(ref)
                        .then(function (r) {                          
                            resolve(r)
                        })
                        .catch(e => {
                            errorLog += '\n' + e
                            console.log(colours.FgRed, 'Error resolving .all getting playlists Urls');
                            errorRespond(e)
                            resolve(e)
                        })
                    });
            };
        };
    };
    
    
    function start() {
        console.log(colours.FgGreen,'Started Updating Playlist ..\n');
        var getAlbums = new spotifyCall('getAlbums', searchString);
        var getPlaylists = new spotifyCall('getPlaylistsTracks');
        rp.post({
                url: 'https://accounts.spotify.com/api/token',
                headers: {
                    'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
                },
                form: {
                    grant_type: 'refresh_token',
                    refresh_token: REFRESH_TOKEN
                },
                json: true
            },
            (error,response,body) => {
                globalToken = body.access_token;
                tokenExpiry = new Date() + (Math.floor(body.expires_in / 60) * 10000);
            }
        )
        .then(() => rp(DROPBOX))
        .then(data => {
            data.split('\n')[0].indexOf('alive') !== -1 ? updateAlive = true : updateAlive = false
            console.log('Update Alive: ' + updateAlive)
            if (!updateAlive){
                resToLambda && resToLambda.send('Updater set to Dead');
                process.exit();
            } else {
                resToLambda && resToLambda.send('Updater initialised');
            };
            var urls = data.split('\n'), list =[]
            playlistReport=''
            labelsAdded=''
            oldLabels=''
            urls.forEach(function(item){
                list.push(item.substring(0, item.length - 1))
            })
            list.shift()
            spotObj.prototype.calls = list.length
            return getPlaylists.multiCall(list)
        })
        .then(res => {
            var calls = [], objToSet=[], callsToMake=[];
            res.forEach((result,i) => {
                objToSet[i] = new spotObj ()
                if (typeof (result && result.total) == 'undefined' || result.total == 0 || result.error) {
                    objToSet[i].status.text='Empty';
                    objToSet[i].status.colour='FgRed';
                    objToSet[i].to_be_logged=8;
                    if(typeof result!=='undefined' && typeof result.uri!='undefined') {
                        console.log(colours.FgRed,'Playlist '+result.uri+' Empty');
                        playlistReport+='Playlist '+result.uri+' Empty\n';
                    };
                } else {
                    typeof (result.items[0] && result.items[0].track && result.items[0].track.artists[0] && result.items[0].track.artists[0].name) !== 'undefined' ? objToSet[i].artist_name=result.items[0].track.artists[0].name : null
                    typeof (result.items[0] && result.items[0].track && result.items[0].track.name) !== 'undefined' ? objToSet[i].track_name=result.items[0].track.name : null
                    typeof (result.items[0] && result.items[0].track && result.items[0].track.album.id) !== 'undefined' ? objToSet[i].album_id=result.items[0].track.album.id : objToSet[i].album_id=result.items[1].track.album.id !== 'undefined' ? result.items[1].track.album.id : null        
                    typeof (result.items[0] && result.items[0].added_at) !== 'undefined' ? objToSet[i].added_date= new Date(result.items[0].added_at) : null
                    typeof (result.items[0] && result.items[0].track && result.items[0].track.uri) !== 'undefined' ? objToSet[i].uri=result.items[0].track.uri : null
                };
                calls.push(objToSet[i]);
            });

            calls.forEach((call)=>{
                call.album_id?callsToMake.push(call):null
            });
            return getAlbums.multiCall(callsToMake);
        })
        .then(spotObjectArray=> { 
            resultArray=[];
            var idArray = [], dateNow = Math.round(Date.now()/86400000).toString().substr(2, 5);
            spotObjectArray.forEach(result => {
                if (typeof result !== 'undefined' && result && !result.error) {
                    typeof (result.res && result.res.release_date)!='undefined' ? result.release_date=new Date(result.res.release_date) : null
                    typeof (result.res && result.res.label) !== "undefined" ? result.label=result.res.label : null
                    typeof (result.res && result.res.tracks && result.res.tracks.total) !== "undefined" ? result.tracks_total=result.res.tracks.total : null
                }; 
                result.res=null
                if (typeof result !='undefined' && !result.error) result.set_status();
                resultArray.push(result);
            });
            for (var scanDate = dateNow; scanDate > 0; scanDate --) {
                resultArray.forEach((toBeSorted)=>{
                    if (toBeSorted.to_be_added){ 
                        if ((Math.round(Date.parse(toBeSorted.added_date)/ 86400000).toString().substr(2, 5) == scanDate) && typeof toBeSorted.uri!== 'undefined') { 
                            idArray.push(toBeSorted.uri)
                            labelsAdded+=toBeSorted.label+', '
                        } else if (typeof toBeSorted.uri== 'undefined') {
                            toBeSorted.status.text="URI undefined."
                            toBeSorted.status.colour=colours.FgRed
                            toBeSorted.to_be_added=false
                            toBeSorted.to_be_logged=5  
                        };     
                    };
                });
            };
    
            for (i=0; i<8; i++) {
                resultArray.forEach(result => { 
                    if (result.to_be_logged && result.to_be_logged==i) {
                        console.log(result.status.colour,`\'${result.track_name} / ${result.artist_name}\' on ${result.label}: ${result.status.text}`);
                        playlistReport =`\'${result.track_name} / ${result.artist_name}\' on ${result.label}: ${result.status.text}\n`;
                    };
                });
            };
            
            if (idArray.length){
                var spotifyApi = new SpotifyWebApi();
                spotifyApi.setAccessToken(globalToken);
                spotifyApi.replaceTracksInPlaylist('iluvdrumandbass', '1yRrivuEUTh5upqzeZOFBG', idArray)
                .then(function(data) {
                    console.log(colours.FgGreen,`\nPlaylist Sucessfully Replaced ${new Date().toUTCString()}\n`);
                    playlistReport+=`Updated ${new Date().toUTCString()}\n\nYou can ask me what playlists were added, or what playlists were not added 😊`
                    axios.post('https://api.telegram.org/' + BOT_TOKEN + '/sendMessage', {
                        chat_id: room,
                        status: 200,
                        text: playlistReport 
                    });
                }, function(err) {
                    errorLog += '/n' + err
                    resToLambda && resToLambda.send('Error: ', err);
                    console.log(colours.BgRed,`\nSomething went wrong! ${err} at ${new Date().toUTCString()}\n\n`);
                    axios.post('https://api.telegram.org/' + BOT_TOKEN + '/sendMessage', {
                        chat_id: room,
                        status: 200,
                        text: 'Playlist update failed, retrying ..'
                    });
                    wait(3000);
                    start();
                });
            };
        })
        .catch(e => {
            errorLog += '/n' + e
            // sendEmail(errorLog)
            console.log(colours.BgRed, 'error in main: ' + e);
            return errorRespond(e);
        })
    };
    start();
};

app.listen(3000, function () {
    console.log('LuvBot now listening on port 3000! ok');
});