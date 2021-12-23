const http = require("http")
const fs = require("fs/promises")

function writeDebug(mac, data) {
    if (!JSON.parse(process.env.DEBUG || false)) return
    fs.appendFile("./debug.log", `[${mac}]\t${data}\n`)
}

function httpRequest(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (response) => {
            let str = "";

            response.on("data", function (chunk) {
                str += chunk;
            });

            response.on("end", function () {
                resolve(str)
            });
        });
        req.write(body)
        req.end()
    })
}

function parseProtocolChunk(data) {
    let messages = data.toString().split("}{")
    if (messages.length > 1) {
        messages = messages.map((message, i) => {
            if (i == messages.length - 1) {
                return "{" + message
            } else if (i == 0) {
                return message + "}"
            } else {
                return "{" + message + "}"
            }
        })
    }

    return messages.map(message => JSON.parse(message))
}
module.exports = {httpRequest, parseProtocolChunk, writeDebug}