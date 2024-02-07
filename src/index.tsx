import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Wrapper from './components/wrapper';
import './shim';
import getConfig from './services/config';

ReactDOM.render(
  <Wrapper>
    <App />
  </Wrapper>,
  document.querySelector('#root')
);

var myWorker = new Worker(
  new URL(/* webpackChunkName: "worker" */ 'worker.ts', import.meta.url),
  { type: 'module' }
);

function sendWorkerData() {
  const config = getConfig();
  myWorker.postMessage({
    config,
  });
}

sendWorkerData();
