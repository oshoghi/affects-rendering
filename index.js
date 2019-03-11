const PropTypes = require("./lib/propTypes");
const React = require("react");

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
}


function getAffectsRenderingProps (propTypes) {
    var renderProps = [];
    for (var k in propTypes) {
        if (propTypes[k].affectsRendering === true) {
            renderProps.push(k);
        }
    }
    return renderProps;
}

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
