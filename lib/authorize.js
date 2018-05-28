var basic_auth = require('basic-auth');

/* Read Config */
var json_file = require('jsonfile');
var anterius_config = json_file.readFileSync('config/anterius_config.json');

module.exports = {
	auth: function (req, res, next) {
		var user = basic_auth(req);

		function unauthorized(res) {
			res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
			return res.sendStatus(401);
		};


		if(anterius_config.admin_user == ""){
			next();
			return;
		}

		if (!user || !user.name || !user.pass) {
			return unauthorized(res);
		}
		if (user.name === anterius_config.admin_user && user.pass === anterius_config.admin_password) {
			next();
		} else {
			return unauthorized(res);
		}
	}
};

