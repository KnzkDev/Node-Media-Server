const axios = require('axios');
const Logger = require('./node_core_logger');
const express = require('express');
const bodyParser = require('body-parser');

module.exports = {
  auth: function(data, callback) {
    if (data.config.knzklive.ignore_auth) {
      callback();
      return;
    }

    axios.get(`${data.config.knzklive.api_endpoint}publish.php?token=${data.publishArgs.token}&live=${data.publishStreamPath}&authorization=${data.config.knzklive.api_key}&mode=pre_publish`).then(response => {
      callback();
    }).catch(error => {
      Logger.log(`[rtmp publish] Unauthorized. id=${data.id} streamPath=${data.publishStreamPath} streamId=${data.publishStreamId} token=${data.publishArgs.token} `);
      data.sendStatusMessage(data.publishStreamId, 'error', 'NetStream.publish.Unauthorized', 'Authorization required.');
    });
  },
  router: function(context, config) {
    let router = express.Router();
    router.use(
      bodyParser.urlencoded({
        extended: true
      })
    );
    router.use(bodyParser.json());
    router.post('/stop', function(req, res) {
      if (req.body.authorization === config.knzklive.api_key) {
        const path = "/live/" + req.body.live_stream;
        const id = context.publishers.get(path);
        if (!id) {
          res.end();
          return;
        }

        const session = context.sessions.get(id);
        if (!session) {
          res.end();
          return;
        }

        session.reject();
      }

      res.end();
    });
    return router;
  }
};