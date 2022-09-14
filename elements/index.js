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