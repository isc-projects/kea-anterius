/*
© Anthrino > DHCP config update publisher [API config-set]
*/

var express = require('express');
var router = express.Router();

var authorize = require('../lib/authorize.js');
var api_agent = require('../lib/api_service.js');

router.post('/', authorize.auth, function (req, res, next) {

	var request = req.body;
	// console.log(JSON.parse(request.dhcp_config_file)[server.sn_tag]);
	// ISC DHCP Local config verification - replaced by CA API
	// fs.writeFileSync("./syntax_verify_config", request.dhcp_config_file, 'utf8');
	// var exec = require('child_process').exec;

	if (request.mode == 'test') {
		config_update_req_data = JSON.stringify({ "command": "config-test", "service": [anterius_config.current_server], "arguments": JSON.parse(request.dhcp_config_file) });
	}
	else {
		config_update_req_data = JSON.stringify({ "command": "config-set", "service": [anterius_config.current_server], "arguments": JSON.parse(request.dhcp_config_file) });
	}
	if (request.affirm) {
		/* Fetch and set server config*/
		var response_data = api_agent.fire_kea_api(config_update_req_data, anterius_config.server_addr, anterius_config.server_port).then(function (api_data) {
			console.log(api_data);
			return api_data;
		});
		response_data.then(function (data) {
			if (data.result != 0)
				console.log("CA Error: " + data.text);
			res.send({ "message": data.text, "status": data.result });
		});
	}


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