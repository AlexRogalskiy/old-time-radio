"use strict";
const archiveOrg = require('./archiveOrg.js'),
    config = require('../config.json');

const playlistsById = {};

module.exports = {
    init() {
        return Promise.all(config.shows.flatMap(show => show.playlists).map(playlistId => archiveOrg.getPlaylist(playlistId))).then(playlists => {
            playlists.forEach(playlist => {
                const id = playlist.metadata.identifier;
                playlistsById[id] = playlist;
            });
        });
    },
    getPlaylist(id) {
        return playlistsById[id];
    }
};
