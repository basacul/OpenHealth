# OpenHealth
This web application is developed on top of the Mana web application with the purpose to implement the given functionalities onto a running healthcare setting. The starting date is set for April 25 2020. 

The roadmap for this application is set to grow organically. Thus, at the beginning the application works as a repository with important information to perform my job as a physician in the emergency department. Next, the given functionalitis are refined to allow the exchange of data with co-workers with the main goal to extend it to clients. As a side hustle, an application is written to automate the analysis of ECGs. The chosen design is based on neomorphism with dark and white mode.

To sum up, the mile stones of the roadmap are
1. April 19: Main security issues are resolved
2. April 25: All given information used in the ER are implemented in the web application
3. May 31: Data exchange grid is set
4. June 30: All information to perform my tasks are implemented
5. July 31: A prototype for the analysis of ECGs is running
6. August 31: 


The goal of this web application is to provide a secure distributed data exchange grid for the healthcare sector by minimizing the investment in new IT infrastructure and providing a tool to accelerate the digital adoption in the healthcare system.

This application uses mongodb, express, nodejs, composer sdk and hyperledger fabric tools, though the latter will be revamped and perhaps excluded altogether. The frontend uses html5, css3 with bootstrap v4.3.0, and finally javascript using jQuery for bootstrap, and vanilla javascript - a fancy name for plain javascript without any additional libraries.

The [synopsis](https://github.com/basacul/Mana/blob/master/documents/Secure_Data_Exchange_Using_Distributed_Ledger_Technologies_Version_0_10.pdf) of my bachelor thesis provides an insight on the previous web application Mana.

The first generation prototype will go live on April 25 2020 at [Openhealth](http://www.openhealth.care).

## Structure - Subject to change
The web application uses ejs to display the following sites that are accessible through the navigation bar at the top starting with the logo from left to right:

* __home.ejs__: *LOGO* Site welcomes the user that is rendered only by clicking the Mana logo
* __e-record.ejs__: *E-Record* Site manages the data available through the hyperledger fabric network 
* __tools.ejs__: *Tools* Site manages the settings concerning the hyperledger fabric network
* __account.ejs__: *My Account* Site manage the account settings concerning the web application
* __messages.ejs__: *Messages* Site providing the messaging service
* __personal.ejs__: *Personal* Site manages data stored outside the hyperledger fabric network
* __contact.ejs__: *Help/Contact Us* Site with contact information and form
* __faq.ejs__: *Help/FAQ* Site with faq
* __documentation.ejs__: *Help/Documentation* Site with documentation for the web application
* __login.ejs__: *Checkout* Logs the user out and sends the user back to the login page

This web application currently in version 4.0.0 is under construction and will be live on July 31 2019 at [Openhealth.care](http://openhealth.care/). In MetaMask choose Rinkeby as network where the smart contracts are deployed and tested.

## How to use

Please make sure, that you have Node.js istalled on your system, which you can download at their site [Node.js](https://nodejs.org/en/download/). With Node.js istalled you automatically have access to the command __npm__. This web app runs and is tested on nodejs version 12.2.0.

If __git__ is not available on your system, you can download this repository as a zip file and unpack it on your system. In the *terminal*/*command line* go to ../../../Mana/dapp and run __node app.js__.  Otherwise clone the repository with git.

Make sure you have mongodb installed and set the environment variables. In my setting, I installed mongodb community version on Windows 10 with the default settings and created a bat file that allows me to start the database manually called StartMongo.bat.

```bat
@echo off
cd "C:\mongodb\bin"
start mongod.exe
timeout 3
start mongo.exe
exit
```

In order to use the prototype:

```
Install node.js before running this commands
> git clone https://github.com/basacul/Mana.git
> cd Mana
> npm install
> npm run start
// if you want to develop without having to restart the server all the time
// make sure to have nodemon installed
// > npm install nodemon // if you do not have nodemon installed
// > npm run dev
```