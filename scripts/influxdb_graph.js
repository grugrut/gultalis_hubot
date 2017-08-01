// Description
// A Hubot script for get graph for influxdb
//
// Configuration:
//   None
//
// Commands:
//   None (auto send on cron)
//
// Author:
//   grugrut <grugruglut+github _at_ gmail.com>

Canvas = require('canvas');
mktemp = require('mktemp');
path = require('path');
fs = require('fs');

module.exports = function(robot) {
    robot.respond(/graph/i, function(msg) {
        canvas = new Canvas(200, 200);
        ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.fillRect(10, 10, 190, 190);
        mktemp.createFile(path.join('/tmp', 'XXXXXXXX.png'), function(err, filename) {
            stream = canvas.createPNGStream();
            outStream = fs.createWriteStream(filename);
            stream.on('data', function(chunk) {
                outStream.write(chunk);
            });
        });
    });
};
