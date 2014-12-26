fs = require('fs')
bncommon = require('./common')

var args = process.argv.slice(2);

if (args.length < 2) {
	console.log("Need at least two arguments")
	console.log("USAGE: node sanity [name] [sets]")
	console.log("  [name] is the name that you want people to solve for")
	console.log("  [sets] is a dash-delimitted list of all of the sets of letters you want to distribute")
	return 1;
}

var NAME = args[0];
var CARDSTRING = args[1];
var CARDS = args[1].split('-');

if (NAME.match(new RegExp('['+ CARDSTRING.replace(/-/g,'') +']', 'i')) != null) {
	console.log("ERROR: The cards contain one of the letters from the name! That makes the game impossible.");
	return 1;
}

console.log("Cards in list:");
console.log(CARDS);

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

	combos = [];
	for(var i=1; i<=CARDS.length; i++) {
		var thiscombos = combos[i-1] = difficultycalc(names, CARDS, i);
		console.log("\nDifficulties for %d cards", i);
		console.log("Best-case: %d",thiscombos[0].matchcount);
		console.log(thiscombos[0].names)
		console.log("Worst-case: %d",thiscombos[thiscombos.length-1].matchcount);

		//console.log(combos);
	}

	fs.writeFile('./sanity_output.txt', formatOutput(combos), 'utf8', function(err, data) {
		if (err) {
			console.log("FILE WRITE ERROR");
			console.log(err);
		} else {
			console.log("Wrote file successfully");
		}
	})

	//console.log(combos);
});

function formatOutput(comboArray) {
	var output = ''
	comboArray.forEach(function(item, numcards) {
		output += numcards+1 + "\r\n"
		item.forEach(function(subitem) {
			output += subitem.exclude + "," + subitem.matchcount + "\r\n";
		});
	});
	return output;
}

function difficultycalc(names, cards, cardcount) {
	var combos = [];
	var combinationsChecked = 0;
	var lastpercent = -1;
	indexcombos = bncommon.getCombinations("0123456789".substring(0, cards.length), cardcount);
	console.log(indexcombos.length + " total combinations");

	indexcombos.forEach(function(currentValue, index, array) {
		var lettersarray = [];
		for (var i = 0, len = currentValue.length; i < len; i++) {
			lettersarray.push(cards[Number(currentValue[i])]);
		}
		var letters = lettersarray.join('');

		var re = new RegExp("^[^" + letters + "\\r\\n]+$", "igm");
		var matcharray = names.match(re);

		if(matcharray != null) {
			nameslist = matcharray.join("\n");
			combonames = null
			if(matcharray.length <= 10) {
				combonames = matcharray;
			}
			combos.push({
				exclude: lettersarray.join('-'),
				matchcount: matcharray.length,
				names: combonames,
			});
		}

		combinationsChecked++;
		var thispercent = Math.floor(combinationsChecked / indexcombos.length * 100);
		if(thispercent > lastpercent) {
			//console.log(thispercent + "% complete");
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

	return combos;
}


function getPermutations(data) {
    if (!(data instanceof Array)) {
        throw new TypeError("input data must be an Array");
    }

    data = data.slice();  // make a copy
    var permutations = [],
        stack = [];

    function doPerm() {
        if (data.length == 0) {
            permutations.push(stack.slice());
        }
        for (var i = 0; i < data.length; i++) {
            var x = data.splice(i, 1);
            stack.push(x);
            doPerm();
            stack.pop();
            data.splice(i, 0, x);
        }
    }

    doPerm();
    return permutations;
}

