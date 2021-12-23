require("dotenv").config()

const SIMPAL_SERVER = {
    host: "47.91.89.116",
    port: 18080
}

const { httpRequest, parseProtocolChunk, writeDebug } = require("./utils")
const net = require("net")
const fs = require("fs/promises")
const EventEmitter = require("events")

fs.mkdir("./temps/", {recursive: true})

class Host extends EventEmitter {
    name
    mac
    account

    constructor(data, account) {
        super()
        this.name = data.host_name
        this.mac = data.host_mac
        this.account = account
    }
    
    connect() {
        this.client = new net.Socket()

        this.client.connect(SIMPAL_SERVER.port, SIMPAL_SERVER.host, () => {
            this.emit("connect")
            this.client.write(`${this.account.email}	${this.account.email}		${this.mac}#1#`)
            this.client.on("data", data => {
                writeDebug(this.mac, data)
                const messages = parseProtocolChunk(data)
        
                for (const message of messages) {
                    if (message.host) {
                        this.emit("temperature", message.host.temperature)
                    } else if (message?.notify?.heartbeats.length > 0) {
                        this.emit("temperature", message?.notify?.heartbeats[0].temperature)
                    }
                }
            })
            this.client.on("close", () => {
                this.emit("close")
                writeJournal(this.mac, "Socket closed")
            })
        })
    }
}
class Account {
    email

    constructor(email) {
        this.email = email
    }
    async getHosts() {
        const uriEmail = decodeURIComponent(this.email)
        const response = await httpRequest(
            {
                host: SIMPAL_SERVER.host,
                path: "/sh.php",
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                    "User-Agent": "W230 WiFi Plug 2.6 rv:20 (iPad; iOS 12.5.5; en_US)"
                }
            }, 
            `action=login&account=${uriEmail}&token=${uriEmail}&login_type=iOs`
        )
        const data = JSON.parse(response)

        const hosts = data.master_hosts.map(host => new Host(host, this))

        return hosts
    }
}

async function main() {
    const account = new Account(process.env.EMAIL)
    const hosts = await account.getHosts()
    console.log("Found hosts", hosts.map(host => host.name)) 

    for (const host of hosts) {
        host.connect()
        host.on("temperature", (temperature) => {
            const date = new Date().toISOString()
            const temp = parseFloat(temperature).toFixed(1)
            
            console.log(`${host.name}\t${date}\t${temp}°C`)
            fs.appendFile(`./temps/${host.name}.log`, `${date}\t${temp}\n`)
        })
    }
}

main()
