// Dependencies
const FileSystem = require('fs');
const Path = require('path');
const Colors = require('colors');

// Hack: Using symbols to make the methods private, so no one can access the internal private methods and mess something up
const load = Symbol();
const loadCache = Symbol();
const saveCache = Symbol();
const checkConfiguration = Symbol();

class ExpressOctopusCore {
    constructor(expressInstance, config) {
        // Initialise the configuration
        this[checkConfiguration](expressInstance, config);

        // Intialise the array for loaded endpoints
        this.endpoints = new Array();

        // Set the Express instance
        this.expressInstance = expressInstance;

        // Load endpoints from specified path
        this[load](this.config.path, '/', 0);

        // Log loaded endpoints message if it is enabled in configuration
        if (this.config.printMessages !== undefined && this.config.printMessages)
            console.log(Colors[this.endpoints.length === 0 ? 'bgRed' : 'bgCyan'][this.endpoints.length === 0 ? 'white' : 'gray'](`[Express-Octopus] Loaded ${this.endpoints.length} endpoint${this.endpoints.length === 1 ? '' : 's'}!`));
    }

    [checkConfiguration](expressInstance, config) {
        // Check if the user has given passed on a valid Express instance
        if (expressInstance === undefined || expressInstance === null)
            throw new Error(`[Express-Octopus] First parameter needs to be the Express Instance`.bgRed.white);
        else if (expressInstance !== undefined && typeof expressInstance !== 'function')
            throw new Error(`[Express-Octopus] First parameter needs to be a valid Express Instance (Expected function, got ${typeof expressInstance})`.bgRed.white);

        // Check if the user has not specified the configuration object
        if (config === undefined)
            throw new Error(`[Express-Octopus] Configuration object is not defined! (Second Parameter)`.bgRed.white);
        else {
            if (config._default_ !== undefined && config.printMessages !== undefined && config.printMessages)
                console.log(`[Express-Octopus] Default ${config._default_} configuration found, using it!`.bgMagenta.white);

            // Check if the given path in configuration object is not specified
            if (config.path === undefined)
                throw new Error(`[Express-Octopus] Configuration object is missing the "path" field!`.bgRed.white);
            else {
                // Check if the given path in configuration object is not of a type string
                if (typeof config.path !== "string")
                    throw new Error(`[Express-Octopus] Field "path" needs to be of a "string" type!`.bgRed.white);
                else {
                    // Check if the given path in configuration object does not exists, if so, create it
                    if (!FileSystem.existsSync(config.path))
                        FileSystem.mkdirSync(config.path, { recursive: true });
                }
            }

            // Check if the user has specified prindMessages field in the configuration object
            if (config.printMessages !== undefined) {
                // Check if the type of printMessages field in configuration object is not of a boolean type
                if (typeof config.printMessages !== "boolean")
                    throw new Error(`[Express-Octopus] Field "printMessages" needs to be of a "boolean" type!`.bgRed.white);
            }

            // Check if the use has specified developer field in the configuration object
            if (config.developer !== undefined) {
                // Check if the type of developer field in configuration object is not of a boolean type
                if (typeof config.developer !== "boolean")
                    throw new Error(`[Express-Octopus] Field "developer" needs to be of a "boolean" type!`.bgRed.white);

                if (config.developer === true)
                    console.log(`[Express-Octopus] Developer mode is enabled, this implies that the caching is disabled!`.bgGreen.gray);
            }

            // Check if the user has not specified developer field in the configuration object or if he has and it's value is false
            if (config.developer === undefined || (config.developer !== undefined && !config.developer)) {
                // Check if the user has specified cache field in the configuration object
                if (config.cache === undefined)
                    throw new Error(`[Express-Octopus] Configuration object is missing the "cache" field!`.bgRed.white);
                else {
                    // Check if the user has not specified enabled field in the cache field in the configuration object
                    if (config.cache.enabled === undefined)
                        throw new Error(`[Express-Octopus] Field "cache" is missing "enabled" field!`.bgRed.white);
                    else {
                        // Check if the enabled field in the cache field in the configuration object is not of a boolean type
                        if (typeof config.cache.enabled !== "boolean")
                            throw new Error(`[Express-Octopus] Field "enabled" in the field "cache" needs to be of a "boolean" type!`.bgRed.white);
                    }

                    // Check if the user has not specified path field in the cache field in the configuration object
                    if (config.cache.path === undefined)
                        throw new Error(`[Express-Octopus] Field "cache" is missing the "path" field!`.bgRed.white);
                    else {
                        // Check if the path field in the cache field in the configuration object is not of a string type
                        if (typeof config.cache.path !== "string")
                            throw new Error(`[Express-Octopus] Field "path" in the field "cache" needs to be of a "string" type!`.bgRed.white);
                        else {
                            // Check if the path field in the cache field in the configuration object is not a valid path
                            if (config.cache.path.includes('.'))
                                throw new Error(`[Express-Octopus] Field "path" in the field "cache" is invalid!`.bgRed.white);

                            // Check if the path in path field in the cache field in the configuration object does not exists, if so, create it
                            if (!FileSystem.existsSync(config.cache.path))
                                FileSystem.mkdirSync(config.cache.path, { recursive: true });
                        }
                    }

                    // Check if the user has not specified expiration field in the cache field in the configuration object
                    if (config.cache.expiration === undefined)
                        throw new Error(`[Express-Octopus] Field "cache" is missing "expiration" field!`.bgRed.white);
                    else {
                        // Check if the expiration field in the cache field in the configuration object is not of a number type
                        if (typeof config.cache.expiration !== "number")
                            throw new Error(`[Express-Octopus] Field "expiration" in the field "cache" needs to be of a "number" type!`.bgRed.white);
                        else config.cache.expiration = Math.abs(config.cache.expiration); // Make an expiration an absolute value
                    }
                }
            }
        }

        this.config = config;

        // Set up the cache configuration
        if ((this.config.developer === undefined || (this.config.developer !== undefined && !config.developer)) && this.config.cache.enabled) {
            this.cachePath = Path.join(this.config.cache.path, '/', 'express_octopus_cache.json');
            this.cacheExpiration = this.config.cache.expiration;

            // Load the cache
            this[loadCache]();
        }
    }

