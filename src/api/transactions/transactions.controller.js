var mongoose = require('mongoose'),
    Transactions = mongoose.model('transactions');

/* POST /api/transactions */
exports.create = function (req, res) {
  var transactions = new Transactions(req.body);
  // amount, transactionType, occuranceTime, accountId
  if(req.session.user) {
    transactions.save(function (err) {
    if (err) {
      res.status(400).send({status: 'failed', message: 'Error while transacting..' + err});
    } else {
      res.send(transactions);
    }
  });
}
else {
    res.status(401).send({status: 'failed', message: 'Session has expired !! Login again..'});  
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
      res.send({success: true, msg: 'saved'});
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
          res.send({success: true, msg: 'removed'});
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

