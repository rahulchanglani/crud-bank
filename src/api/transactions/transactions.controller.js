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

