var moment = require('moment');
var fs = require('fs');
var utf8 = require('utf8');
var gui = require('nw.gui');

var lastEntryFile = 'log/.lastEntry.txt';
var pinFile = 'log/.pins'

function getLastEntry(){
	if(fs.existsSync(lastEntryFile)){
		return fs.readFileSync(lastEntryFile, {});
	}
	return null;
}

function writeLastEntry(data, cb){
	data = utf8.encode(data);
	console.log(data);
	fs.writeFile(lastEntryFile, data, {}, cb);
}

function pin(now){
	var pins = [];
	if(fs.existsSync(pinFile)){
		pins = readJsonFile(pinFile);
	}
	var ts = now.unix();
	var doPin = true;
	for(var i = 0; i < pins.length; i++){
		if(pins[i] == ts) {
			doPin = false;
			break;
		}
	}
	if(doPin){
		pins.push(ts);
		fs.writeFile(pinFile, JSON.stringify(pins), {});
	}
}

function unpin(now){
	var d = $.Deferred();
	var ts = now.unix();
	var pins = [];
	var newPins = [];
	if(fs.existsSync(pinFile)){
		pins = readJsonFile(pinFile);
	}
	
	for(var i = 0; i < pins.length; i++){
		if(pins[i] == ts) {
			continue;
		}
		newPins.push(pins[i]);
	}
	
	fs.writeFile(pinFile, JSON.stringify(newPins), {}, function(){
		d.resolve();
	});
	
	return d.promise();
}

function reload(now){
	// Loading pinned ts
	var pins = readJsonFile(pinFile);
	
	// Opening a window per pin
	for(var i = 0; i < pins.length; i++){
		var pin = pins[i];
		if(pin != now.unix()){
			setTimeout(function(pin){ 
				return function(){
					var newWin = gui.Window.open('index.html',{
						"show": true,
						"toolbar": false,
						"frame": true,
						"position": "center",
						"width": 600,
						"height": 400,
						"min_width": 600,
						"min_height": 400
					});
					newWin.on('document-start', function() {
						console.log('pin: ' + pin);
						newWin.eval(null, 'sessionStorage.setItem("nowPin", ' + pin + ')');
					});
				}
			}(pin), i * 1000);
		}
	}
}

function readJsonFile(file){
	var data = fs.readFileSync(file, 'utf8');
	data = JSON.parse(data);
	return data;
}

$(function(){
	console.log('Starting load');
	var nowPin = sessionStorage.getItem("nowPin");
	console.log('nowPin: ' + nowPin);
	var reloading = false;
	if(nowPin){
		now = moment.unix(nowPin);
		reloading = true;
	} else {
		now = moment();
		pin(now);
	}	
	
	var fmtNow = now.format("ddd, h:mm A");  
	document.title = fmtNow;
	
	if(!fs.existsSync('log')) fs.mkdirSync('log');
	
	var lastEntry = null;
	if(!reloading)
		lastEntry = getLastEntry();
	if(lastEntry) {
		$('#data').val(lastEntry);
	}
	$('#data').focus();	
	
	$('#refreshLastEntryLink').click(function(){
		event.preventDefault();
		var lastEntry = getLastEntry();
		$('#data').val(lastEntry);
	});
	$('#cancelBtn').click(function(){
		unpin(now).done(function(){
			var win = gui.Window.get();
			win.hide();
			setTimeout(win.close, 3000);
		});
	});
	$('#saveBtn').click(function(){
		writeLastEntry($('#data').val(), function(){
			fs.appendFile(
				'log/' + now.format('YYYY-MM-DD') + '.txt', 
				now.format("HH:mm") + ' | ' + $('#data').val() + '\n',
				{},
				function(){window.close();}
			)
		});
		
	});
	$('#pinBtn').click(function(){
		pin(now);
		$('#pinBtn').hide();
		$('#unpinBtn').show();
	});
	$('#unpinBtn').click(function(){
		unpin(now);
		$('#pinBtn').show();
		$('#unpinBtn').hide();
	});
	$('#reloadBtn').click(function(){
		reload(now);
	});
});
