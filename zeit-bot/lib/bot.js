function checkIntent(string2, anyOfArray, alsoArray, And) {
    /*search a string for any element of anyOfArray, OPTION alsoArray one of these elements must also be found
    if AND is set then all*/
    var found = null
    for (let i = 0; i < anyOfArray.length; i++) {
        if ((string2.indexOf(anyOfArray[i]) !== -1) && typeof anyOfArray == "object") {
            found = true;
            i = anyOfArray.length;
        } else if (typeof anyOfArray == "string" && string2.indexOf(anyOfArray) !== -1) {
            found = true
        }
    }
    if (And) {
        if (alsoArray) {
            var alsoFound = 0
            for (let j = 0; j < alsoArray.length; j++) {
                if (string2.indexOf(alsoArray[j]) !== -1) {
                    alsoFound++
                }
            }
            if ((alsoFound == alsoArray.length) && (found == 1)) {
                found = true
            } else {
                found = false
            }
        }
    } else {
        if (alsoArray) {
            var alsoFound = null
            for (let j = 0; j < alsoArray.length; j++) {
                if ((string2.indexOf(alsoArray[j]) !== -1) && typeof alsoArray == "object") {
                    alsoFound++;
                } else if (typeof alsoArray == "string" && string2.indexOf(alsoArray) !== -1) {
                    alsoFound++;
                }
            }
            if ((alsoFound) && (found)) {
                found = true
            } else {
                found = false
            }
        }
    }
    if (found == true) {
        return true
    } else {
        return false
    }
};

function randomPick(array) {
    return array[Math.floor(Math.random() * array.length)]
};

function makeTelMsg(content) {
    const message = {
        messageId: 35,
        content: content
    };
    switch (true) {
        case message.content.indexOf("jpg") !== -1:
            message.type = 'photo';
            break;
        case message.content.indexOf("gif") !== -1:
            message.type = 'photo';
            break;
        case message.content.indexOf("png") !== -1:
            message.type = 'photo';
            break;
        case message.content.indexOf("mp4") !== -1:
            message.type = 'video';
            break;
        case message.content.indexOf("mpeg") !== -1:
            message.type = 'video';
            break;
        default:
            message.type = 'message'
    }
    return message
}

export { checkIntent, randomPick, makeTelMsg };