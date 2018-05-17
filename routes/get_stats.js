var express = require('express');
var router = express.Router();
var fs = require('fs');
var http = require('http');
var template_render = require('../lib/render_template.js');

/* GET home page. */
router.get('/', function (req, res, next) {

	// var json_file = require('jsonfile');
	// var ante_config = json_file.readFileSync('config/anterius_config.json');

	//Kea REST API calls
	req_data = JSON.stringify({ "command": "statistic-get-all", "service": ["dhcp4"] });

	var options = {
		host: 'localhost',
		port: '8000',
		path: '/',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': req_data.length
		},
		method: 'POST'

	};
	var api_data;

	var req = http.request(options, function (res) {
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (body) {
			// console.log('BODY: ' + body);
			set_stats(JSON.parse(body));
		});
		res.on('end', function () {
			console.log('Total leases: ' + total_leases);

		});
	});

	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});

	req.write(req_data);
	req.end();


	// alert(api_data);


	// TODO: see if dhcpd-pools will work for Kea files
	// Third-party lib dhcpd-pools to parse config and lease files
	// const execSync = require('child_process').execSync;
	// output = execSync('./bin/dhcpd-pools -c ' + ante_config.config_file + ' -l ' + ante_config.leases_file + ' -f j -A -s e');

	// var dhcp_data = JSON.parse(output);

	// for (var i = 0; i < dhcp_data['shared-networks'].length; i++) {
	// 	utilization = round(parseFloat(dhcp_data['shared-networks'][i].used / dhcp_data['shared-networks'][i].defined) * 100, 2);
	// 	if (isNaN(utilization))
	// 		utilization = 0;

	// 	dhcp_data['shared-networks'][i].utilization = utilization;
	// }
	// dhcp_data['shared-networks'].sort(function (a, b) {
	// 	return parseFloat(b.utilization) - parseFloat(a.utilization);
	// });

	// shared_networks = '';

	// for (var i = 0; i < dhcp_data['shared-networks'].length; i++) {

	// 	utilization = dhcp_data['shared-networks'][i].utilization;

	// 	table_row = '';
	// 	table_row = table_row + '<td><b>' + dhcp_data['shared-networks'][i].location + '</b></td>';
	// 	table_row = table_row + '<td>' + dhcp_data['shared-networks'][i].used.toLocaleString('en') + ' (' + utilization + '%)</td>';
	// 	table_row = table_row + '<td class="hide_col">' + dhcp_data['shared-networks'][i].defined.toLocaleString('en') + '</td>';
	// 	table_row = table_row + '<td class="hide_col">' + dhcp_data['shared-networks'][i].free.toLocaleString('en') + '</td>';

	// 	utilization_color = 'green';

	// 	if (utilization >= 80)
	// 		utilization_color = 'orange';
	// 	if (utilization >= 90)
	// 		utilization_color = 'red';

	// 	table_row = table_row + '<td><div class="progress">' +
	// 		'<div class="progress-bar bg-' + utilization_color + '" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" style="width: ' + utilization + '%"></div>' +
	// 		'</div></td>';

	// 	shared_networks = shared_networks + '<tr>' + table_row + '</tr>';
	// }

	// /* Display All Subnets */
	// for (var i = 0; i < dhcp_data.subnets.length; i++) {
	// 	utilization = round(parseFloat(dhcp_data.subnets[i].used / dhcp_data.subnets[i].defined) * 100, 2);
	// 	if (isNaN(utilization))
	// 		utilization = 0;

	// 	dhcp_data.subnets[i].utilization = utilization;
	// }

	// dhcp_data.subnets.sort(function (a, b) {
	// 	return parseFloat(b.utilization) - parseFloat(a.utilization);
	// });

	// display_subnets = '';

	// for (var i = 0; i < dhcp_data.subnets.length; i++) {
	// 	utilization = dhcp_data.subnets[i].utilization;

	// 	table_row = '';
	// 	table_row = table_row + '<td><b>' + dhcp_data.subnets[i].location + '</b></td>';
	// 	table_row = table_row + '<td>' + dhcp_data.subnets[i].range + '</td>';
	// 	table_row = table_row + '<td>' + dhcp_data.subnets[i].used.toLocaleString('en') + ' (' + utilization + '%)</td>';
	// 	table_row = table_row + '<td class="hide_col">' + dhcp_data.subnets[i].defined.toLocaleString('en') + '</td>';
	// 	table_row = table_row + '<td class="hide_col">' + dhcp_data.subnets[i].free.toLocaleString('en') + '</td>';

	// 	utilization_color = 'green';

	// 	if (utilization >= 80)
	// 		utilization_color = 'orange';
	// 	if (utilization >= 90)
	// 		utilization_color = 'red';

	// 	table_row = table_row + '<td><div class="progress">' +
	// 		'<div class="progress-bar bg-' + utilization_color + '" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" style="width: ' + utilization + '%"></div>' +
	// 		'</div></td>';

	// 	display_subnets = display_subnets + '<tr>' + table_row + '</tr>';
	// }

	// total_leases = dhcp_data.summary.used.toLocaleString('en');

	// return_data = {
	// 	"cpu_utilization": cpu_utilization,
	// 	"leases_used": total_leases,
	// 	"leases_per_second": current_leases_per_second,
	// 	"leases_per_minute": leases_per_minute,
	// 	"shared_network_table": shared_networks,
	// 	"host_name": host_name,
	// 	"display_subnets_table": display_subnets
	// };

	// res.setHeader('Content-Type', 'application/json');
	// res.send(JSON.stringify(return_data));
});

module.exports = router;

function set_stats(api_data) {
	// console.log(api_data[0].arguments);
	total_leases = api_data[0].arguments['subnet[1].assigned-addresses'][0][0];

}

function round(num, places) {
	var multiplier = Math.pow(10, places);
	return Math.round(num * multiplier) / multiplier;
}