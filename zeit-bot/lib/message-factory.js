const axios = require('axios');
const request = require('request');
import { checkIntent, randomPick, makeTelMsg } from './bot';
import { ROOM_NAMES } from '../service/room-service';
import * as vocab from './vocab';
const { 
    DROPBOX, 
    LABEL_ROOM,
    ADMIN_ROOM,
    ARTIST_ROOM,
    MAIN_ROOM,
    TEST_ROOM,
    LABEL_UPDATE_FORM_LINK,
    LABEL_NEWS_LINK,
    LABEL_SUBMISSION_FORM_LINK,
    UPDATE_COMMAND,
    BOT_TOKEN
} = process.env;


function messageFactory (inputs) {
    const { msgIn, oldLabels, labelsAdded, playlistReport, message } = inputs;
    const userName = message.from.first_name;
    let toSend = { content: null };
    let resourceType = null, reportWanted = false;
    let tmp;

    switch (true) {
        /*  case checkIntent(msgIn.substr(0,19), 'add url'):
            //toSend = makeTelMsg('not sure thats a great idea!')
            resourceType="add";
            break;    
        case checkIntent(msgIn.substr(0,23), 'replace url'):
            resourceType="replace";
            break;   
        case checkIntent(msgIn.substr(0,22), 'remove url'):
            resourceType="remove"
            break;  */
        case checkIntent(msgIn, vocab.orderIn, 'label urls'):
            toSend = makeTelMsg('Here is the list of Playlist URLs ' + DROPBOX);
            break; 

        case checkIntent(msgIn, 'not','added',vocab.AND):
            toSend = makeTelMsg('These are the labels not added in the last update: ' + oldLabels.substring(0,oldLabels.length-1))
            break;

        case checkIntent(msgIn, 'were','added',vocab.AND):
        toSend = makeTelMsg('These are the labels added in the last update: ' + labelsAdded.substring(0,labelsAdded.length-2))
        break;

        case checkIntent(msgIn, 'whats happening'):
        toSend.type="status";
        break;

        case checkIntent(msgIn, UPDATE_COMMAND):
        resourceType="update";
        break;

        case checkIntent(msgIn, 'link','playlist'):
            toSend = makeTelMsg('Sure it\'s ' + MAIN_PLAYLIST_LINK);
            break;

        case checkIntent(msgIn, 'love'):
            toSend = makeTelMsg(randomPick(vocab.loveOut));
            break;

        case checkIntent(msgIn, vocab.questionIn,'room'):
            const room = ROOM_NAMES[message.chat.id];
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
            resourceType = "picture";
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
            resourceType = "news";
            console.log("Label News Requested");
            break;

        case checkIntent(msgIn, 'label', vocab.listIn):
            resourceType = "form";
            break;

        case checkIntent(msgIn, vocab.logIn):
            resourceType = "log";
            break;

        case checkIntent(msgIn, 'own', vocab.questionIn):
            toSend = makeTelMsg('when it comes to the playlist, we all own it together');
            break;

        case checkIntent(msgIn, 'time'):
            var time = new Date();
            toSend = makeTelMsg("Its " + time.toUTCString());
            break;

        case checkIntent(msgIn, vocab.playlistIn, vocab.orderIn):
            toSend = makeTelMsg(playlistReport);
            reportWanted = true;
            console.log("Report requested");
            break;

        case checkIntent(msgIn, vocab.playlistIn, vocab.newIn):
            toSend = makeTelMsg(playlistReport);
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
    return { toSend, resourceType, reportWanted };
};

function adminFactory (inputs) {
    const { msgIn, resourceType, message } = inputs;
    const userName = message.from.first_name;
    let destUrl;
    let tmp;
    switch (true) {
        case resourceType == "news":
            toSend = makeTelMsg('Latest label News: ' + LABEL_NEWS_LINK);
            break;

        case resourceType == "add":
        fs.readFile ('/tmp/PlayBoyLabelUrls.txt', 'utf8', function (err, data) {
            if (err) {
                toSend = makeTelMsg('I\'m afraid there was an Error reading the URL list.')
                console.log("Error reading URL list.");
                throw err;
            } else { 
                if (data.indexOf(msgIn.substr(23))!== -1) {
                    toSend = makeTelMsg('That Url has already been added to the playlist')
                } else {
                    tmp = data;tmp=tmp+"\n" + msgIn.substr(23);
                    fs.writeFile ('/tmp/PlayBoyLabelUrls.txt', tmp, function(err) {
                    if (err) {
                        throw err;
                        toSend = makeTelMsg('Error adding url.');console.log('Error adding:'+msgIn.substr(23));
                    } else {
                        toSend = makeTelMsg('Url:'+msgIn.substr(23)+' sucessfully added!')}});
                };
                console.log('URL:'+msgIn.substr(23)+' added successfully');
            };
        });    
        break;

        case resourceType == "replace":
            console.log("in replace " + os.tmpdir())
            fs.readFile ('/tmp/PlayBoyLabelUrls.txt', 'utf8', function (err, data) {
                console.log(data)                       
                if (err) {
                    toSend = makeTelMsg('I\'m afraid there was an Error.');
                    console.log("Error reading file"+err);
                    throw err; 
                } else { 
                    destUrl=msgIn.substr(23).split(' ');
                    repUrl=destUrl[1];
                    console.log(destUrl[0]);
                    if (data.indexOf(destUrl[0]) !== -1) {
                        tmp = data;
                        tmp = data.replace(destUrl[0],repUrl);
                        fs.writeFile ('/tmp/PlayBoyLabelUrls.txt', tmp, function(err) {
                            if (err) {
                                toSend = makeTelMsg('Error adding url.');
                                console.log('Error adding:'+repUrl);
                                throw err;
                            } else {
                                toSend = makeTelMsg('Url:'+destUrl[0]+' sucessfully replaced with\n'+repUrl);
                                console.log('Url:'+destUrl[0]+' sucessfully replaced with\n'+repUrl);
                            }
                        });
                    } else {
                        toSend = makeTelMsg('Url:'+destUrl[0]+' Not found!');
                        console.log('Url:'+destUrl[0]+' Not found!');
                    };
                };
            });
            break;

        case resourceType == "remove":
            fs.readFile ('/tmp/PlayBoyLabelUrls.txt', 'utf8', function (err, data) {
                if (err) {
                    toSend = makeTelMsg('I\'m afraid there was an Error.');
                    throw err;
                } else { 
                    if (data.indexOf(msgIn.substr(26)) !== -1) {
                        tmp=data;
                        tmp=data.replace(msgIn.substr(26),'');
                        fs.writeFile ('/tmp/PlayBoyLabelUrls.txt', tmp, function(err) {
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
                        toSend = makeTelMsg('Url:'+msgIn.substr(26)+' Not found!');
                    };
                };
            });
            toSend.type="message";
            break;

        case resourceType == "form":
            toSend = makeTelMsg('here is the label update form: ' + LABEL_UPDATE_FORM_LINK);
            break;

        case resourceType == "log":
            toSend = makeTelMsg('The log is no longer available, please speak to Dan Fresh for access');
            break;

        case resourceType == "picture":
            toSend = makeTelMsg("I am a new version in testing i cannot send pictures yet.");
            pictureWanted = true;
            break;
            
        case resourceType == "update":
            toSend = makeTelMsg("Updating the playlist, report will be available soon.");
            res.end('ok');
            updateThePlaylist(null, message.chat.id);
    };
};

function resourceFactory (inputs) {
    const { toSend, message, res } = inputs
    const userName = message.from.first_name;
    switch (toSend.type) {
        case "message":
        console.log(message.chat.id)
            axios.post('https://api.telegram.org/' + BOT_TOKEN + '/sendMessage', {
                chat_id: message.chat.id,
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
                chat_id: message.chat.id,
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
            console.log(message.chat.id)
            for (ft=0;ft<14;ft++){
                axios.post('https://api.telegram.org/' + BOT_TOKEN + '/sendMessage', {
                    chat_id: message.chat.id,
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
                            chat_id: message.chat.id,
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

export { messageFactory, adminFactory, resourceFactory };