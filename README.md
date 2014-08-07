Whodat?
=======

An interactive game with *your* Twitter home feed!

[See it in production](http://whodat.mybluemix.net)

How to play
-----------
 1. Go to (http://whodat.mybluemix.net)
 2. Authorize the application using your twitter account. You will be redirected to the game screen.
 3. Select which person / account posted the shown tweet.
 4. Repeat step 3 ad infinitum.

Basic Requirements
------------------
 - Twitter OAuth API with Read access
 - Node.js ~0.10
 - Express 4.*
 - Redis 2.6 (For `express-session` storage, but can easily be disabled)
 
How to use the code
----------
```shell
# install dependencies
npm install
# run eslint
npm test
# run application
npm start
```
 
This application was originally designed to run on IBM's [Bluemix](http://bluemix.net) platform with a Node.js runtime and a redis session store.
