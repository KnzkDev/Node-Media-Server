const { NodeMediaServer } = require('../index');
const axios = require('axios');
// eslint-disable-next-line import/no-unresolved
const conf = require('./config');

const config = {
  logType: conf.debug ? 4 : 2,
  rtmp: {
    port: 1935,
    chunk_size: 100000,
    gop_cache: false,
    ping: 60,
    ping_timeout: 30
  },
  http: {
    port: conf.http_port,
    allow_origin: '*',
    mediaroot: './media'
  },
  knzklive: {
    api_endpoint: conf.endpoint,
    api_key: conf.APIKey,
    ignore_auth: !!conf.debug
  }
};

if (conf.https_port) {
  config.https = {
    port: conf.https_port,
    cert: conf.https_cert,
    key: conf.https_key
  };
}

if (conf.ffmpeg_path) {
  const tasks = [
    {
      app: 'live',
      ac: 'libopus',
      hls: true,
      hlsFlags: 'hls_time=1:hls_list_size=5:hls_flags=delete_segments'
    }
  ];

  config.trans = {
    ffmpeg: conf.ffmpeg_path,
    tasks
  };
}

const nms = new NodeMediaServer(config);
nms.run();

nms.on('prePublish', (id, StreamPath, args) => {

});

nms.on('donePublish', (id, StreamPath, args) => {
  axios
    .get(
      `${config.knzklive.api_endpoint}publish.php?token=${
        args.token
      }&live=${StreamPath}&authorization=${
        config.knzklive.api_key
      }&mode=done_publish`
    )
    .then(response => {
      // eslint-disable-next-line no-console
      console.log('[donePublish]', response);
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.log('[donePublish]', error);
    });
});
