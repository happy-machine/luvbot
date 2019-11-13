/* THIS WAS THE FIRST JAVASCRIPT SERVICE I EVER WROTE, HENCE THE SPAGHETTI CODE, SORRY
WILL GET ROUND TO REFACTORING WHEN I HAVE TIME, THE MOST NOTABLE ISSUES ARE THE MIX OF VARIOUS
PRE ES6 CONVENTIONS WITH ES7, THAT THERE ARE NO IMPORTS, LOTS OF GLOBALS ETC ETC

THIS PROJECT STARTED OFF AS A SEPERATE BOT AND SCHEDULER CODE, WHICH ARE NOW ENCAPSULATED IN TWO FUNCTIONS
WHICH TO SOME EXTENT EXPLAINS WHY I USED REQUEST_PROMISE AND AXIOS IN THE SAME FILE (??)*/

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const axios = require('axios')

require('dotenv').config()

import { colours } from './constants';
import { messageFactory, adminFactory, resourceFactory } from './lib/message-factory';
import { wait, errorRespond, todaysDate } from './lib/tools';
import { checkIntent, randomPick, makeTelMsg } from './lib/bot';
import { playlistFactory } from './service/spotify-service';
import { ADMIN_GROUP } from './service/room-service';
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
} = process.env;

let updateAlive, playlistReport, resultArray = [], labelsAdded = '', oldLabels = '', reportWanted = false;

app.get('/diagnostic', function (req,res) {
    console.log('Diagnostic requested at: ', new Date().toUTCString())
    res.status(200).send({ response: 'OK' })
});

app.get('/make-playlist', function (req,res) {
    console.log('Lambda playlist requested at ', new Date().toUTCString())
    const resToLambda = res
    updateThePlaylist(resToLambda)
});
       
app.post('/new-message', function (req, res) {
    const { message } = req.body
    let toSend, resourceType, fightMode = false;
    if (!message || typeof message == "undefined") {
        return res.end();
    } else {
        if (typeof message.text !== "undefined") {
            const msgIn = message.text.toLowerCase()
            console.log('new message from room id: ', message.chat.id);
            toSend = { content: null };
            if (checkIntent(msgIn, vocab.robotHailsIn) && typeof message !== undefined) {
                /* First check the intent of the message, returns either a message, type,
                or both */
                console.log('Message recieved: ', msgIn);
                const response = messageFactory({ msgIn, oldLabels, labelsAdded, playlistReport, message });
                toSend = response.toSend;
                resourceType = response.resourceType;
                reportWanted = response.reportWanted;
                if (resourceType && typeof message!=undefined && fightMode==false) {
                    if (Object.keys(ADMIN_GROUP).includes(message.chat.id)) {
                        /* if the user is in the Admin group then operate on types accordingly */
                        const { tmpMessage, tmpPicture } = adminFactory({ 
                            msgIn, 
                            oldLabels, 
                            labelsAdded, 
                            playlistReport, 
                            updateThePlaylist, 
                            resourceType,
                            message
                        });
                        toSend = tmpMessage;
                        pictureWanted = tmpPicture;
                    } else {
                        /* if the user is not in the Admin group then refuse the request */
                        toSend = makeTelMsg('please ask for that in the label or admin rooms.');
                    };
                };           
            };
            if (checkIntent(msgIn, 'hey hatebot fight luvbot') && typeof message !== undefined) toSend.type="fight";
        } else {
            return res.end();
        };
        // Return a message with resources
        console.log('sending: ', toSend)
        resourceFactory({ message, toSend, res });
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
                url: 'https://api.spotify.com/v1/albums/' + id,
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
                    var throt = function (playlistFactory) {
                        return new Promise(function(resolve, reject) {
                            if (playlistFactory.album_id!=null && (typeof playlistFactory && typeof playlistFactory.album_id)!='undefined') {
                                that.rpSafe(that.optionsGetAlbums(playlistFactory.album_id))
                                .then(res => {
                                    playlistFactory.res=res.body;
                                    resolve(playlistFactory);
                                })
                                .catch(e => {
                                    errorLog += '\n' + e;
                                    resolve(e);
                            })} else {
                                resolve(playlistFactory);
                            };
                        });
                    };

                    return new Promise((resolve, fail) => {
                        array.forEach((playlistFactory) => {
                            ref.push(promiseThrottle.add(throt.bind(this, playlistFactory)));
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
            playlistFactory.prototype.calls = list.length
            playlistFactory.prototype.oldLabels = oldLabels;
            return getPlaylists.multiCall(list)
        })
        .then(res => {
            var calls = [], objToSet=[], callsToMake=[];
            res.forEach((result,i) => {
                objToSet[i] = new playlistFactory ()
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

export { app };