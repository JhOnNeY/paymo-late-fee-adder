# README #

### What is this repository for? ###

* A node.js script designed to add monthly recurring late fees to all overdue and unpaid paymo invoices.

##  specifically all overdue invoices with the status of draft, sent, or viewed, 1 day after the invoice due date a recurring* monthly finance charge is added to the invoice. 

*: recurring means the late fee will be added multiple times up to the current date as the script assess 1 month intervals from 1 day after the due date.

#How do I get set up? #

We will be using [Node.js](https://nodejs.org/en/) to run the script and a [crontab](http://www.computerhope.com/unix/ucrontab.htm) to run it effortlessly every night.

### * ### To run a crontab (re-occurring daily/monthly/etc...), follow the instructions in sample-crontab.txt

# For a How-To-Install please head over to [this](https://www.legendwebsolutions.com/blog/auto-add-late-fees-to-paymo-invoices) instructional blog post.