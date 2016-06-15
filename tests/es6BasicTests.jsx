window.__DEV__ = true;

jest.dontMock("../index.js");

describe("PropTypes", function () {
    var React = require("../index.js"),
        ReactTestUtils = require("react-addons-test-utils"),
        _ = require("underscore");

    class ES6Comp extends React.Component {
        render () {
            return <div />
        }
    }
    ES6Comp.propTypes = {
        prop1: React.PropTypes.string.isRequired.affectsRendering,
        prop2: React.PropTypes.string.isRequired,
        prop3: React.PropTypes.object.affectsRendering,
        prop4: React.PropTypes.number
    };

    var Wrapper = React.createClass({
        sendProps: function (state) {
            this.setState(state);
        },

        render: function () {
            return <ES6Comp {...this.props.opts} {...this.state} ref="target" />;
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

    it("injects shouldComponentUpdate function", function () {
        var wrapper = getWrappedComponent();
        var component = wrapper.refs.target;

        expect(typeof(component.shouldComponentUpdate)).toBe("function");
    });

    it("doesnt render if props dont change", function () {
        var wrapper = getWrappedComponent();
        var component = wrapper.refs.target;
        var props = component.props;

        expect(component.shouldComponentUpdate(_.defaults({ prop2: "3" }, props), component.state)).toBe(false);
        expect(component.shouldComponentUpdate(_.defaults({ prop1: "2", prop2: "3" }, props), component.state)).toBe(true);
    });
/*
    it("considers state", function () {
        var wrapper = getWrappedComponent();
        var component = wrapper.refs.target;
        var props = component.props;

        component.setState({ a: 1 });

        expect(component.shouldComponentUpdate(props)).toBe(false);
        expect(component.shouldComponentUpdate(props, { a: 2 })).toBe(true);
    });*/
});
