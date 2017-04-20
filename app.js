const winston = require('winston');
const fs = require('fs');
const env = 'development'; // current environment (silent or development)
const logDir = 'log';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// use system time for logging
const tsFormat = () => (new Date()).toLocaleTimeString();

// set up logger with winston logging
const logger = new (winston.Logger)({
    transports: [
    // colorize helps see the messages in a more legible fashion
      new winston.transports.Console({
        timestamp: tsFormat,
        colorize: true,
        level: 'debug'
      }),
      new (require('winston-daily-rotate-file'))({
        filename: logDir + '/-results.log',
        timestamp: tsFormat,
        datePattern: 'yyyy-MM-dd',
        prepend: true,
        level: env === 'development' ? 'debug' : 'info'
      })
    ],
    exitOnError: false
  });

//everything after this point is loggable.

logger.debug("Initializing Paymo Late Fee Adder");
logger.debug("Loading modules.....");
// Modules
const request = require('request');
logger.debug("Module 'reqest' loaded");
var moment = require('moment');
logger.debug("Module 'moment' loaded");

// Runtime variables
logger.debug("Setting runtime variables");
const email = 'email@or-use-api.key'; // email or api key here 
const password = 'X'; // any string will work if using api key

const paymoApi = "https://app.paymoapp.com/api";


// MOMENT
logger.debug("creating a moment in time...");
var now = moment();
logger.debug("done.");

var mfcItemDescription = "Monthly Finance Charge"; // This is what the script will use to verify previous charges.
var mfcChargeAmount = 0.03; // ammount to charge per monthly late fee.
logger.debug("Runtime variables set");


// Start API functions
logger.debug("loading api requests...")
logger.debug("loading: GET all invoices");
var getApiAllOverdueInvoices = function(callback) {
    logger.debug("__API__doing API request: GET all invoices");
    request.get(
        paymoApi + "/invoices?where=due_date%20<%20\"" + now.format("YYYY-MM-DD") + "\"%20and%20status%20in%20(\"draft\",\"sent\",\"viewed\")",
        {
            auth: {
                user: email,
                pass: password
            },
            headers: {
                'Accept': 'application/json'
            }
        },
        function (error, response, body) {
            if (!error) {
                var parsedBody = JSON.parse(body);
                logger.debug("SUCCESS: got all " + parsedBody.invoices.length + " invoices!");
                callback(parsedBody.invoices);
            } else {
                logger.debug(error);
            }
        }
    );
}
logger.debug("done.");

logger.debug("loading: GET single invoice");
var getApiSingleInvoices = function(invoice_id, callback) {
    logger.debug("__API__doing API request: GET single invoices");

    request.get(
        paymoApi + "/invoices/" + invoice_id + "?include=invoiceitems,invoicepayments",
        {
            auth: {
                user: email,
                pass: password
            },
            headers: {
                'Accept': 'application/json'
            }
        },
        function (error, response, body) {
            if (!error) {
                var parsedBody = JSON.parse(body);
                callback(parsedBody.invoices);
            } else {
                logger.debug(error);
            }
        }
    );
}
logger.debug("done.");

logger.debug("loading: Post single invoice item");
var postApiSingleInvoiceItem = function(invoice_id, data, callback) {

    request.post(
        {
            url: 'https://app.paymoapp.com/api/invoices' + "/" + invoice_id,
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            },
            auth: {
                user: email,
                pass: password
            }
        },
        function (error, response, body) {
            if (!error) {
                logger.debug('UPDATED: invoice ID: ' + JSON.parse(body).invoices[0].id);
            } else {
                logger.debug(error);
            }
        }
    );

}
// END API Requests



// Start Program functions
logger.debug("function loading: getAllOverdueInvoices");
var getAllOverdueInvoices = function() {
    logger.debug("function running: getAllOverdueInvoices");
    getApiAllOverdueInvoices(function(response) {
        response.forEach(function (invoice, index) {
            var id = invoice.id;

            logger.debug(invoice);
            logger.debug("____INVOICE____");
            logger.debug("invoice ID : " + invoice.id);
            logger.debug("Client ID : " + invoice.client_id);
            logger.debug("invoice Number : " + invoice.number);
            logger.debug("Due Date : " + invoice.due_date);
            logger.debug("Total Amount : " + invoice.total);
            logger.debug("---Date Check---");

            checkInvoiceDueDate(invoice);
        });
    });
}
logger.debug("done.");


var checkInvoiceDueDate = function(invoice) {
    var mDueDate = moment(invoice.due_date);

    if (now.isAfter(mDueDate)) {
        // Today is after the duedate
        checkInvoiceForPreviousFees(invoice.id);
    } else {
        logger.debug("ERROR: Due date is before Today");
    }
}


