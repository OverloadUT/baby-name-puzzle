fs = require('fs')
bncommon = require('./common')

var args = process.argv.slice(2);

if (args.length < 2) {
	console.log("Need at least two arguments")
	console.log("USAGE: node babyname [name] [number_of_letters] [seed_letters]")
	console.log("  [name] is the name that you want people to solve for")
	console.log("  [number_of_letters] is the number of letters you want to eliminate (in addition to the seed letters)")
	console.log("  [seed_letters] is optional, and can be any number of letters that you want to ALSO exclude")
	process.exit(1);
}

var NAME = args[0];
var NUMBEROFLETTERS = Number(args[1]);
var SEED = args[2] || "";

var output_data = {};

fs.readFile('./names.txt', 'utf8', function(err,names) {
	if (err) {
		console.log("ERROR READING names.txt")
		console.log("File must be utf8 with one name on each line")
		return console.log(err);
	}

	console.log("Total names in list: %d", names.split("\n").length)

	namesarray = names.match(new RegExp('^.{'+ NAME.length +'}$','gm'));
	names = namesarray.join("\n")

	console.log("Total exact-length names in list: %d", namesarray.length)

	namesarray = names.match(new RegExp("^[^"+SEED+"\\r\\n]+$", "igm"));
	names = namesarray.join("\n")
	console.log("Total names in list after seed purge: %d", namesarray.length)

	var excludeletters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	excludeletters = excludeletters.replace(new RegExp("["+SEED+NAME+"]",'ig'), '')
	console.log("Valid letters remaining after eliminating the seed and the actual name:");
	console.log("  %s", excludeletters);

	var combos = [];
	var combinationsChecked = 0;
	var lastpercent = -1;
	lettercombos = bncommon.getCombinations(excludeletters, NUMBEROFLETTERS);
	console.log("%d total combinations of %d letters from the pool of %d", lettercombos.length, NUMBEROFLETTERS, excludeletters.length);

	lettercombos.forEach(function(currentValue, index, array) {
		var re = new RegExp("^[^" + currentValue + "\\r\\n]+$", "igm");
		var matcharray = names.match(re);

		if(matcharray != null) {
			nameslist = matcharray.join("\n");
			combonames = null
			if(matcharray.length <= 10) {
				combonames = matcharray;
			}
			combos.push({
				exclude: SEED + "+" + currentValue,
				matchcount: matcharray.length,
				names: combonames,
			});
		}

		combinationsChecked++;
		var thispercent = Math.floor(combinationsChecked / lettercombos.length * 100);
		if(thispercent > lastpercent && thispercent % 5 == 0) {
			console.log("%d% complete", thispercent);
			lastpercent = thispercent;
		}
	});

	combos.sort(function(a, b) {
		if(a.matchcount > b.matchcount) {
			return 1;
		} else if (a.matchcount < b.matchcount) {
			return -1;
		} else {
			return 0;
		}
	});

	console.log(combos[0]);
	console.log(combos[combos.length-1]);

	filename = NAME + "-" + SEED +'_'+NUMBEROFLETTERS+'_output.txt';

	fs.writeFile('./'+ filename, formatOutput(combos), 'utf8', function(err, data) {
		if (err) {
			console.log("FILE WRITE ERROR");
			console.log(err);
		} else {
			console.log("Wrote all combinations to file: %s", filename);
		}
	})

	//console.log(combos);
});

function formatOutput(comboArray) {
	var output = ''
	comboArray.forEach(function(item) {
		output += item.exclude + "," + item.matchcount + "\r\n";
	});
	return output;
}