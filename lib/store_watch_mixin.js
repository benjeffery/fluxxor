import _each from 'lodash/forEach';

const StoreWatchMixin = (...storeNames) => {

    return {

        _setStateFromFlux: function() {
            if (this.mounted) {
                this.setState(this.getStateFromFlux());
            }
        },

        componentDidMount: function () {
            let flux = this.props.flux || this.context.flux;
            this.mounted = true;

            storeNames.forEach((store) => {
                flux.store(store).on("change", this._setStateFromFlux);
            });
        },

        componentWillUnmount: function () {
            let flux = this.props.flux || this.context.flux;
            this.mounted = false;
            _each(storeNames, (store) => {
                flux.store(store).removeListener("change", this._setStateFromFlux);
            });
        },

        getInitialState: function () {
            return this.getStateFromFlux();
        }
    };
};

StoreWatchMixin.componentWillMount = function () {
    throw new Error("Fluxxor.StoreWatchMixin is a function that takes one or more " +
        "store names as parameters and returns the mixin, e.g.: " +
        "mixins: [Fluxxor.StoreWatchMixin(\"Store1\", \"Store2\")]");
};

export default StoreWatchMixin
