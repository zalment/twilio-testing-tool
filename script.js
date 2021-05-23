let phoneNumber = document.getElementById("number")
let msgs = document.querySelector(".msgs")
let cont = document.querySelector(".cont")
let newMsg = document.getElementById("input")
let button = document.getElementById("send")
let urlInput = document.getElementById("url")
let routeInput = document.getElementById("route")

let sound=new Audio('msg_sound.mp3')

let url = urlInput.value == "" ? "http://127.0.0.1:3000/" : urlInput.value
url+=routeInput.value
urlInput.addEventListener("change", () => {
    url = urlInput.value == "" ? "http://127.0.0.1:3000/" : urlInput.value
    url+=routeInput.value
})
routeInput.addEventListener("change", () => {
    url = urlInput.value == "" ? "http://127.0.0.1:3000/" : urlInput.value
    url+=routeInput.value
})
let currentNumber = "+1" + phoneNumber.value

let allMsgs = {}
allMsgs[currentNumber] = []
const changeNumber = () => {
    currentNumber = "+1" + phoneNumber.value
    if (!allMsgs[currentNumber]) allMsgs[currentNumber] = []

    setMsgs()
}


const setMsgs = () => {
    msgs.innerHTML = ""
    let currentMsgs = allMsgs[currentNumber]
    currentMsgs.forEach(msg => {
        msgs.appendChild(createEl(msg.msg, msg.toFrom))
    });
    cont.scrollTo(0, cont.scrollHeight);
}


phoneNumber.addEventListener("change", changeNumber)



const createEl = (msg, toFrom) => {
    let msgCont = document.createElement("div")
    msgCont.className = "msgCont"
    msgCont.innerHTML = `<div class="${toFrom} msg"><p>${msg}</p></div>`
    return msgCont
}

const sendMsg = async () => {
    let currentMsgs = allMsgs[currentNumber]
    let msg = newMsg.value
    newMsg.value = ""
    let toFrom = 'sent'
    currentMsgs.push({ msg, toFrom })
    msgs.appendChild(createEl(msg, toFrom))
    cont.scrollTo(0, cont.scrollHeight);
    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                //'Content-Type': 'application/json'
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: new URLSearchParams({
                Body: msg,
                From: currentNumber
            })
        });
        text = await response.text()

        parser = new DOMParser();
        xmlDoc = parser.parseFromString(text, "text/xml");
        json = xmlToJson(xmlDoc)
        reply = json.Response.Message
        if (Array.isArray(reply)) {
            json.Response.Message.forEach(msg => {
                if (msg["#text"]) {
                    replyMsg = msg["#text"]
                    replyMsg = replyMsg.replace(/\n/g, "<br>")
                    currentMsgs.push({ msg: replyMsg, toFrom: 'recieved' })

                    msgs.appendChild(createEl(replyMsg, 'recieved'))
                    sound.play()
                    cont.scrollTo(0, cont.scrollHeight);
                }

            })
        } else {
            replyMsg = reply["#text"]
            replyMsg = replyMsg.replace(/\n/g, "<br>")
            currentMsgs.push({ msg: replyMsg, toFrom: 'recieved' })
            msgs.appendChild(createEl(replyMsg, 'recieved'))
            sound.play()
            cont.scrollTo(0, cont.scrollHeight);
        }
    } catch (error) {
        replyMsg = 'did  not fetch! recieved error:<br>"'+error+'"'
        console.log(error)
        //replyMsg = replyMsg.replace(/\n/g, "<br>")
        currentMsgs.push({ msg: replyMsg, toFrom: 'recieved' })
        msgs.appendChild(createEl(replyMsg, 'recieved'))
        sound.play()
        cont.scrollTo(0, cont.scrollHeight);
    }



}

button.addEventListener('click', sendMsg)

newMsg.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault()
        sendMsg()
    }
});



function xmlToJson(xml) {

    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
};
