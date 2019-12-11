![Express-Octopus](https://i.imgur.com/kxmVDDg.png)

# What is it?

**Express-Octopus** is a fast and a lightweight **Express Auto-Router** which loads your **endpoints** (**routes**) from the file system **automatically**.

It is made with the **simplicity** and **scalability** in mind, so it is suitable both for small and large applications.

**Endpoints** (**Routes**) are loaded in a straightforward way, your **directories** and **file names** become **path** in your **endpoint** (**route**).

For example, for the following directory structure:

```
endpoints/
    users/
        all/
            index.js
```

We will get the following path: **/users/all/**

As you can see, the **index.js** is **ommited** from the path, so if you specify, for example, **a.js**, the path will be: **/users/all/a**

The directory **endpoints/** is a base directory that you specify, so it is ommited from the path.

# Endpoints (Routes)

**Endpoints** (**Routes**) must be witten in a form of a CommonJS module, which exports an **ES6 class** which extends the **OctopusEndPoint** class.

**NOTE: You must not instantiate the class, it must be directly exported without new keyword!**
**Also, you must use ES6 class, since the module is written to check the class with regex**, (If you need/prefere ES5 prototype support, feel free to contribute).

### Endpoint (Route) class format

Your endpoint (route) class, always needs to have constuctor and super constructor called inside.

For each HTTP Request method, you need to specify the method in the class.

Method format:

```javascript
async? <http method name>(request, response) {
    /* method body */
}
```

Rules for HTTP Request Method methods:

- method name must be just HTTP Request method (Currently supported: **get, post, put, patch, delete**)
- **method name must be lowercase**
- method always has **2 parameters** (no less, no more) (Those are: request, response)
- async is not requiered, it is optional (recommended to use)

Optinally you can handle middleware for each HTTP Request Method.

For each HTTP Request method middleware, you need to specify the method in the class.

Middleware Method format:

```javascript
async? <http method name>_middleware(request, response, next) {
    /* method body */
}
```

Rules for middleware methods:

- method name must have HTTP Request method (Currently supported: **get, post, put, patch, delete**)
- **method name must be lowercase**
- method always has **3 parameters** (no less, no more) (Those are: request, response, next)
- async is not requiered, it is optional (recommended to use)

### Using parameters

If you want to parameters in the URL, you can pass a string with them inside the super in constuctor.

Example:

```javascript
constructor() {
    super(':id');
}
```

You can use this to extend the url path more.

Example:

```javascript
constructor() {
    super('more/:id/:anotherparam/other');
}
```

# Examples

#### Default development configuration:

```javascript
// Dependencies
const ExpressOctopus = require("express-octopus");
const Express = require("express");
const App = Express();

// Setup with Default Development configuration (Cache is disabled and debug messages are printed)
const ExpressOctopusCore = new ExpressOctopus.Setup(
  App,
  ExpressOctopus.DefaultConfiguration.Development
);

// Autowiring
ExpressOctopusCore.autowire();

// Start the Express server on the port 3000
App.listen(3000, () => console.log("Started on the port 3000"));
```

#### Default production configuration:

```javascript
// Dependencies
const ExpressOctopus = require("express-octopus");
const Express = require("express");
const App = Express();

// Setup with Default Production configuration (Cache is enabled and debug messages are not printed)
const ExpressOctopusCore = new ExpressOctopus.Setup(
  App,
  ExpressOctopus.DefaultConfiguration.Production
);

// Autowiring
ExpressOctopusCore.autowire();

// Start the Express server on the port 3000
App.listen(3000, () => console.log("Started on the port 3000"));
```

### Custom configuration:

```javascript
// Dependencies
const ExpressOctopus = require("express-octopus");
const Express = require("express");
const Path = require("path");
const App = Express();

// Setup
const ExpressOctopusCore = new ExpressOctopus.Setup(
  // Express instance (Aka: Express())
  App,

  // Configuration
  {
    // Base Directory where you create your end points
    path: Path.join(process.cwd(), "/", "endpoints"),

    // Development mode (Disables cache)
    // Recommended for development, since you would need to manually delete cache on each run
    // Optional field
    developer: true,

    // Prints debug messages
    // Recommended for development, helps a lot
    // Optional field
    // Independent of a developer field
    printMessages: true,

    // Caching configuration
    cache: {
      // Is the cache enabled?
      // Requiered field, must be of a boolean type (true/false)
      enabled: true,

      // Directory where the cache is saved
      // Requiered field
      path: Path.join(process.cwd(), "/cache/"),

      // Expiration of the cache in days
      // Requiered field
      expiration: 30
    }
  }
);