var checkInvoiceForPreviousFees = function(invoice_id) {

    getApiSingleInvoices(invoice_id, function(response) {
        logger.debug("SUCCESS: \t" + "invoice_id : "+ response[0].id);
        response.forEach(function (invoice) {
            var newInvoiceItems = [];
            var lastSeq = 0;
            var mDueDate = moment(invoice.due_date);
            var mFeeDate = moment(mDueDate).add(1, "days"); // Fee date is 1 day after invoice's due date. From there it is monthly.
            if (!(typeof invoice.invoicepayments !== 'undefined' && invoice.invoicepayments.length > 0)) {
                logger.debug("invoice payments: NO INVOICE PAYMENTS FOUND");
            } else {
                logger.debug("going over invoice payments for invoice: " + invoice.id);
                logger.debug("invoice payments: ", invoice.invoicepayments);
                logger.debug("adding up invoice payments");
                var payments = 0;
                var paymentCount = 0;
                invoice.invoicepayments.forEach(function(payment, index) {
                    paymentCount++;
                    logger.debug(paymentCount + "# payment, adding " + payment.amount + " to payment total");
                    payments += payment.amount;
                });
                logger.debug("total payments: ", payments);
                var hasPayments = true;
            }
            logger.debug("going over invoice items for invoice: " +  invoice.id);
            logger.debug(invoice.invoiceitems);
            var mfcCount = 0;
            logger.debug("counting monthly finance charges items");
            invoice.invoiceitems.forEach(function(item, index) {
                // Add previous items as new items.
                var newItem = { 
                     "item": item.item,
                     "description": item.description,
                     "price_unit": item.price_unit,
                     "quantity": item.quantity,
                     "seq": (lastSeq = index + 1)
                }
                newInvoiceItems[index] = newItem;
                logger.debug("------------------");
                logger.debug("item : ", (index + 1));
                logger.debug("item name : ", item.item);
                logger.debug("item description : ", item.description);

                if (item.description.toUpperCase().includes(mfcItemDescription.toUpperCase())) {
                    // item is a monthly finance charge
                    mfcCount++;
                }
            });
            logger.debug("------------------");
            logger.debug("counted " + mfcCount + " MFC items!");
            logger.debug("Number of Monthly Finance Charges :", mfcCount);


            logger.debug("calculating number of needed Charge items...");
            var mCheckFeeDate = moment(mFeeDate);
            var numberOfNeededCharges = 0;
            var lastday = false;
            if (moment(mFeeDate).add(1, "days").month() == moment(mFeeDate).add(1, "months").month()) {
                // if the day after the fee date is into the next month, note it for adding months later
                lastday = true;
            }

            while (mCheckFeeDate.isBefore(now)) {
                logger.debug("counted ", mCheckFeeDate.format("MMMM, DD [of] YYYY"));
                numberOfNeededCharges++;
                logger.debug("check one month from ", mCheckFeeDate.format("MMMM, DD [of] YYYY"));
                mCheckFeeDate.add(1, "months");
                if (lastday) {
                    mCheckFeeDate.endOf('month');
                }
            }
            logger.debug("finished count...");
            logger.debug("number of total charges needed : " + numberOfNeededCharges);
            logger.debug("current invoice items :", newInvoiceItems);


            var forcheck = false;
            var readyToUpdate = false;
            var newTotal = invoice.total;
            if (hasPayments) {
                newTotal -= payments;
            }
            for (var i = mfcCount; i < numberOfNeededCharges; i++) {

                var mFeeDateManipulate = moment(mFeeDate);

                if (!(mfcCount < numberOfNeededCharges)) {
                    logger.debug("invoice " + invoice.id + " already has charge " + i);
                } else {
                    // need another charge.
                    mFeeDateManipulate.add(i, 'months');
                    if (lastday) {
                        mFeeDateManipulate.endOf('month');
                    }
                    var feeAmount = newTotal * mfcChargeAmount; // Edit charge percentage amount near the top
                    newTotal += feeAmount;
                    // generate item Name based on mfcCount
                    var newMfcItemName = mFeeDateManipulate.format("MM/DD/YYYY")
                    var newItem = { 
                         "item": newMfcItemName,
                         "description": mfcItemDescription,
                         "price_unit": feeAmount.toFixed(2),
                         "quantity": 1,
                         "seq": (lastSeq += 1)
                    }
                    logger.debug("adding invoice item : ", newItem);
                    newInvoiceItems.push(newItem);

                    mfcCount++;
                    if (mfcCount == numberOfNeededCharges) {
                        readyToUpdate = true;
                    }
                }
                forcheck = true;
            }

            if (!forcheck) {
                logger.debug("invoice :" + invoice.id + " has " + mfcCount + "/" + numberOfNeededCharges + " charges.");
            }

            if (readyToUpdate) {
                logger.debug("updating invoice with POST data");
                addFee(invoice.id, newInvoiceItems);
            } else {
                logger.debug("did not update invoice ", invoice.id);
            }
            
        });

    });
}

var addFee = function(invoice_id, newInvoiceItems) {
    
    data = {
        items: newInvoiceItems
    }
    
    postApiSingleInvoiceItem(invoice_id, data, function(response) {
        
    });
}
//end program functions


logger.debug("Initialization Finished\n______________\n Run Program...");
getAllOverdueInvoices();
logger.debug("The Machines Are Taking Over.");