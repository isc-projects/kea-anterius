/*
© Anthrino > Anterius Settings Manager
*/

var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

router.get('/', authorize.auth, function (req, res, next) {

	anterius_settings_template = template_render.get_template("anterius_settings");

	var json_file = require('jsonfile');

	// /* Leases File */
	// input = template_render.form_input('Leases File', '<input type="input" class="form-control" name="leases_file" id="leases_file" placeholder="/var/lib/dhcp/dhcpd.leases" value="' + anterius_config.leases_file + '">');

	// /* Config File */
	// input = input + template_render.form_input('Config File', '<input type="input" class="form-control" name="config_file" id="config_file" placeholder="/etc/dhcp/dhcpd.conf" value="' + anterius_config.config_file + '">');

	/* Kea Control Agent address [host:port] */
	input = template_render.form_input('Kea Control Agent Address [host:port]', '<input type="input" class="form-control" name="ca_remote_addr" id="ca_remote_addr" placeholder="Enter host:port value for Kea control API" value="' + anterius_config.server_addr + ':' + anterius_config.server_port + '">');

	/* Stats Refresh interval */
	input = input + template_render.form_input('Statistics Refresh Interval (s)', '<input type="input" class="form-control" name="stat_refr_int" id="stat_refr_int" placeholder="Enter refresh interval in secs" value="' + anterius_config.stat_refresh_interval + '">');

	/*  Default server */
	input = input + '<label> Default server </label><div class="form-group"><div class="form-line">'
		+ '<input name="svrselect" id="dhcp4" value="dhcp4" type="radio" class="with-gap" /><label for="dhcp4"><span>DHCPv4</span></label>'
		+ '<input name="svrselect" id="dhcp6" value="dhcp6" type="radio" class="with-gap" /><label for="dhcp6"><span>DHCPv6</span></label></div></div>';
	input = input.replace('value="' + anterius_config.current_server + '"', 'value="' + anterius_config.current_server + '" checked');

	/* Admin User */
	input = input + template_render.form_input('Admin User', '<input type="input" class="form-control" name="admin_user" id="admin_user" placeholder="Username" value="' + anterius_config.admin_user + '">');
	input = input + template_render.form_input('Admin Password', '<input type="input" class="form-control" name="admin_password" id="admin_password" placeholder="Password" value="' + anterius_config.admin_password + '">');

	/* Log File */
	// input = input + template_render.form_input('Log File', '<input type="input" class="form-control" name="log_file" id="log_file" placeholder="/var/log/dhcp.log" value="' + anterius_config.log_file + '">');

	input = input + '<br><div id="anterius_settings_result"></div>';

	form_data = template_render.form_body("anterius-settings-form", input);

	anterius_settings_template = template_render.set_template_variable(anterius_settings_template, "body_content", form_data);

	server_hostname_list = anterius_config.server_hostname_list;
	hostname_data_table = '';

	for (var i = 0; i < server_hostname_list.length; i++) {

		/* Define hostname row for remote servers table */
		table_row = '';
		table_row = table_row + '<td>' + server_hostname_list[i].hostname + '</td>';
		table_row = table_row + '<td>' + server_hostname_list[i].svr_addr + '</td>';
		table_row = table_row + '<td>' + server_hostname_list[i].svr_port + '</td>';

		table_row = table_row.replace(/<td><\/td>/g, '<td> -- </td>');
		// console.log(table_row);
		hostname_data_table = hostname_data_table + '<tr>' + table_row + '</tr>';
	}

	anterius_settings_template = template_render.set_template_variable(anterius_settings_template, "server_hostname_list", hostname_data_table);

	res.send(template_render.get_index_template(anterius_settings_template, req.url));
});

module.exports = router;	