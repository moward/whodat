var _ = require('underscore');
var moment = require('moment');
var TwitterAPI = require('node-twitter-api');
var config = require('./config');

var twitter = new TwitterAPI(config.twitter);

var get_tweet = function (req, res, callback){
  //pick a random tweet
  var tweet = req.session.tweets.pop();

  // TODO: could make randomization and selection more efficient

  var tweeter = _.findWhere(req.session.accts,{handle: tweet.handle});

  var choices = _.first(_.shuffle(_.without(req.session.accts,tweeter)), 4);

  choices.push(tweeter);

  choices = _.shuffle(choices);

  callback(tweet, choices);
};

var get_new_tweets = function (req, res, callback){
  if (req.session.access_token){
    twitter.getTimeline('home_timeline',
      {count: 100},
      req.session.access_token,
      req.session.access_token_secret,
      function(error, data) {
        if (error) {
          console.log(error);
          res.send('Timeline reading error');
        } else {
          var accts = req.session.accts = [];

          req.session.tweets = _.shuffle(data.map(function (full_tweet){
            //create list of users on the feed
            var user = {handle: full_tweet.user.screen_name, name: full_tweet.user.name};
            //prevent duplicates
            if (!_.findWhere(accts, {handle: user.handle})){
              accts.push(user);
            }
            //boil down tweets
            return {
              text: full_tweet.text,
              handle: user.handle,
              date: full_tweet.created_at
            };
          }));

          callback();
        }
      }
    );
  } else {
    res.redirect('/');
  }
};

exports.get = function (req, res){
  if (req.session.access_token){

    var loadPage = function (tweet, choices){

      req.session.tweet = tweet;
      req.session.choices = choices;

      res.render('play', {
        tweet: tweet,
        choices: choices,
        formatDate: function (date) {
          return moment(date).fromNow();
        },
        correct: req.session.correct,
        incorrect: req.session.incorrect
      });
    };

    //use has already gotten tweet and refreshed page
    if (req.session.tweet){
      loadPage(req.session.tweet, req.session.choices);
    } else {
      if (req.session.tweets && req.session.tweets.length > 0){
        get_tweet(req, res, loadPage);
      } else {
        get_new_tweets(req, res, function(){
          get_tweet(req, res, loadPage);
        });
      }
    }
  } else {
    res.redirect('/');
  }
};

exports.ajax = function (req, res){
  if (req.session.tweet){
    var answeredHandle = req.body.handle;

    //must be done BEFORE res.json for the session to be updated
    var reset = function (){
      delete req.session.tweet;
      delete req.session.choices;
    };

    if (answeredHandle === req.session.tweet.handle){
      req.session.correct ++;
      reset();
      res.json({response: 'correct', new_score: req.session.correct});
    } else {
      req.session.incorrect ++;
      var correct_handle = req.session.tweet.handle;
      reset();
      res.json({response: 'incorrect', correct_handle: correct_handle, new_score: req.session.incorrect});
    }
  } else {
    res.json({response: 'error'});
  }
};
