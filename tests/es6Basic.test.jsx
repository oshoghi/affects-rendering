global.__DEV__ = true;

const React = require("react");
const PropTypes = require("prop-types");
const Enzyme = require("enzyme");
const ReReact = require("../index.js");
const Adapter = require("enzyme-adapter-react-16");

Enzyme.configure({ adapter: new Adapter() })

describe("PropTypes", function () {

    class ES6Comp extends React.Component {
        render () {
            return <div />
        }
    }
    ES6Comp.propTypes = {
        prop1: PropTypes.string.isRequired.affectsRendering,
        prop2: PropTypes.string.isRequired,
        prop3: PropTypes.object.affectsRendering,
        prop4: PropTypes.number
    };

    function getWrapper (opts) {
        opts = Object.assign({}, {
            prop1: "1",
            prop2: "2",
            prop3: {},
            prop4: 4
        }, opts || {});

        return Enzyme.mount(<ES6Comp {...opts} />);
    }

    it("injects shouldComponentUpdate function", function () {
        const wrapper = getWrapper();
        const component = wrapper.instance();

        expect(typeof(component.shouldComponentUpdate)).toBe("function");
    });

    it("shouldComponentUpdate returns correct value", function () {
        const wrapper = getWrapper();
        const component = wrapper.instance();
        component.render = jest.fn().mockReturnValue(null);

        expect(component.render).not.toBeCalled();

        let nextProps = Object.assign({}, component.props, { prop2: "3" });
        expect(component.shouldComponentUpdate(nextProps, component.state, component.context)).toBe(false);

        nextProps = Object.assign({}, component.props, { prop1: "2", prop2: "3" });
        expect(component.shouldComponentUpdate(nextProps, component.state, component.context)).toBe(true);
    });

    it("doesnt render if props dont change", function () {
        const wrapper = getWrapper();
        const component = wrapper.instance();
        component.render = jest.fn().mockReturnValue(null);

        expect(component.render).not.toBeCalled();

        //change a prop which does not affect rendering
        wrapper.setProps({ prop2: "3" });
        expect(component.render).not.toBeCalled();

        //change a prop which does affect rendering
        wrapper.setProps({ prop1: "blah" });
        expect(component.render).toBeCalled();
    });
});
