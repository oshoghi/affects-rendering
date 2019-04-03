# re-react
A wrapper for react which allows decorating protoTypes to indicate which properties should cause a re-render.

# what does it do?
React is an amazing library but if you use it with Redux, every mundane state change causes the entire app to re-render.  To combat this most developers implement shouldComponentUpdate functions but these requires lots of boilerplate code.  re-react allows you to decorate your propTypes to automatically have a shouldComponentUpdate function injected into your component.

#Example
```js
import React, { Component } from "react";
import "re-react";
import { moun } from "enzyme";

class MyComponent extends Component {
    static propTypes = {
      propA: React.PropTypes.string.affectsRendering
      propB: React.PropTypes.string
    };

    render () {
      return (
        <div>
          A: {this.props.propA}, B: {this.props.propB}
        </div>
      );
    }
}

it("only renders when decorated props change", function () {
    const wrapper = mount(<MyComponent propA="1" propB="2" />);

    expect(wrapper.find("div").text()).toBe("A: 1, B: 2");

    //modifying a prop that hasnt been set to cause re-renders will have no effect
    wrapper.setProps({ propB: "3" });
    expect(wrapper.find("div").text()).toBe("A: 1, B: 2");

    //modifying the prop which affectsRendering, will cause re-render
    wrapper.setProps({ propA: "3" });
    expect(wrapper.find("div").text()).toBe("A: 3, B: 3");
});
```
