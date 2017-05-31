
module.exports = function (mongoose, name) {
  var Schema = mongoose.Schema;
  var transactionSchema = ({
    /* Place your schema definition for model transactions here, e.g: */
    amount: Number,
    transactionType: String,
    transactionMode: String,
    occuranceTime: {type: Date, default: Date.now},
    accountId: String
  });

  mongoose.model(name, transactionSchema);
};

