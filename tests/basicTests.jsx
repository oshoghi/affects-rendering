window.__DEV__ = true;

jest.dontMock("../index.js");

describe("PropTypes", function () {
    var React = require("../index.js"),
        ReactTestUtils = require("react-addons-test-utils"),
        _ = require("underscore");

    var TestComp = React.createClass({
        propTypes: {
            prop1: React.PropTypes.string.isRequired.affectsRendering,
            prop2: React.PropTypes.string.isRequired,
            prop3: React.PropTypes.object.affectsRendering,
            prop4: React.PropTypes.number
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

    it("oneOfType validator", function () {
        var validator = React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]);

        //array should not match the condition
        expect(_.isError(validator({ someProp: [] }, "someProp", "my comp"))).toBe(true);

        //string or number do
        expect(validator({ someProp: 1 }, "someProp", "my comp")).toBeFalsy();
        expect(validator({ someProp: "one" }, "someProp", "my comp")).toBeFalsy();

        //null should be okay too
        expect(validator({}, "someProp", "my comp")).toBeFalsy();
    });

    it("isRequired", function () {
        var validator = React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]).isRequired;

        //array should not match the condition
        expect(_.isError(validator({ someProp: [] }, "someProp", "my comp"))).toBe(true);

        //string or number do
        expect(validator({ someProp: 1 }, "someProp", "my comp")).toBeFalsy();
        expect(validator({ someProp: "one" }, "someProp", "my comp")).toBeFalsy();

        //null should NOT be okay
        expect(_.isError(validator({}, "someProp", "my comp"))).toBe(true);
    });

    it("affectsRendering", function () {
        var validator = React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]).affectsRendering;

        //array should not match the condition
        expect(_.isError(validator({ someProp: [] }, "someProp", "my comp"))).toBe(true);

        //string or number do
        expect(validator({ someProp: 1 }, "someProp", "my comp")).toBeFalsy();
        expect(validator({ someProp: "one" }, "someProp", "my comp")).toBeFalsy();

        //null should be okay too
        expect(validator({}, "someProp", "my comp")).toBeFalsy();
    });

    it("isRequired.affectsRendering", function () {
        var validator = React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]).isRequired.affectsRendering;

        //array should not match the condition
        expect(_.isError(validator({ someProp: [] }, "someProp", "my comp"))).toBe(true);

        //string or number do
        expect(validator({ someProp: 1 }, "someProp", "my comp")).toBeFalsy();
        expect(validator({ someProp: "one" }, "someProp", "my comp")).toBeFalsy();

        //null should NOT be okay
        expect(_.isError(validator({}, "someProp", "my comp"))).toBe(true);
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
