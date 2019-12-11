"use strict";

class OctopusEndPoint {
    constructor(parameters = null) {
        this.parameters = parameters;

        // We add this so we can check if the loaded class is extending this one
        this._octopus_ = true;
    }

    static RequestMethods() {
        return ['get', 'post', 'delete', 'put', 'patch'];
    }

    hasRequestMethodPresent(method) {
        return ((typeof this[method] !== undefined) && (typeof this[method] === 'function'));
    }

    hasMethodMiddleware(method) {
        return ((typeof this[this.getMethodMiddlewareName(method)] !== undefined) && (typeof this[this.getMethodMiddlewareName(method)] === 'function'));
    }

    isMethodMiddlewareValid(method) {
        return /((async)?)\s?(get|put|post|delete|patch)(_middleware)(\(\w*\s?\,\s?\w+\s?\,\s?\w+\))/.test(this[this.getMethodMiddlewareName(method)].toString());
    }

    getMethodMiddleware(method) {
        return this[this.getMethodMiddlewareName(method)];
    }

    getMethodMiddlewareName(method) {
        return `${method.toLowerCase()}_middleware`;
    }

    getDefinedRequestMethods(endPointObject) {
        let methods = new Array();

        OctopusEndPoint.RequestMethods().forEach(method => {
            if (this.hasRequestMethodPresent(method))
                methods.push({ method: method, object: endPointObject });
        });

        return methods;
    }

    hasValidRequestMethods() {
        const methods = this.getDefinedRequestMethods();

        if (methods.length === 0)
            return false;

        for (let iterator = 0; iterator < methods.length; iterator++) {
            if (!this.isMethodValid(methods[iterator].method))
                return false;
        }

        return true;
    }

    isMethodValid(method) {
        return /((async)?)\s?(get|put|post|delete|patch)(\(\w*\s?\,\s?\w+\))/.test(this[method].toString());
    }

    hasParameters() {
        if(this.parameters === undefined || this.parameters === null)
            return false;

        return ((this.hasOwnProperty('parameters') !== undefined) && (this.hasOwnProperty('parameters') === true));
    }
}

module.exports = OctopusEndPoint;