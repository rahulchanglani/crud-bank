# crud-bank

1

POST localhost:7000/api/accounts
{
	"accountType": "savings",
	"currencyType": "INR",
	"fullName": "ABC XYZ",
	"username": "rvc",
	"password": "rr",
	"contact": "9071095182",
	"bankName": "HDFC",
	"branchName": "Koramangala",
	"ifscCode": "ABCD1234",
	"city": "Bangalore",
	"state": "Karnataka"
}

O/p - SUCCESS

{
  "status": "New User Account creation success",
  "userObj": {
    "__v": 0,
    "accountId": "SkmRH3jbZ",
    "name": "ABC XYZ",
    "username": "rvc",
    "contact": "9071095182",
    "password": "$2a$10$XH6RDh2kxvTqSANLhVyvi.4VJ23g45eaV3eia6LxVOahoik/m80gC",
    "_id": "592e35caacc96731cfd8e9cb"
  }
}


2

POST localhost:7000/api/accounts/login
{
	"username": "rvc",
	"password": "rr"
}

OR

{
    "accountId": "ABCDEFGH",
	"password": "rr"
}

O/p - SUCCESS

{
  "status": "Login success",
  "responseObj": {
    "_id": "592e35caacc96731cfd8e9cb",
    "accountId": "SkmRH3jbZ",
    "name": "ABC XYZ",
    "username": "rvc",
    "contact": "9071095182",
    "password": "$2a$10$XH6RDh2kxvTqSANLhVyvi.4VJ23g45eaV3eia6LxVOahoik/m80gC",
    "__v": 0,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnt9LCJnZXR0ZXJzIjp7fSwid2FzUG9wdWxhdGVkIjpmYWxzZSwiYWN0aXZlUGF0aHMiOnsicGF0aHMiOnsiYWNjZXNzVG9rZW4iOiJpbml0IiwiX192IjoiaW5p"
  }
}

3

GET localhost:7000/api/accounts/BykW1SiWZ

O/p - SUCCESS

{
  "status": "Hello ABC XYZ, the remaining balance in your savings A/c is INR 0 !!"
}


4

POST localhost:7000/api/transactions
{
	"transactionType": "deposit",
	"amount": 50
}

OR

{
	"transactionType": "withdrawal",
	"amount": 50
}

O/p - SUCCESS

{
  "status": "success",
  "message": "Transaction done successfully ! New Balance = 1100 INR"
}


5

POST localhost:7000/api/accounts/transactions-history
{
	"accountId": "SkmRH3jbZ",
	"fromDt": "",
	"toDt": ""
}

O/p - SUCCESS

{
  "status": "success",
  "responseObj": {
    "_id": "SkmRH3jbZ",
    "accountType": "savings",
    "currencyType": "INR",
    "__v": 5,
    "transactions": [
      {
        "_id": "592e35dfacc96731cfd8e9cc",
        "transactionType": "deposit",
        "amount": 500,
        "occuranceTime": "2017-05-31T03:17:51.125Z"
      },
      {
        "_id": "592e35e1acc96731cfd8e9cd",
        "transactionType": "deposit",
        "amount": 500,
        "occuranceTime": "2017-05-31T03:17:53.140Z"
      },
      {
        "_id": "592e35e5acc96731cfd8e9ce",
        "transactionType": "deposit",
        "amount": 1200,
        "occuranceTime": "2017-05-31T03:17:57.363Z"
      }
    ],
    "createdTime": "2017-05-31T03:17:30.837Z",
    "balance": 1100
  }
}

6
POST localhost:7000/api/accounts/add-beneficiary
POST localhost:7000/api/accounts/remove-beneficiary

{
	"accountId": "ryrFJl3bZ",
	"beneficiaryUserId": "592e35caacc96731cfd8e9cb",
	"beneficiaryAccountId": "SkmRH3jbZ"
}

