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
	content = template_render.set_template_variable(content, "dhcp_config_content", JSON.stringify(kea_config.Dhcp4, null, 4));
	// content = template_render.set_template_variable(content, "title", "Kea DHCP4 Configuration");

	// Uncomment to display/modify Local configuration file
	// content = template_render.set_template_variable(content, "c_content", "");
	// content = template_render.set_template_variable(content, "dhcp_config_location", anterius_config.config_file);
	// var dhcp_config = fs.readFileSync(anterius_config.config_file, 'utf8');

	if (req.query.network) {
		if (req.query.network == 'host') {

			var host_res;
			hr_addr = req.query.id.split(':')[0];
			subnet_id = req.query.id.split(':')[1];
			kea_config['Dhcp4']['subnet4'].forEach(s => {
				if (s.id == subnet_id) {
					// pools = s.pools;
					s['reservations'].forEach(h => {
						if (h['ip-address'] == hr_addr)
							host_res = h;
					});
					// TODO: make effecient
					// break;
				}
			});

			content = template_render.set_template_variable(content, "edit_title", "Host Reservation [ " + host_res['ip-address'] + " ] Configuration options");

			input = template_render.form_input('IP Address', '<input type="input" class="form-control" id="hr-addr" placeholder="Enter address to be reserved" value="' + host_res['ip-address'] + '">');
			input = input + template_render.form_input('Hostname', '<input type="input" class="form-control" id="hostname" placeholder="Enter device hostname" value="' + host_res.hostname + '">');
			input = input + template_render.form_input('Server-Hostname', '<input type="input" class="form-control" id="svr-hostname" placeholder="Enter hostname for server" value="' + host_res['server-hostname'] + '">');
			input = input + template_render.form_input('Hardware Address', '<input type="input" class="form-control" id="hw-addr" placeholder="Enter MAC address for device" value="' + host_res['hw-address'] + '">');
			input = input + template_render.form_input('Next Server', '<input type="input" class="form-control" id="next-svr" placeholder="Enter next server address" value="' + host_res['next-server'] + '">');

		}
		else {

			var network;
			if (req.query.network == 'subnet') {

				kea_config['Dhcp4']['subnet4'].forEach(s => {
					if (s.id == req.query.id) {
						// pools = s.pools;
						network = s;
						// TODO: make effecient
						// break;
					}
				});

				content = template_render.set_template_variable(content, "edit_title", "Subnet ID:" + network.id + " [ <a href='/nw_detail_info?type=subnet&id=" + network.id + "'>" + network.subnet + "</a> ] Configuration options");
				input = template_render.form_input('Subnet', '<input type="input" class="form-control" id="subnet" placeholder="Enter address/netmask" value="' + network.subnet + '">');
			}
			else {

				kea_config['Dhcp4']['shared-networks'].forEach(s => {
					if (s.name == req.query.id) {
						// s['subnet4'].forEach(x => {
						// 	id.push(x['id']);
						// });
						network = s;
					}
					// TODO: make effecient
					// break;
				});

				content = template_render.set_template_variable(content, "edit_title", "Shared Network [ <a href='/nw_detail_info?type=shared&id=" + network.name + "'>" + network.name + "</a> ] Configuration options");
				input = template_render.form_input('Shared NW name', '<input type="input" class="form-control" id="sharednw-name" placeholder="Enter shared network name" value="' + network.name + '">');
			}

			// Subnet, Shared nw common parameters
			input += template_render.form_input('Valid Lifetime', '<input type="input" class="form-control" id="valid-lt" placeholder="Enter valid lifetime" value="' + network['valid-lifetime'] + '">');
			input += template_render.form_input('Renew Timer', '<input type="input" class="form-control" id="stat_refr_int" placeholder="Enter renew time interval" value="' + network['renew-timer'] + '">');
			input += template_render.form_input('Rebind Timer', '<input type="input" class="form-control" id="stat_refr_int" placeholder="Enter rebindtime interval" value="' + network['rebind-timer'] + '">');
			input += template_render.form_input('Relay IP Address', '<input type="input" class="form-control" id="relay_ipaddr" placeholder="Enter relay address" value="' + network.relay['ip-address'] + '">');

		}

		input = input + '<br><div class="row" align="center"><button type="button" class="btn btn-info waves-effect ant-btn" onclick="save_config()"><i class="material-icons">settings</i> <span>Write Changes to Test file</span></button></div>';
		input = input + '<br><div id="anterius_settings_result"></div>';

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