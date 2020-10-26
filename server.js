const express = require('express');
const webSocketServer = require('websocket').server;

const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { getSyncDoc } = require('./lib/libSync');
const { getApiKey } = require('./lib/libKeys');

const httpPort = process.env.PORT || 3001;

const server = express()
  .use(express.static(path.join(__dirname, 'build')))
  .use(bodyParser.json())
  .get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  })
  .listen(httpPort, () => console.log(`Listening on ${httpPort}`));

// Spinning the http server and the websocket server.
const wsServer = new webSocketServer({
  httpServer: server
});
const clients = {};

wsServer.on('request', function (request) {
  console.log(
    new Date() + ' Recieved a new connection from ' + request.origin + '.'
  );
  // ToDo: Rewrite this to accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  console.log('connected');

  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      const data = JSON.parse(message.utf8Data);
      if (data.action === 'auth') {
        auth(connection, data);
      }
    }
  });

  connection.on('close', function (connection) {});
});

const storeConstructor = [];
let store = [storeConstructor];
let storeExpireTimers = [];
let storeExpireAfter = 60; // 1 minute - ToDo: update this

/**
 * make sure store expires after some time
 */
function expireStore() {
  store = storeConstructor;
}

function dispatch(code, msg) {}

/**
 * auth - Authenticate
 * @param {*} connection
 * @param {*} data
 */
function auth(connection, data) {
  if (
    !(
      data.accountSid.match(/^AC[a-zA-Z0-9]{32}$/) &&
      data.authToken.match(/^[a-zA-Z0-9]{32}$/)
    )
  ) {
    const err = {
      header: 'Collecting input failed',
      body: 'Invalid Account SID or Auth Token'
    };
    return connection.sendUTF(
      JSON.stringify({
        type: 'stepUpdate',
        step: 0,
        success: false,
        error: err
      })
    );
  }
  if (!data.instanceName.match(/^[a-zA-Z][a-zA-Z0-9 \-\(\)\[\]]*$/)) {
    const err = {
      header: 'Collecting input failed',
      body: 'Invalid instance name - make sure it starts with a letter'
    };
    return connection.sendUTF(
      JSON.stringify({
        type: 'stepUpdate',
        step: 0,
        success: false,
        error: err
      })
    );
  }
  const instanceName = data.instanceName;
  const client = require('twilio')(data.accountSid, data.authToken);
  const hash = crypto
    .createHash('sha1')
    .update(`${data.accountSid}:${data.authToken}`)
    .digest('base64');
  if (store[hash] === undefined) store[hash] = { msgs: [] };
  store[hash].accountSid = data.accountSid;
  store[hash].authToken = data.authToken;
  storeExpireTimers[hash] = setTimeout(expireStore, storeExpireAfter * 1000);
  connection.sendUTF(
    JSON.stringify({
      type: 'stepUpdate',
      step: 1,
      success: true
    })
  );

  // use credentials to see if Sync service with installation details exists
  getSyncDoc(client, instanceName)
    .then(([serviceSid, documentSid]) => {
      console.log('Sync doc:', documentSid);
      store[hash].syncServiceSid = serviceSid;
      store[hash].syncDocumentSid = documentSid;

      const msg1 = { 'Sync Service SID': serviceSid };
      const msg2 = { 'Sync Document SID': documentSid };
      store[hash].msgs.push(msg1, msg2);
      connection.sendUTF(
        JSON.stringify({
          type: 'stepUpdate',
          step: 2,
          success: true,
          msgs: [msg1, msg2]
        })
      );
      //return res.status(200).send(JSON.stringify([log1, log2]));
    })
    .catch((err) => {
      console.error(err);
      console.log(500);
      const log = { 'Authentication failed': err };
      store[hash].msgs.push(log);
      //return res.status(500).send(JSON.stringify([log]));
    });
}
