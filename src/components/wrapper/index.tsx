import React, { useState } from 'react';
import { IntlProvider } from 'react-intl';
import zh_CN from '../../locales/zh_CN';
import en_US from '../../locales/en_US';
import vi from '../../locales/vi';
import uk from '../../locales/uk_UA';
import ru from '../../locales/ru';
import ja from '../../locales/ja';
import ko from '../../locales/ko';
import es from '../../locales/es';
import { useEffect } from 'react';

export const Context = React.createContext(null);
const local = localStorage.getItem('local') || navigator.language;
let lang: any;

const switchLanguage = (local: string) => {
  switch (local) {
    case 'en':
      lang = en_US;
      break;
    case 'zh-CN':
      lang = zh_CN;
      break;
    case 'vi':
      lang = vi;
      break;
    case 'uk':
      lang = uk;
      break;
    case 'ru':
      lang = ru;
      break;
    case 'ja':
      lang = ja;
      break;
    case 'ko':
      lang = ko;
      break;
    case 'es':
      lang = es;
      break;
    default:
      lang = en_US;
      break;
  }
};

const changeLocale = (local: string) => {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, newValue) {
    const setItemEvent = new Event('setItemEvent');
    setItemEvent[key] = newValue;
    window.dispatchEvent(setItemEvent);
    originalSetItem.apply(this, [key, newValue]);
  };

  switchLanguage(local);
  localStorage.setItem('local', local);
};

changeLocale(local);

const Wrapper = (props: any) => {
  const [locale, setLocale] = useState(local);
  const [messages, setMessages] = useState(lang);

  function selectLanguage(e: string) {
    const newLocale = e;
    changeLocale(newLocale);
    setLocale(newLocale);
    setMessages(lang);
  }

  useEffect(() => {
    setMessages(lang);
  }, [lang]);

  return (
    <Context.Provider
      value={{ locale, selectLanguage, setLocale, setMessages }}
    >
      <IntlProvider messages={messages} locale={locale}>
        {props.children}
      </IntlProvider>
    </Context.Provider>
  );
};

export default Wrapper;
