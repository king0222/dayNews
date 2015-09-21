/**
 * Created by Administrator on 14-6-8.
 */
var mongoose = require('mongoose');
var dbConfig = require('./config/config.json');
mongoose.connect(dbConfig.url);
var db = mongoose.connection;
function init() {
    db.on('error', console.error.bind(console, 'connection error'));

    db.once('open', function callback() {
        console.log('mongodb is ready');
    });
}
exports.init = init;
