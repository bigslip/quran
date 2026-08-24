const React = require('react');
const ReactDOMServer = require('react-dom/server');

const Pill = ({ containerClassName, ...props }) => {
  return React.createElement('div', {
    ...props,
    className: `default-class ${containerClassName || ''}`.trim()
  });
};

console.log(ReactDOMServer.renderToString(React.createElement(Pill, { className: 'custom-class' })));
