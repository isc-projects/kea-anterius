var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

router.get('/', authorize.auth, function (req, res, next) {

	// var json_file = require('jsonfile');
	// var anterius_config = json_file.readFileSync('config/anterius_config.json');
	content = template_render.get_template("dhcp_config");
	// Display current config file from API config-get
	content = template_render.set_template_variable(content, "dhcp_config_content", JSON.stringify(kea_config, null, 4));
	// content = template_render.set_template_variable(content, "title", "Kea DHCP4 Configuration");

	// Uncomment to display/modify Local configuration file
	// content = template_render.set_template_variable(content, "c_content", "");
	// content = template_render.set_template_variable(content, "dhcp_config_location", anterius_config.config_file);
	// var dhcp_config = fs.readFileSync(anterius_config.config_file, 'utf8');
	var nw_type = req.query.network;
	var nw_id = req.query.id;

	if (nw_type) {
		if (nw_type == 'reservations') {

			var nw_entity;
			hr_addr = req.query.id.split(':')[0];
			subnet_id = req.query.id.split(':')[1];
			subnet_list.forEach(s => {
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
			if (nw_type == 'subnet4') {

				subnet_list.forEach(s => {
					if (s.id == req.query.id) {
						// pools = s.pools;
						nw_entity = s;
						// TODO: make effecient
						// break;
					}
				});

				content = template_render.set_template_variable(content, "edit_title", "Subnet ID : " + nw_entity.id + " [ <a href='/nw_detail_info?type=subnet4&id=" + nw_entity.id + "'>" + nw_entity.subnet + "</a> ] Configuration options");
				input = template_render.form_input('Subnet', '<input type="text" class="form-control" name="subnet" id="subnet" placeholder="Enter address/netmask" value="' + nw_entity.subnet + '">');
			}
			else {

				kea_config['Dhcp4']['shared-networks'].forEach(s => {
					if (s.name == req.query.id) {
						// s['subnet4'].forEach(x => {
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

		input += '<div class="row" align="center"><button type="button" id="gen_btn" class="btn btn-info waves-effect ant-btn" disabled style="margin-bottom: 2%; width: 25%;" onclick=\'gen_dhcp_config("'
			+ nw_id + '","' + nw_type + '",' + JSON.stringify(subnet_list) + ')\'><i class="material-icons">settings</i> <span>Write Changes to Test file</span></button></div>';

		form_data = template_render.form_body("config-form", input);

		content = template_render.set_template_variable(content, "config_form", form_data);
		content = template_render.set_template_variable(content, "form_focus", "active", 1);
		content = template_render.set_template_variable(content, "file_focus", "", 1);
		content = template_render.set_template_variable(content, "form_selected", "true", 1);
		content = template_render.set_template_variable(content, "file_selected", "false", 1);
	}
	else {
		console.log(req.query);

		content = template_render.set_template_variable(content, "file_focus", "active", 1);
		content = template_render.set_template_variable(content, "form_focus", "disabled disabledTab", 1);
		content = template_render.set_template_variable(content, "file_selected", "true", 1);
		content = template_render.set_template_variable(content, "form_selected", "false", 1);
	}
	res.send(template_render.get_index_template(content, req.url));
});

module.exports = router;