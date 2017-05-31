var mongoose = require('mongoose'),
  Beneficiaries = mongoose.model('beneficiaries'),
  Users = mongoose.model('users'),
  Accounts = mongoose.model('accounts');

var Promise = require('bluebird');
Promise.promisifyAll(Accounts);
Promise.promisifyAll(Users);
Promise.promisifyAll(Beneficiaries);
var config = require('../../config');
var jwt = require('jsonwebtoken');



/* POST /api/beneficiaries */
exports.create = function (req, res) {
  // transactionLimit

  if (req.session.user) {
    jwt.verify(req.session.user.accessToken, config.secret, function (err, decoded) {
      if (err) {
        console.log('Error jwt verification...', err);
        res.status(400).send({ status: 'failed', message: 'Not eligible to add beneficiaries ! Error during verifying user account by token::' + err });
      }
      console.log('\n\nDECODED====', decoded);

      Accounts.findByIdAsync(req.body.accountId)
        .then(function (account) {
          console.log('====', account);
          if (account) {
            Beneficiaries.findBeneficiaryUserByUserIdAsync(mongoose.Types.ObjectId(decoded._doc._id))
              .then(function (ben) {
                if (ben) {
                  // update existing ben doc 
                  if (ben.beneficiaryAccIds.indexOf(req.body.accountId) < 0) {
                    ben.beneficiaryAccIds.push(req.body.accountId);

                    ben.save(function (err, updatedBen) {
                      if (err) {
                        res.status(400).send({ status: 'failed', message: 'Error while adding beneficiary..' + err });
                      }
                      res.status(200).send({ status: 'success', message: 'beneficiary added successfully !' });
                    });
                  }
                  else {
                    res.status(400).send({ status: 'failed', message: 'Beneficiary account already added!!!' + err });
                  }

                } else {
                  // create new 
                  var beneficiaries = new Beneficiaries(req.body);

                  beneficiaries.addedBy = mongoose.Types.ObjectId(decoded._doc._id);
                  if (beneficiaries.beneficiaryAccIds.indexOf(req.body.accountId) < 0) {
                    beneficiaries.beneficiaryAccIds.push(req.body.accountId);

                    beneficiaries.save(function (err, updatedBen) {
                      if (err) {
                        res.status(400).send({ status: 'failed', message: 'Error while adding new beneficiary..' + err });
                      }
                      res.status(200).send({ status: 'success', message: 'New beneficiary added successfully !' });
                    });
                  }
                  else {
                    res.status(400).send({ status: 'failed', message: 'Beneficiary account already added!!!' + err });
                  }

                }
              })
              .catch(function (err) {
                res.status(400).send({ status: 'failed', message: 'Error while adding new beneficiary..' + err });
              })
          }
          else {
            res.status(400).send({
              status: 'failed', message: 'Account Id can\'t be added as beneficiary it\'s not present in Db' + err
            });
          }
        })
        .catch(function (err) {
          res.status(400).send({
            status: 'failed', message: 'Error while finding acc' + err
          });
        })

    })
  }
  else {
    res.status(401).send({ status: 'failed', message: 'Session has expired !! Login again..' });
  }
};

/* GET /api/beneficiaries */
exports.read = function (req, res) {
  Beneficiaries.findById(req.params.id, function (err, beneficiaries) {
    if (err) {
      res.send(400, err);
    } else if (!beneficiaries) {
      res.send(404);
    } else {
      res.send(beneficiaries);
    }
  });
};

/* PUT /api/beneficiaries/:id */
exports.update = function (req, res) {
  var id = mongoose.Types.ObjectId(req.params.id),
    dataToUpdate = {
      $pull: { beneficiaryAccIds: req.body.accountId }
    }

  if (req.session.user) {
    jwt.verify(req.session.user.accessToken, config.secret, function (err, decoded) {
      if (err) {
        console.log('Error jwt verification...', err);
        res.status(400).send({ status: 'failed', message: 'Not eligible to add beneficiaries ! Error during verifying user account by token::' + err });
      }

      Accounts.findByIdAsync(req.body.accountId)
        .then(function (account) {
          if (account) {
            Beneficiaries.findByIdAndUpdate(id, dataToUpdate, function (err) {
              if (err) {
                res.status(400).send({ status: 'success', message: 'Error while removing beneficiary...' + err });
              } else {
                res.send({ status: 'success', message: 'beneficiary account id successfully removed !' });
              }
            });
          }
          else {
            res.status(400).send({
              status: 'failed', message: 'Account Id can\'t be removed from beneficiary it\'s not present in Db' + err
            });
          }
        })
    })
  }
  else {
    res.status(401).send({ status: 'failed', message: 'Session has expired !! Login again..' });
  }
};

/* DELETE /api/beneficiaries/:id */
exports.del = function (req, res) {
  var id = req.params.id;

  Beneficiaries.findById(id, function (err, beneficiaries) {
    if (err) {
      res.send(400, err);
    } else if (!beneficiaries) {
      res.send(404);
    } else {
      beneficiaries.remove(function (err) {
        if (err) {
          res.send(400, err);
        } else {
          res.send({ success: true, msg: 'removed' });
        }
      });
    }
  });
};

/* GET /api/beneficiaries */
exports.search = function (req, res) {
  Beneficiaries.find(req.query, function (err, beneficiariesList) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(beneficiariesList);
    }
  });
};

