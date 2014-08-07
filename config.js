var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
var user_defined = process.env;

//defaults
var config = module.exports = exports = {
  express_session: {
    secret: user_defined.expression_session_secret || 'EXPRESS_SESSION_SECRET' 
  },
  twitter: {
    consumerKey: user_defined.twitter_consumerKey || 'CONSUMER_KEY',
    consumerSecret: user_defined.twitter_consumerSecret || 'CONSUMER_SECRET',
  },
  redis: {
    host: '127.0.0.1',
    port: 5556,
    pass: ''
  },
  cookie_secret: user_defined.cookie_secret || 'COOKIE_SECRET',
  public_host: user_defined.public_host || 'localhost:3000'
};

//load in Bluemix configuation for redis
if(services && services['redis-2.6']){
  config.redis.host = services['redis-2.6'][0].credentials.host;
  config.redis.port = services['redis-2.6'][0].credentials.port;
  config.redis.pass = services['redis-2.6'][0].credentials.password;
}