    [loadCache]() {
        // Check if the cache path does not exists
        if (!FileSystem.existsSync(this.cachePath))
            return;

        // Load in the cache from the file in string format
        const cacheString = FileSystem.readFileSync(this.cachePath, 'utf8').toString();

        // Check if there is not loaded cache
        if (!cacheString.length)
            return;

        // Serialize cache to JSON
        this.cache = JSON.parse(cacheString);

        // Check if the cache has expired
        if (this.cache.expiration <= new Date().getTime()) {
            this.cache = undefined;

            // Delete the old cache file
            if (FileSystem.existsSync(this.cachePath))
                FileSystem.unlinkSync(this.cachePath);
        }
    }

    [saveCache]() {
        // Check if the developer mode is enabled
        if (this.config.developer !== undefined && this.config.developer)
            return;

        // Check if the cache is disabled
        if (!this.config.cache.enabled)
            return;

        // Check if for some reason the cache field is not present
        if (this.cache === undefined)
            return;

        // Delete the old cache file
        if (FileSystem.existsSync(this.cachePath))
            FileSystem.unlinkSync(this.cachePath);

        // Write the new cache to the file
        FileSystem.open(this.cachePath, 'w', (error, file) => {
            if (error)
                throw error;

            this.cache.expiration = new Date().getTime() + (this.cacheExpiration * 24 * 60 * 60);
            FileSystem.writeFileSync(this.cachePath, JSON.stringify(this.cache));
        });
    }

