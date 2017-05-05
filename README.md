# Paymo Late Fee Adder #

## What is this repository? ##

* A node.js script designed to add monthly recurring late fees to all overdue and unpaid paymo invoices.

## How do I get set up? ##

###For a Detailed How-To-Install please head over to [this](https://www.legendwebsolutions.com/blog/auto-add-late-fees-to-paymo-invoices) instructional blog post.

###Fast Track Install
We will be using [Node.js](https://nodejs.org/en/) to run the script and a [crontab](http://www.computerhope.com/unix/ucrontab.htm) to run it effortlessly every night.

or those of you who know their way around git, node, and paymo:

First off, If you want to run this script without testing, then all you need is these first five steps.

However, I HIGHLY RECOMMEND TESTING THIS SCRIPT BEFORE LIVE EXECUTION AS IT MAY NOT BE WHAT YOU’RE LOOKING FOR!

1. Open a terminal (mac) or cmd prompt (windows) and navigate to your desired project folder
2. Type the command `git clone https://github.com/JhOnNeY/paymo-late-fee-adder.git`, press enter
3. Type the command `npm install`, press enter
4. Edit app.js; insert your Paymo API key or username and password in the [corresponding fields](https://github.com/JhOnNeY/paymo-late-fee-adder/blob/master/app.js#L46-L47)
5. Run the script by entering the command `node app.js`

To run a crontab (re-occurring daily/monthly/etc...), follow the instructions in sample-crontab.txt


#### NOTE: specifically all overdue invoices with the status of draft, sent, or viewed, 1 day after the invoice due date a recurring* monthly finance charge is added to the invoice. 

*: recurring means the late fee will be added multiple times up to the current date as the script assess 1 month intervals from 1 day after the due date.
