/*
© Anthrino > Home page statistics processor
*/
var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');

/* GET home page. */
router.get('/', function (req, res, next) {

	// var json_file = require('jsonfile');
	// var ante_config = json_file.readFileSync('config/anterius_config.json');

	// TODO: see if dhcpd-pools will work for Kea files, if parsing lease files
	// Third-party lib dhcpd-pools to parse config and lease files
	// const execSync = require('child_process').execSync;
	// output = execSync('./bin/dhcpd-pools -c ' + ante_config.config_file + ' -l ' + ante_config.leases_file + ' -f j -A -s e');
	// var kea_stats = JSON.parse(output);

	// console.log(kea_config['Dhcp4']['shared-networks'].length);

	// Calculate Shared network utilization
	shared_nw_count = kea_config['Dhcp4']['shared-networks'].length;
	shared_nw_util = [], shared_nw_assgn_addr_list = [], shared_nw_total_addr_list = [],
		shared_nw_free_addr_list = [], shared_nw_snet_id_list = [], subnet_pool_map = [];

	for (var i = 0; i < shared_nw_count; i++) {

		shared_nw_snet_id_list = [];
		kea_config['Dhcp4']['shared-networks'][i]['subnet4'].forEach(x => {
			shared_nw_snet_id_list.push(x['id']);
		});

		shared_nw_total_addr = 0, shared_nw_assgn_addr = 0;
		shared_nw_snet_id_list.forEach(k => {
			shared_nw_assgn_addr += kea_stats['subnet[' + k + '].assigned-addresses'][0][0];
			shared_nw_total_addr += kea_stats['subnet[' + k + '].total-addresses'][0][0];
		});

		// console.log(shared_nw_assgn_addr, shared_nw_total_addr);		

		utilization = round(parseFloat(shared_nw_assgn_addr / shared_nw_total_addr) * 100, 2);

		if (isNaN(utilization))
			utilization = 0;

		shared_nw_assgn_addr_list.push(shared_nw_assgn_addr);
		shared_nw_total_addr_list.push(shared_nw_total_addr);
		shared_nw_free_addr_list.push(shared_nw_total_addr - shared_nw_assgn_addr);
		shared_nw_util.push(utilization);
	}
	// TODO: Modify list sorting
	// kea_stats['shared-networks'].sort(function (a, b) {
	// 	return parseFloat(b.utilization) - parseFloat(a.utilization);
	// });

	shared_network_table = '';

	for (var i = 0; i < shared_nw_count; i++) {

		utilization = shared_nw_util[i];

		// TODO: Find and replace correct attribute value source from API
		// TODO: Verify shared network attrbute 'location' used as promary index
		// Define shared network row for table
		table_row = '';
		table_row = table_row + '<td><b>' + kea_config['Dhcp4']['shared-networks'][i].name + '</b></td>';
		table_row = table_row + '<td>' + shared_nw_assgn_addr_list[i].toLocaleString('en') + ' (' + utilization + '%)</td>';
		table_row = table_row + '<td class="hide_col">' + shared_nw_total_addr_list[i].toLocaleString('en') + '</td>';
		table_row = table_row + '<td class="hide_col">' + shared_nw_free_addr_list[i].toLocaleString('en') + '</td>';

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
	subnet4_config = kea_config['Dhcp4']['subnet4'];
	subnet_count = subnet4_config.length;
	subnet_util = [];
	for (var i = 1; i <= subnet_count; i++) {
		utilization = round(parseFloat(kea_stats['subnet[' + i + '].assigned-addresses'][0][0] / kea_stats['subnet[' + i + '].total-addresses'][0][0]) * 100, 2);
		pools = subnet4_config[i - 1]['pools'];
		pool_range = '';
		if (pools) {
			pools.forEach(p => {
				pool_range += p.pool + '<br>';
			});
			// console.log(pool_range);			
		}
		subnet_pool_map.splice(i - 1, 0, pool_range);
		if (isNaN(utilization))
			utilization = 0;

		subnet_util.push(utilization);
	}
	// TODO: Modify list sorting
	// kea_stats.subnets.sort(function (a, b) {
	// 	return parseFloat(b.utilization) - parseFloat(a.utilization);
	// });

	// Subnet pools parser

	subnet_table = '';

	for (var i = 0; i < subnet_count; i++) {
		// console.log(kea_config.Dhcp4.subnet4[i].pools[0].pool, kea_stats['subnet[' + i+1 + '].assigned-addresses'][0][0], subnet_util[i].utilization, )
		utilization = subnet_util[i];

		// TODO: Determine subnet pools (disjoint/aggregate)
		// Define subnet row for table
		table_row = '';
		table_row = table_row + '<td><b>' + kea_config.Dhcp4.subnet4[i].subnet + '</b></td>'; //Subnet 
		table_row = table_row + '<td>' + subnet_pool_map[i] + '</td>'; //Subnet Pool range
		table_row = table_row + '<td>' + kea_stats['subnet[' + (i + 1) + '].assigned-addresses'][0][0].toLocaleString('en') + ' (' + utilization + '%)</td>';
		table_row = table_row + '<td class="hide_col">' + kea_stats['subnet[' + (i + 1) + '].total-addresses'][0][0].toLocaleString('en') + '</td>';
		// table_row = table_row + '<td class="hide_col">' + kea_stats.subnets[i].free.toLocaleString('en') + '</td>';

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

	svrun = run_status.replace('server:', ':').replace('server:', ':').replace("\n", "<br> \n")
		.replace('active', '<span style="color: #00a90b">Active</span>')
		.replace('inactive', '<span style="color: #D50000">Inactive</span>')
		.split("\n").slice(0, 2);

	response_data = {
		"cpu_utilization": cpu_utilization,
		"run_status": svrun,
		"leases_used": total_leases,
		"leases_per_second": leases_per_sec,
		"leases_per_minute": leases_per_minute,
		"shared_network_table": shared_network_table,
		"host_name": host_name,
		"subnet_table": subnet_table
	};

	// Test response data
	// response_data = {
	// 	"cpu_utilization": Math.random(200),
	// 	"leases_used": Math.random(200),
	// 	"leases_per_second": Math.random(200),
	// 	"leases_per_minute": Math.random(200),
	// 	"shared_network_table": '',
	// 	"host_name": 'alcatraz',
	// 	"subnet_table": ''
	// };

	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(response_data));
});

module.exports = router;

function round(num, places) {
	var multiplier = Math.pow(10, places);
	return Math.round(num * multiplier) / multiplier;
}