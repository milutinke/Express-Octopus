const UpdateNotifier = require('update-notifier')({ pkg: require('../package.json') });
const Colors = require('colors');

module.exports = {
    CheckForUpdates: () => {
        if (UpdateNotifier.update) {
            console.log(`[Express-Octopus] New version ${UpdateNotifier.update.latest} is avaliable!`.bgMagenta.white);
            console.log(`[Express-Octopus] Please read the changelog before updating!`.bgRed.white);
        }
    }
}