
module.exports = function (mongoose, name) {
  var Schema = mongoose.Schema;
  var beneficiarySchema = mongoose.Schema({
    /* Place your schema definition for model beneficiaries here, e.g: */
    beneficiaryAccIds: [{ type: String, ref: 'accounts' }], // arr of accountIds
    addedBy: { type: Schema.Types.ObjectId, ref: 'users' },    
    createdTime: { type: Date, default: Date.now },
    transactionLimit: Number
  });

  beneficiarySchema.static('findBeneficiaryUserByUserId', function (userId, cb) {
    this.findOne({addedBy: userId}, function (err, ben) {
      console.log('error while findBeneficiaryByUserId user',err);
      
      if (err) {
        return cb(err);
      }
      cb(null, ben);
    });
  });

  mongoose.model(name, beneficiarySchema);
};

