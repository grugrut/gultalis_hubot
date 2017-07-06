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

  robot.respond /weather/, (msg) ->
    forecast()

  send = (channel, msg) ->
    robot.send {room: channel}, msg

  forecast = ->
    url = 'https://weather.yahoo.co.jp/weather/jp/13/4410.html'
    request url, (_, res) ->
      $ = cheerio.load res.body
      div = $('#main div.forecastCity table tbody tr td:nth-child(1) div').html()
      $ = cheerio.load div
      message = $('p.date').text() + " の天気\n"
      message += $('p.pict').text() + "\n"
      message += "最高気温: " + $('ul.temp li.high em').text() + "度 最低気温: " +  $('ul.temp li.low em').text() + "度\n"
      message += "降水確率:\n"
      message += $('tr.time td:nth-child(2)').text() + "\t" + $('tr.precip td:nth-child(2)').text() + "\n"
      message += $('tr.time td:nth-child(3)').text() + "\t" + $('tr.precip td:nth-child(3)').text() + "\n"
      message += $('tr.time td:nth-child(4)').text() + "\t" + $('tr.precip td:nth-child(4)').text() + "\n"
      message += $('tr.time td:nth-child(5)').text() + "\t" + $('tr.precip td:nth-child(5)').text() + "\n"
      message += $('p.pict img').attr('src')
      send '#news', message

  new cronJob('0 0 7 * * *', () ->
    forecast()
  ).start()

  new cronJob('0 0 12 * * *', () ->
    forecast()
  ).start()

  new cronJob('0 0 18 * * *', () ->
    forecast()
  ).start()
