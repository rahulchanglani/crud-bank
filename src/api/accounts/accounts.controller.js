var mongoose = require('mongoose'),
  Accounts = mongoose.model('accounts'),
  Users = mongoose.model('users'),
  Transactions = mongoose.model('transactions'),
  Beneficiaries = mongoose.model('beneficiaries'),
  bcrypt = require('bcryptjs'),
  jwt = require('jsonwebtoken');

var Promise = require('bluebird');
Promise.promisifyAll(Users);
Promise.promisifyAll(Accounts);
Promise.promisifyAll(Transactions);
Promise.promisifyAll(Beneficiaries);
var config = require('../../config');

/* POST /api/accounts */
exports.create = function (req, res) {
  console.log('create ac');

  var accounts = new Accounts(req.body);
  // accountType, currencyType, bankName, branchName, ifscCode, city, state

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
                  return res.status(200).send({ status: 'New User Account creation success', userObj: newUser });
                })
                .catch(function (error) {
                  return res.status(400).send({ status: 'New User Account creation failed', message: "New User creation failed due to " + error });
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

/* GET /api/accounts get balance */
exports.read = function (req, res) {
  console.log('---', req.session);
  Accounts.findById(req.params.id, function (err, accounts) {
    if (err) {
      res.status(400).send({ status: 'failed', message: 'Error in findng ac ...' + err });
    } else if (!accounts) {
      res.status(404).send({ status: 'failed', message: 'Account not found!' });
    } else {
      if (req.session.user) {
        jwt.verify(req.session.user.accessToken, config.secret, function (err, decoded) {
          if (err) {
            console.log('Error jwt verification...', err);
            res.status(400).send({ status: 'failed', message: 'Error during verifying user by token::' + err });
          }
          console.log('DECODED====', decoded);
          res.status(200).send({ status: 'Hello ' + decoded._doc.name + ', the remaining balance in your ' + accounts.accountType + ' A/c is ' + accounts.currencyType + ' ' + accounts.balance + ' !!' });
        });
        // Users
        //   .findUsrByToken(req.session.user.accessToken, function (err, userObj) {
        //     if (err) {
        //       res.status(400).send({ status: 'failed', message: 'Error during fing user by token::' + err });
        //     }
        //     res.status(200).send({ status: userObj.name + ', the remaining balance in your ' + accounts.accountType + ' A/c is ' + accounts.currencyType + ' ' + accounts.balance + ' !!' });
        //   })
      }
      else {
        res.status(401).send({ status: 'failed', message: 'Session has expired !! Login again..' });
      }
    }
  });
};

/* POST /api/accounts/transactions-history */
exports.postTransactionsHistory = function (req, res) {
  console.log('---', req.session);
  console.log('req body->>>', req.body);
  var qryObj = {
    id: req.body.accountId,
    fromDt: req.body.fromDt,
    toDt: req.body.toDt
  }
  Accounts.findOne({ '_id': qryObj.id })
    .populate({
      path: 'transactions',
      match: { occuranceTime: { $gte: new Date(qryObj.fromDt), $lte: new Date(qryObj.toDt) } },
      select: '_id amount transactionType occuranceTime'
    }).execAsync()
    .then(function (accounts) {

      if (req.session.user) {
        jwt.verify(req.session.user.accessToken, config.secret, function (err, decoded) {
          if (err) {
            console.log('Error jwt verification...', err);
            res.status(400).send({ status: 'failed', message: 'Error during verifying user account by token::' + err });
          }
          // console.log('DECODED====', decoded);
          console.log('POPULATED AC...', accounts);
          res.status(200).send({ status: 'success', responseObj: accounts });
        });
      }
      else {
        res.status(401).send({ status: 'failed', message: 'Session has expired !! Login again..' });
      }
    })
    .catch(function (err) {
      res.status(400).send({ status: 'failed', message: 'No Matching Account Found !! ' + err });
    });
};

/* POST /api/accounts/add-beneficiary */
exports.postAddBeneficiary = function (req, res) {
  console.log('---', req.session);
  console.log('req body->>>', req.body);
  var qryObj = {
    id: req.body.accountId
  }
  var dataToUpdate = {
    $addToSet: { beneficiaries: mongoose.Types.ObjectId(req.body.beneficiaryUserId), beneficiaryAccounts: req.body.beneficiaryAccountId }
  }
  if (req.session.user) {
    jwt.verify(req.session.user.accessToken, config.secret, function (err, decoded) {
      if (err) {
        console.log('Error jwt verification...', err);
        res.status(400).send({ status: 'failed', message: 'Error during verifying user account by token::' + err });
      }
      console.log('DECODED====', decoded);

      // check if userId and accountId are present in db
      Users
        .findByIdAsync(mongoose.Types.ObjectId(req.body.beneficiaryUserId))
        .then(function (usr) {
          if (usr) {
            Accounts.findByIdAsync(req.body.beneficiaryAccountId)
              .then(function (acc) {
                if (acc) {

                  var newBeneficiary = new Beneficiaries(req.body);
                  beneficiaries.save(function (err) {
                    if (err) {
                      res.send(400, err);
                    } else {
                      Accounts.findOneAndUpdate({ '_id': qryObj.id }, dataToUpdate, function (errFaU, updatedAC) {
                        if (errFau) {
                          res.status(400).send({ status: 'failed', message: 'Error in adding adding beneficiary !! ' + errFaU });
                        }
                        if (!updatedAC) {
                          res.status(400).send({ status: 'failed', message: 'No Matching Account Found to update !! ' });
                        }
                        else {
                          res.status(200).send({ status: 'success', message: 'beneficiary added successfully !', responseObj: updatedAC });
                        }
                      });
                    }
                  });

                }
              })
              .catch(function (errAcc) {
                console.log('no benef acc found', errAcc)
              })
          }
        })
        .catch(function (errUsr) {
          console.log('no benef user found', errUsr)
        })

    });
  }
  else {
    res.status(401).send({ status: 'failed', message: 'Session has expired !! Login again..' });
  }
};

/* PUT /api/accounts/remove-beneficiary */
exports.postRemoveBeneficiary = function (req, res) {
  console.log('---', req.session);
  console.log('req body->>>', req.body);
  var qryObj = {
    id: req.body.accountId
  }
  var dataToUpdate = {
    $pull: { beneficiaries: mongoose.Types.ObjectId(req.body.beneficiaryUserId), beneficiaryAccounts: req.body.beneficiaryAccountId }
  }
  if (req.session.user) {
    jwt.verify(req.session.user.accessToken, config.secret, function (err, decoded) {
      if (err) {
        console.log('Error jwt verification...', err);
        res.status(400).send({ status: 'failed', message: 'Error during verifying user account by token::' + err });
      }
      console.log('DECODED====', decoded);

      // check if userId and accountId are present in db
      Accounts.findOneAndUpdate({ '_id': qryObj.id }, dataToUpdate, function (err, updatedAC) {
        if (err) {
          res.status(400).send({ status: 'failed', message: 'Error in removing adding beneficiary !! ' + err });
        }
        if (!updatedAC) {
          res.status(400).send({ status: 'failed', message: 'No Matching Account Found !! ' + err });
        }
        else {
          res.status(200).send({ status: 'success', message: 'beneficiary added successfully !', responseObj: updatedAC });
        }
      });
    });
  }
  else {
    res.status(401).send({ status: 'failed', message: 'Session has expired !! Login again..' });
  }
};

/* PUT /api/accounts/:id */
exports.update = function (req, res) {
  var id = req.params.id,
    data = req.body;

  // delete data._id; // Just in case...

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

