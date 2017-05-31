var shortid = require('shortid');

module.exports = function (mongoose, name) {
  var Schema = mongoose.Schema;
  var accountSchema = ({
    /* Place your schema definition for model transactions here, e.g: */
    _id: {
      type: String,
      'default': shortid.generate
    },
    accountType: String,
    currencyType: String,
    bankName: String,
    branchName: String,
    ifscCode: String,
    city: String,
    state: String,
    balance: { type: Number, default: 0 },
    createdTime: { type: Date, default: Date.now },
    transactions: [{ type: Schema.Types.ObjectId, ref: 'transactions' }],
    beneficiaries: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    beneficiaryAccounts: [{ type: String, ref: 'accounts' }]
  });

  mongoose.model(name, accountSchema);
};

