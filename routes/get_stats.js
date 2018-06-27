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

	// TODO: see if dhcpd-pools will work for Kea files, if parsing lease files
	// Third-party lib dhcpd-pools to parse config and lease files
	// const execSync = require('child_process').execSync;
	// output = execSync('./bin/dhcpd-pools -c ' + ante_config.config_file + ' -l ' + ante_config.leases_file + ' -f j -A -s e');
	// var kea_stats = JSON.parse(output);

	// console.log(kea_config['Dhcp4']['shared-networks'].length);

	/* Lists to store server network data */
	subnet_list = [], subnet_util = [], subnet_assgn_addr_list = [], subnet_total_addr_list = [], subnet_free_addr_list = [],
		shared_nw_util = [], shared_nw_assgn_addr_list = [], shared_nw_total_addr_list = [], shared_nw_free_addr_list = [],
		shared_nw_snet_id_list = [], subnet_pool_map = [];

	/* Calculate Shared network utilization */
	shared_nw_count = kea_config['Dhcp4']['shared-networks'].length;
	for (var i = 0; i < shared_nw_count; i++) {

		shared_nw_snet_list = [];
		kea_config['Dhcp4']['shared-networks'][i]['subnet4'].forEach(x => {
			/* Retrieve and store subnets defined within shared nw */
			x['shared_nw_name'] = kea_config['Dhcp4']['shared-networks'][i].name;
			subnet_list.push(x);
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

	/* Generate Shared nw table */
	shared_network_table = '';
	for (var i = 0; i < shared_nw_count; i++) {

		utilization = shared_nw_util[i];

		/* Define shared network row for table */
		table_row = '';
		table_row = table_row + '<td><b><a href="/nw_detail_info?type=shared-networks&id=' + kea_config['Dhcp4']['shared-networks'][i].name + '" pjax="1">' + kea_config['Dhcp4']['shared-networks'][i].name + '</a></b></td>';
		table_row = table_row + '<td>' + shared_nw_assgn_addr_list[i].toLocaleString('en') + ' </td>';
		table_row = table_row + '<td>' + shared_nw_total_addr_list[i].toLocaleString('en') + '</td>';
		table_row = table_row + '<td>' + shared_nw_free_addr_list[i].toLocaleString('en') + '</td>';

		utilization_color = 'green';

		if (utilization >= 80)
			utilization_color = 'orange';
		if (utilization >= 90)
			utilization_color = 'red';

		table_row = table_row + '<td><div class="progress">' +
			'<div class="progress-bar bg-' + utilization_color + '" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" style="width: ' + utilization + '%"></div>' +
			'<span>' + utilization + '%</span></div></td>';

		shared_network_table = shared_network_table + '<tr>' + table_row + '</tr>';
	}

	kea_config['Dhcp4']['subnet4'].forEach(sn => {
		subnet_list.push(sn);
	});

	/* Subnet sorting by ID */
	subnet_list.sort(function (a, b) {
		return parseInt(a.id) - parseInt(b.id);
	});

	// console.log(subnet_list);

	/* Calculate Subnet utilization */
	subnet_count = subnet_list.length;
	for (var i = 1; i <= subnet_count; i++) {
		utilization = round(parseFloat(kea_stats['subnet[' + i + '].assigned-addresses'][0][0] / kea_stats['subnet[' + i + '].total-addresses'][0][0]) * 100, 2);

		/* Subnet pools parser */
		pools = subnet_list[i - 1]['pools'];
		pool_range = '';
		if (pools) {
			pools.forEach(p => {
				pool_range += p.pool + '<br>';
			});
			if (pool_range == '')
				pool_range = ' - undefined - ';
		}
		// console.log(pool_range);			
		subnet_pool_map.splice(i - 1, 0, pool_range);

		if (isNaN(utilization))
			utilization = 0;

		subnet_assgn_addr_list.push(kea_stats['subnet[' + i + '].assigned-addresses'][0][0]);
		subnet_total_addr_list.push(kea_stats['subnet[' + i + '].total-addresses'][0][0]);
		subnet_free_addr_list.push(subnet_total_addr_list[i - 1] - subnet_assgn_addr_list[i - 1]);
		subnet_util.push(utilization);
		// console.log(subnet_util);
	}

	/* Generate Subnet Table */
	subnet_table = '';
	for (var i = 0; i < subnet_count; i++) {
		// console.log(subnet_list[i].pools, kea_stats['subnet[' + i+1 + '].assigned-addresses'][0][0], subnet_util[i].utilization )
		utilization = subnet_util[i];

		// TODO: Determine subnet pools (disjoint/aggregate)
		/* Define subnet row for table */
		table_row = '';
		table_row = table_row + '<td>' + subnet_list[i].id + '</td>'; //Subnet ID
		table_row = table_row + '<td><b><a href="/nw_detail_info?type=subnet4&id=' + subnet_list[i].id + '" pjax="1">' + subnet_list[i].subnet + '</a></b></td>'; //Subnet details link
		table_row = table_row + '<td>' + subnet_pool_map[i] + '</td>'; //Subnet Pool range
		table_row = table_row + '<td>' + subnet_assgn_addr_list[i].toLocaleString('en') + '</td>';
		table_row = table_row + '<td>' + subnet_total_addr_list[i].toLocaleString('en') + '</td>';
		table_row = table_row + '<td>' + subnet_free_addr_list[i].toLocaleString('en') + '</td>';

		utilization_color = 'green';

		if (utilization >= 80)
			utilization_color = 'orange';
		if (utilization >= 90)
			utilization_color = 'red';

		table_row = table_row + '<td><div class="progress">' +
			'<div class="progress-bar bg-' + utilization_color + '" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" style="width: ' + utilization + '%"></div>' +
			'<span>' + utilization + '%</span></div></td>';

		subnet_table = subnet_table + '<tr>' + table_row + '</tr>';
	}

	/* Process server run status output for display */
	svrun = run_status.replace(/server:/g, ':').replace("\n", "<br> \n")
		.replace(/\bDHCPv4\b/g, '<input name="svr-select" id="dhcp4" type="radio" class="with-gap" /><label for="dhcp4"><span>DHCPv4')
		.replace(/\bDHCPv6\b/g, '<input name="svr-select" id="dhcp6" type="radio" class="with-gap" /><label for="dhcp6"><span>DHCPv6')
		.replace(/\bactive\b/g, '<span style="color: #00a90b">Active</span></span></label>')
		.replace(/\binactive\b/g, '<span style="color: #D50000">Inactive</span></span></label>')
		.split("\n").slice(0, 2);

	response_data = {
		"cpu_utilization": cpu_utilization,
		"run_status": svrun,
		"current_server": '#' + anterius_config.current_server,
		"leases_used": total_leases,
		"leases_per_second": leases_per_sec,
		"leases_per_minute": leases_per_minute,
		"shared_network_table": shared_network_table,
		"host_name": host_name,
		"subnet_table": subnet_table
	};

	/* Test response data */
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