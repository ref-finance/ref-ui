import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Wrapper from './components/wrapper';

ReactDOM.render(
  <Wrapper>
    <App />
  </Wrapper>,
  document.querySelector('#root')
);

console.log('worker.ts');

new Worker('./worker.ts');
