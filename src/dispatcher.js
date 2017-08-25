import _clone from "lodash.clone";
import _mapValues from "lodash.mapvalues";
import _forOwn from "lodash.forown";
import _intersection from "lodash.intersection";
import _keys from "lodash.keys";
import _map from "lodash.map";
import _each from "lodash.foreach";
import _size from "lodash.size";
import _findKey from "lodash.findkey";
import _uniq from "lodash.uniq";


export default class Dispatcher {

    constructor(stores) {
        this.stores = {};
        this.currentDispatch = null;
        this.currentActionType = null;
        this.waitingToDispatch = [];
        this.dispatchInterceptor = Dispatcher.defaultDispatchInterceptor;
        this._boundDispatch = this._dispatch.bind(this);

        for (let key in stores) {
            if (stores.hasOwnProperty(key)) {
                this.addStore(key, stores[key]);
            }
        }
    }

    static defaultDispatchInterceptor(action, dispatch) {
        return (dispatch(action))
    }


    addStore(name, store) {
        store.dispatcher = this;
        this.stores[name] = store;
    }

    dispatch(action) {
        this.dispatchInterceptor(action, this._boundDispatch);
    };

    _dispatch(action) {
        if (!action || !action.type) {
            throw new Error("Can only dispatch actions with a 'type' property");
        }

        if (this.currentDispatch) {
            const complaint = "Cannot dispatch an action ('" + action.type + "') while another action ('" +
                this.currentActionType + "') is being dispatched";
            throw new Error(complaint);
        }

        this.waitingToDispatch = _clone(this.stores);

        this.currentActionType = action.type;
        this.currentDispatch = _mapValues(this.stores, () => {
            return { resolved: false, waitingOn: [], waitCallback: null };
        });

        try {
            this.doDispatchLoop(action);
        } finally {
            this.currentActionType = null;
            this.currentDispatch = null;
        }
    };

    doDispatchLoop(action) {
        let dispatch, canBeDispatchedTo, wasHandled = false,
            removeFromDispatchQueue = [], dispatchedThisLoop = [];

        _forOwn(this.waitingToDispatch, (value, key) => {
            dispatch = this.currentDispatch[key];
            canBeDispatchedTo = !dispatch.waitingOn.length ||
                !_intersection(dispatch.waitingOn, _keys(this.waitingToDispatch)).length;
            if (canBeDispatchedTo) {
                if (dispatch.waitCallback) {
                    let stores = _map(dispatch.waitingOn, (key) => {
                        return this.stores[key];
                    }, this);
                    let fn = dispatch.waitCallback;
                    dispatch.waitCallback = null;
                    dispatch.waitingOn = [];
                    dispatch.resolved = true;
                    fn.apply(null, stores);
                    wasHandled = true;
                } else {
                    dispatch.resolved = true;
                    let handled = this.stores[key].__handleAction__(action);
                    if (handled) {
                        wasHandled = true;
                    }
                }

                dispatchedThisLoop.push(key);

                if (this.currentDispatch[key].resolved) {
                    removeFromDispatchQueue.push(key);
                }
            }
        }, this);

        if (_keys(this.waitingToDispatch).length && !dispatchedThisLoop.length) {
            let storesWithCircularWaits = _keys(this.waitingToDispatch).join(", ");
            throw new Error("Indirect circular wait detected among: " + storesWithCircularWaits);
        }

        _each(removeFromDispatchQueue, (key) => {
            delete this.waitingToDispatch[key];
        }, this);

        if (_size(this.waitingToDispatch)) {
            this.doDispatchLoop(action);
        }

        if (!wasHandled && console && console.warn) {
            console.warn("An action of type " + action.type + " was dispatched, but no store handled it");
        }

    };

    waitForStores(store, stores, fn) {
        if (!this.currentDispatch) {
            throw new Error("Cannot wait unless an action is being dispatched");
        }

        let waitingStoreName = _findKey(this.stores, (val) => {
            return val === store;
        });

        if (stores.indexOf(waitingStoreName) > -1) {
            throw new Error("A store cannot wait on itself");
        }

        let dispatch = this.currentDispatch[waitingStoreName];

        if (dispatch.waitingOn.length) {
            throw new Error(waitingStoreName + " already waiting on stores");
        }

        _each(stores, (storeName) =>{
            let storeDispatch = this.currentDispatch[storeName];
            if (!this.stores[storeName]) {
                throw new Error("Cannot wait for non-existent store " + storeName);
            }
            if (storeDispatch.waitingOn.indexOf(waitingStoreName) > -1) {
                throw new Error("Circular wait detected between " + waitingStoreName + " and " + storeName);
            }
        }, this);

        dispatch.resolved = false;
        dispatch.waitingOn = _uniq(dispatch.waitingOn.concat(stores));
        dispatch.waitCallback = fn;
    };

    setDispatchInterceptor(fn) {
        if (fn) {
            this.dispatchInterceptor = fn;
        } else {
            this.dispatchInterceptor = Dispatcher.defaultDispatchInterceptor;
        }
    };
}






