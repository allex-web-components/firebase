(function (execlib) {
    var lR = execlib.execSuite.libRegistry;
    lR.register('allex_firebasewebcomponent', require('./weblib')(execlib));
})(ALLEX);