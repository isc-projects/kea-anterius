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
			console.log(kea_stats);
		});
	});

	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});

	req.write(req_data);
	req.end();

	// TODO: see if dhcpd-pools will work for Kea files, if parsing lease files
	// Third-party lib dhcpd-pools to parse config and lease files
	// const execSync = require('child_process').execSync;
	// output = execSync('./bin/dhcpd-pools -c ' + ante_config.config_file + ' -l ' + ante_config.leases_file + ' -f j -A -s e');

	// var kea_stats = JSON.parse(output);

	// Calculate Shared network utilization
	shared_nw_count = kea_config['Dhcp4']['shared-networks'].length;
	shared_nw_util = [];
	for (var i = 0; i < shared_nw_count; i++) {
		// TODO: Check whether assigned addresses is updated with reclaimed, else use assigned - reclaimed
		utilization = round(parseFloat(kea_stats['shared-network[' + i + '].assigned-addresses'][0][0] / kea_stats['shared-network[' + i + '].total-addresses'][0][0]) * 100, 2);

		if (isNaN(utilization))
			utilization = 0;

		shared_nw_util.push(utilization);
	}
	// TODO: Modify list sorting
	// kea_stats['shared-networks'].sort(function (a, b) {
	// 	return parseFloat(b.utilization) - parseFloat(a.utilization);
	// });

	shared_network_table = '';

	for (var i = 1; i <= shared_nw_count; i++) {

		utilization = shared_nw_util[i];

		// TODO: Find and replace correct attribute value source from API
		// Define shared network row for table
		table_row = '';
		table_row = table_row + '<td><b>' + kea_stats['shared-networks'][i].location + '</b></td>';
		table_row = table_row + '<td>' + kea_stats['shared-networks'][i].used.toLocaleString('en') + ' (' + utilization + '%)</td>';
		table_row = table_row + '<td class="hide_col">' + kea_stats['shared-networks'][i].defined.toLocaleString('en') + '</td>';
		table_row = table_row + '<td class="hide_col">' + kea_stats['shared-networks'][i].free.toLocaleString('en') + '</td>';

		utilization_color = 'green';

		if (utilization >= 80)
			utilization_color = 'orange';
		if (utilization >= 90)
			utilization_color = 'red';

		table_row = table_row + '<td><div class="progress">' +
			'<div class="progress-bar bg-' + utilization_color + '" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" style="width: ' + utilization + '%"></div>' +
			'</div></td>';

		shared_network_table = shared_network_table + '<tr>' + table_row + '</tr>';
	}

	// Calculate Subnet utilization
	// TODO: Find source for subnet count
	subnet_count = kea_config['Dhcp4']['subnets'].length;
	subnet_util = [];
	for (var i = 1; i <= subnet_count; i++) {
		// TODO: Check whether assigned addresses is updated with reclaimed, else use assigned - reclaimed
		utilization = round(parseFloat(kea_stats['subnet[' + i + '].assigned-addresses'][0][0] / kea_stats['subnet[' + i + '].total-addresses'][0][0]) * 100, 2);

		if (isNaN(utilization))
			utilization = 0;

		shared_nw_util.push(utilization);
	}
	// TODO: Modify list sorting
	// kea_stats.subnets.sort(function (a, b) {
	// 	return parseFloat(b.utilization) - parseFloat(a.utilization);
	// });

	subnet_table = '';

	for (var i = 0; i < kea_stats.subnets.length; i++) {
		utilization = kea_stats.subnets[i].utilization;
		
		// TODO: Find and replace correct attribute value source from API
		// Define subnet row for table
		table_row = '';
		table_row = table_row + '<td><b>' + kea_stats.subnets[i].location + '</b></td>';
		table_row = table_row + '<td>' + kea_stats.subnets[i].range + '</td>';
		table_row = table_row + '<td>' + kea_stats.subnets[i].used.toLocaleString('en') + ' (' + utilization + '%)</td>';
		table_row = table_row + '<td class="hide_col">' + kea_stats.subnets[i].defined.toLocaleString('en') + '</td>';
		table_row = table_row + '<td class="hide_col">' + kea_stats.subnets[i].free.toLocaleString('en') + '</td>';

		utilization_color = 'green';

		if (utilization >= 80)
			utilization_color = 'orange';
		if (utilization >= 90)
			utilization_color = 'red';

		table_row = table_row + '<td><div class="progress">' +
			'<div class="progress-bar bg-' + utilization_color + '" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" style="width: ' + utilization + '%"></div>' +
			'</div></td>';

		subnet_table = subnet_table + '<tr>' + table_row + '</tr>';
	}

	response_data = {
		"cpu_utilization": cpu_utilization,
		"leases_used": total_leases,
		"leases_per_second": current_leases_per_second,
		"leases_per_minute": leases_per_minute,
		"shared_network_table": shared_network_table,
		"host_name": host_name,
		"subnet_table": subnet_table
	};

	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(response_data));
});

module.exports = router;

function set_stats(api_data) {
	// console.log(api_data[0].arguments);
	kea_stats = api_data[0].arguments;

}

function round(num, places) {
	var multiplier = Math.pow(10, places);
	return Math.round(num * multiplier) / multiplier;
}