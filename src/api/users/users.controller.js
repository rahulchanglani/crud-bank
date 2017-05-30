var mongoose = require('mongoose'),
    Users = mongoose.model('users');

/* POST /api/users */
exports.create = function (req, res) {
  var users = new Users(req.body);
  users.save(function (err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(users);
    }
  });
};


/* GET /api/users */
exports.read = function (req, res) {
  Users.findById(req.params.id, function (err, users) {
    if (err) {
      res.send(400, err);
    } else if (!users) {
      res.send(404);
    } else {
      res.send(users);
    }
  });
};

/* PUT /api/users/:id */
exports.update = function (req, res) {
  var id = req.params.id,
      data = req.body;

  delete data._id; // Just in case...

  Users.findByIdAndUpdate(id, data, function (err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send({success: true, msg: 'saved'});
    }
  });
};

/* DELETE /api/users/:id */
exports.del = function (req, res) {
  var id = req.params.id;

  Users.findById(id, function (err, users) {
    if (err) {
      res.send(400, err);
    } else if (!users) {
      res.send(404);
    } else {
      users.remove(function (err) {
        if (err) {
          res.send(400, err);
        } else {
          res.send({success: true, msg: 'removed'});
        }
      });
    }
  });
};

/* GET /api/users */
exports.search = function (req, res) {
  Users.find(req.query, function (err, usersList) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(usersList);
    }
  });
};

