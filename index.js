var React = require("react");

/*
 * Simple function which just wraps the passed in function in another function
 */
function wrap (fn) {
    return function () {
        return fn.apply(null, arguments);
    };
}

/*
 * A function for comparing two sets of props for the keys given in list
 */
function diffProps (current, next, list) {
    for (var i = 0; i < list.length; i += 1) {
        if (current[list[i]] !== next[list[i]]) {
            return true;
        }
    }

    return false;
};

/*
 * Decorate the complex validators that return a validator
 */
["oneOf", "oneOfType", "arrayOf", "shape"].forEach(function (type) {
    var validator = React.PropTypes[type];

    React.PropTypes[type] = function () {
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
Object.keys(React.PropTypes).forEach(function (type) {
    React.PropTypes[type].affectsRendering = wrap(React.PropTypes[type]);
    React.PropTypes[type].affectsRendering.affectsRendering = true;

    if (typeof(React.PropTypes[type].isRequired) !== "undefined") {
        React.PropTypes[type].isRequired.affectsRendering = wrap(React.PropTypes[type].isRequired);
        React.PropTypes[type].isRequired.affectsRendering.affectsRendering = true;
    }
});

function getAffectsRenderingProps (propTypes) {
    var renderProps = [];
    for (var k in propTypes) {
        if (propTypes[k].affectsRendering === true) {
            renderProps.push(k);
        }
    }
    return renderProps;
}

var createClass = React.createClass;
React.createClass = function (props) {
    //Determine which properties affect rendering
    var renderProps = getAffectsRenderingProps(props.propTypes);
    var contextProps = getAffectsRenderingProps(props.contextTypes);

    //If the affectsRendering feature is used in at least one prop, then inject a shouldComponentUpdate function
    if (renderProps.length > 0 && !props.shouldComponentUpdate) {
        //wrap the original function in some logic
        props.shouldComponentUpdate = function (nextProps, nextState, nextContext) {
            return !!(
                (this.state && nextState && this.state !== nextState) ||
                diffProps(this.context, nextContext, contextProps) ||
                diffProps(this.props, nextProps, renderProps)
            );
        };
        //attach the renderProps to the shouldComponentUpdate method.  This is just to expose them to unit tests
        props.shouldComponentUpdate.renderProps = renderProps;
    }

    return createClass(props);
};

/*
 * Because React checks that all component instances' prototypes includes React.Component, cloning
 * React.Component and only modifying the clone will cause warnings.  To get around this issue we
 * modify the prototype of React.Component and account for components which do not wish to use the
 * features of re-react.
 */
React.Component.prototype.shouldComponentUpdate = function (nextProps, nextState, nextContext) {
    var constructor = Object.getPrototypeOf(this).constructor;

    if (typeof(constructor.renderProps) === "undefined") {
        constructor.renderProps = getAffectsRenderingProps(constructor.propTypes);
    }

    if (typeof(constructor.propTypes) === "undefined" || constructor.renderProps.length === 0) {
        return true;
    }

    return this.state !== nextState || this.context !== nextContext || diffProps(this.props, nextProps, constructor.renderProps);
};

module.exports = React;
