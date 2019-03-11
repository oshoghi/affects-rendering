var PropTypes = require("prop-types");

/*
 * Simple function which just wraps the passed in function in another function
 */
function wrap (fn) {
    return function () {
        return fn.apply(null, arguments);
    };
}

/*
 * Decorate the complex validators that return a validator
 */
["oneOf", "oneOfType", "arrayOf", "shape"].forEach(function (type) {
    var validator = PropTypes[type];

    PropTypes[type] = function () {
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
Object.keys(PropTypes).forEach(function (type) {
    PropTypes[type].affectsRendering = wrap(PropTypes[type]);
    PropTypes[type].affectsRendering.affectsRendering = true;

    if (typeof(PropTypes[type].isRequired) !== "undefined") {
        PropTypes[type].isRequired.affectsRendering = wrap(PropTypes[type].isRequired);
        PropTypes[type].isRequired.affectsRendering.affectsRendering = true;
    }
});

module.exports = PropTypes;
