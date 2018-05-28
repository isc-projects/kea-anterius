var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

router.get('/', authorize.auth, function(req, res, next) {

	anterius_settings_template = template_render.get_template("anterius_settings");

	var json_file = require('jsonfile');

	/* Read Config */
	anterius_config = json_file.readFileSync('config/anterius_config.json');

	/* Leases File */
	input = template_render.form_input('Leases File', '<input type="input" class="form-control" id="leases_file" placeholder="/var/lib/dhcp/dhcpd.leases" value="' + anterius_config.leases_file + '">');

	/* Config File */
	input = input + template_render.form_input('Config File', '<input type="input" class="form-control" id="config_file" placeholder="/etc/dhcp/dhcpd.conf" value="' + anterius_config.config_file + '">');

	/* Log File */
	input = input + template_render.form_input('Log File', '<input type="input" class="form-control" id="log_file" placeholder="/var/log/dhcp.log" value="' + anterius_config.log_file + '">');

	/* Admin User */
	input = input + template_render.form_input('Admin User', '<input type="input" class="form-control" id="admin_user" placeholder="Username" value="' + anterius_config.admin_user + '">');
	input = input + template_render.form_input('Admin Password', '<input type="input" class="form-control" id="admin_password" placeholder="Password" value="' + anterius_config.admin_password + '">');

	input = input + '<br><button type="button" class="btn btn-info waves-effect" onclick="save_config()"><i class="material-icons">settings</i> <span>Save Config</span></button>';
	input = input + '<br><div id="anterius_settings_result"></div>';

	form_data = template_render.form_body("anterius-settings-form", input);

	anterius_settings_template = template_render.set_template_variable(anterius_settings_template, "body_content", form_data);

	res.send(template_render.get_index_template(anterius_settings_template, req.url));
});

module.exports = router;