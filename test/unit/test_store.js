import 'babel-polyfill';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
let expect = chai.expect;
chai.use(sinonChai);

import {createStore} from '../..';

describe("Store", function () {
    it("passes one object from constructor to initialize", function (done) {
        /* jshint expr:true */
        let Store = createStore({
            initialize: function (opt, nothing) {
                expect(opt).to.equal(42);
                expect(nothing).to.be.undefined;
                done();
            }
        });
        new Store(42, 100);
    });

    it("copies properties from the spec", function () {
        var Store = createStore({
            answer: {is: 42}
        });
        var store = new Store();
        expect(store.answer).to.eql({is: 42});
    });

    it("disallows reserved property names", function () {
        expect(function () {
            createStore({
                flux: true
            });
        }).to.throw(/reserved.*flux/i);

        expect(function () {
            createStore({
                waitFor: true
            });
        }).to.throw(/reserved.*waitFor/i);
    });

    it("allows registering actions via an actions hash", function () {
        var Store = createStore({
            actions: {
                "ACTION": "handleAction"
            },

            handleAction: function () {
            }
        });
        var store = new Store();
        store.handleAction = sinon.spy();
        var payload = {val: 42};
        store.__handleAction__({type: "ACTION", payload: payload});
        expect(store.handleAction).to.have.been.calledWith(payload, "ACTION");
    });

    describe("#bindActions", function () {
        it("allows registering actions via an argument list", function () {
            // also tests that methods are autobound to the store instance
            var Store = createStore({
                actions: {
                    "ACTION": "handleAction"
                },

                initialize: function () {
                    this.bindActions("ACTION2", "handleAction2",
                        "ACTION3", this.handleAction3);
                },

                handleAction: function () {
                },
                handleAction2: function () {
                },
                handleAction3: function () {
                    this.value = 42;
                }
            });
            var store = new Store();
            store.handleAction = sinon.spy();
            store.handleAction2 = sinon.spy();
            var payload = {val: 42};
            store.__handleAction__({type: "ACTION", payload: payload});
            expect(store.handleAction).to.have.been.calledWith(payload, "ACTION");
            store.__handleAction__({type: "ACTION2", payload: payload});
            expect(store.handleAction2).to.have.been.calledWith(payload, "ACTION2");
            store.__handleAction__({type: "ACTION3", payload: payload});
            expect(store.value).to.equal(42);
        });

        it("allows registering actions via a hash", function () {
            var Store = createStore({
                actions: {
                    "ACTION": "handleAction"
                },

                initialize: function () {
                    this.bindActions({
                        "ACTION2": "handleAction2",
                        "ACTION3": this.handleAction3
                    });
                },

                handleAction: function () {
                },
                handleAction2: function () {
                },
                handleAction3: function () {
                    this.value = 42;
                }
            });

            var store = new Store();
            store.handleAction = sinon.spy();
            store.handleAction2 = sinon.spy();

            var payload = {val: 42};
            store.__handleAction__({type: "ACTION", payload: payload});
            expect(store.handleAction).to.have.been.calledWith(payload, "ACTION");
            store.__handleAction__({type: "ACTION2", payload: payload});
            expect(store.handleAction2).to.have.been.calledWith(payload, "ACTION2");
            store.__handleAction__({type: "ACTION3", payload: payload});
            expect(store.value).to.equal(42);
        });
    });

    it("throws when binding to a falsy action type", function () {
        var Store = createStore({
            initialize: function () {
                this.bindActions(
                    "TYPE_ONE", "handleOne",
                    null, "handleTwo"
                );
            }
        });

        expect(function () {
            new Store();
        }).to.throw(/Argument 3.*bindActions.*falsy/);
    });

    it("throws when using a non-function action handler", function () {
        var Store = createStore({
            actions: {
                "ACTION": "handleAction"
            }
        });

        var store = new Store();
        expect(function () {
            store.__handleAction__({type: "ACTION"});
        }).to.throw(/handler.*type ACTION.*not.*function/);

        expect(function () {
            store.__handleAction__({type: "ACTION2"});
        }).not.to.throw();
    });

    it("throws when binding an action type to a falsy handler", function () {
        var Store = createStore({
            actions: {
                "ACTION": this.handleAction
            },

            handleAction: function () {
            }
        });

        expect(function () {
            new Store();
        }).to.throw(/handler.*type ACTION.*falsy/);
    });
});
