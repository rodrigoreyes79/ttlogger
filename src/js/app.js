var moment = require('moment');
var fs = require('fs');
var utf8 = require('utf8');
var lastEntryFile = 'log/.lastEntry.txt';

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

$(function(){
	var now = moment();
	var fmtNow = now.format("ddd, h:mm A");  
	document.title = fmtNow;
	
	if(!fs.existsSync('log')) fs.mkdirSync('log');
	
	var lastEntry = getLastEntry();
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
		window.close();
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
});
