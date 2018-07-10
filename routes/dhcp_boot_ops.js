var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

router.get('/', authorize.auth, function (req, res, next) {

	var content = "";

	content = template_render.get_template("dhcp_boot_ops");
	content = template_render.set_template_variable(content, "title", anterius_config.current_server.toUpperCase() + " Server Boot Ops : Start / Stop / Restart");

	var exec = require('child_process').exec;

	// run_status = execSync("keactrl status").toString();

	var svrun = run_status.replace("\n", "<br> \n")
		.replace(/\bactive\b/g, '<span style="color: #00a90b">Active</span></span></label>')
		.replace(/\binactive\b/g, '<span style="color: #D50000">Inactive</span></span></label>')
		.split("\n").slice(0, 2);

	console.log(svrun);

	var return_content = "";

	// 	if (is_running) {
	// 		return_content = return_content + 'DHCP Server is online!<br><br>';
	// 		return_content = return_content + '<button style="float: right; margin-top:-1%; margin-right:1%;" type="button" class="btn btn-info waves-effect ant-btn" onclick="add_server_host([svr_hosts_len])">
	// 		<i class="material-icons">add</i>
	// 	</button>';
	// 	}
	// 	else {
	// 		return_content = return_content + 'DHCP Server is offline!<br><br>';
	// 		return_content = return_content + '<button type="button" onclick="process_action(\'start\')" class="btn btn-default waves-effect">Start Server</button> ';
	// 	}

	svrun.forEach(function (svr, index, svr_list) {

		state = '';

		if (svr.includes('Inactive')) {
			ss_btn_template = '<div class="row" align="center">' +
				'<button id="start_btn" type="button" class="btn btn-info waves-effect ant-btn" style="margin-bottom: 2%; width: 20%;" onclick="test_dhcp_config()">' +
				'<i class="material-icons">power_settings_new</i>' +
				'<span>Start</span></button>';
			state = 'disabled';
		}
		else
			ss_btn_template = '<div class="row" align="center">' +
				'<button id="stop_btn" type="button" class="btn btn-info waves-effect ant-btn" style="margin-bottom: 2%; width: 20%;" onclick="test_dhcp_config()">' +
				'<i class="material-icons">power_settings_new</i>' +
				'<span>Stop</span></button>';

		return_content = return_content + '<h4>' + svr + ' </h4>' + ss_btn_template +
			'<span style="margin-left:5%; margin-right:5%"></span>' +
			'<button id="restart_btn" type="button" class="btn btn-info waves-effect ant-btn" ' + state + ' style="margin-bottom: 2%; width: 20%;" onclick="test_dhcp_config()">' +
			'<i class="material-icons">restore</i>' +
			'<span>Restart</span></button></div><hr>'
	});

	content = template_render.set_template_variable(content, "c_content", return_content);

	res.send(template_render.get_index_template(content, req.url));
	// });
});

router.post('/', authorize.auth, function (req, res, next) {
	var request = req.body;

	const execSync = require('child_process').execSync;

	switch (request.action) {
		case "stop":
			dhcp_exec = execSync('/usr/sbin/service isc-dhcp-server stop && /bin/sleep 1');
			res.send("<script type='text/javascript'>notification('DHCP Server Stopped');ignore_cache = 1;do_pjax_request('/dhcp_start_stop_restart');$('#mdModal').modal('hide');</script>");
			break;
		case "start":
			dhcp_exec = execSync('/usr/sbin/service isc-dhcp-server start');
			res.send("<script type='text/javascript'>notification('DHCP Server Started');ignore_cache = 1;do_pjax_request('/dhcp_start_stop_restart');</script>");
			break;
		case "restart":
			dhcp_exec = execSync('/usr/sbin/service isc-dhcp-server restart && /bin/sleep 1');
			res.send("<script type='text/javascript'>notification('DHCP Server Restarted " + dhcp_exec + "');ignore_cache = 1;do_pjax_request('/dhcp_start_stop_restart');$('#mdModal').modal('hide');</script>");
			break;
		default:
			break;
	}

	console.log(request);

});

module.exports = router;