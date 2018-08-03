var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');
var json_file = require('jsonfile');

router.get('/', authorize.auth, function (req, res, next) {

	// var json_file = require('jsonfile');
	content = template_render.get_template("dhcp_config");

	// Display current config file from API config-get
	content = template_render.set_template_variable(content, "dhcp_config_content", JSON.stringify(global.kea_config, null, 4));
	content = template_render.set_template_variable(content, "title", global.anterius_config.current_server.toUpperCase().replace('P', 'Pv'));

	var nw_id, nw_template = '', nw_type = req.query.network;
	if (req.query.id)
		nw_id = req.query.id;
	else
		nw_id = -1;

	if (nw_type) {

		if (req.query.mode == 'edit') {
			if (nw_type == 'reservations') {

				var nw_entity;
				hr_addr = req.query.id.split(':')[0];
				subnet_id = req.query.id.split(':')[1];
				global.kea_server.subnet_list.forEach(s => {
					if (s.id == subnet_id) {
						// pools = s.pools;
						s['reservations'].forEach(h => {
							if (h['ip-address'] == hr_addr)
								nw_entity = h;
						});

						// TODO: make effecient
						// break;
					}
				});

				content = template_render.set_template_variable(content, "edit_title", "Host Reservation [ " + nw_entity['ip-address'] + " ] Configuration options");

				input = template_render.form_input('IP Address', '<input type="text" class="form-control" name="ip-address" id="ip-address" placeholder="Enter address to be reserved" value="' + nw_entity['ip-address'] + '">');
				input = input + template_render.form_input('Hostname', '<input type="text" class="form-control" name="hostname" id="hostname" placeholder="Enter device hostname" value="' + nw_entity.hostname + '">');
				input = input + template_render.form_input('Server-Hostname', '<input type="text" class="form-control" name="server-hostname" id="server-hostname" placeholder="Enter hostname for server" value="' + nw_entity['server-hostname'] + '">');
				input = input + template_render.form_input('Hardware Address', '<input type="text" class="form-control" name="hw-address" id="hw-address" placeholder="Enter MAC address for device" value="' + nw_entity['hw-address'] + '">');
				input = input + template_render.form_input('Next Server', '<input type="text" class="form-control" name="next-server" id="next-server" placeholder="Enter next server address" value="' + nw_entity['next-server'] + '">');
			}
			else {

				var nw_entity;
				if (nw_type == global.kea_server.sn_tag) {

					global.kea_server.subnet_list.forEach(s => {
						if (s.id == req.query.id) {
							// pools = s.pools;
							nw_entity = s;
							// TODO: make effecient
							// break;
						}
					});

					content = template_render.set_template_variable(content, "edit_title", "Subnet ID : " + nw_entity.id + " [ <a href='/nw_detail_info?type=" + global.kea_server.sn_tag + "&id=" + nw_entity.id + "'>" + nw_entity.subnet + "</a> ] Configuration options");
					input = template_render.form_input('Subnet', '<input type="text" class="form-control" name="subnet" id="subnet" placeholder="Enter address/netmask" value="' + nw_entity.subnet + '">');
				}
				else {

					global.kea_server.server_config[global.kea_server.svr_tag]['shared-networks'].forEach(s => {
						if (s.name == req.query.id) {
							// s[global.kea_server.sn_tag].forEach(x => {
							// 	id.push(x['id']);
							// });
							nw_entity = s;
						}
						// TODO: make effecient
						// break;
					});

					content = template_render.set_template_variable(content, "edit_title", "Shared Network [ <a href='/nw_detail_info?type=shared-networks&id=" + nw_entity.name + "'>" + nw_entity.name + "</a> ] Configuration options");
					input = template_render.form_input('Shared NW name', '<input type="text" class="form-control"  name="name" id="name" placeholder="Enter shared network name" value="' + nw_entity.name + '">');
				}

				// Subnet, Shared nw common parameters
				input += template_render.form_input('Valid Lifetime', '<input type="number" class="form-control" name="valid-lifetime" id="valid-lifetime" placeholder="Enter valid lifetime" value="' + nw_entity['valid-lifetime'] + '">');
				input += template_render.form_input('Renew Timer', '<input type="number" class="form-control" name="renew-timer" id="renew-timer" placeholder="Enter renew time interval" value="' + nw_entity['renew-timer'] + '">');
				input += template_render.form_input('Rebind Timer', '<input type="number" class="form-control" name="rebind-timer"  id="rebind-timer" placeholder="Enter rebindtime interval" value="' + nw_entity['rebind-timer'] + '">');
				input += template_render.form_input('Relay IP Address', '<input type="text" class="form-control" name="relay_ip-addresses" id="relay_ipaddr" placeholder="Enter relay address" value="' + nw_entity.relay['ip-address'] + '">');
			}
		} else {

			if (nw_type == 'subnet')
				nw_template = json_file.readFileSync('public/config_templates/subnet' + global.kea_server.svr_tag.replace('Dhcp', '') + '.json');
			else
				nw_template = json_file.readFileSync('public/config_templates/sharednw' + global.kea_server.svr_tag.replace('Dhcp', '') + '.json');

			// console.log(nw_template);
			content = template_render.set_template_variable(content, "edit_title", nw_type.toUpperCase() + " Creation options: " + global.kea_server.svr_tag + " Server");
			input = '', buffer = '';

			for (param in nw_template) {
				// console.log(nw_template[param]);
				if (typeof (nw_template[param]) === 'boolean')
					buffer += '<div class="form-group"><input type="checkbox" class="form-check-input checkbox pull-right" name="' + param + '" id="' + param + '"><label for="' + param + '">' + param + '</label></div>';
				else if (Array.isArray(nw_template[param]) || typeof (nw_template[param]) === 'object')
					buffer += template_render.form_input(param, '<input type="text" class="form-control" name="' + param + '" id="' + param + '" disabled placeholder="Edit ' + nw_type + ' ' + param + ' values on file editor tab after generating test config...">');
				else if (nw_template[param] == '')
					input += template_render.form_input(param, '<input type="text" class="form-control" name="' + param + '" id="' + param + '" placeholder="Enter ' + nw_type + ' ' + param + '">');
				else if (nw_template[param] == -1)
					input += template_render.form_input(param, '<input type="number" class="form-control" name="' + param + '" id="' + param + '" placeholder="Enter ' + nw_type + ' ' + param + '">');
			}
			input += buffer;
		}

		/* Config gen button */
		input += '<div class="row" align="center"><button id="gen_btn" type="button" class="btn btn-info waves-effect ant-btn" style="margin-bottom: 2%; width: 25%;" onclick=\'gen_dhcp_config("'
			+ req.query.mode + '","' + global.kea_server.svr_tag + '","' + global.kea_server.sn_tag + '","' + nw_id + '","' + nw_type + '",' + JSON.stringify(nw_template) + ',' + JSON.stringify(global.kea_server.subnet_list) + ')\'><i class="material-icons">settings</i> <span>Write ' + req.query.mode + ' changes to Test file</span></button></div>';

		form_data = template_render.form_body("config-form", input);

		content = template_render.set_template_variable(content, "config_form", form_data);
		content = template_render.set_template_variable(content, "form_focus", "active", 1);
		content = template_render.set_template_variable(content, "file_focus", "", 1);
		content = template_render.set_template_variable(content, "form_selected", "true", 1);
		content = template_render.set_template_variable(content, "file_selected", "false", 1);
	}
	else {
		// console.log(req.query);

		content = template_render.set_template_variable(content, "file_focus", "active", 1);
		content = template_render.set_template_variable(content, "form_focus", "disabled disabledTab", 1);
		content = template_render.set_template_variable(content, "file_selected", "true", 1);
		content = template_render.set_template_variable(content, "form_selected", "false", 1);
	}
	res.send(template_render.get_index_template(content, req.url));
});

module.exports = router;