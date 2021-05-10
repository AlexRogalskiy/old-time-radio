"use strict";

const channelData = require('./channelData.js'),
    channelCodes = require('./channelCodes'),
    scheduler = require('./scheduler.js'),
    playlistData = require('./playlistData.js'),
    webClient = require('./webClient.js'),
    ONE_HOUR = 60 * 60;

module.exports = {
    init() {
        return webClient.init().then(() => playlistData.init());
    },
    getShows() {
        return channelData.getShows().map(show => {
            return {
                channels: show.channels,
                index: show.index,
                isCommercial: show.isCommercial,
                name: show.name
            };
        });
    },
    getChannels() {
        return channelData.getChannels();
    },
    getScheduleForChannel(channelId, length = ONE_HOUR) {
        return scheduler.getScheduleForChannel(channelId, length);
    },
    getCodeForShowIndexes(showIndexes = []) {
        return channelCodes.buildChannelCodeFromShowIndexes(showIndexes);
    }
};