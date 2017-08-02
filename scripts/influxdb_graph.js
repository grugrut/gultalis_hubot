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
ChartjsNode = require('chartjs-node');
mktemp = require('mktemp');
path = require('path');
fs = require('fs');

chartJsOptions = {
    type: 'line',
    data: {
        labels: ['M', 'T', 'W'],
        datasets: [{
            label: 'apples',
            data: [12, 19, 3],
            backgroundColor: "rgba(255, 0, 0, 0.5)"
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: false
                }
            }]
        }
    }
};

module.exports = function(robot) {
    robot.respond(/graph/i, function(msg) {
        msg.send ('Start...');
        var chartNode = new ChartjsNode(400, 400);
        chartNode.drawChart(chartJsOptions)
            .then(() => {
                return chartNode.getImageStream('image/png');
            })
            .then(streamResult => {
                return chartNode.writeImageToFile('image/png', './testimage.png');
            });
    });
};
