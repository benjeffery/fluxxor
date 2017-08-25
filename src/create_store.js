import _each from 'lodash.foreach';
import _isFunction from 'lodash.isfunction';
import Store from "./store";

const RESERVED_KEYS = ["flux", "waitFor"];

export default (spec) => {
    _each(RESERVED_KEYS, key => {
        if (spec[key]) {
            throw new Error("Reserved key '" + key + "' found in store definition");
        }
    });

    return class StoreCreator extends Store {

        constructor(options) {
            super(options);
            options = options || {};

            for (let key in spec) {
                if (key === "actions") {
                    this.bindActions(spec[key]);
                } else if (key === "initialize") {
                    // do nothing
                } else if (_isFunction(spec[key])) {
                    this[key] = spec[key].bind(this);
                } else {
                    this[key] = spec[key];
                }
            }

            if (spec.initialize) {
                spec.initialize.call(this, options);
            }
        };
    };
};


