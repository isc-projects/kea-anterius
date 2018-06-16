/*
© Anthrino > DHCP config update publisher [API config-set]
*/

var express = require('express');
var router = express.Router();

var authorize = require('../lib/authorize.js');
var api_agent = require('../lib/api_service.js');

router.post('/', authorize.auth, function (req, res, next) {

	var request = req.body;
	// console.log(JSON.parse(request.dhcp_config_file).Dhcp4);
	// ISC DHCP Local config verification - replaced by CA API
	// fs.writeFileSync("./syntax_verify_config", request.dhcp_config_file, 'utf8');
	// var exec = require('child_process').exec;

	config_req_data = JSON.stringify({ "command": "config-test", "service": ["dhcp4"] , "arguments": JSON.parse(request.dhcp_config_file) });

	console.log(api_agent.fire_kea_api(config_req_data));


	// exec('/usr/sbin/dhcpd -t -cf ./syntax_verify_config > verify_output 2> verify_output', function(err, stdout, stderr)
	// {
	// 	var output = fs.readFileSync('./verify_output', "utf8");

	// 	if (err) {
	// 		output = output.replace("\n", "<br>");
	// 		output = output.replace(". ", "<br>");
	// 		output = output.replace("line", "<br><br>line");
	// 		output = output.replace("Configuration file errors encountered", "<br><br>Configuration file errors encountered");

	// 		res.send('<script type="text/javascript">modal (\'DHCP Config Syntax Validation\', ' + JSON.stringify('<span style="color:red">' + output + '</span>') + ', "");');

	// 		return;
	// 	}
	// 	else {

	// 		output = output.replace("\n", "<br>");
	// 		res.send(
	// 			'<script type="text/javascript">modal (\'DHCP Config Save\', ' + JSON.stringify('Syntax OK <br><br> Config Snapshot created') + ', "");'
	// 		);
	// 		/* Read Config */
	// 		var json_file = require('jsonfile');
	// 		var anterius_config = json_file.readFileSync('config/anterius_config.json');

	// 		/* Make Dir if not exist */
	// 		var dir = './config_backups';
	// 		if (!fs.existsSync(dir)){
	// 			fs.mkdirSync(dir);
	// 		}

	// 		//date +"%Y-%m-%d_%H:%M:%S"
	// 		exec('/bin/cp ' + anterius_config.config_file + ' ./config_backups/`basename ' + anterius_config.config_file + '`_`date +"%Y-%m-%d_%H:%M:%S"`',
	// 			function(err, stdout, stderr) {

	// 		});

	// 		fs.writeFileSync(anterius_config.config_file, request.dhcp_config_file, 'utf8');

	// 		fs.unlinkSync("./verify_output");
	// 		fs.unlinkSync("./syntax_verify_config");
	// 	}
	// });
});

module.exports = router;