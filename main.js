var payloads = require('nano')('http://localhost:5984').db.use('payloads'),
  redis = require('redis');

rclient = redis.createClient();

payloads.list(function(err, body) {
  body.rows.forEach(function(doc) {
    payloads.get(doc.id, {revs_info: false}, function(err, body) {
      console.log(body.domain + ' loaded!');

      rclient.lpop('frontend:' + body.domain, function(err, data) {
        rclient.multi()
          .del('frontend:' + body.domain, body.domain)
          .rpush('frontend:' + body.domain, body.domain)
          .rpush('frontend:' + body.domain, 'http://' + body.node + ':' + body.docker.NetworkSettings.PortMapping.Tcp['80'])
          .exec(function(err, replies) {
            process.exit(0);
          });
      });
    });
  });
});