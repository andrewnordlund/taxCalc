var dbug = true;
var fcs = {
	"province" : null,
	"workIncome" : null,
	"initAmntInvested" : null,
	"yearlyContrib" : null,
	"totalAnnualReturn" : null,
	"annualGrowth" : null,
	"annualDiv": null,
	"rprovince" : null,
	"retirementIncome" : null,
	"yearsLeft" : null,
	"calcBtn" : null,
	"resultsHolder" : null
}
var accountTypes = {"TFSA" : {"Working" : {}, "Retirement" : {}}, "Unregistered" : {"Working" : {}, "Retirement" : {}} , "RRSP" : {"Working" : {}, "Retirement" : {}}};
//console.log ("Got: " + accountTypes.Unregistered.Working + ".");
var times = ["Working", "Retirement"];

/*
		
 */

var brackets = {
	grossUpRate : 1.38,
	fed : {
		basicPersonal :	11474,
		/*amount : [0, 45282, 90563, 140388, 200000],*/
		amount : [0, 45282, 45281, 49825, 59612, 200000],
		rate : [0, .15, .205, .26, .29, .33],
		divTaxCreditRate : .150198
		},
	prov : {
		on : {
			basicPersonal : 9863,
			amount : [0, 41536, 41539, 66925, 70000, 220000],
			rate : [0, 0.0505, .0915, .1116, .1216, .1316],
			divTaxCreditRate : .10
		     },
		ns : {
			basicPersonal : 8481,
			amount : [0, 29590, 29590, 33820, 57000, 150000],
			rate : [0, 0.0879, .1495, .1667, .175, .21],
			divTaxCreditRate : .0885
		     },
	}
}
function init () {
	if (dbug) console.log("initing...");
	for (id in fcs) {
		fcs[id] = document.getElementById(id);
		//if (dbug) console.log ("Got " + id + ", and it's value is " + fcs[id].value + ".");
	}
	fcs["calcBtn"].addEventListener("click", calculate, false);
}

function calculate (e) {
	if (dbug) console.log ("Calculating...");
	let yearsLeft = fcs["yearsLeft"].value;
	var taxableIncome = fcs["workIncome"].value;
	let province = fcs["province"].value;
	var initAmntInvested = fcs["initAmntInvested"].value;
	var annualGrowth = fcs["annualGrowth"].value;
	var totalAnnualReturn = fcs["totalAnnualReturn"].value;
	var annualDiv = fcs["annualDiv"].value;
	var retirementTaxable = fcs["retirementIncome"].value;
	var rprovince = fcs["rprovince"].value;
	let output ="";

	output += "<h2>Results</h2>\n";
	output += "<details><summary>";
	output += "Tax Brackets</summary>\n";
	output += getTaxBracketLists(province, rprovince);
	output += "</details>\n";

	output += "<table>\n";
	output += "<thead>\n";
	output += "<tr>\n";
	output += "<th scope='col'>Year</th>\n";
	output += "<th scope=\"col\">Growth</th>\n";
	output += "<th scope=\"col\">Div</th>\n";
	output += "<th scope=\"col\">Balance</th>\n";
	output += "<th scope=\"col\">Taxes Paid</th>\n";
	output += "<th scope=\"col\">Balance (RRSP)</th>\n";
	output += "<th scope=\"col\">Taxes Paid (RRSP)</th>\n";
	output += "</tr>\n";
	output += "<td>0</td>\n";
	output += "<td>$ 0.00</td>\n";
	output += "<td>$ 0.00</td>\n";
	output += "<td>$ " + initAmntInvested + "</td>\n";

	
	//let taxesPaid = getTaxesPaid (taxableIncome, province, false);


	output += "<td>$ 0.00</td>\n";	// taxes paid on regular income
	output += "<td>$ " + initAmntInvested + "</td>\n";
	output += "<td>$ 0.00</td>\n";	// taxes paid on (regular income - initAmntInvested)

	let rrspBal = initAmntInvested;
	let unregBal = initAmntInvested;
	for (let i = 1; i <= yearsLeft; i++) {
		
		output += "<tr>\n";
		output += "\t<td>" + i + "</td>\n";

		var growth = (unregBal *  (annualGrowth/100));
		if (dbug) console.log ("Growth: " + growth);

		output += "\t<td>$ " + growth.toFixed(2) + "</td>\n";
		output += "\t<td>$ " + "</td>\n";	// Get div
		
		unregBal = unregBal *1 + growth*1;
		output += "\t<td>$ " + unregBal + "</td>\n";
		output += "\t<td>$ " + "</td>\n";

		rrspBal = rrspBal* (1 + (totalAnnualReturn/100))*1;
		output += "\t<td>$ " + rrspBal + "</td>\n";
		output += "\t<td>$ " + "</td>\n";
		output += "</tr>\n";
	}
	//output += "</tbody>\n";
	output += "</table>\n";
	
	fcs["resultsHolder"].innerHTML = output;
} // End of calculate

