// todo: add tab arr conversion (missing zeros)

var inputSub = document.getElementById('inputSub');
var inputTab = document.getElementById('inputTab');
var convertBtn = document.getElementById('convertBtn');
var latencyBtn = document.getElementById('latencyBtn');
var result = document.getElementById('result');
convertBtn.onclick = recreateSrt;
latencyBtn.onclick = createLatency;

// magic - recreate SRT
function recreateSrt(sub, tab) {
  var convertedSub = convertSub(sub);
  var convertedTab = convertTable(tab);
  var correctTab = convertTableTime(convertedTab);
  var arrSubNoPunct = removePunct(convertedSub);
  var switchedSub = switchTimes(correctTab, arrSubNoPunct);
  var firstJoin = joinBack(switchedSub);
  var finalJoin = firstJoin.join('\n');
  displaySrt(finalJoin);
}


// magic - Latency
function createLatency(sub, tab) {
	var convertedSub = convertSub(sub);
  var convertedTab = convertTable(tab);
  var arrSubNoPunct = removePunct(convertedSub);
	var latArr = createLatencyArr(convertedTab, arrSubNoPunct);
	var latGoodTimes = convertLat(latArr);
	var finalArr = calculateLatency(latGoodTimes);
	var latChecked = checkLatResults(finalArr);
	// var latDblChecked = checkLatSubs(latChecked);
	var joinedLat = joinLat(latChecked);
	displayLat(joinedLat);
}

//convert SUB to array; break on new line, then on space
function convertSub(string) {
	var firstSubArr = inputSub.value.split('\n');
	var secondSubArr = [];
	for (var i = 0; i < firstSubArr.length; i++) {
		var subItem = firstSubArr[i].split(' ');
		secondSubArr.push(subItem);
	}	
	return secondSubArr;
}

//convert CSV to array; break on new line, then on tab
function convertTable(string) {
	var firstTableArr = inputTab.value.split('\n');
	var secondTableArr = [];
	for (var i = 0; i < firstTableArr.length; i++) {
    var tableItem = firstTableArr[i].split('\t');
    secondTableArr.push(tableItem);
	}
	return secondTableArr;
}

// convert single time block
function convertTime(string) {
	var miliseconds = string.slice(-2);
	var input = Number.parseFloat(string);

	var minutes1 = Math.floor(input / 60);
	var minStr = minutes1.toString();
	var minutes = minStr.padStart(2, '00');
	
	var seconds1 = Math.floor(input - minutes * 60);
  var secStr = seconds1.toString();
	var seconds = secStr.padStart(2, '00');

	var time = minutes + ':' + seconds + ',' + miliseconds;
	return time;
}

// convert times of the whole table
function convertTableTime(arr) {
	var correctTimeTab = arr.slice(0);
	for (var i = 0; i < arr.length; i++) {
		for (var j = 0; j < arr[i].length; j++) {
			if (j == 2) {
				correctTimeTab[i].splice(j, 1, convertTime(arr[i][j]) );
			}
		}
	}
	return correctTimeTab;
}

// format time correctly
function formatTime(string) {
	var step1 = string.padStart(11, '00:00:00,00');
	var step2 = step1.padEnd(12, '0');
	var final = step2.replace('.', ',');
	return final;
}

// remove punctuation marks from subs
function removePunct(arr) {
	var arrSubNoPunct = arr.slice(0);
	for (var i = 0; i < arr.length; i++) {
		for (var j = 0; j < arr[i].length; j++) {
			if ( !arr[i][j].match( /\d\d[:]\d\d[:]\d\d[,]\d\d\d/ ) ) {
				arrSubNoPunct[i].splice(j, 1, arrSubNoPunct[i][j].replace(/[,.!?]/g,''));
				// add: if cell following >> ends with :, remove that cell too
			}
		}
	}
	return arrSubNoPunct;
}

// covert Sub Times for Latency 
function convertLat(arr) {
	for (var i = 0; i < arr.length; i++) {
		for (var j = 0; j < arr[i].length; j++) {
			if ( arr[i][j].match( /\d\d[:]\d\d[:]\d\d[,]\d\d\d/ ) ) {
				var mili = arr[i][j].slice(-3);
				var sec = Number.parseInt(arr[i][j].slice(6,8));
				var min = Number.parseInt(arr[i][j].slice(3,5));
				var minToSec = min * 60;
				var totalSec = (sec + minToSec);
				var time = totalSec + '.' + mili;
				arr[i].splice(j, 1, time);
			}
		}
	}
	return arr;
}

// switch times

