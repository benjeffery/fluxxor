import PropTypes from 'prop-types';

const FluxChildMixin = function(React) {
    return {
        componentWillMount: function() {
            if (console && console.warn) {
                var namePart = this.constructor.displayName ? " in " + this.constructor.displayName : "",
                    message = "Fluxxor.FluxChildMixin was found in use" + namePart + ", " +
                        "but has been deprecated. Use Fluxxor.FluxMixin instead.";
                console.warn(message);
            }
        },

        contextTypes: {
            flux: PropTypes.object
        },

        getFlux: function() {
            return this.context.flux;
        }
    };
};

FluxChildMixin.componentWillMount = function() {
    throw new Error("Fluxxor.FluxChildMixin is a function that takes React as a " +
        "parameter and returns the mixin, e.g.: mixins[Fluxxor.FluxChildMixin(React)]");
};

export default FluxChildMixin;
