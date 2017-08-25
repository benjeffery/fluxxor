import PropTypes from 'prop-types';

const FluxMixin = React => {
    return {
        componentWillMount: function() {
            if (!this.props.flux && (!this.context || !this.context.flux)) {
                let namePart = this.constructor.displayName ? " of " + this.constructor.displayName : "";
                throw new Error("Could not find flux on this.props or this.context" + namePart);
            }
        },

        childContextTypes: {
            flux: PropTypes.object
        },

        contextTypes: {
            flux: PropTypes.object
        },

        getChildContext: function() {
            return {
                flux: this.getFlux()
            };
        },

        getFlux: function() {
            return this.props.flux || (this.context && this.context.flux);
        }
    };
};

FluxMixin.componentWillMount = function() {
    throw new Error("Fluxxor.FluxMixin is a function that takes React as a " +
        "parameter and returns the mixin, e.g.: mixins: [Fluxxor.FluxMixin(React)]");
};

export default FluxMixin
