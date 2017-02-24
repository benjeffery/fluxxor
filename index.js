import Dispatcher from './src/dispatcher';
import createStore from './src/create_store';
import Flux from './src/flux';
import FluxMixin from './src/flux_mixin';
import StoreWatchMixin from './src/store_watch_mixin';
import FluxChildMixin from './src/flux_child_mixin';
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