function calculateOld (e) {
	if (dbug) console.log ("Calculating...");
	var taxableIncome = fcs["workIncome"].value;
	var province = fcs["province"].value;
	var retirementTaxable = fcs["retirementIncome"].value;
	var rprovince = fcs["rprovince"].value;
	var roi = fcs["roi"].value;
	var investmentType = fcs["investmentType"].value;
	var amntInvested = fcs["amntInvested"].value;
	var yearsInRetirement = 1;
	var amntSaved = 0;
	var output ="";

	output += "<h2>Results</h2>\n";
	output += "<details><summary>";
	output += "Tax Brackets</summary>\n";
	output += getTaxBracketLists(province, rprovince);
	output += "</details>\n";

	output += "<table>\n";
	output += "<thead>\n";
	output += "<tr>\n";
	output += "<td></td>\n";
	output += "<th scope=\"col\">Income</th>\n";
	output += "<th scope=\"col\">Taxes Paid</th>\n";
	output += "<th scope=\"col\">Take Home</th>\n";
	output += "<th scope=\"col\">Average Tax Rate</th>\n";
	output += "<th scope=\"col\">Marginal Tax Rate</th>\n";
	output += "<th scope=\"col\">Tax Bracket</th>\n";
	output += "<th scope=\"col\">Marginal Amount</th>\n";
	output += "<th scope=\"col\">Taxes paid in this bracket</th>\n";
	output += "<th scope=\"col\">Ahead by</th>\n";
	output += "</tr>\n";
	output += "</thead>\n";
	output += "<tbody>\n";

	//if (dbug) console.log ("With values: prov: " + province + ", and work income: $" + taxableIncome + ".");
	
	// The order here should be a nested loop.  For each [TFSA, Unregistered, RRSP], do [working, retirement]
	//for (var i = 0; i < accountTypes.length; i++) {
	for (var i in accountTypes) {
		if (dbug) console.log ("calculate::" + i + ".");
		output += "<tr>\n";
		output += "<th scope=\"col\" id=\"tfsa\" colspan=\"10\">" + i + "</th>\n";
		output += "</tr>\n";

		for (var j = 0; j < times.length; j++) {
			if (dbug) console.log ("calculate::" + times[j] + ".");
			var divTaxCredit = false;
			output += "<tr>\n";
			output += "<th scope=\"col\" id=\"tfsa\" colspan=\"10\">" + times[j] + "</th>\n";
			output += "</tr>\n";
			var inc, prov;
			prov = fcs[(times[j] == "Retirement" ? "r" : "") + "province"].value;
			inc = fcs[(times[j] == "Retirement" ? "retirement" : "work") + "Income"].value;
			if (i == "RRSP") {
				if (times[j] == "Working") {
					inc = inc - amntInvested;
					// Here I should figure out the difference between your taxes and what they would have been in an unregistered account.
					// But where to add that in a note?
				} else {
					inc = parseFloat(inc) + (parseFloat(roi)/yearsInRetirement);
				}
			} else if (i == "Unregistered") {
				if (investmentType == "div") {
					inc = parseFloat(inc) + parseFloat(roi * brackets.grossUpRate);
					divTaxCredit = true;
				} else if (investmentType == "cg" && times[j] == "Retirement") {
					inc = parseFloat(inc) + parseFloat(roi/2);
				} else if (investmentType == "int" && times[j] == "Retirement") {
					inc = parseFloat(inc) + parseFloat(roi);
				}

			}
			var taxesPaid = getTaxesPaid(inc, prov, divTaxCredit);
			// Gotta calculate how much ahead you are.  Shucks.  How am I gonna do this....
			/*
			if (times[j] == "Retirement") {
				// For TFSA:  You're ahead the ROI. period.
				if (accountTypes[i] == "TFSA") {
					taxesPaid["total"]["ahead"]= fcs["roi"].value;
				} else if (accountTypes[i] == "RRSP") {
					// For RRSP: you're ahead the tax return + roi - taxes paid
					// Take net pay retirement/rrsp - net pay retirement/unregistered + wokring[ahead]
				} else if (accountTypes[i] == "Unregistered") {
					// For Unregistered, you're ahead the roi - taxes paid
					//var ahead = fcs["roi"].value
					
				}
				//taxesPaid["total"]["ahead"] = (times[j].match(/retirement/i) ? fcs["roi"].value : " - ");
			}
			*/
			accountTypes[i][times[j]] = taxesPaid;
			output += "<tbody>\n";
			for (var k in taxesPaid) {
				//console.log("Dealing with " + k + " in taxesPaid.");
				output += "<tr>\n";
				output += "<td>" + k + "</td>\n";
				output += "<td>$" + inc + "</td>\n";
				output += "<td>$" + accountTypes[i][times[j]][k]["taxesPaid"];
				if (amntInvested > 0) {
					if (i == "RRSP") {
						if (times[j] == "Working") {
							output += "<div>Tax Return $";
							let diff = accountTypes["Unregistered"]["Working"][k]["taxesPaid"] - accountTypes["RRSP"]["Working"][k]["taxesPaid"];
							output += diff.toFixed(2) + "</div>";
							accountTypes[i]["Working"][k]["ahead"] = diff.toFixed(2);
						} else if (times[j] == "Retirement") {
							let diff = accountTypes["RRSP"]["Retirement"][k]["takeHome"] - accountTypes["Unregistered"]["Retirement"][k]["takeHome"];
							//(parseFloat(fcs["retirementIncome"].value) + (parseFloat(roi)/yearsInRetirement) - accountTypes["Unregistered"][times[j]][k]["taxesPaid"]);
							accountTypes[i]["Retirement"][k]["ahead"] = diff.toFixed(2);
						}
					} else if (i == "TFSA") {
						if (times[j] == "Working") accountTypes[i]["Working"][k]["ahead"] = " - ";
						if (times[j] == "Retirement") accountTypes[i]["Retirement"][k]["ahead"] = roi;
					} else if (i == "Unregistered") {
						if (times[j] == "Working") { 
							accountTypes[i]["Working"][k]["ahead"] = " - ";
						} else if (times[j] == "Retirement") {
							//accountTypes[i]["Retirement"][k]["ahead"] = roi;  // This isn't accurate.
							// You'd be ahead the (income + roi - taxes) - (income - taxes)
							var tempTaxesPaid = getTaxesPaid(fcs["retirementIncome"].value, prov, divTaxCredit);
							accountTypes[i]["Retirement"][k]["ahead"] = (accountTypes[i]["Retirement"][k]["takeHome"] - parseFloat(tempTaxesPaid[k]["takeHome"])).toFixed(2);
						}
					}
				} else {
					if (times[j] == "Retirement") accountTypes[i]["Retirement"][k]["ahead"] = " - ";
					if (times[j] == "Working") accountTypes[i]["Working"][k]["ahead"] = " - ";
				}
				output += "</td>\n";
				output += "<td>$" + accountTypes[i][times[j]][k]["takeHome"].toFixed(2) /*parseFloat(inc - accountTypes[i][times[j]][k]["taxesPaid"]).toFixed(2)*/ + "</td>\n";
				output += "<td>" + accountTypes[i][times[j]][k]["avgRate"] + "%</td>\n";
				output += "<td>" + accountTypes[i][times[j]][k]["marginalRate"] + "%</td>\n";
				output += "<td>" + accountTypes[i][times[j]][k]["bracket"] + "<div>" + taxesPaid[k]["range"] + "</td>\n";
				output += "<td>$" + accountTypes[i][times[j]][k]["marginalAmount"] + "</td>\n";
				output += "<td> $" + accountTypes[i][times[j]][k]["marginalPaid"] + "</td>\n";
				output += "<td>" + (accountTypes[i][times[j]][k]["ahead"] == " - " ? " - " : "$" + accountTypes[i][times[j]][k]["ahead"]) + "</td>\n";
				output += "</tr>\n";
			}
			output += "</tbody>\n";
		}
	}
	output += "</tbody>\n";
	output += "</table>\n";
	
	fcs["resultsHolder"].innerHTML = output;

} // End of calculate

