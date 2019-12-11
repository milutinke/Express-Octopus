// Dependencies
const Path = require('path');

// Chech for updates
require('./lib/CheckForUpdates').CheckForUpdates();

// Export functionality
module.exports = {
    Setup: require('./lib/ExpressOctopusCore'),
    OctopusEndPoint: require('./lib/OctopusEndPoint'),
    DefaultConfiguration: {
        Production: {
            path: Path.join(process.cwd(), '/', 'endpoints'),
            developer: false,
            printMessages: false,

            cache: {
                enabled: true,
                path: Path.join(process.cwd(), '/cache/'),
                expiration: 30
            },

            _default_: 'production'
        },

        Development: {
            path: Path.join(process.cwd(), '/', 'endpoints'),
            developer: true,
            printMessages: true,

            cache: {
                enabled: true,
                path: Path.join(process.cwd(), '/cache/'),
                expiration: 30
            },

            _default_: 'development'
        }
    }
};