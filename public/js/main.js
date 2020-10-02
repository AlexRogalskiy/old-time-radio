window.onload = () => {
    const model = {};

    view.init(model);

    view.setVisualisationDataSource(audioPlayer.getData);
    visualiser.init(view.getCanvas());
    window.addEventListener('resize', visualiser.onResize());
    playlist.init(model);

    function playNextFromCurrentChannel() {
        "use strict";
        return playlist.getNext()
            .then(nextItem => {
                const {url, name, offset} = nextItem;
                model.track = {name, url};

                return audioPlayer.load(url, offset)
                    .then(() => {
                        audioPlayer.play();
                        view.updatePlayState(model);
                    })
                    .catch(() => {
                        return playNextFromCurrentChannel();
                    })
            });
    }

    view.onChannelSelected(channel => {
        "use strict";
        model.track = null;
        model.playlist = null;
        model.channel = channel;
        view.updatePlayState(model);
        visualiser.activate();
        playNextFromCurrentChannel();
        audioPlayer.play();
    });

    view.onChannelDeselected(() => {
        "use strict";
        model.track = model.channel = model.playlist = null;
        audioPlayer.stop();
        view.updatePlayState(model);
        setTimeout(() => {
            visualiser.deactivate();
        }, 2000);
    });

    view.onSleepTimerCancelClicked(() => {
        "use strict";
        sleepTimer.stop();
    });

    view.onSetSleepTimerClicked(seconds => {
        "use strict";
        sleepTimer.start(seconds);
    });

    channelBuilder.onChannelRequested(showIndexes => {
        "use strict";
         return service.getChannelCodeForShows(showIndexes);
    });

    audioPlayer.onAudioEnded(() => {
        "use strict";
        playNextFromCurrentChannel();
    });

    const urlChannelCodes = new URLSearchParams(window.location.search).get('channels');
    if (urlChannelCodes) {
        model.channels = urlChannelCodes.split(',').map((code, i) => {
            "use strict";
            return {
                id: code,
                name: `Channel ${i+1}`,
                userChannel: true
            };
        });
        view.setChannels(model.channels);

    } else {
        service.getChannels().then(channelIds => {
            "use strict";
            model.channels = channelIds;
            view.setChannels(channelIds.map(channelId => {
                return {
                    id: channelId,
                    name: channelId,
                    userChannel: false
                };
            }));
        }).catch(err => messageManager.httpError());
    }

    service.getShowList().then(shows => {
        channelBuilder.populate(model.shows = shows);
    });

    sleepTimer.onTimerStarted(timeInSeconds => {
        "use strict";
        view.updateSleepTimer(timeInSeconds);
    });
    sleepTimer.onTimerTick(timeInSeconds => {
        "use strict";
        view.updateSleepTimer(timeInSeconds);
    });
    sleepTimer.onTimerCancelled(() => {
        "use strict";
        view.updateSleepTimer();
    });
    sleepTimer.onTimerFinish(() => {
        "use strict";
        view.updateSleepTimer();
        console.log('finished')
    });

};
