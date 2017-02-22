import Dispatcher from './lib/dispatcher';
import createStore from './lib/create_store';
import Flux from './lib/flux';
import FluxMixin from './lib/flux_mixin';
import StoreWatchMixin from './lib/store_watch_mixin';
import FluxChildMixin from './lib/flux_child_mixin';
import version from './version';


// var Flux = require("./lib/flux"),
//     FluxMixin = require("./lib/flux_mixin"),
//     FluxChildMixin = require("./lib/flux_child_mixin"),
//     StoreWatchMixin = require("./lib/store_watch_mixin"),
//     createStore = require("./lib/create_store");

export {
    Dispatcher,
    createStore,
    Flux,
    FluxMixin,
    StoreWatchMixin,
    FluxChildMixin,
    version
};
