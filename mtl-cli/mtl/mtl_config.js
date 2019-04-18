const configFile = require('./config');
const Configstore = require('configstore');
const conf = new Configstore(configFile.CONFIG_STORE_FILENAME);

const config = function(key, value){
    if (key == null || value == null){
        console.log('Missing parameters. must be  config [key] [value]');
        return;
    }
    conf.set(key, value);
    // console.log('config success');
};

exports.config = config;

