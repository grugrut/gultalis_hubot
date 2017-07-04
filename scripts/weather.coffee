# Description
# A Hubot script for get Today weather report
#
# Configuration:
#   None
#
# Commands:
#   None (auto send on cron)
#
# Author:
#   grugrut <grugruglut+github _at_ gmail.com>

cheerio = require 'cheerio'
request = require 'request'
cronJob = require('cron').CronJob

module.exports = (robot) ->

  send = (channel, msg) ->
    robot.send {room: channel}, msg

  new cronJob('0 0 7 * * *', () ->
    url = 'https://weather.yahoo.co.jp/weather/jp/13/4410.html'
    request url, (_, res) ->
      $ = cheerio.load res.body
      div = $('#main div.forecastCity table tbody tr td:nth-child(1) div').html()
      $ = cheerio.load div
      message = $('p.date').text() + " の天気\n"
      message += $('p.pict').text() + "\n\n"
      message += $('p.pict img').attr('src')
      send '#news', message
  ).start()
