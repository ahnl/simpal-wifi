# SimPal WiFi client

Pulls your temperature sensor data from SimPal's servers. Temperature readings with timestamps are written to files inside `temps/` directory. 

Currently reads only the master sensor temperature data, not its slaves. Tested with SimPal W230 WiFi thermostat sockets.

## Getting Started

Firstly, make sure you have an account registered and a sensor added in SimPal WiFi app ([iOS](https://apps.apple.com/fi/app/w230-wifi-plug/id1287508004), [Android](https://play.google.com/store/apps/details?id=com.val.wifi&hl=fi&gl=US)).

1. `git clone https://github.com/ahnl/simpal-wifi.git`
2. `npm install`
3. Copy `.env.example` to `.env` and configure it accordingly
4. `npm start`