function getTaxesPaid (taxable, prov, doDivTaxCredit) {
	var rv = {

		};
	var jur = {"fed" : brackets.fed, "prov" : brackets.prov[prov]};
	var origTaxable = taxable;
	for (var part in jur) {
		if (dbug) console.log("Dealing with part " + part + ".");
		var keepGoing = true;
		var tmpTaxable = taxable;
		var sum = 0;
		var taxesPaid = 0;
		var takeHome = 0;
		var range = "";
		var marginalPaid = 0;
		var marginalRate = 0;
		var tbSum = 0;
		var bracket = 0;
		var marginalAmount = 0;
		if (taxable > jur[part].amount[jur[part].amount.length-1]) {
			//if (dbug) console.log("In the top tax bracket because " + taxable + " > " + jur[part].amount[jur[part].amount.length-1] +  ".");
			sum = jur[part].amount[jur[part].amount.length-1];
			tmpTaxable -= sum;

			marginalRate = jur[part].rate[jur[part].rate.length-1];
			taxesPaid = tmpTaxable * marginalRate;
			marginalAmount = tmpTaxable;
			marginalPaid = taxesPaid;

			if (dbug) console.log ("taxes paid is $" + taxesPaid + " in the top bracket (= " + marginalRate + " x " + tmpTaxable + ").");
			range = "$" + jur[part].amount[jur[part].amount.length-1] + "+";

			tmpTaxable = sum;
			bracket = jur[part].amount.length-1;
		} else {
			//if (dbug) console.log("Not in the top tax bracket because " + taxable + " < " + jur[part].amount[jur[part].amount.length-1] +  ".");
		}
		// go through tax brackets, checking how much to pay in each.
		for (var i = 1; i < jur[part].amount.length && keepGoing; i++) {
			if (sum < jur[part].amount[jur[part].amount.length-1]) sum += jur[part].amount[i];	// this will never happen in top tax bracket
			//if (dbug) console.log("Sum is now: " + sum + ".");
			if (tmpTaxable > jur[part].amount[i]) {
				taxesPaid += jur[part].amount[i] * jur[part].rate[i];
				tmpTaxable -= jur[part].amount[i];
				if (dbug) console.log ("looping: taxesPaid is now:" + taxesPaid + " and tmpTaxable is now " + tmpTaxable + ".");
			} else {
				keepGoing = false;
				if (marginalRate == 0) marginalRate = jur[part].rate[i];
				if (marginalPaid == 0) marginalPaid = tmpTaxable * marginalRate;
				if (marginalAmount == 0) {
					marginalAmount = tmpTaxable;
					if (dbug) console.log("Setting marginalAmount to " + marginalAmount + " and not in top tax bracket.");
				}
				taxesPaid += tmpTaxable * jur[part].rate[i];
				if (dbug) console.log ("final: taxesPaid is now:" + taxesPaid + " and tmpTaxable is now " + tmpTaxable + ".");
				if (bracket == 0) bracket = i;
				range = "$" + (sum - jur[part].amount[i]) + (i < jur[part].amount.length - 2 ? " - $" + sum :  " - $" + jur[part].amount[i]) 
			}
		}
		if (dbug) {
			//console.log ("Setting range: " + range + ".");
			//console.log("marginalAmount: " + marginalAmount + ".");
		}
		//Must take into account divident tax credit
		if (doDivTaxCredit && fcs["investmentType"].value == "div") {
			if (dbug) {
				console.log ("Calculating div tax credit for part " + part + ".");
				console.log ("Starting with taxesPaid: $" + taxesPaid + ".");
				console.log ("grossedUpAmnt = " + fcs["roi"].value + " x " + brackets.grossUpRate + ".");
			}
			var grossedUpAmnt = fcs["roi"].value * brackets.grossUpRate;
			if (dbug) console.log("divTaxCredit = $" + grossedUpAmnt + " x " +  jur[part].divTaxCreditRate + ".");
			var divTaxCredit = grossedUpAmnt * jur[part].divTaxCreditRate;
			if (dbug) console.log("divTaxCredit = $" + divTaxCredit + ".");
			taxesPaid = Math.max(taxesPaid-divTaxCredit, 0);
			if (dbug) console.log ("Ending with taxesPaid: $" + taxesPaid + ".");
		}
		if (dbug) {
			console.log (part + ": taxable: " + taxable + ", taxesPaid: " + taxesPaid);
			console.log (part + ": takeHome: " + (taxable - taxesPaid) + ".");
		}
		// Now for the personal tax credit.  Take the personal amount, multiply it by the first tax bracket amount to get the credit amount.
		// Then subtract that amount from taxesPaid
		let ptc = jur[part]["basicPersonal"] * jur[part]["rate"][1];
		taxesPaid -= ptc;
		rv[part] = {"taxesPaid" : taxesPaid.toFixed(2), "takeHome" : (taxable - taxesPaid),"avgRate" : (taxesPaid*100/taxable).toFixed(2), "bracket" : bracket, "range" : range, "marginalRate" : (marginalRate * 100).toFixed(2), "marginalPaid" : marginalPaid.toFixed(2), "marginalAmount" : parseFloat(marginalAmount).toFixed(2)};
		if (dbug) console.log("Finished Dealing with " + part + ".\n");
	}

	var totalTaxesPaid = parseFloat(rv["fed"]["taxesPaid"]) + parseFloat(rv["prov"]["taxesPaid"]);
	var totMarginalRate = parseFloat(rv["fed"]["marginalRate"]) + parseFloat(rv["prov"]["marginalRate"]);
	var totMarginalPaid = parseFloat(rv["fed"]["marginalPaid"]) + parseFloat(rv["prov"]["marginalPaid"]);
	if (dbug) {
		console.log ("Total: taxable: " + taxable + ", taxesPaid: " + totalTaxesPaid);
		console.log ("Total: takeHome: " + (taxable - totalTaxesPaid) + ".");
	}
	rv["total"] = {"taxesPaid" : totalTaxesPaid.toFixed(2), "takeHome" : (taxable - totalTaxesPaid), "avgRate" : (totalTaxesPaid*100/taxable).toFixed(2), "bracket" : "", "range" : "", "marginalRate" : totMarginalRate, "marginalPaid" : totMarginalPaid.toFixed(2), "marginalAmount" : parseFloat(rv["fed"]["marginalAmount"]) + parseFloat(rv["prov"]["marginalAmount"])};
	return rv;
} //  End of getTaxesPaid

