import { onLCP, onCLS, onINP, onTTFB } from 'web-vitals';

const SAMPLE_RATE = 1.0;
const ENDPOINT = '/api/admin/vitals';
import constants from './constants';

function shouldSample() {
  return Math.random() < SAMPLE_RATE;
}

const queue = [];
let flushTimer = null;

function enqueue(metric) {
  queue.push({
    name: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    rating: metric.rating,
    route: window.location.pathname.replace(/\/\d+/g, '/:id'),
  });
  if (!flushTimer) {
    flushTimer = setTimeout(flush, 3000);
  }
}

function flush() {
  flushTimer = null;
  if (!queue.length) return;
  const batch = queue.splice(0);
  const url = constants.SERVER_URL + ENDPOINT;
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, JSON.stringify(batch));
  } else {
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(batch),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    });
  }
}

export function initVitals() {
  if (!shouldSample()) return;
  onLCP(enqueue);
  onCLS(enqueue);
  onINP(enqueue);
  onTTFB(enqueue);
}
