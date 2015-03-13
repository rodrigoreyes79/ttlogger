var moment = require('moment');
var fs = require('fs');
var utf8 = require('utf8');
var gui = require('nw.gui');
var CronJob = require('cron').CronJob;

var lastEntryFile = 'log/.lastEntry.txt';
var pinFile = 'log/.pins'

var ViewModel = function(ts,msg){
	var self = this;
	var initialTs = ts;
	console.log('InitialTs: ' + initialTs);
	
	self.pins = ko.observableArray([ts]);
	self.pinOptions = ko.computed(function() {
		var ret = [];
		for(var i = 0; i < self.pins().length; i++){
			ret.push({"value": self.pins()[i], "label": moment.unix(self.pins()[i]).format("ddd, h:mm A"), "moment": moment.unix(self.pins()[i])});
		}
		return ret;
	});
	self.selectedPin = ko.observable(self.pinOptions()[self.pinOptions().length - 1]);
	self.selectedPin.subscribe(function(newValue){
		if(newValue) document.title = newValue.label; else return '';
	})
	
	self.fmtNow = ko.computed(function() {
		if(self.selectedPin()) return self.selectedPin().label; else return '';
	});
	self.msg = ko.observable(msg);


	// ---------
	// Triggers
	// ---------

	self.onSave = function(){
		writeLastEntry(self.msg(), function(){
			fs.appendFile(
				'log/' + self.selectedPin().moment.format('YYYY-MM-DD') + '.txt', 
				self.selectedPin().moment.format("HH:mm") + ' | ' + self.msg() + '\n',
				{},
				function(){
					self.onCancel();
				}
			)
		});
	}

	self.onCancel = function(){
		unPin(self.selectedPin().value);
	}

	self.onPin = function(){
		pin(moment().unix());
	}

	self.onUnpin = function(){
		unpin();
	}

	self.onNextPin = function(){
		var index = getPinIndex(self.selectedPin().value);
		if(index > -1){
			index++;
			
			if(index > self.pins().length -1){
				index = 0;
			}
			self.selectedPin(self.pinOptions()[index]);
		}
	}

	self.onPrevPin = function(){
		var index = getPinIndex(self.selectedPin().value);
		if(index > -1){
			index--;
			
			if(index < 0){
				index = self.pins().length -1;
			}
			self.selectedPin(self.pinOptions()[index]);
		}

	}

	// ------
	// Logic
	// ------

	self.loadPins = function(){
		var pins = [];
		if(fs.existsSync(pinFile)){
			pins = readJsonPinFile(pinFile);
		}
		console.log('Loaded pins: ' + pins);
		self.pins(pins);
		pin(initialTs);
	}

	var pin = function(ts){
		console.log('Pinning ' + ts);
		self.pins.push(ts);
		self.selectedPin(self.pinOptions()[self.pinOptions().length - 1]);
		saveJsonPinFile(pinFile);
	}

	var unPin = function(){
		var newPins = [];
		var index = getPinIndex(self.selectedPin().value);
		for(var i = 0; i < self.pins().length; i++){
			if(i == index) continue
			newPins.push(self.pins()[i]);
		}
		if(newPins.length == 0) newPins.push(moment().unix());

		self.pins(newPins);
		self.selectedPin(self.pinOptions()[index]);
		return saveJsonPinFile(pinFile);
	}

	var getPinIndex = function(ts){
		var index = -1;
		for(var i = 0; i < self.pins().length; i++){
			if(self.pins()[i] == ts && index < 0){
				console.log('Found at index '+ i);
				index = i;
				break;
			}
		}
		return index;
	}

	var getLastEntry = function(){
		if(fs.existsSync(lastEntryFile)){
			return fs.readFileSync(lastEntryFile, {});
		}
		console.log('No lastEntryFile');
		return '';
	}
	self.getLastEntry = getLastEntry;

	var writeLastEntry = function(data, cb){
		console.log('About to write "' + data + '"');
		try {
			data = utf8.encode(data.toString());
		} catch(e) {
			console.log('Error UTF8 encoding');
		}
		console.log(data);
		fs.writeFile(lastEntryFile, data, {}, cb);
	}

	var saveJsonPinFile = function(file){
		var d = $.Deferred();
		fs.writeFile(file, JSON.stringify(self.pins()), {}, function(){
			d.resolve();
		});
		return d.promise();
	}

	var readJsonPinFile = function(file){
		var data = fs.readFileSync(file, 'utf8');
		data = JSON.parse(data);

		return data;
	}
}

$(function(){
	if(!fs.existsSync('log')) fs.mkdirSync('log');

	console.log('Starting load');
	var vm = new ViewModel(moment().unix());
	vm.loadPins();
	vm.msg(vm.getLastEntry());

	ko.applyBindings(vm);
	$('#data').focus();	
                 
	new CronJob('0 0 8-18 * * 1-5', function(){
		vm.onPin();
	}, null, true, "America/Guayaquil");
});