function getTaxBracketLists(prov) {
	var output = "<div id=\"taxBracketLists\">\n";
	var rprov = (arguments.length > 1 ? arguments[1] : prov);
	var parts = [{part : "Federal",	bracket :  brackets.fed},
	    	{part : "Provincial", bracket : brackets.prov[prov]}];
	if (rprov != prov) parts.push({part : "Provincial (Retirement)", bracket: brackets.prov[rprov]});

	output += "<h3>Tax Brackets</h3>\n";
	for (var i = 0; i < parts.length; i++) {
		output += "<h4>" + parts[i].part + "</h4>\n";
		output += "<ol>\n";
		var rt = 0;
		for (var j = 1; j < parts[i].bracket.amount.length; j++) {
			output += "\t<li>" + (parts[i].bracket.rate[j]*100).toFixed(2) + "%: $" + rt + (j == parts[i].bracket.amount.length -1 ? "+" : " - $" + (rt + parts[i].bracket.amount[j])) + "(max tax: $" + (j < parts[i].bracket.amount.length -1 ? (parts[i].bracket.rate[j]*parts[i].bracket.amount[j]).toFixed(2) : "infinity") + ")</li>\n";
			rt += parts[i].bracket.amount[j];
		}
		output += "</ol>\n";
	}
	output += "</div>\n";
	return output;
} // End of getTaxBracketLists
