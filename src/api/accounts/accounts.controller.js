var mongoose = require('mongoose'),
  Accounts = mongoose.model('accounts'),
  Users = mongoose.model('users'),
  bcrypt = require('bcryptjs'),
  jwt = require('jsonwebtoken');

var Promise = require('bluebird');
Promise.promisifyAll(Users);
Promise.promisifyAll(Accounts);
var config = require('../../config');

/* POST /api/accounts */
exports.create = function (req, res) {
  console.log('create ac');

  var accounts = new Accounts(req.body); // accountType, currencyType

  console.log('-----new account obj', accounts);
  accounts
    .save(function (err, account) {
      console.log('saving ac', err, account)
      if (err) {
        res.status(400).send({ status: "Failure in creating New Account duue to " + err });
      }
      else {
        console.log('New account created ===', account);
        // var newUser = new Users(req.body);
        var newUser = {
          accountId: account._id,
          name: req.body.fullName,
          username: req.body.username,
          contact: req.body.contact,
          password: req.body.password
        }

        Users
          .findUsrByUsernameAsync(newUser.username)
          .then(function (user) {
            if (user) {
              res.status(400).send({ status: 'failed', message: 'User registered with the username. Please type different one!' });
            } else {
              var salt = bcrypt.genSaltSync(10);
              var hash = bcrypt.hashSync(newUser.password, salt);
              newUser.password = hash;
              return Users.createUsrAsync(newUser)
                .then(function (newUser) {
                  return res.status(200).send({ status: 'New User creation success', userObj: newUser });
                })
                .catch(function (error) {
                  return res.status(400).send({ status: 'New User creation failed', message: "New User creation failed due to " + error });
                })
            }
          })
          .catch(function (err) {
            res.status(400).send({ status: 'failed', message: 'Finding user by username failed due to ' + err });
          })

      }

    })
};

/* POST /api/accounts/login */
exports.postLogin = function (req, res) {

  var userObj = {
    username: req.body.username,
    accountId: req.body.accountId
  }
  Users
    .findUsrByUsernameOrAccountId(userObj, function (err, user) {
      console.log('API ======>>>>', err);
      if (err) {
        res.status(400).send({ status: 'failed', message: 'Error while finding user...' + err });
      }
      console.log('calling findUsrByUsernameOrAccountIdAsync:::', user)
      console.log('\n\n\n\n', req.body.password + '=====' + user.password)
      console.log('authentic...', bcrypt.compareSync(req.body.password, user.password));
      if (!user) {
        res.status(404).send({ status: 'failed', message: 'User not found!' });
      }
      // var authenticated = bcrypt.compareSync(req.body.password, user.password);
      var authenticated = true;
      if (authenticated == true) {
        var token = jwt.sign(user, config.secret, {
          expiresIn: 600 // expires in 10 min
        });
        //         jwt.sign({
        //   data: 'foobar'
        // }, 'secret', { expiresIn: 60 * 60 });
        console.log('access token session----->', token);
        user.accessToken = token;
        user.save(function (err) {
          if (err) {
            res.status(400).send({ status: 'failed', message: 'User obj saving failure!' + err });
          }
          req.session.user = user;
          res.status(200).send({ status: 'Login success', responseObj: user });
        });
      }
      else {
        res.status(400).send({ status: 'failed', message: 'Incorrect password!' });
      }
    });

};


/* GET /api/accounts */
exports.read = function (req, res) {
  console.log('---', req.session);
  Accounts.findById(req.params.id, function (err, accounts) {
    if (err) {
      res.status(400).send({ status: 'failed', message: 'Error in findng ac ...' + err });
    } else if (!accounts) {
      res.status(404).send({ status: 'failed', message: 'Account not found!' });
    } else {
      if (req.session.user) {
        Users
          .findUsrByToken(req.session.user.accessToken, function (err, userObj) {
            if (err) {
              res.status(400).send({ status: 'failed', message: 'Error during fing user by token::' + err });
            }
            res.status(200).send({ status: userObj.name + ', the remaining balance in your ' + accounts.accountType + ' A/c is ' + accounts.currencyType + ' ' + accounts.balance.toFixed(2) + ' !!' });
          })
      }
      else {
        res.status(401).send({ status: 'failed', message: 'Session has expired !! Login again..' });
      }
    }
  });
};

/* PUT /api/accounts/:id */
exports.update = function (req, res) {
  var id = req.params.id,
    data = req.body;

  delete data._id; // Just in case...

  Accounts.findByIdAndUpdate(id, data, function (err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send({ success: true, msg: 'saved' });
    }
  });
};

/* DELETE /api/accounts/:id */
exports.del = function (req, res) {
  var id = req.params.id;

  Accounts.findById(id, function (err, accounts) {
    if (err) {
      res.send(400, err);
    } else if (!accounts) {
      res.send(404);
    } else {
      accounts.remove(function (err) {
        if (err) {
          res.send(400, err);
        } else {
          res.send({ success: true, msg: 'removed' });
        }
      });
    }
  });
};

/* GET /api/accounts */
exports.search = function (req, res) {
  Accounts.find(req.query, function (err, accountsList) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(accountsList);
    }
  });
};

