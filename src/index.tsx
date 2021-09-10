import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import App from './App';
import zh_CN from './locales/zh_CN';
import en_US from './locales/en_US';

ReactDOM.render(
  <IntlProvider locale={'zh-cn'} messages={zh_CN}>
    <App />
  </IntlProvider>,
  document.querySelector('#root')
);

new Worker('./worker.ts');