function switchTimes(arrTab, arrSub) {
	var newSub = arrSub.slice(0);
	var newTab = arrTab.slice(0);
	for (var k = 1; k < newSub.length; k++) {
		partyStarter:
		for (var m = 0; m < 1; m++) {
			if ( (m == 0) && ( newSub[k-1][0].match( /\d\d[:]\d\d[:]\d\d[,]\d\d\d/ ) ) ) {
        // start iterating though the Tab
        for (var i = 0; i < newTab.length; i++) { 
        	for (var j = 0; j < 2; j++) {
        		// check if matches
        		if ( newSub[k][0] === newTab[i][j] ) {
              newSub[k-1].splice(0, 1, formatTime(newTab[i][2]) );
              // delete previous entries
              for (var z = 0; z < i; z++) {
              	newTab[z].splice(0,2, 'fffff', 'fffff');
              }
              // end-time substitution
              var lastSub = newSub[k].length - 1;
              for (var a = 0; a < newTab.length; a++) {
              	if ( newSub[k][lastSub] === newTab[a][0] ) {
                  newSub[k-1].splice(2, 1, formatTime(newTab[a][3]) );
                  // delete previous entries
                  for (var c = z; c <= a; c++) {
              	    newTab[c].splice(0,2, 'fffff', 'fffff');
                  }
                  break partyStarter;
                }
              }
              break partyStarter;
        		}
        		else if (newSub[k][0] === '>>') {
              if ( newSub[k][1] === newTab[i][j] ) {
              	newSub[k-1].splice(0, 1, formatTime(newTab[i][2]) );
                // delete previous entries
                for (var y = 0; y < i; y++) {
              	  newTab[y].splice(0,2, 'fffff', 'fffff');
                }
                // end-time substitution
                var lastSub2 = newSub[k].length - 1;
                for (var b = 0; b < newTab.length; b++) {
              	  if ( newSub[k][lastSub2] === newTab[b][0] ) {
                    newSub[k-1].splice(2, 1, formatTime(newTab[b][3]) );
                    //delete previous entries
                    for (var d = y; d <= b; d++) {
              	      newTab[d].splice(0,2, 'fffff', 'fffff');
                    }
                    break partyStarter;
                  }
                }
                break partyStarter;
              }
        		}
          } 
        }
			}
		}
	}
	return newSub;
}

// join on space
function joinBack(arr) {
	var newArr = [];
	for (var i = 0; i < arr.length; i++) {
		newArr.push(arr[i].join(' '));
	}
	return newArr;
}

// Latency Array
function createLatencyArr(arrTab, arrSub) {
	var latArr = [];
	var newSub = arrSub.slice(0);
	var newTab = arrTab.slice(0);
	for (var k = 1; k < newSub.length; k++) {
		partyUp:
		for (var m = 0; m < 1; m++) {
			if ( (m == 0) && ( newSub[k-1][0].match( /\d\d[:]\d\d[:]\d\d[,]\d\d\d/ ) ) ) {
        var subNo = newSub[k-2][0];
        var subOrigTime = newSub[k-1][0];
        // start iterating though the Tab
        for (var i = 0; i < newTab.length; i++) { 
        	for (var j = 0; j < 2; j++) {
        		// check if matches
        		if ( newSub[k][0] === newTab[i][j] ) {
              var tabActTime = newTab[i][2];
              var readyArr = [subNo, subOrigTime, tabActTime];
              latArr.push(readyArr);
              // remove used words to avoid doubling
              for (var z = 0; z < i; z++) {
              	newTab[z].splice(0,2);
              }
              // remove words up to last word in subtitle
              var lastSub = newSub[k].length - 1;
              for (var a = 0; a < newTab.length; a++) {
              	if ( newSub[k][lastSub] === newTab[a][0] ) {
                  // delete previous entries
                  for (var c = z; c <= a; c++) {
              	    newTab[c].splice(0,2, 'fffff', 'fffff');
                  }
                  break partyUp;
                }
              }
              break partyUp;
        		}
        		else if (newSub[k][0] === '>>') {
              if ( newSub[k][1] === newTab[i][j] ) {
              	var tabActTimeAlt = newTab[i][2];
              	var readyArrAlt = [subNo, subOrigTime, tabActTimeAlt];
                latArr.push(readyArrAlt);
                //remove used words to avoid doubling
                for (var y = 0; y < i; y++) {
              	  newTab[y].splice(0,2);
                }
                // remove entries up to the last word in subs
                var lastSub2 = newSub[k].length - 1;
                for (var b = 0; b < newTab.length; b++) {
              	  if ( newSub[k][lastSub2] === newTab[b][0] ) {
                    //delete previous entries
                    for (var d = y; d <= b; d++) {
              	      newTab[d].splice(0,2, 'fffff', 'fffff');
                    }
                    break partyUp;
                  }
                }
                break partyUp;
              }
        		}
          } 
        }
			}
		}
	}
	return latArr;
}

function calculateLatency(arr) {
	for (i = 0; i < arr.length; i++) {
		var latency = Number.parseFloat(arr[i][1]) - Number.parseFloat(arr[i][2]);
		arr[i].push(latency.toFixed(3));
	}
	return arr;
}

function joinLat (arr) {
	var newArr = [];
	for (i = 0; i < arr.length; i++) {
		newArr.push(arr[i].join('\t'));
	}
	var final = newArr.join('\n');
	return final;
}

function checkLatResults(arr) {
	for (i = 1; i < arr.length; i++) {
    if (Number.parseFloat(arr[i][2]) <= Number.parseFloat(arr[i-1][2])) {
      arr[i].push('***');
      arr[i-1].push('***');
    }
	}
	return arr;
}

// function checkLatSubs(arr) {
// 	debugger
// 	for (j = 0; j < arr.length - 1; j++) {
//     var sub = Number.parseInt(arr[j][0]);
//   	var nextSub = (Number.parseInt(arr[j+1][0]));
//     if ( sub !== (nextSub - 1) ) {
//     	var newEnrty = [(sub+1).toString, '0.000', '0.00', '0.00'];
//     	arr.splice(j + 1, 0, newEnrty);
//     }
// 	}
// 	return arr;
// }

// display stuff
function displaySrt(text) {
	result.innerText = text;
}

function displayLat(text) {
	var header = 'Sub#\tSRT\tCSV\tLatency\n';
	result.innerText = header + text;
}