    [load](currentPath, purePath, level) {
        // Begin tracking execution time
        let hrstart = process.hrtime();
        let hrend;

        // Load from cache
        if (this.cache !== undefined && this.cache.length > 0) {
            if (this.config.printMessages !== undefined && this.config.printMessages)
                console.log(`[Express-Octopus] Loading endpoints from the cache ...`.bgCyan.gray);

            // Require in each endpoint class from it's file
            this.cache.forEach(endpoint => endpoint.js = new (require(endpoint.jsPath))());

            // Stop tracking execution time
            hrend = process.hrtime(hrstart);

            // Print the execution time
            if (this.config.printMessages !== undefined && this.config.printMessages)
                console.log(`[Express-Octopus] Finished in ${hrend[0]}s ${hrend[1] / 1000000}ms.`.bgGreen.gray);

            return;
        }

        if (this.config.printMessages !== undefined && this.config.printMessages && !level)
            console.log(`[Express-Octopus] Loading endpoints ...`.bgCyan.gray);

        // Load each endpoint from it's file
        FileSystem.readdirSync(currentPath).forEach(file => {
            // Skip if the file is valid, or if it is a directory, or if the file is non .js file
            if (file === undefined || file === null || file === '..' || file === '.' || (file.indexOf('.') !== -1 && file.indexOf('.js') === -1))
                return;

            // Recursively load the endpoints from each folder
            if (file.indexOf('.js') === -1) {
                this[load](Path.join(currentPath, file), Path.join(purePath, file), level + 1);
                return;
            }

            // Get the endpoint path without .js file extension
            const pureFileName = file.substr(0, file.indexOf('.')).trim();
            const endpointPath = level === 0 ? Path.join(pureFileName) : Path.join(currentPath, pureFileName);

            // Push loaded endpoint to the endpoints array
            this.endpoints.push({
                // Endpoint js file path
                jsPath: endpointPath + '.js',

                // Full path
                path: pureFileName === 'index' ? purePath : Path.join(purePath, pureFileName),

                // Instantiate the class and get is's reference
                js: new (require(endpointPath + '.js'))()
            });
        });

        // Stop tracting the execution time
        hrend = process.hrtime(hrstart);

        // Print out the execution time
        if (this.config.printMessages !== undefined && this.config.printMessages && !level)
            console.log(`[Express-Octopus] Finished in ${hrend[0]}s ${hrend[1] / 1000000}ms.`.bgGreen.gray);
    }

