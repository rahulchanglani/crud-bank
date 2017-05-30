
module.exports = function (mongoose, name) {
  var Schema = mongoose.Schema;
  var userSchema = mongoose.Schema({
    /* Place your schema definition for model users here, e.g: */
    name: String,
    username: String,
    password: String,
    contact: String,
    accountId: {type: String, ref: 'accounts'},
    accessToken: String,
    refreshToken: String    
  });

  userSchema.static('findUsrByUsername', function (username, cb) {
    this.findOne({username: username}, function (err, user) {
      console.log('error while findUsrByUsername user',err);
      
      if (err || !user) {
        return cb(err);
      }
      cb(null, user);
    });
  });

  userSchema.static('findUsrByToken', function (accessToken, cb) {
    this.findOne({accessToken: accessToken}, function (err, user) {
      console.log('error while findUsrByToken user',err);
      
      if (err || !user) {
        return cb(err);
      }
      cb(null, user);
    });
  });

  userSchema.static('findUsrByUsernameOrAccountId', function (userObj, cb) {
    console.log('=============',userObj)
    this.findOne({$or:[{username: userObj.username}, {accountId: userObj.accountId}]}, function (err, user) {
      console.log('error while findUsrByUsernameOrAccountId user',err);
      console.log('db me se....',user);

      if (err || !user) {
        return cb(err);
      }
      cb(null, user);
    });
  });


  userSchema.static('createUsr', function (user, cb) {
    this.create(user, function (err, user) {
      console.log('error while creating user',err);
      if (err || !user) {
        return cb(err);
      }
      cb(null, user);
    });
  });

  mongoose.model(name, userSchema);
};

