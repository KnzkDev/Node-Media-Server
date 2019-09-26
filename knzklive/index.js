const NodeMediaServer = require('../node_media_server');
const knzk = require('../knzk');

const conf = require('./config');
const IS_DEBUG = process.env.NODE_ENV === 'development';

const config = {
  logType: IS_DEBUG ? 4 : 2,
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
      ac: 'copy',
      vc: 'copy',
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

nms.on('donePublish', (id, StreamPath, args) => 
  knzk.api(args.token, StreamPath, 'done_publish'));
