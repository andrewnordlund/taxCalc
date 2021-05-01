var dbug = !true;
var fcs = {
	"province" : null,
	"workIncome" : null,
	"initAmntInvested" : null,
	"yearlyContrib" : null,
	"annualGrowth" : null,
	"annualDiv": null,
	"annualGrowthOutput" : null,
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
	}
	fcs["annualGrowth"].addEventListener("change", updateGrowthOutput, false);
	fcs["annualDiv"].addEventListener("change", updateGrowthOutput, false);
	fcs["calcBtn"].addEventListener("click", calculate, false);
}

var formatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  // Taken from https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-string
});


function calculate (e) {
	if (dbug) console.log ("Calculating...");
	let yearsLeft = fcs["yearsLeft"].value;
	var taxableIncome = fcs["workIncome"].value;
	let province = fcs["province"].value;
	var initAmntInvested = fcs["initAmntInvested"].value;
	var annualGrowth = fcs["annualGrowth"].value;
	var yearlyContrib = fcs["yearlyContrib"].value;
	var annualDiv = fcs["annualDiv"].value;
	var retirementTaxable = fcs["retirementIncome"].value;
	var rprovince = fcs["rprovince"].value;
	let output ="";
	let unregTax, rrspTax, unregCumTaxm, rrspCumTax = 0;

	output += "<h2>Results</h2>\n";
	output += "<details>\n";
	output += "<summary>Tax Brackets</summary>\n";
	output += getTaxBracketLists(province, rprovince);
	output += "</details>\n";

	output += "<table>\n";
	output += "<caption>Your Working Years</caption>\n";
	output += "<thead>\n";
	output += "<tr>\n";
	output += "<th colspan=\"3\" scope=\"col\">Investment Activity</th>\n";
	output += "<th colspan=\"4\" scope=\"col\">All Unregistered Investments</th>\n";
	output += "<th colspan=\"4\" scope=\"col\">All Investments in RRSP</th>\n";
	output += "</tr>\n";
	output += "<tr>\n";
	output += "<th scope='col'>Year</th>\n";
	output += "<th scope=\"col\">Growth</th>\n";
	output += "<th scope=\"col\">Div</th>\n";
	output += "<th scope=\"col\">Unregistered Balance<div>(Divs not included)</div></th>\n";
	output += "<th scope=\"col\">Taxes Paid<div>(No RRSP Contributions)</div></th>\n";
	output += "<th scope=\"col\">Cumulative Taxes Paid<div>(No RRSP Contributions)</div></th>\n";
	output += "<th scope=\"col\">Disposable Income</th>\n";
	output += "<th scope=\"col\">RRSP Balance<div>(Growth+Dividends)</div></th>\n";
	output += "<th scope=\"col\">Taxes Paid<div>(After RRSP Contributions)</div></th>\n";
	output += "<th scope=\"col\">Cumulative Taxes Paid<div>(With RRSP Contributions)</div></th>\n";
	output += "<th scope=\"col\">Disposable Income</th>\n";
	output += "</tr>\n";
	output += "</thead>\n";
	output += "<tbody>\n";
	output += "\t<td>0</td>\n";		// Year
	output += "\t<td>$0.00</td>\n";		// Growth
	output += "\t<td>$0.00</td>\n";		// Div
	output += "\t<td>" + formatter.format(initAmntInvested) + "</td>\n";	// Balance

	dbug = true;
	unregTax = getTaxesPaid (taxableIncome, province, 0);
	dbug = false;
	rrspTax = getTaxesPaid (taxableIncome - initAmntInvested, province, 0);

	unregTax=unregTax["total"]["taxesPaid"];
	rrspTax=rrspTax["total"]["taxesPaid"];

	unregCumTax = unregTax;
	rrspCumTax = rrspTax;
	
	let totTakeHomeUnreg = taxableIncome - unregTax - initAmntInvested;
	let totTakeHomeRRSP = taxableIncome - initAmntInvested - rrspTax;

	output += "\t<td> " + formatter.format(unregTax) + "</td>\n";	// taxes paid on regular income
	output += "\t<td> " + formatter.format(unregCumTax) + "</td>\n";	// cumulative taxes paid on regular income
	output += "\t<td> " + formatter.format(totTakeHomeUnreg) + "</td>\n";
	output += "\t<td> " + formatter.format(initAmntInvested) + "</td>\n";
	output += "\t<td> " + formatter.format(rrspTax) + "</td>\n";	// taxes paid on (regular income - initAmntInvested)
	output += "\t<td> " + formatter.format(rrspCumTax) + "</td>\n";	// cumulative taxes paid on (regular income - initAmntInvested)
	output += "\t<td> " + formatter.format(totTakeHomeRRSP) + "</td>\n";

	let rrspBal = initAmntInvested;
	let unregBal = initAmntInvested;
	let divTotal = 0;
	for (let i = 1; i <= yearsLeft; i++) {
		
		output += "<tr>\n";
		output += "\t<td>" + i + "</td>\n";

		var growth = (unregBal *  (annualGrowth/100));
		if (dbug) console.log ("Growth: " + growth);

		output += "\t<td>" + formatter.format(growth) + "</td>\n";
		let div = (annualDiv/100) * unregBal;
		divTotal += div;
		output += "\t<td>" + formatter.format(div) + "</td>\n";	

		dbug = true;
		let taxesPaid = getTaxesPaid ((taxableIncome*1 + div*brackets.grossUpRate), province, div);
		dbug = !true;
		taxesPaid = taxesPaid["total"]["taxesPaid"];

		unregCumTax = unregCumTax*1 + taxesPaid*1;
		
		unregBal = unregBal *1 + growth*1 + yearlyContrib*1;
		output += "\t<td>" + formatter.format(unregBal) + "</td>\n";
		output += "\t<td>" + formatter.format(taxesPaid) + "</td>\n";
		output += "\t<td>" + formatter.format(unregCumTax) + "</td>\n";

		let takeHomeUnreg = taxableIncome*1 + div*1 - yearlyContrib - taxesPaid;

		output += "\t<td> " + formatter.format(takeHomeUnreg) + "</td>\n";
		totTakeHomeUnreg += takeHomeUnreg;

		rrspBal = (rrspBal* (1 + (calculateGrowth()/100))*1) + yearlyContrib*1;
		output += "\t<td>" + formatter.format(rrspBal) + "</td>\n";

		rrspTax = getTaxesPaid (taxableIncome - yearlyContrib, province, 0);
		rrspTax = rrspTax["total"]["taxesPaid"];

		rrspCumTax = rrspCumTax *1 + rrspTax*1;
		
		output += "\t<td>" + formatter.format(rrspTax) + "</td>\n";
		output += "\t<td>" + formatter.format(rrspCumTax) + "</td>\n";

		let takeHomeRRSP = taxableIncome*1 - yearlyContrib - rrspTax

		output += "\t<td> " + formatter.format(takeHomeRRSP) + "</td>\n";

		totTakeHomeRRSP += takeHomeRRSP;

		output += "</tr>\n";
	}
	//output += "</tbody>\n";
	output += "<tr>\n";
	output += "</tbody>\n";
	output += "<tfoot>\n";
	output += "\t<td>Totals</td>\n";
	output += "\t<td>" + formatter.format(growth) + "</td>\n";
	output += "\t<td>" + formatter.format(divTotal) + "</td>\n";
	output += "\t<td>" + formatter.format(unregBal) + "</td>\n";
	output += "\t<td>" + formatter.format(unregCumTax) + "</td>\n";
	output += "\t<td>" + formatter.format(unregCumTax) + "</td>\n";
	output += "\t<td>" + formatter.format(totTakeHomeUnreg) + "</td>\n";
	output += "\t<td>" + formatter.format(rrspBal) + "</td>\n";
	output += "\t<td>" + formatter.format(rrspTax) + "</td>\n";
	output += "\t<td>" + formatter.format(rrspCumTax) + "</td>\n";
	output += "\t<td>" + formatter.format(totTakeHomeRRSP) + "</td>\n";
	output += "</tr>\n";
	output += "</tfoot>\n";
	output += "</table>\n";

	let totalInvested = initAmntInvested*1 + (yearlyContrib*yearsLeft);

	output += "<section>\n";
	output += "<h2>In the end</h2>\n";

	output += "<section>\n";
	output += "<h3>Unregistered</h3>\n";
	output += "<p><b>Invested " + formatter.format(initAmntInvested) + " and " + formatter.format(yearlyContrib) + " every year thereafter in an unregistered account</b></p>\n";
	output += "<dl>\n";
	output += "	<dt>Total amount Invested:</dt>\n";
	output += "	<dd>" + formatter.format(totalInvested) + "</dd>\n";
	output += "	<dt>Investment Account Value at retirement:</dt>\n";
	output += "	<dd>" + formatter.format(unregBal) + "</dd>\n";
	output += "	<dt>Growth:</dt>\n";
	output += "	<dd>" + formatter.format(unregBal - totalInvested) + "</dd>\n";
	output += "	<dt>Total taxes paid (Dividends + working Income)</dt>\n";
	output += "	<dd>" + formatter.format(unregCumTax) + "</dd>\n";
	output += "	<dt>Total Take-Home (ie: Money in your pocket)</dt>\n";
	output += "	<dd>" + formatter.format(totTakeHomeUnreg) + "</dd>\n";
	output += "</dl>\n";
	output += "</section>\n";


	output += "<section>\n";
	output += "<h3>RRSP</h3>\n";
	output += "<p><b>Invested " + formatter.format(initAmntInvested) + " and " + formatter.format(yearlyContrib) + " every year thereafter, and take a year off after work before collecting your pension and Withdraw all RRSP at that time</b></p>\n";

	output += "<dl>\n";
	output += "	<dt>Total amount Invested:</dt>\n";
	output += "	<dd>" + formatter.format(totalInvested) + "</dd>\n";
	output += "	<dt>RRSP Value at retirement:</dt>\n";
	output += "	<dd>" + formatter.format(rrspBal) + "</dd>\n";
	output += "	<dt>Growth:</dt>\n";
	output += "	<dd>" + formatter.format(rrspBal - totalInvested) + "</dd>\n";

	output += "	<dt>Total Taxes paid (Working income - RRSP Contributions)</dt>\n";
	output += "	<dd>" + formatter.format(rrspCumTax) + "</dd>\n";

	output += "	<dt>Total Take-Home (ie: Money in your pocket)</dt>\n";
	output += "	<dd>" + formatter.format(totTakeHomeRRSP) + "</dd>\n";
	output += "</dl>\n";
	
	output += "</section>\n";
	output += "</section>\n";


	output += "<section>\n";
	output += "<h2>Scenarios</h2>\n";
	output += "<section>\n";
	output += "<h3>Scenario A: Gap Year</h3>\n";
	output += "<p><b>Take a gap year at retirement and withdraw your whole RRSP in one go as your whole income.</b></p>\n";

	let rrspLumpSumTax = getTaxesPaid(rrspBal, rprovince, 0);
	rrspLumpSumTax = rrspLumpSumTax["total"]["taxesPaid"];

	//output += "	<dt>Taxes paid on a total lunmp-sum RRSP withdrawal</dt>\n";
	//output += "	<dd>" + formatter.format(rrspLumpSumTax) + "</dd>\n";
	//output += "	<dt>Total taxes paid</dt>\n";
	var totTax = rrspCumTax*1 + rrspLumpSumTax*1;
	//output += "	<dd>" + formatter.format(totTax) + "</dd>\n";

	let pensionTax = getTaxesPaid(retirementTaxable, rprovince, 0);

	output += "<p>If you take this kind of gap year, your RRSP will be worth " + formatter.format(rrspBal) + ", but you will pay " + formatter.format(rrspLumpSumTax) + " taxes on it.  Your disposable income will be " + formatter.format(rrspBal - rrspLumpSumTax) + ".</p>\n";
	output += "<p>Over all the years, your total taxes paid will be " + formatter.format(totTax) + ", and your total disposable income will be " + formatter.format(totTakeHomeUnreg + (rrspBal - rrspLumpSumTax)) + ".</p>\n";
	output += "<p>Thereafter, with your pension, you will collect " + formatter.format(retirementTaxable) + " minus " + formatter.format(pensionTax["total"]["taxesPaid"]) + " leaving you with " + formatter.format(pensionTax["total"]["takeHome"]) + ".</p>\n";

	output += "</section>\n";
	output += "<section>\n";
	output += "<h3>Scenario B: RRSP + Pension</h3>\n";
	output += "<p><b>Collect pension right when work income stops, convert RRSP to RRIF and withdraw 4% year.</b></p>\n";

	let rrif = rrspBal * 0.04;
	let totalRetirementIncome = retirementTaxable*1 + rrif*1;
	let retirementTaxes = getTaxesPaid(totalRetirementIncome, rprovince, 0);

	output += "<p>At this point, your pension will be giving you " + formatter.format(retirementTaxable) + " and your RRIF will give you " + formatter.format(rrif) + " for a total annual taxable income of " + formatter.format(totalRetirementIncome) + ".  On this you will pay " + formatter.format(retirementTaxes["total"]["taxesPaid"]) + " in taxes, leavnig you with a take-home amount of " + formatter.format(retirementTaxes["total"]["takeHome"]) + " each year.</p>\n";

	output += "</section>\n";

	output += "<section>\n";
	output += "<h3>Scenario C: No RRSP Whatsoever</h3>\n";
	output += "<p><b>You collect your pension when you retire, and you just add your dividends onto pension income</b></p>\n";

	let div = (annualDiv/100) * unregBal;
	let taxesPaid = getTaxesPaid ((retirementTaxable*1 + div*brackets.grossUpRate), rprovince, div);

	output += "<p>At this point, your pension will be giving you " + formatter.format(retirementTaxable) + " and your Dividends will give you " + formatter.format(div) + " for a total annual taxable income of " + formatter.format(retirementTaxable*1 + div*1) + ".  On this you will pay " + formatter.format(taxesPaid["total"]["taxesPaid"]) + " in taxes, leavnig you with a take-home amount of " + formatter.format(taxesPaid["total"]["takeHome"]) + " each year.</p>\n";

	output += "</section>\n";
	


	output += "</section>\n";

	output += "<section>\n";
	output += "<h2>Conclusion</h2>\n";
	if (totTax > unregCumTax) {
		output += "<p>You pay " + formatter.format(totTax - unregCumTax) + " more tax by using an RRSP instead of keeping it unregistered.</p>\n";
	} else if (totTax < unregCumTax) {
		output += "<p>You pay " + formatter.format(unregCumTax - totTax) + " more tax by keeping it unregistered rather than by putting it in an RRSP.</p>\n";
	} else {
		output += "<p>You pay the same amount of tax, regardless.</p>\n";
	}

	output += "<p>However, legally avoiding taxes is a fine goal, but don't let the tax-tail wag the investment-dog.  In terms of growth";
	if (unregBal > rrspBal) {
		output += " you will have made " + formatter.format(unregBal - rrspBal) + " more by leaving your investments unregistered.  Don't get an RRSP.";
	} else if (rrspBal > unregBal) {
		output += " you will have made " + formatter.format(rrspBal - unregBal) + " more by investing in your RRSP.  Get an RRSP.";
	} else {
		output += ", it was break-even.  Doesn't matter what you do.  Don't forget your TFSA!";
	}
	output += "</p>\n";

	output += "</section>\n";
	
	fcs["resultsHolder"].innerHTML = output;
} // End of calculate



