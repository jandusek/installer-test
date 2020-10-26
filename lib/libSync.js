const syncInstallerServiceName = 'Twilio Phone Client';
const syncInstallerDocName = 'InstallerConfig';

/**
 * getSyncService - get Sync service for this project
 * @param {Object} client Twilio helper library client object
 * @returns {*} Sync service sid
 */
function getSyncService(client, instanceName) {
  return new Promise(function (resolve, reject) {
    let syncInstallerServiceSid = undefined;
    client.sync.services
      .list()
      .then((services) => {
        // Sync service cannot be fetched using uniqueName, hence this
        services.forEach((s) => {
          if (s.friendlyName === instanceName) {
            syncInstallerServiceSid = s.sid;
            console.log('Sync service found:', syncInstallerServiceSid);
            resolve(syncInstallerServiceSid);
          }
        });
        // if Sync service doesn't exist, create it
        if (!syncInstallerServiceSid) {
          client.sync.services
            .create({ friendlyName: instanceName })
            .then((service) => {
              syncInstallerServiceSid = service.sid;
              console.log(
                'Sync service not found, new one created:',
                syncInstallerServiceSid
              );
              resolve(syncInstallerServiceSid);
            })
            .catch((err) => {
              console.error(err);
              reject(err);
            });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * getSyncDoc - get Sync document with installer configuration
 * @param {Object} client Twilio helper library client object
 * @returns [serviceSid, documentSid]
 */
exports.getSyncDoc = function (client, instanceName) {
  return new Promise(function (resolve, reject) {
    getSyncService(client, instanceName)
      .then((serviceSid) => {
        console.log(
          'Sync service sorted out...',
          serviceSid,
          syncInstallerDocName
        );
        client.sync
          .services(serviceSid)
          .documents(syncInstallerDocName)
          .fetch()
          .then((document) => {
            console.log('Sync doc found:', document.sid);
            resolve([serviceSid, document.sid]);
          })
          .catch((err) => {
            if (err.status === 404) {
              // if Sync doc doesn't exist, create it
              client.sync
                .services(serviceSid)
                .documents.create({ uniqueName: syncInstallerDocName })
                .then((document) => {
                  console.log(
                    'Sync doc not found, new one created:',
                    document.sid
                  );
                  resolve([serviceSid, document.sid]);
                })
                .catch((err) => {
                  console.error(err);
                  reject(err);
                });
            } else {
              console.error(err);
              reject(err);
            }
          });
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};
