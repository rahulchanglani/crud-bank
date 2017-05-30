var mongoose = require('mongoose'),
    Transactions = mongoose.model('transactions');

/* POST /api/transactions */
exports.create = function (req, res) {
  var transactions = new Transactions(req.body);
  transactions.save(function (err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(transactions);
    }
  });
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

