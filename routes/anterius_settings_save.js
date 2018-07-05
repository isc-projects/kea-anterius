/*
© Anthrino > Anterius settings updater
*/

var express = require('express');
var router = express.Router();
var authorize = require('../lib/authorize.js');

router.post('/', function (req, res, next) {
	var request = req.body;
	var json_file = require('jsonfile');

	/* Check if remote server host update request */
	if (request.hostname) {
		anterius_config.server_host_list[request.index].hostname = request.hostname;
		anterius_config.server_host_list[request.index].svr_addr = request.addr;
		anterius_config.server_host_list[request.index].svr_port = request.port;

		json_file.writeFile('./config/anterius_config.json', anterius_config, { spaces: 2 }, function (err) {
			console.error(err)
		});
		res.send('<script type="text/javascript">notification("Remote Server details updated!");</script>');
	}

	/* Check if current server update request */
	else if (request.svrselect && !request.admin_user) {
		anterius_config.current_server = request.svrselect;

		json_file.writeFile('./config/anterius_config.json', anterius_config, { spaces: 2 }, function (err) {
			console.error(err)
		});
		res.send('<script type="text/javascript">notification(\' Switched to ' + request.svrselect + '\')</script>');
	}

	/* Anterius settings update */
	else {
		anterius_config.admin_user = request.admin_user;
		anterius_config.admin_password = request.admin_password;
		anterius_config.stat_refresh_interval = request.stat_refr_int;
		anterius_config.server_addr = request.ca_remote_addr.split(':')[0];
		anterius_config.server_port = request.ca_remote_addr.split(':')[1];
		anterius_config.current_server = request.svrselect;

		// anterius_config.leases_file = request.leases_file;
		// anterius_config.log_file = request.log_file;
		// anterius_config.config_file = request.config_file;

		json_file.writeFile('./config/anterius_config.json', anterius_config, { spaces: 2 }, function (err) {
			console.error(err)
		});

		res.send('<script type="text/javascript">notification(\'Settings saved!\')</script>');
	}
});

module.exports = router;