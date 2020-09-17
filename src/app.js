const express = require('express'),
    service = require('./service.js').service,
    winston = require('winston'),
    app = express(),
    port = 3000;

const transports = [];
try{
    transports.push(new (winston.transports.File)({ filename: '/var/log/oldtimeradio/access.log', json : false }))
} catch (e) {
    transports.push(new (winston.transports.Console)({json : false }))
}

winston.configure({
    transports
});

app.use(express.static('public'))

app.get(`/api/shows`, (req, res) => {
    "use strict";
    res.status(200).json(service.getShows());
});

app.get(`/api/channels`, (req, res) => {
    "use strict";
    res.status(200).json(service.getPredefinedChannels());
});

app.get(`/api/channel/:channel`, (req, res) => {
    const channelId = req.params.channel,
        trimToNearestBoundary = req.query.nearest !== undefined,
        schedule = service.getScheduleForChannel(channelId, trimToNearestBoundary);

    if (schedule) {
        res.status(200).json(schedule);
    } else {
        res.status(400).send('Unknown channel');
    }
});

service.init()
    .then(_ => {
        app.listen(port, () => winston.log('info', `Initialisation complete, listening on port ${port}...`));
    })
    .catch(err => {
        // winston.log('error', 'Failed to start application - ' + err)
        throw err
    });


