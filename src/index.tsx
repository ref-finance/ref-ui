import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Wrapper from './components/wrapper';
import './shim';

ReactDOM.render(
  <Wrapper>
    <App />
  </Wrapper>,
  document.querySelector('#root')
);

new Worker(
  new URL(/* webpackChunkName: "worker" */ 'worker.ts', import.meta.url),
  {type: 'module'}
);
