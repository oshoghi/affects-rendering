window.__DEV__ = true;

jest.dontMock("../index.js");

describe("PropTypes", function () {
    var React = require("../index.js"),
        PropTypes = require("prop-types"),
        ReactTestUtils = require("react-dom/test-utils"),
        _ = require("underscore");

    var TestComp = React.createClass({
        propTypes: {
            prop1: PropTypes.string.isRequired.affectsRendering,
            prop2: PropTypes.string.isRequired,
            prop3: PropTypes.object.affectsRendering,
            prop4: PropTypes.number
        },

        render: function () {
            return <div />;
        }
    });

    var Wrapper = React.createClass({
        sendProps: function (state) {
            this.setState(state);
        },

        render: function () {
            return <TestComp {...this.props.opts} {...this.state} ref="target" />;
        }
    });

    function getWrappedComponent (opts) {
        opts = _.defaults(opts || {}, {
            prop1: "1",
            prop2: "2",
            prop3: {},
            prop4: 4
        });

        return ReactTestUtils.renderIntoDocument(<Wrapper opts={opts} />);
    }

    // PropTypes.checkPropTypes does NOT report the same error message more than once
    // so we have to alter the message for each call
    // the easiest way is to make up a new component name
    // Ref:
    // https://github.com/facebook/prop-types/issues/91
    // would be nice if this PR is accepted:
    // https://github.com/facebook/prop-types/pull/54/files
    var _checkCount = 0;
    function getUniqueCompName() {
        return "my comp " + _checkCount++;
    }

    describe("validators", () => {
        let consoleError;
        beforeAll(() => {
            consoleError = console.error;
        });
        afterAll(() => {
            console.error = consoleError;
        });
    
        beforeEach(() => {
            console.error = jest.fn();
        });
    
        it("oneOfType validator", function () {
            var validator = PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]);
    
            //array should not match the condition
            PropTypes.checkPropTypes({ someProp: validator }, { someProp: [] }, "someProp", getUniqueCompName());
            expect(console.error).toBeCalled();
            jest.resetAllMocks();
    
            //string or number do
            PropTypes.checkPropTypes({ someProp: validator }, { someProp: 1 }, "someProp", getUniqueCompName());
            expect(console.error).not.toBeCalled();

            PropTypes.checkPropTypes({ someProp: validator }, { someProp: "one" }, "someProp", getUniqueCompName());
            expect(console.error).not.toBeCalled();
    
            // //null should be okay too
            PropTypes.checkPropTypes({ someProp: validator }, {}, "someProp", getUniqueCompName());
            expect(console.error).not.toBeCalled();
        });
    
        it("isRequired", function () {
            var validator = PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]).isRequired;
    
            //array should not match the condition
            PropTypes.checkPropTypes({ someProp: validator }, { someProp: [] }, "someProp", getUniqueCompName());
            expect(console.error).toBeCalled();
            jest.resetAllMocks();

            //string or number do
            PropTypes.checkPropTypes({ someProp: validator }, { someProp: 1 }, "someProp", getUniqueCompName());
            expect(console.error).not.toBeCalled();

            PropTypes.checkPropTypes({ someProp: validator }, { someProp: "one" }, "someProp", getUniqueCompName());
            expect(console.error).not.toBeCalled();

            //null should NOT be okay
            PropTypes.checkPropTypes({ someProp: validator }, {}, "someProp", getUniqueCompName());
            expect(console.error).toBeCalled();
        });
    
        it("affectsRendering", function () {
            var validator = PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]).affectsRendering;
    
            //array should not match the condition
            PropTypes.checkPropTypes({ someProp: validator }, { someProp: [] }, "someProp", getUniqueCompName());
            expect(console.error).toBeCalled();
            jest.resetAllMocks();
    
            //string or number do
            PropTypes.checkPropTypes({ someProp: validator }, { someProp: 1 }, "someProp", getUniqueCompName());
            expect(console.error).not.toBeCalled();
            PropTypes.checkPropTypes({ someProp: validator }, { someProp: "one" }, "someProp", getUniqueCompName());
            expect(console.error).not.toBeCalled();
    
            //null should be okay too
            PropTypes.checkPropTypes({ someProp: validator }, {}, "someProp", getUniqueCompName());
            expect(console.error).not.toBeCalled();
        });
    
        it("isRequired.affectsRendering", function () {
            var validator = PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]).isRequired.affectsRendering;

            //array should not match the condition
            PropTypes.checkPropTypes({ someProp: validator }, { someProp: [] }, "someProp", getUniqueCompName());
            expect(console.error).toBeCalled();
            jest.resetAllMocks();

            //string or number do
            PropTypes.checkPropTypes({ someProp: validator }, { someProp: 1 }, "someProp", getUniqueCompName());
            expect(console.error).not.toBeCalled();

            PropTypes.checkPropTypes({ someProp: validator }, { someProp: "one" }, "someProp", getUniqueCompName());
            expect(console.error).not.toBeCalled();

            //null should NOT be okay
            PropTypes.checkPropTypes({ someProp: validator }, {}, "someProp", getUniqueCompName());
            expect(console.error).toBeCalled();
        });
    });

    it("injects shouldComponentUpdate function", function () {
        var wrapper = getWrappedComponent();
        var component = wrapper.refs.target;

        expect(typeof(component.shouldComponentUpdate)).toBe("function");
    });

    it("doesnt render if props dont change", function () {
        var wrapper = getWrappedComponent();
        var component = wrapper.refs.target;
        var props = component.props;

        expect(component.shouldComponentUpdate.renderProps).toEqual(["prop1", "prop3"]);

        expect(component.shouldComponentUpdate(_.defaults({ prop2: "3" }, props))).toBe(false);
        expect(component.shouldComponentUpdate(_.defaults({ prop1: "2", prop2: "3" }, props))).toBe(true);
    });

    it("considers state", function () {
        var wrapper = getWrappedComponent();
        var component = wrapper.refs.target;
        var props = component.props;

        component.setState({ a: 1 });

        expect(component.shouldComponentUpdate(props)).toBe(false);
        expect(component.shouldComponentUpdate(props, { a: 2 })).toBe(true);
    });
});
