/**
 * Augment browser console to send logs to server/cloudwatch
 * logErrorToService - has the post call
 * config - to define error boundary limits
 * 
 */

import logErrorToService from './logErrorToService';
import debounce from 'lodash/debounce';

const config = {
    logLevel: 'error',
    errorInterval: 2 //in seconds
}

const errors = [];
const info = [];
const warn = [];

const appendLogs = (method, theArgs) => {
  switch (method) {
    case 'error':
      errors.push({
        code: 0,
        type: 'ERROR',
        description: JSON.stringify(theArgs)
      });
      shouldSendToServer(errors);
      break;
    case 'warn':
      if (config.logLevel === 'info' || config.logLevel === 'warn') {
        warn.push({
          code: 1,
          type: 'WARN',
          description: JSON.stringify(theArgs)
        });
        shouldSendToServer(warn);
      }
      break;
    case 'log':
    default:
      if (config.logLevel === 'info') {
        info.push({
          code: 2,
          type: 'INFO',
          description: JSON.stringify(theArgs)
        });
        shouldSendToServer(info);
      }
      break;
  }
};

const intercept = method => {
  const original = console[method];
  console[method] = function(...theArgs) {
    try {
      appendLogs(method, theArgs);
    } catch (e) {
      //do nothing
    }

    if (original.apply) {
      // Do this for normal browsers
      original.apply(console, theArgs);
    } else {
      // Do this for IE
      var message = Array.prototype.slice.apply(theArgs).join(' ');
      original(message);
    }
  };
};

const shouldSendToServer = arr => {
  const __func = () => {
    const cloned = arr.slice(0);
    arr = [];
    logErrorToService(cloned);
  };

  const _d = debounce(__func, 1000, { maxWait: config.errorInterval * 1000 });
  _d();
};

const browserConsole = () => {
  const console = window.console;
  if (!console) {
    return;
  } else {
    ['log', 'warn', 'error'].forEach(method => {
      intercept(method);
    });
  }
};

export default browserConsole;
