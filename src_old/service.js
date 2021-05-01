const fs = require('fs'),
    winston = require('winston'),
    metaDataDownloader = require('./metaDataDownloader.js'),
    buildChannelManager = require('./channelManager.js').buildChannelManager,
    buildShowManager = require('./showManager.js').buildShowManager,
    buildPlaylistManager = require('./playlistManager.js').buildPlaylistManager,
    buildScheduleBuilder = require('./scheduleBuilder.js').buildScheduleBuilder;

const DATA_FILE = 'data.json';

const
    playlistManager = buildPlaylistManager(),
    showManager = buildShowManager(),
    channelManager = buildChannelManager(showManager, playlistManager),
    scheduleBuilder = buildScheduleBuilder();

module.exports.service = {
    init() {
        "use strict";
        return fs.promises.readFile(DATA_FILE)
            .then(data => {
                const json = JSON.parse(data),
                    showList = json.shows,
                    channelList = json.channels,
                    uniqueIndexes = new Set();
                winston.log('info', `Read ${showList.length} shows and ${channelList.length} channels from ${DATA_FILE}`);

                channelList.forEach(channelManager.addPredefinedChannel);
                showList.forEach(show => {
                    const index = show.index,
                        showChannels = channelManager.getChannelsForShowId(index);
                    if (uniqueIndexes.has(index)) {
                        throw new Error(`Duplicate index value ${index} in ${DATA_FILE}`);
                    }
                    uniqueIndexes.add(index);

                    show.channels = showChannels;
                    showManager.addShow(show);
                });

                channelManager.addCommercialShows(showList.filter(show => show.isCommercial).map(show => show.index));

                const playlists = showManager.getShows().flatMap(show => show.playlists);

                return Promise.all(playlists.map(metaDataDownloader.download))
                    .then(metaDataForPlaylists => {
                        metaDataForPlaylists.forEach(playlistManager.addPlaylist);
                    });
            });
    },
    getShows() {
        "use strict";
        return showManager.getShows();
    },
    getPredefinedChannels() {
        "use strict";
        return channelManager.getPredefinedChannels();
    },
    getScheduleForChannel(channelId, length) {
        "use strict";
        const episodeListForChannel = channelManager.getEpisodeList(channelId);
        if (episodeListForChannel) {
            return scheduleBuilder.buildScheduleForEpisodeList(episodeListForChannel, length);
        }
    },
    generateCodeForShowIndexes(showIndexes) {
        "use strict";
        return channelManager.generateCodeForShowIndexes(showIndexes);
    }
};
