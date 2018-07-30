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
		if (request.index == anterius_config.server_host_list.length)
			anterius_config.server_host_list.push({});

		anterius_config.server_host_list[request.index].hostname = request.hostname;
		anterius_config.server_host_list[request.index].svr_addr = request.addr;
		anterius_config.server_host_list[request.index].svr_port = request.port;

		json_file.writeFile('./config/anterius_config.json', anterius_config, { spaces: 2 }, function (err) {
			console.error(err)
		});
		res.send("Server Host details updated!");
	}

	/* Check if delete server host entry request */
	if (request.delete) {

		anterius_config.server_host_list.splice(request.index, 1);

		json_file.writeFile('./config/anterius_config.json', anterius_config, { spaces: 2 }, function (err) {
			console.error(err)
		});
		res.send("Server Host Entry deleted!");
	}

	/* Check if current server update request */
	else if (request.svrselect && request.mode && !request.admin_user) {
		anterius_config[request.mode] = request.svrselect;

		if (request.mode == 'current_host_index') {
			anterius_config.server_addr = anterius_config.server_host_list[request.svrselect].svr_addr;
			anterius_config.server_port = anterius_config.server_host_list[request.svrselect].svr_port;
		}

		json_file.writeFile('./config/anterius_config.json', anterius_config, { spaces: 2 }, function (err) {
			console.error(err)
		});

		server_active = 1;
		res.send('<script type="text/javascript">notification(\'Reloading Stats..\')</script>');
	}

	/* Anterius settings update */
	else {
		anterius_config.admin_user = request.admin_user;
		anterius_config.admin_password = request.admin_password;
		anterius_config.stat_refresh_interval = request.stat_refr_int;
		anterius_config.current_server = request.svrselect;

		// anterius_config.leases_file = request.leases_file;
		// anterius_config.log_file = request.log_file;
		// anterius_config.config_file = request.config_file;

		json_file.writeFile('./config/anterius_config.json', anterius_config, { spaces: 2 }, function (err) {
			console.error(err)
		});

		server_active = 1;
		res.send('<script type="text/javascript">notification(\'Settings saved!\')</script>');
	}
});

module.exports = router;