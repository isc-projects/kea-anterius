var express = require('express');
var router = express.Router();
var authorize = require('../lib/authorize.js');

router.post('/', authorize.auth, function(req, res, next) {
	var request = req.body;
	var json_file = require('jsonfile');

	var anterius_config = json_file.readFileSync('config/anterius_config.json');

	anterius_config.admin_user = request.admin_user;
	anterius_config.admin_password = request.admin_password;
	anterius_config.leases_file = request.leases_file;
	anterius_config.log_file = request.log_file;
	anterius_config.config_file = request.config_file;

	json_file.writeFile('./config/anterius_config.json', anterius_config, {spaces: 2}, function(err) {
		console.error(err)
	});

	res.send('<script type="text/javascript">notification(\'Saved Config!\')</script>');
});

module.exports = router;