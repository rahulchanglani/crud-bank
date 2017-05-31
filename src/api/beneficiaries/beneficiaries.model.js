
module.exports = function (mongoose, name) {
  var Schema = mongoose.Schema;
  var beneficiarySchema = mongoose.Schema({
    /* Place your schema definition for model beneficiaries here, e.g: */
    userId: { type: Schema.Types.ObjectId },    
    createdTime: { type: Date, default: Date.now }
  });

  mongoose.model(name, beneficiarySchema);
};

