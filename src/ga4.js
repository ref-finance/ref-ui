import ReactGA from "react-ga4";


const GA_ID = window.location.hostname.startsWith('app.')
  ? 'G-GL2STL8WB4'
  : 'G-MJNEGMP1NR';

console.log('GA_ID_4', GA_ID);

ReactGA.initialize(GA_ID);