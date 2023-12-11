const GA_ID = window.location.hostname.startsWith('app.')
  ? 'G-GL2STL8WB4'
  : 'G-MJNEGMP1NR';

// console.log('GA_ID', GA_ID);
window.dataLayer = window.dataLayer || [];
window.gtag = (...args) => window.dataLayer.push(args);
window.gtag('js', new Date());
window.gtag('config', GA_ID);
const script = window.document.createElement('script');
script.async = true;
script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
const elem = window.document.getElementsByTagName('script')[0];
elem.parentNode.insertBefore(script, elem);
