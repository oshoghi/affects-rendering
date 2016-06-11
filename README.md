# re-react
A wrapper for react which allows decorating protoTypes to indicate which properties should cause a re-render.

# what does it do?
React is an amazing library but if you use it with Redux, every mundane state change causes the entire app to re-render.  To combat this most developers implement shouldComponentUpdate functions but these requires lots of boilerplate code.  re-react allows you to decorate your propTypes to automatically have a shouldComponentUpdate function injected into your component.

#Example
```js
  var React = require("re-react");
  
  var MyComponent = React.createClass({
    propTypes: {
      onButtonClicked: React.PropTypes.function,
      buttonName: React.PropTypes.string.affectsRendering 
      //Now the component will only re-render if any of it's affectsRendering properties change.  In this case, only if
      //buttonName changes.
    },
  
    render: function () {
      return (
        <div className="container">
          <input type="button" onClick={this.props.onButtonClicked}>{this.props.buttonName}</input>
        </div>
    }
  });
```
