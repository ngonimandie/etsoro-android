'use strict';
const BootBot = require('./lib/BootBot');
const config= require ('config')
const echoModule = require('./examples/modules/echo');

const bot = new BootBot({
    accessToken: config.get('access_token'),
    verifyToken: config.get('verify_token'),
    appSecret: config.get('app_secret')
  });
  
module.exports = BootBot;
