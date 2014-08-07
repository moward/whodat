/*jshint node:true*/

var express = require('express');
var body_parser = require('body-parser');
var cookie_parser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redis = require('redis');
var TwitterAPI = require('node-twitter-api');
var _ = require('underscore');
var config = require('./config');
var play = require('./play');
var path = require('path');

var twitter = new TwitterAPI(_.extend(
  {callback: 'http://' + config.public_host + '/login_return'},
  config.twitter));

var app = express();

//set up Redis
var redis_client = redis.createClient(config.redis.port, config.redis.host);

redis_client.on('error', function (err) {
  console.log('Error ' + err);
});

if (config.redis.pass) {
  redis_client.auth(config.redis.pass);
}

// setup middleware
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, '/views'));
app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());
app.use(cookie_parser(config.cookie_secret));
app.use(session({
  store: new RedisStore({client: redis_client}),
  secret: config.express_session.secret,
  saveUninitialized: true,
  resave: true
}));

app.use(express.static(path.join(__dirname, '/public')));

// render index page
app.get('/', function (req, res){
  if (req.session.requestToken && req.session.access_token){
    res.redirect('/play');
  } else {
    twitter.getRequestToken(function (error, requestToken, requestTokenSecret){
      if (error) {
        console.log('Error getting OAuth request token : ' + error);
      } else {
        req.session.requestToken = requestToken;
        req.session.requestTokenSecret = requestTokenSecret;
      }
      res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + req.session.requestToken);
    });
  }
});

//twitter auth callback
app.get('/login_return', function (req, res){
  var oauth_verifier = req.query.oauth_verifier;

  twitter.getAccessToken(req.session.requestToken, req.session.requestTokenSecret, oauth_verifier,
    function(error, access_token, access_token_secret) {
      if (error) {
        console.log(error);
        res.send('Callback error');
      } else {
        req.session.access_token = access_token;
        req.session.access_token_secret = access_token_secret;
        //set the score
        req.session.correct = req.session.incorrect = 0;
        res.redirect('/play');
      }
    }
  );
});

app.get('/play', play.get);
app.post('/ajax', play.ajax);

//TODO: remove, only for debugging
app.get('/data', function (req, res){
  res.json(process.env);
});

// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
// var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
console.log('App started on port ' + port);
