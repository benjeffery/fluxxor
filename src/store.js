import {EventEmitter} from 'eventemitter3';
import _isFunction from "lodash.isfunction";
import _isObject from "lodash.isobject";

export default class Store extends EventEmitter {

    constructor(dispatcher){
        super();
        this.dispatcher = dispatcher;
        this.__actions__ = {};
    }

    __handleAction__(action) {
        let handler;
        if (!!(handler = this.__actions__[action.type])) {
            if (_isFunction(handler)) {
                handler.call(this, action.payload, action.type);
            } else if (handler && _isFunction(this[handler])) {
                this[handler].call(this, action.payload, action.type);
            } else {
                throw new Error("The handler for action type " + action.type + " is not a function");
            }
            return true;
        } else {
            return false;
        }
    }

    bindAction(type, handler) {
        if (!handler) {
            throw new Error("The handler for action type " + type + " is falsy");
        }

        this.__actions__[type] = handler;
    }

    bindActions(...args) {
        let actions = args;

        if (actions.length > 1 && actions.length % 2 !== 0) {
            throw new Error("bindActions must take an even number of arguments.");
        }


        if (actions.length === 1 && _isObject(actions[0])) {
            actions = actions[0];
            for (let key in actions) {
                if (actions.hasOwnProperty(key)) {
                    this.bindAction(key, actions[key]);
                }
            }
        } else {
            for (let i = 0; i < actions.length; i += 2) {
                let type = actions[i],
                    handler = actions[i+1];

                if (!type) {
                    throw new Error("Argument " + (i+1) + " to bindActions is a falsy value");
                }

                this.bindAction(type, handler);
            }
        }
    };

    waitFor(stores, fn) {
        this.dispatcher.waitForStores(this, stores, fn.bind(this));
    };
}
