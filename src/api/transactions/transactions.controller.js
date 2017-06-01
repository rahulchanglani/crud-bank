var mongoose = require('mongoose'),
  Transactions = mongoose.model('transactions'),
  Beneficiaries = mongoose.model('beneficiaries'),
  Users = mongoose.model('users'),
  Accounts = mongoose.model('accounts');

var Promise = require('bluebird');
Promise.promisifyAll(Accounts);
Promise.promisifyAll(Transactions);
Promise.promisifyAll(Beneficiaries);
Promise.promisifyAll(Users);
var config = require('../../config');
var jwt = require('jsonwebtoken');
var https = require('https');


/* POST /api/transactions Deposit or withdrawal */
exports.create = function (req, res) {
  var transactions = new Transactions(req.body);
  // amount, transactionType, occuranceTime, accountId
  if (req.session.user) {
    transactions.accountId = req.session.user.accountId;

    Accounts
      .findById(req.session.user.accountId, function (err, account) {
        if (err) {
          res.status(400).send({ status: 'failed', message: 'Error while finding a/c...' + err });
        }
        if (req.body.transactionType == 'deposit') {
          account.balance += req.body.amount;
        } else if (req.body.transactionType == 'withdrawal') {
          if (account.balance > 0 && account.balance >= req.body.amount) {
            account.balance -= req.body.amount;
          }
          else {
            res.status(400).send({ status: 'failed', message: 'Error while withdrawal !! Insufficient balance.. ' });
          }
        }
        transactions.transactionMode = 'ATM';
        transactions.save(function (err) {
          if (err) {
            res.status(400).send({ status: 'failed', message: 'Error while transacting..' + err });
          } else {
            account.transactions.push(mongoose.Types.ObjectId(transactions._id));
            account.save(function (err, updatedAccount) {
              if (err) {
                res.status(400).send({ status: 'failed', message: 'Error while saving account..' + err });
              }
              res.status(200).send({ status: 'success', message: 'Transaction done successfully ! New Balance = ' + updatedAccount.balance + ' ' + updatedAccount.currencyType });
            });
          }
        });
      });
  }
  else {
    res.status(401).send({ status: 'failed', message: 'Session has expired !! Login again..' });
  }

};

/* POST /api/transactions/fund-transfer fund transfer */
exports.postFundTransfer = function (req, res) {
  var transactions = new Transactions(req.body);
  // amount, transactionType, accountId
  if (req.session.user) {
    jwt.verify(req.session.user.accessToken, config.secret, function (err, decoded) {
      if (err) {
        console.log('Error jwt verification...', err);
        res.status(400).send({ status: 'failed', message: 'Not eligible to add beneficiaries ! Error during verifying user account by token::' + err });
      }
      console.log(decoded._doc)
      transactions.accountId = req.session.user.accountId;
      Accounts
        .findById(req.session.user.accountId, function (err, account) {
          if (err) {
            res.status(400).send({ status: 'failed', message: 'Error while finding a/c...' + err });
          }
          if (req.body.transactionType == 'transfer') {
            if (account.balance > 0 && account.balance >= req.body.amount) {
              Accounts
                .findById(req.body.accountId, function (err, benAcc) {
                  if (err) {
                    res.status(400).send({ status: 'failed', message: 'Error while finding benn a/c...' + err });
                  }
                  // chk in beneficiaries
                  Beneficiaries.findBeneficiaryUserByUserIdAsync(mongoose.Types.ObjectId(decoded._doc._id))
                    .then(function (ben) {
                      // check if accountId is added as beneficiatiary
                      if (ben.beneficiaryAccIds.indexOf(req.body.accountId) >= 0) {

                        // check account as well as ben acc currencyType. If not same, convert else not... using  fixer.io API
                        var exchRateObj = {};

                        https.get('https://api.fixer.io/latest?base=' + account.currencyType + '&symbols=' + benAcc.currencyType, function (res) {
                          console.log('statusCode:', res.statusCode);
                          console.log('headers:', res.headers);

                          res.on('data', function (d) {
                            console.log('\n\n--->', JSON.parse(d));
                            exchRateObj = JSON.parse(d);
                          });

                          res.on('error', function (e) {
                            console.log(e);
                          });
                        });
                        var originalAmount = {
                          value: req.body.amount
                        };
                        var multi = exchRateObj.rates;
                        for (key in multi) {
                          console.log("foo..." + multi[key]);
                          transactions.amount = multi[key] * req.body.amount; // convert
                        }

                        if (req.body.transactionType == 'transfer') {
                          benAcc.balance += transactions.amount;
                        }
                        account.balance -= originalAmount.value;
                        transactions.transactionMode = 'Fund Transfer';
                        transactions.save(function (err) {
                          if (err) {
                            res.status(400).send({ status: 'failed', message: 'Error while transacting..' + err });
                          } else {
                            account.transactions.push(mongoose.Types.ObjectId(transactions._id));
                            benAcc.transactions.push(mongoose.Types.ObjectId(transactions._id));
                            benAcc.save(function (err, updatedBenAccount) {
                              if (err) {
                                res.status(400).send({ status: 'failed', message: 'Error while saving benn account..' + err });
                              }

                              account.save(function (err, updatedAccount) {
                                if (err) {
                                  res.status(400).send({ status: 'failed', message: 'Error while saving account..' + err });
                                }
                                res.status(200).send({ status: 'success', message: 'Transfer Transaction done successfully ! New Balance = ' + updatedAccount.balance + ' ' + updatedAccount.currencyType });
                              });

                            });
                          }
                        });

                      } else {
                        res.status(400).send({ status: 'failed', message: "Account Id not add as beneficiary" });
                      }
                    })
                    .catch(function (err) {
                      res.status(400).send({ status: 'failed', message: 'Error while finding beneficiatiary a/c...' + err });
                    });
                })
            }
            else {
              res.status(400).send({ status: 'failed', message: 'Error while fund transfer !! Insufficient balance.. ' });
            }
          }
        })
    })
  }
  else {
    res.status(401).send({ status: 'failed', message: 'Session has expired !! Login again..' });
  }
};

/* GET /api/transactions */
exports.read = function (req, res) {
  Transactions.findById(req.params.id, function (err, transactions) {
    if (err) {
      res.send(400, err);
    } else if (!transactions) {
      res.send(404);
    } else {
      res.send(transactions);
    }
  });
};

/* PUT /api/transactions/:id */
exports.update = function (req, res) {
  var id = req.params.id,
    data = req.body;

  delete data._id; // Just in case...

  Transactions.findByIdAndUpdate(id, data, function (err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send({ success: true, msg: 'saved' });
    }
  });
};

/* DELETE /api/transactions/:id */
exports.del = function (req, res) {
  var id = req.params.id;

  Transactions.findById(id, function (err, transactions) {
    if (err) {
      res.send(400, err);
    } else if (!transactions) {
      res.send(404);
    } else {
      transactions.remove(function (err) {
        if (err) {
          res.send(400, err);
        } else {
          res.send({ success: true, msg: 'removed' });
        }
      });
    }
  });
};

/* GET /api/transactions */
exports.search = function (req, res) {
  Transactions.find(req.query, function (err, transactionsList) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(transactionsList);
    }
  });
};

