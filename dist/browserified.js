(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function createElements (execlib) {
  'use strict';
  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    applib = lR.get('allex_applib'),
    BasicElement = applib.getElementType('BasicElement');

  function FirebaseElement (id, options) {
    BasicElement.call(this, id, options);
    firebase.initializeApp(options.config);
    this.firebaseToken = null;
  }
  lib.inherit(FirebaseElement, BasicElement);
  FirebaseElement.prototype.__cleanUp = function () {
    BasicElement.prototype.__cleanUp.call(this);
  };
  FirebaseElement.prototype.onLoaded = function () {
    if (this.get('actual')) {
      Notification.requestPermission().then(
        this.onPermission.bind(this),
        console.error.bind(console, 'Permission request failed:')
      );
    }
    return BasicElement.prototype.onLoaded.call(this);
  };
  FirebaseElement.prototype.staticEnvironmentDescriptor = function (myname) {
    var env = this.getConfigVal('environment');
    return {
      preprocessors: {
        Command: [{
          environment: env,
          entity: {
            name: 'takeFirebaseToken',
            options: {
              sink: '.',
              session: true,
              name: 'takeFirebaseToken'
            }
          }
        }]
      },
      logic: [{
        triggers: [
          'environment.'+env+':state'
        ].join(','),
        references: [
          '.>takeFirebaseToken'
        ].join(','),
        handler: this.onEnvState.bind(this)
      }]
    };
  };

  FirebaseElement.prototype.onPermission = function (perm) {
    if (perm !== 'granted') {
      console.error('Permission request resulted in', perm);
      return;
    }
    firebase.messaging().getToken({
      vapidKey: this.getConfigVal('publicKey')
    }).then(
      this.onToken.bind(this),
      console.error.bind(console, 'Firebase messaging token retrieval failed:')
    );
  };

  FirebaseElement.prototype.onToken = function (token) {
    console.log('got token', token);
    this.set('firebaseToken', token);
  };

  FirebaseElement.prototype.onEnvState = function (func, state) {
    console.log('environment state', state);
    if (state !== 'established') return;
    if (!this.firebaseToken) return;
    func([this.firebaseToken]);
  };

  applib.registerElementType('FirebaseElement', FirebaseElement);
}
module.exports = createElements;
},{}],2:[function(require,module,exports){
(function (execlib) {
    var lR = execlib.execSuite.libRegistry;
    lR.register('allex_firebasewebcomponent', require('./weblib')(execlib));
})(ALLEX);
},{"./weblib":3}],3:[function(require,module,exports){
function createWebLib (execlib) {
  'use strict';
  var mylib = {};
  require('./elements')(execlib);

  return mylib;
}
module.exports = createWebLib;
},{"./elements":1}]},{},[2]);