function updateGrowthOutput (e) {
	fcs["annualGrowthOutput"].innerHTML = calculateGrowth() + "%";
	
} // End of updateGrowthOutput
function calculateGrowth () {
	return (parseFloat(fcs["annualGrowth"].value) + parseFloat(fcs["annualDiv"].value));
} // End of calculateGrowth

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
	output += "<tr>\n";
	output += "<th cols=\"3\" scope=\"col\">Investment Activity</th>\n";
	output += "</tr>\n";
	output += "</thead>\n";
	output += "<tbody>\n";

	//if (dbug) console.log ("With values: prov: " + province + ", and work income: $" + taxableIncome + ".");
	
	// The order here should be a nested loop.  For each [TFSA, Unregistered, RRSP], do [working, retirement]
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

} // End of calculateOld

function getTaxesPaid (taxable, prov, divAmnt) {
	var rv = {

		};
	var jur = {"fed" : brackets.fed, "prov" : brackets.prov[prov]};
	var origTaxable = taxable;
	if (dbug) console.log ("Gonna calculate taxes on $" + taxable + ", of which $" + divAmnt + " is from dividends."); 
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

			//if (dbug) console.log ("taxes paid is $" + taxesPaid + " in the top bracket (= " + marginalRate + " x " + tmpTaxable + ").");
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
				//if (dbug) console.log ("looping: taxesPaid is now:" + taxesPaid + " and tmpTaxable is now " + tmpTaxable + ".");
			} else {
				keepGoing = false;
				if (marginalRate == 0) marginalRate = jur[part].rate[i];
				if (marginalPaid == 0) marginalPaid = tmpTaxable * marginalRate;
				if (marginalAmount == 0) {
					marginalAmount = tmpTaxable;
					//if (dbug) console.log("Setting marginalAmount to " + marginalAmount + " and not in top tax bracket.");
				}
				taxesPaid += tmpTaxable * jur[part].rate[i];
				if (dbug) console.log ("final: taxesPaid is now:" + taxesPaid + " and tmpTaxable is now " + tmpTaxable + ".");
				if (bracket == 0) bracket = i;
				range = "$" + (sum - jur[part].amount[i]) + (i < jur[part].amount.length - 2 ? " - $" + sum :  " - $" + jur[part].amount[i]) 
			}
		}
		//if (dbug) {
			//console.log ("Setting range: " + range + ".");
			//console.log("marginalAmount: " + marginalAmount + ".");
		//}
		//Must take into account dividend tax credit
		if (divAmnt > 0) {
			if (dbug) {
				console.log ("Calculating div tax credit for part " + part + ".");
				console.log ("Starting with taxesPaid: $" + taxesPaid + ".");
				console.log ("grossedUpAmnt = " + divAmnt + " x " + brackets.grossUpRate + ".");
			}
			var grossedUpAmnt = divAmnt * brackets.grossUpRate;
			if (dbug) console.log("divTaxCredit = $" + grossedUpAmnt + " x " +  jur[part].divTaxCreditRate + ".");
			var divTaxCredit = grossedUpAmnt * jur[part].divTaxCreditRate;
			if (dbug) console.log("divTaxCredit = $" + divTaxCredit + ".");
			taxesPaid = Math.max(taxesPaid-divTaxCredit, 0);
			if (dbug) console.log ("Ending with taxesPaid: $" + taxesPaid + ".");
		}
		// Now for the personal tax credit.  Take the personal amount, multiply it by the first tax bracket amount to get the credit amount.
		// Then subtract that amount from taxesPaid
		let ptc = jur[part]["basicPersonal"] * jur[part]["rate"][1];
		if (dbug) console.log ("Basic Personal Credit: $"  +ptc + ".");
		taxesPaid = taxesPaid - ptc;
		if (dbug) {
			console.log (part + ": taxable: " + taxable + ", taxesPaid: " + taxesPaid);
			console.log (part + ": takeHome: " + (taxable - taxesPaid) + ".");
		}
		rv[part] = {"taxesPaid" : taxesPaid.toFixed(2), "takeHome" : (taxable - taxesPaid),"avgRate" : (taxesPaid*100/taxable).toFixed(2), "bracket" : bracket, "range" : range, "marginalRate" : (marginalRate * 100).toFixed(2), "marginalPaid" : marginalPaid.toFixed(2), "marginalAmount" : parseFloat(marginalAmount).toFixed(2)};
		if (dbug) console.log("Finished Dealing with " + part + ".\n");
	}

	if (dbug) console.log ("Fed taxes paid: $" + rv["fed"]["taxesPaid"] + ", prov taxes paid: $" + rv["prov"]["taxesPaid"] + ".");
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

function getDivTaxCredit () {
	let rv = 0;

	let grossedUpAmnt = fcs["annualDiv"].value * brackets.grossUpRate;
	let divTaxCredit = grossedUpAmnt * jur[part].divTaxCreditRate;

	return rv;
} // End of getDivTaxCredit

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
