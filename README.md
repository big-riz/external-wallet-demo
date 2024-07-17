## Handcash Wallet Creation Demo 
This projects demonstrates how to create wallets on behalf of a user.  The original implementation we will call the App Created Wallet flow.
This creates a Handcash guest account on behalf of a user within the Handcash Domain. The new approach will be called the External Wallet flow. 
Where a wallet will be created outside the Handcash domain, this wallet will not be able to sign into Handcash market/ Handcash wallet.

* This repo is using a custom implementation of Handcash sdk and external wallet creation will not work with standard npm download

### Command Line Interface 

Creates an app created wallet by adding +random-number to the email address so you can use the same one over and over
```
node cmd/index.js createACW <email>
```

Create external wallet 

```
node cmd/index.js createExternal <email>
```