    autowire() {
        // Begin tracking execution time
        let hrstart = process.hrtime();
        let hrend;

        // Autowire from the cache
        if (this.cache !== undefined && this.cache.length > 0) {
            if (this.config.printMessages !== undefined && this.config.printMessages)
                console.log(`[Express-Octopus] Auto-wiring endpoints from the cache ...`.bgCyan.gray);

            // Loop trought all endpoints in the cache
            this.cache.forEach(endpoint => {
                // Register every method in the Express
                endpoint.requestMethods.forEach(method => {
                    const path = endpoint.path.replace(/\\/g, '/');

                    // If the endpoint has a middleware for current method, add it to the express, otherwise, just add the method
                    if (endpoint.middleware.length > 0) {
                        endpoint.middleware.some(middleware => {
                            if (middleware.method === method) {
                                this.expressInstance[method](path, endpoint.js[middleware.name], endpoint.js[method]);
                                return true;
                            }
                        });
                    } else this.expressInstance[method](path, endpoint.js[method]); // Just add the request method without middleware
                });
            });

            // Stop tracting the execution time
            hrend = process.hrtime(hrstart);

            // Print out the execution time
            if (this.config.printMessages !== undefined && this.config.printMessages)
                console.log(`[Express-Octopus] Finished in ${hrend[0]}s ${hrend[1] / 1000000}ms.`.bgGreen.gray);

            return;
        }

        if (this.config.printMessages !== undefined && this.config.printMessages)
            console.log(`[Express-Octopus] Auto-wiring endpoints ...`.bgCyan.gray);

        // Check if there is no loaded endpoints
        if (this.endpoints === undefined || this.endpoints === null || this.endpoints.length === 0)
            return;

        // Loop over the endpoints, check their class properties and wire them with Express
        for (let iterator = 0; iterator < this.endpoints.length; iterator++) {
            const currentEndPoint = this.endpoints[iterator];

            // Check if the current endpoint class does have a path defined
            if (currentEndPoint === undefined || currentEndPoint === null || currentEndPoint.path === undefined || currentEndPoint.path === null)
                continue;

            // Check if the current endpoint class is not instantiated
            if (currentEndPoint.js === undefined || currentEndPoint.js === null)
                throw new Error(`[Express-Octopus] Failed to load the endpoint from: ${currentEndPoint.jsPath}, maybe the modules.export is missing!`.bgRed.white);

            if (currentEndPoint.js._octopus_ === undefined)
                throw new Error(`[Express-Octopus] Given class in: ${currentEndPoint.jsPath} does not extend OctopusRoute class!`.bgRed.white);

            // TO DO: Check if the parameters field exist and check their format with regex
            const requestMethods = currentEndPoint.js.getDefinedRequestMethods(currentEndPoint.js);

            // Check if the given endpoint class does not have any HTTP request methods
            if (requestMethods.length === 0)
                throw new Error(`[Express-Octopus] The endpoint from ${currentEndPoint.jsPath} does have any request methods defined!`.bgRed.white);

            // Check if the current endpoint class does not contain valid HTTP request methods (Requiered at least 1)
            if (!currentEndPoint.js.hasValidRequestMethods())
                throw new Error(`[Express-Octopus] The endpoint in: ${currentEndPoint.jsPath} does not have valid request methods defined! (Possibly: Request Method name is not lowercase or it is misspelled)`.bgRed.white);

            // Temp variable for current endpointh path
            let endPointPath = currentEndPoint.path;

            // If the parameters field exist, add those parameters to the path
            if (currentEndPoint.js.hasParameters()) {
                const parameters = currentEndPoint.js.parameters;
                endPointPath = parameters.indexOf('/') === 0 ? Path.join(endPointPath, parameters) : Path.join(endPointPath, '/', parameters);
            }

            // Extract just the HTTP request methods
            const pureRequestMethods = new Array();
            requestMethods.forEach(item => pureRequestMethods.push(item.method));

            // Create an object for the cache
            let forCache = {
                jsPath: currentEndPoint.jsPath,
                path: endPointPath,
                requestMethods: pureRequestMethods,
                middleware: new Array()
            };

            // Register every method in the Express
            requestMethods.forEach(item => {
                const currentObject = item.object; // currentEndPoint.js
                endPointPath = endPointPath.replace(/\\/g, '/');

                // If the endpoint has a middleware for the current method
                if (currentObject.hasMethodMiddleware(item.method)) {
                    // Check if the middleare for the current method is not a valid one
                    if (!currentObject.isMethodMiddlewareValid(item.method))
                        throw new Error(`[Express-Octopus] Request Method ${item.method} in: ${currentEndPoint.jsPath} has a middleware method (${currentObject.getMethodMiddlewareName(item.method)}), but it is missing (or has too many) parameters! (Requiered parameters: request, response, next)`.bgRed.white);

                    // If the middleware is a valid one, add it to the cache
                    forCache.middleware.push({ method: item.method, name: currentObject.getMethodMiddlewareName(item.method) });

                    // If the middleware is a valid one, add it to the express
                    this.expressInstance[item.method](endPointPath, currentObject.getMethodMiddleware(item.method), currentObject[item.method]);
                } else this.expressInstance[item.method](endPointPath, currentObject[item.method]); // Just add the request method without middleware
            });

            // Cache the endpoint
            if (this.cache === undefined)
                this.cache = new Array();

            // Add current endpoint in the cache
            this.cache.push(forCache);
        }

        // Stop tracting the execution time
        hrend = process.hrtime(hrstart);

        // Print out the execution time
        if (this.config.printMessages !== undefined && this.config.printMessages)
            console.log(`[Express-Octopus] Finished in ${hrend[0]}s ${hrend[1] / 1000000}ms.`.bgGreen.gray);

        // Save the cache
        this[saveCache]();
    }
}

module.exports = ExpressOctopusCore;