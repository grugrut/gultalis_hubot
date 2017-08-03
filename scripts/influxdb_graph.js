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

var ChartjsNode = require('chartjs-node');
var path = require('path');
var fs = require('fs');
var request = require('request');

module.exports = function(robot) {
    robot.respond(/graph/i, function(msg) {
        var chartNode = new ChartjsNode(400, 300);

        request.get({url:'http://localhost:8086/query?pretty=true&db=monitoring&q='+encodeURIComponent('select used_percent from mem where time > now() - 24h')},
                    function(error, response, body) {
                        if (error) {
                            console.log(error);
                            return;
                        }
                        var parsedJson = JSON.parse(body);
                        var label = [];
                        var data = [];
                        for (let value of parsedJson['results'][0]['series'][0]['values']) {
                            var d = new Date(value[0]);
                            label.push(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
                            data.push(value[1]);
                        }
                        
                        chartNode.drawChart( {
                            type: 'line',
                            data: {
                                labels: label,
                                datasets: [{
                                    label: parsedJson['results'][0]['series'][0]['name'],
                                    data: data,
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
                            }})
                            .then(() => {
                                return chartNode.getImageStream('image/png');
                            })
                            .then(streamResult => {
                                return chartNode.writeImageToFile('image/png', '/tmp/testimage.png');
                            })
                            .then(() => {
                                request.post({url:'https://slack.com/api/files.upload',
                                              formData: {
                                                  token: process.env.HUBOT_SLACK_TOKEN,
                                                  filename: 'testimage.png',
                                                  file: fs.createReadStream('/tmp/testimage.png'),
                                                  channels: 'develop'
                                              }},
                                             function(error, response, body) {
                                             });
                            });
                        
                    });
    });
};