// Autowiring
ExpressOctopusCore.autowire();

// Start the Express server on the port 3000
App.listen(3000, () => console.log("Started on the port 3000"));
```

#### Simple Endpoint (Route):

```javascript
const OctopusEndPoint = require("express-octopus").OctopusEndPoint;

// You must extend upon OctopusEndPoint class!
class SimpleEndPoint extends OctopusEndPoint {
  constructor() {
    // It is requiered to call super in the constructor
    // Argument is the parameters from the url
    // Example: super(':id');
    super("");
  }

  // Handle the middleware for the GET request
  // Always has 3 parameters, no more, no less
  // Async is not requiered, but recommended
  // Method name needs to be in the following format: <HTTP request method>_middleware
  // Method name needs to be lowercase!
  async get_middleware(request, response, next) {
    console.log("GET MIDDLEWARE");
    next();
  }

  // Handle the middleware for the POST request
  // Always has 3 parameters, no more, no less
  // Async is not requiered, but recommended
  // Method name needs to be in the following format: <HTTP request method>_middleware
  // Method name needs to be lowercase!
  async post_middleware(request, response, next) {
    console.log("POST MIDDLEWARE");
    next();
  }

  // Handle the middleware for the PUT request
  // Always has 3 parameters, no more, no less
  // Async is not requiered, but recommended
  // Method name needs to be in the following format: <HTTP request method>_middleware
  // Method name needs to be lowercase!
  async put_middleware(request, response, next) {
    console.log("PUT MIDDLEWARE");
    next();
  }

  // Handle the middleware for the PATCH request
  // Always has 3 parameters, no more, no less
  // Async is not requiered, but recommended
  // Method name needs to be in the following format: <HTTP request method>_middleware
  // Method name needs to be lowercase!
  async patch_middleware(request, response, next) {
    console.log("PATCH MIDDLEWARE");
    next();
  }

  // Handle the middleware for the DELETE request
  // Always has 3 parameters, no more, no less
  // Async is not requiered, but recommended
  // Method name needs to be in the following format: <HTTP request method>_middleware
  // Method name needs to be lowercase!
  async delete_middleware(request, response, next) {
    console.log("DELETE MIDDLEWARE");
    next();
  }

  // Handle the GET request
  // Always has 2 parameters, no more, no less
  // Async is not requiered, but recommended
  // Method name needs to be in the following format: <HTTP request method>
  // Method name needs to be lowercase!
  async get(request, response) {
    console.log("GET!");
    response.send("Get!");
  }

  // Handle the POST request
  // Always has 2 parameters, no more, no less
  // Async is not requiered, but recommended
  // Method name needs to be in the following format: <HTTP request method>
  // Method name needs to be lowercase!
  async post(request, response) {
    console.log("POST!");
    response.send("Post!");
  }

  // Handle the PUT request
  // Always has 2 parameters, no more, no less
  // Async is not requiered, but recommended
  // Method name needs to be in the following format: <HTTP request method>
  // Method name needs to be lowercase!
  async put(request, response) {
    console.log("PUT!");
    response.send("Put!");
  }

  // Handle the PATCH request
  // Always has 2 parameters, no more, no less
  // Async is not requiered, but recommended
  // Method name needs to be in the following format: <HTTP request method>
  // Method name needs to be lowercase!
  async patch(request, response) {
    console.log("PATCH!");
    response.send("Patch!");
  }

  // Handle the DELETE request
  // Always has 2 parameters, no more, no less
  // Async is not requiered, but recommended
  // Method name needs to be in the following format: <HTTP request method>
  // Method name needs to be lowercase!
  async delete(request, response) {
    console.log("DELETE!");
    response.send("Delete!");
  }
}

// Must be class reference directly, do not instantiate class!
module.exports = SimpleEndPoint;
```

#### Simple Endpoint (Route) - Real world Example:

```javascript
const OctopusEndPoint = require("express-octopus").OctopusEndPoint;
const UserContoller = require("../../Controllers/UserController");

class DeleteUser extends OctopusEndPoint {
  constructor() {
    super(":id");
  }

  async delete_middleware(request, response, next) {
    UserContoller.middlewareHandler(request, response, next);
  }

  async delete(request, response) {
    UserContoller.deleteUser(request, response);
  }
}

module.exports = DeleteUser;
```

# TODO:
- Validate URL parameters with Regex

# Contributing:
If you have any suggestions, ideas or you have found a bug, feel free to contribute :)

Github Repository: [https://github.com/milutinke/Express-Octopus](https://github.com/milutinke/Express-Octopus)