/*
© Anthrino > Anterius settings updater
*/

var express = require('express');
var router = express.Router();
var authorize = require('../lib/authorize.js');

router.post('/', authorize.auth, function (req, res, next) {
	var request = req.body;
	var json_file = require('jsonfile');

	anterius_config.admin_user = request.admin_user;
	anterius_config.admin_password = request.admin_password;
	anterius_config.stat_refresh_interval = request.stat_refr_int;
	anterius_config.server_addr = request.ca_remote_addr.split(':')[0];
	anterius_config.server_port = request.ca_remote_addr.split(':')[1];
	// anterius_config.leases_file = request.leases_file;
	// anterius_config.log_file = request.log_file;
	// anterius_config.config_file = request.config_file;

	json_file.writeFile('./config/anterius_config.json', anterius_config, { spaces: 2 }, function (err) {
		console.error(err)
	});

	res.send('<script type="text/javascript">notification(\'Settings saved!\')</script>');
});

router.get('/', function (req, res, next) {
	var request = req.body;
	var json_file = require('jsonfile');

	console.log(request);
	// anterius_config.current_server = request.;

	// json_file.writeFile('./config/anterius_config.json', anterius_config, { spaces: 2 }, function (err) {
	// 	console.error(err)
	// });

	notification('Switched to' + 'server');
});

module.exports = router;