import {EventEmitter} from "eventemitter3";
import objectPath from "object-path";
import _each from "lodash.foreach";
import _reduce from "lodash.reduce";
import _isFunction from "lodash.isfunction";
import _isString from "lodash.isstring";

import Dispatcher from './dispatcher';

export default class Flux extends  EventEmitter {

    constructor(stores, actions) {
        super();

        this.dispatcher = new Dispatcher(stores);
        this.actions = {};
        this.stores = {};

        let dispatcher = this.dispatcher;
        //let flux = this;
        this.dispatchBinder = {
            flux: this,
            dispatch: (type, payload) => {
                try {
                    this.emit("dispatch", type, payload);
                } finally {
                    dispatcher.dispatch({type: type, payload: payload});
                }
            }
        };

        this.addActions(actions);
        this.addStores(stores);

    }

    static findLeaves(obj, path, callback) {
        path = path || [];

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (_isFunction(obj[key])) {
                    callback(path.concat(key), obj[key]);
                } else {
                    Flux.findLeaves(obj[key], path.concat(key), callback);
                }
            }
        }
    }


    // addAction has two signatures:
    // 1: string[, string, string, string...], actionFunction
    // 2: arrayOfStrings, actionFunction
    addAction(...args) {
        if (arguments.length < 2) {
            throw new Error("addAction requires at least two arguments, a string (or array of strings) and a function");
        }

        if (!_isFunction(args[args.length - 1])) {
            throw new Error("The last argument to addAction must be a function");
        }

        let func = args.pop().bind(this.dispatchBinder);

        if (!_isString(args[0])) {
            args = args[0];
        }

        let leadingPaths = _reduce(args, (acc, next) => {
            if (acc) {
                let nextPath = acc[acc.length - 1].concat([next]);
                return acc.concat([nextPath]);
            } else {
                return [[next]];
            }
        }, null);

        // Detect trying to replace a function at any point in the path
        _each(leadingPaths, (path) => {
            if (_isFunction(objectPath.get(this.actions, path))) {
                throw new Error("An action named " + args.join(".") + " already exists");
            }
        }, this);

        // Detect trying to replace a namespace at the final point in the path
        if (objectPath.get(this.actions, args)) {
            throw new Error("A namespace named " + args.join(".") + " already exists");
        }

        objectPath.set(this.actions, args, func, true);
    }


    addActions(actions) {
        Flux.findLeaves(actions, [], this.addAction.bind(this));
    }

    store(name) {
        return this.stores[name];
    };

    getAllStores() {
        return this.stores;
    };

    addStore(name, store) {
        if (name in this.stores) {
            throw new Error("A store named '" + name + "' already exists");
        }
        store.flux = this;
        this.stores[name] = store;
        this.dispatcher.addStore(name, store);
    };

    addStores(stores) {
        for (let key in stores) {
            if (stores.hasOwnProperty(key)) {
                this.addStore(key, stores[key]);
            }
        }
    }

    setDispatchInterceptor(fn) {
        this.dispatcher.setDispatchInterceptor(fn);
    }

}





