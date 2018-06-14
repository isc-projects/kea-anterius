var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

router.get('/', authorize.auth, function (req, res, next) {

	var content = "";

	content = template_render.get_template("dhcp_config");

	/* Read Config */
	var json_file = require('jsonfile');
	var anterius_config = json_file.readFileSync('config/anterius_config.json');

	// content = template_render.set_template_variable(content, "title", "Kea DHCP4 Configuration");

	// Display current config from API config-get
	content = template_render.set_template_variable(content, "dhcp_config_content", JSON.stringify(kea_config.Dhcp4, null, 4));

	// Uncomment to display/modify Local configuration file
	// content = template_render.set_template_variable(content, "c_content", "");
	// content = template_render.set_template_variable(content, "dhcp_config_location", anterius_config.config_file);
	// var dhcp_config = fs.readFileSync(anterius_config.config_file, 'utf8');


	if (req.query.network == 'host_res') {
		input = input + template_render.form_input('', '<input type="input" class="form-control" id="stat_refr_int" placeholder="Enter refresh interval in secs" value="' + anterius_config.stat_refresh_interval + '">');
		input = input + template_render.form_input('', '<input type="input" class="form-control" id="stat_refr_int" placeholder="Enter refresh interval in secs" value="' + anterius_config.stat_refresh_interval + '">');
		input = input + template_render.form_input('', '<input type="input" class="form-control" id="stat_refr_int" placeholder="Enter refresh interval in secs" value="' + anterius_config.stat_refresh_interval + '">');
		input = input + template_render.form_input('', '<input type="input" class="form-control" id="stat_refr_int" placeholder="Enter refresh interval in secs" value="' + anterius_config.stat_refresh_interval + '">');

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

	res.send(template_render.get_index_template(content, req.url));
});

module.exports = router;