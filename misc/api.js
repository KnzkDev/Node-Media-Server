const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');

module.exports.api = (token, streamPath, mode = 'verify') => 
  axios.get(config.APIUrl, {
    params: {
      token,
      live: streamPath,
      authorization: config.APIKey,
      mode
    }
  });

module.exports.router = context => {
  const router = express.Router();

  router.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
  router.use(bodyParser.json());

  router.post('/stop', (req, res) => {
    const { authorization, live_stream } = req.body;
    const path = '/live/' + live_stream;

    if (authorization !== config.APIKey) {
      return res.end();
    }

    const id = context.publishers.get(path);
    if (!id) {
      return res.end();
    }

    const session = context.sessions.get(id);
    if (!session) {
      return res.end();
    }

    session.reject();
  });

  return router;
};
