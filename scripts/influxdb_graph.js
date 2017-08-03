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

targetJson = `{
    "results": [
        {
            "statement_id": 0,
            "series": [
                {
                    "name": "mem",
                    "columns": [
                        "time",
                        "used_percent"
                    ],
                    "values": [
                        [
                            "2017-08-02T12:38:00Z",
                            80.14317538453697
                        ],
                        [
                            "2017-08-02T12:38:30Z",
                            80.25594033438736
                        ],
                        [
                            "2017-08-02T12:39:00Z",
                            80.24192435192009
                        ]
                    ]
                }
            ]
        }
    ]
}`;

module.exports = function(robot) {
    robot.respond(/graph/i, function(msg) {
        var chartNode = new ChartjsNode(400, 200);

        request.get({url:'http://localhost:8086/query?pretty=true --data-urlencode "db=monitoring" --data-urlencode "q=select used_percent from mem where time > now() - 24h"'},
                    function(error, response, body) {
                        var parsedJson = JSON.parse(targetJson);
                        var label = [];
                        var data = [];
                        for (let value of parsedJson['results'][0]['series'][0]['values']) {
                            label.push(value[0]);
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
