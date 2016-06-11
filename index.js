var React = require("react"),
    deepClone = require("clone");

/*
 * Simple function which just wraps the passed in function in another function
 */
function wrap (fn) {
    return function () {
        return fn.apply(null, arguments);
    };
}

/*
 * Clone React
 */
var ReactClone = deepClone(React);

/*
 * Decorate the complex validators that return a validator
 */
["oneOf", "oneOfType", "arrayOf"].forEach(function (type) {
    var validator = ReactClone.PropTypes[type];

    ReactClone.PropTypes[type] = function () {
        var innerValidator = validator.apply(null, arguments);

        //create a new type checker which will call the original React logic
        var fn = wrap(innerValidator);
        fn.affectsRendering = wrap(innerValidator);
        fn.affectsRendering.affectsRendering = true;

        if (typeof(innerValidator.isRequired) !== "undefined") {
            fn.isRequired = wrap(innerValidator.isRequired);
            fn.isRequired.affectsRendering = wrap(innerValidator.isRequired);
            fn.isRequired.affectsRendering.affectsRendering = true;
        }

        return fn;
    };
});

/*
 * Decorate all proptypes with a affectsRendering attribute that just returns the original function
 */
Object.keys(ReactClone.PropTypes).forEach(function (type) {
    ReactClone.PropTypes[type].affectsRendering = wrap(React.PropTypes[type]);
    ReactClone.PropTypes[type].affectsRendering.affectsRendering = true;

    if (typeof(ReactClone.PropTypes[type].isRequired) !== "undefined") {
        ReactClone.PropTypes[type].isRequired.affectsRendering = wrap(ReactClone.PropTypes[type].isRequired);
        ReactClone.PropTypes[type].isRequired.affectsRendering.affectsRendering = true;
    }
});


ReactClone.createClass = function (props) {
    /*
     * For each new class tally which properties affect rendering.  If there are none, then the shouldComponentUpdate
     * function will be left alone and not wrapped.
     */
    var renderProps = [];
    for (var k in props.propTypes) {
        if (props.propTypes[k].affectsRendering === true) {
            renderProps.push(k);
        }
    }

    /* If the new class includes a property with the name renderProps, inject a default shouldComponentUpdate function
     * so that every class doesnt have to implement boilerplate code
     */
    if (renderProps.length > 0) {
        //wrap the original function in some logic
        props.shouldComponentUpdate = function (newProps, newState) {
            //if any of the renderProps have changed, automatically re-render
            for (var i = 0; i < renderProps.length; i += 1) {
                if (this.props[renderProps[i]] !== newProps[renderProps[i]]) {
                    return true;
                }
            }

            //return false unless the state has changed
            return !!(this.state && newState && this.state !== newState);
        };

        //attach the list of renderProps to the shouldComponentUpdate function.  Mostly just used in unit testing
        props.shouldComponentUpdate.renderProps = renderProps;
    }

    return React.createClass(props);
};

module.exports = ReactClone;
