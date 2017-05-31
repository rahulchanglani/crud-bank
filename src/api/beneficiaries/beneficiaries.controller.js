var mongoose = require('mongoose'),
    Beneficiaries = mongoose.model('beneficiaries');

/* POST /api/beneficiaries */
exports.create = function (req, res) {
  var beneficiaries = new Beneficiaries(req.body);
  beneficiaries.save(function (err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(beneficiaries);
    }
  });
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
  var id = req.params.id,
      data = req.body;

  delete data._id; // Just in case...

  Beneficiaries.findByIdAndUpdate(id, data, function (err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send({success: true, msg: 'saved'});
    }
  });
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
          res.send({success: true, msg: 'removed'});
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

