/*
© Anthrino > Kea Boot-Operations manager
*/

'use strict';

var express = require('express');
var router = express.Router();
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

router.get('/', authorize.auth, function (req, res, next) {

	var content = "";

	content = template_render.get_template("dhcp_boot_ops");
	content = template_render.set_template_variable(content, "title", global.anterius_config.current_server.toUpperCase() + " Server Boot Ops : Start / Stop / Restart");

	// global.kea_server.run_status = execSync("keactrl status").toString();

	var svrun = global.kea_server.run_status.replace("\n", "<br> \n")
		.replace(/\bactive\b/g, '<span style="color: #00a90b">Active</span></span></label>')
		.replace(/\binactive\b/g, '<span style="color: #D50000">Inactive</span></span></label>')
		.split("\n").slice(0, 2);

	console.log(svrun);

	var return_content = "";

	svrun.forEach(function (svr, index, svr_list) {

		var state = '', ss_btn_template = '';
		var svr_name = svr.split(':')[0];

		if (svr.includes('Inactive')) {
			ss_btn_template = '<div class="row" align="center">' +
				'<button id="start_btn" type="button" class="btn btn-info waves-effect ant-btn" style="margin-bottom: 2%; width: 20%;" onclick="server_boot_ops(\'start\', \'' + svr_name + '\')">' +
				'<i class="material-icons">power_settings_new</i>' +
				'<span>Start</span></button>';
			state = 'disabled';
		}
		else
			ss_btn_template = '<div class="row" align="center">' +
				'<button id="stop_btn" type="button" class="btn btn-info waves-effect ant-btn" style="margin-bottom: 2%; width: 20%;" onclick="server_boot_ops(\'stop\', \'' + svr_name + '\')">' +
				'<i class="material-icons">power_settings_new</i>' +
				'<span>Stop</span></button>';

		return_content = return_content + '<h4>' + svr + ' </h4>' + ss_btn_template +
			'<span style="margin-left:5%; margin-right:5%"></span>' +
			'<button id="restart_btn" type="button" class="btn btn-info waves-effect ant-btn" ' + state + ' style="margin-bottom: 2%; width: 20%;" onclick="server_boot_ops(\'restart\',\'' + svr_name + '\')">' +
			'<i class="material-icons">restore</i>' +
			'<span>Restart</span></button></div><hr>'

	});

	return_content = return_content + '<h6><center> Page auto-refreshed every 3s, please reload manually if changes are not reflected. </center></h6>';
	var content = template_render.set_template_variable(content, "c_content", return_content);
	res.send(template_render.get_index_template(content, req.url));
});

router.post('/', authorize.auth, function (req, res, next) {
	var request = req.body;

	var sudo = require('sudo-prompt');

	var options = {
		name: 'Anterius',
		icns: '../public/assets/images/favicon.ico',
	};

	var svr_name = request.server.replace('server', '').replace('v', '').toLowerCase();

	switch (request.action) {
		case "stop":
			sudo.exec('keactrl stop -s ' + svr_name, options,
				function (error, stdout, stderr) {
					if (error) throw error;
					console.log('stdout: ' + stdout);
				}
			);
			// var child = sudo(['keactrl stop -s ' + svr_name], options);
			// child.stdout.on('data', function (data) {
			// 	console.log(data.toString());
			// });
			res.send("<script type='text/javascript'>refresh_info(delay = 4000, message = 'Stopping " + request.server + " after authentication. ');ignore_cache = 1;$('#mdModal').modal('hide');</script>");
			break;

		case "start":
			sudo.exec('keactrl start -s ' + svr_name, options,
				function (error, stdout, stderr) {
					if (error) throw error;
					console.log('stdout: ' + stdout);
				}
			);
			// var child = sudo(['keactrl start -s ' + svr_name], options);
			// child.stdout.on('data', function (data) {
			// 	console.log(data.toString());
			res.send("<script type='text/javascript'>refresh_info(delay = 4000, message = 'Starting " + request.server + " after authentication. ');ignore_cache = 1;</script>");
			// }); 	 
			break;

		case "restart":
			sudo.exec('keactrl reload -s ' + svr_name, options,
				function (error, stdout, stderr) {
					if (error) throw error;
					console.log('stdout: ' + stdout);
				}
			);
			// var child = sudo(['keactrl reload -s ' + svr_name], options);
			// child.stdout.on('data', function (data) {
			// 	console.log(data.toString());
			res.send("<script type='text/javascript'>refresh_info(delay = 4000, message = 'Restarting " + request.server + " after authentication. '); $('#mdModal').modal('hide');</script > ");
			// });
			break;

		default:
			break;
	}

	console.log(request);

});

module.exports = router;