var Q = require('q'),
  webmention = require('webmention-client'),
  microformats = require('microformat-node');

module.exports = function() {
  var session;
 
  function doSomething(what, cb) {
    console.log('doSomething', what);
    if (what.action === 'webmention') {
      webmention(what.source, what.target, function(err, data) {
        console.log('webmention result', err, data);
        cb(err, data);
      });
    } else if (what.action === 'microformats') {
      microformats.parseUrl(what.url, what.options, function(err, data){
        console.log('microformats parser result', err, data);
        cb(err, data);
      });    
    } else {
      cb('cannot do that!');
    }
  }

  return {
    init: function(setSession) {
      session = setSession;  // session object from sockethub
      var q = Q.defer();
      q.resolve();  // fulfill promise, you can also reject()
      return q.promise;
    },
    cleanup: function() {
      var q = Q.defer();
      q.resolve();
      return q.promise;
    },
    post: function (job) {
      var q = Q.defer();
      doSomething(job.object.what, function(err, data) {
        session.send({
          actor: { name: '', address: 'doSomething'},
          verb: 'report', 
          err: (err && typeof(err) === 'object' ? err.toString() : JSON.stringify(err)),
          data: data,
          target: []
        });
      });
      q.resolve();
      return q.promise;
    }
  };
};
