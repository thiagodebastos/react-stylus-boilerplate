import React from 'react';
import ReactDOM from 'react-dom';
const reactPerf = require('react-addons-perf');

if (process.env.NODE_ENV !== 'production') {
  React.Perf = reactPerf;
}

ReactDOM.render(
  <div>Hello world</div>,
  document.getElementById('app')
);
