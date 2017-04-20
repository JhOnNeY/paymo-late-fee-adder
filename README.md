# README #

### What is this repository for? ###

* A node.js script designed to add monthly recurring late fees to all overdue and unpaid paymo invoices.
* 1.2.1 
##  specifically all overdue invoices with the status of draft, sent, or viewed, 1 day after the invoice due date a recurring* monthly finance charge is added to the invoice. 

*: recurring means the late fee will be added multiple times up to the current date as the script assess 1 month intervals from 1 day after the due date.

#How do I get set up? #

We will be using [Node.js](https://nodejs.org/en/) to run the script and a [crontab](http://www.computerhope.com/unix/ucrontab.htm) to run it effortlessly every night.

First things first, clone this repository to get a local copy of the script *app.js*. then:

1)  insert your credentials (api key or email and pwd) in the corresponding fields in app.js

2)  open a terminal/cmd prompt and type the  command  ` npm install ` in the directory containing package.json

## We HIGHLY recommend testing the script to make sure it is what you want. It may seem like the greatest quick fix, BUT IT IS NOT A QUICK FIX. This is a tailored solution for a specific use.

3)  You can test the script by following these steps

   1. Add a test client in Paymo and get the client id from the url:
              
      client id : https://app.paymoapp.com/#Paymo.Clients/`541551`/overview

   2. copy this snippet ` %20and%20client_id=541551 ` but replace the number with your test client's ID
 
   3. paste the snippet at the end of [This Line](https://bitbucket.org/JhOnNeY/paymo-late-fee-adder/annotate/48bd20d81ad4deb0e54bdb305868a852ebb4b53c/app.js?at=master&fileviewer=file-view-default#app.js-48) just before the last quotation mark and just after the parentheses: ` )[paste here]", ` .

   4. create a project or two for the test client along with some invoices. Also, add a few line items to charge the test client and change the invoice due dates to be late.
   
   5. You're now ready to test with just that client.

   6. Run the script via Terminal/CmD prompt by typing the command ` node app.js ` in the directory with app.js


### * ### To run a crontab (re-occurring daily/monthly/etc...), follow the instructions in sample-crontab.txt
