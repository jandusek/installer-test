const apiKeyName = 'Twilio Phone Client';

/**
 * getApiKey - get API key for this project, recreate it if it already exists
 * @param {Object} client Twilio helper library client object
 * @returns [serviceSid, documentSid]
 */
exports.getApiKey = function (client) {
  return new Promise(function (resolve, reject) {
    client.keys.list({ limit: 20 }).then((keys) =>
      keys.forEach((apiKey) => {
        if (apiKey.friendlyName === apiKeyName) {
          resolve([apiKey.sid, apiKey.friendlyName]);
        } else {
          reject();
        }
      })
    );
  });
};
