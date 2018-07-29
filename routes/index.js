var app = require('../app');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');

/* GET home page. */
router.get('/', function (req, res, next) {

	/* Initialize homepage templates */
	counters = template_render.get_template("counters");
	content_shared_networks = template_render.get_template("shared_nw_table");
	content_subnets = template_render.get_template("subnet_table");

	/* Server online check */
	if (server_active == 1) {

		/* Update Stats */
		app.reload();

		/* Lists to store server network data */
		subnet_list = [], subnet_util = [], subnet_assgn_addr_list = [], subnet_total_addr_list = [], subnet_free_addr_list = [],
			shared_nw_util = [], shared_nw_assgn_addr_list = [], shared_nw_total_addr_list = [], shared_nw_free_addr_list = [],
			shared_nw_snet_id_list = [], subnet_pool_map = [];

		/* Calculate Shared network utilization */
		shared_nw_count = server.server_config[server.svr_tag]['shared-networks'].length;
		for (var i = 0; i < shared_nw_count; i++) {

			shared_nw_snet_list = [];
			server.server_config[server.svr_tag]['shared-networks'][i][server.sn_tag].forEach(x => {
				/* Retrieve and store subnets defined within shared nw */
				x['shared_nw_name'] = server.server_config[server.svr_tag]['shared-networks'][i].name;
				subnet_list.push(x);
				shared_nw_snet_id_list.push(x['id']);
			});

			shared_nw_total_addr = 0, shared_nw_assgn_addr = 0;
			shared_nw_snet_id_list.forEach(k => {
				shared_nw_assgn_addr += kea_stats['subnet[' + k + '].assigned-' + server.addr_tag][0][0];
				shared_nw_total_addr += kea_stats['subnet[' + k + '].total-' + server.addr_tag][0][0];
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
			table_row = table_row + '<td><b><a href="/nw_detail_info?type=shared-networks&id=' + server.server_config[server.svr_tag]['shared-networks'][i].name + '" pjax="1">' + server.server_config[server.svr_tag]['shared-networks'][i].name + '</a></b></td>';
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

		server.server_config[server.svr_tag][server.sn_tag].forEach(sn => {
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
			utilization = round(parseFloat(kea_stats['subnet[' + i + '].assigned-' + server.addr_tag][0][0] / kea_stats['subnet[' + i + '].total-' + server.addr_tag][0][0]) * 100, 2);

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

			subnet_assgn_addr_list.push(kea_stats['subnet[' + i + '].assigned-' + server.addr_tag][0][0]);
			subnet_total_addr_list.push(kea_stats['subnet[' + i + '].total-' + server.addr_tag][0][0]);
			subnet_free_addr_list.push(subnet_total_addr_list[i - 1] - subnet_assgn_addr_list[i - 1]);
			subnet_util.push(utilization);
			// console.log(subnet_util);
		}

		/* Generate Subnet Table */
		subnet_table = '';
		for (var i = 0; i < subnet_count; i++) {
			// console.log(subnet_list[i].pools, kea_stats['subnet[' + i+1 + '].assigned-'+server.addr_tag][0][0], subnet_util[i].utilization )
			utilization = subnet_util[i];

			// TODO: Determine subnet pools (disjoint/aggregate)
			/* Define subnet row for table */
			table_row = '';
			table_row = table_row + '<td>' + subnet_list[i].id + '</td>'; //Subnet ID
			table_row = table_row + '<td><b><a href="/nw_detail_info?type=' + server.sn_tag + '&id=' + subnet_list[i].id + '" pjax="1">' + subnet_list[i].subnet + '</a></b></td>'; //Subnet details link
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

		if (anterius_config.server_host_list) {
			svr_host_list = '<option value="" disabled>Choose Kea machine</option>'
			anterius_config.server_host_list.forEach(function (host, index) {
				svr_host_list += '<option value="' + index + '" id="server-host' + index + '" >' + host.hostname + '</option>';
			});

			if (anterius_config.current_host_index == '-1')
				svr_host_list = svr_host_list.replace('<option value=""', '<option value="" selected');
			else
				svr_host_list = svr_host_list.replace('<option value="' + anterius_config.current_host_index + '"', '<option value="' + anterius_config.current_host_index + '" selected');

		} else
			svr_host_list = '<option value="" disabled selected>No server hosts configured</option>';


		if (anterius_config.server_addr != 'localhost' && anterius_config.server_addr != '127.0.0.1') {
			cpu_utilization = 'Information not available for remote servers.';
			svrun = 'Information not available for remote servers.';
		}
		else {
			/* Process server run status output for display */
			svrun = run_status.replace(/server:/g, ':').replace("\n", "<br> \n")
				.replace(/\bDHCPv4\b/g, '<input name="svrselect" id="dhcp4" value="dhcp4" type="radio" class="with-gap" /><label for="dhcp4"><span>DHCPv4')
				.replace(/\bDHCPv6\b/g, '<input name="svrselect" id="dhcp6" value="dhcp6" type="radio" class="with-gap" /><label for="dhcp6"><span>DHCPv6')
				.replace(/\bactive\b/g, '<span style="color: #00a90b">Active</span></span></label>')
				.replace(/\binactive\b/g, '<span style="color: #D50000">Inactive</span></span></label>')
				.split("\n").slice(0, 2);

			svrun.forEach(function (svr, index, svr_list) {
				/* Check if inactive server */
				if (svr.includes('Inactive'))
					svr_list[index] = svr.replace('type="radio"', 'type="radio" disabled');

				/* Check if current server */
				if (svr.includes(anterius_config.current_server))
					svr_list[index] = svr.replace('type="radio"', 'type="radio" checked');
			});
		}

		/* Set counter param values */
		counters.replace(/Loading../g, '');
		counters = template_render.set_template_variable(counters, "svr_host_list", svr_host_list);
		counters = template_render.set_template_variable(counters, "run_status", svrun);
		counters = template_render.set_template_variable(counters, "leases_ps", leases_per_sec);
		counters = template_render.set_template_variable(counters, "leases_pm", leases_per_minute);
		counters = template_render.set_template_variable(counters, "total_active_leases", total_leases);
		counters = template_render.set_template_variable(counters, "cpu_utilzn", cpu_utilization);

		/* Set Shared NW table params*/
		content_shared_networks = template_render.set_template_variable(content_shared_networks, "title", "Shared Networks");
		content_shared_networks = template_render.set_template_variable(content_shared_networks, "table_id", "shared-networks");
		content_shared_networks = template_render.set_template_variable(content_shared_networks, "table_dim", "col-xs-12 col-sm-12 col-md-6 col-lg-6");
		content_shared_networks = template_render.set_template_variable(content_shared_networks, "table_content", shared_network_table);

		/* Set Subnet table params*/
		content_subnets = template_render.set_template_variable(content_subnets, "title", "Subnets");
		content_subnets = template_render.set_template_variable(content_subnets, "table_id", "subnets");
		content_subnets = template_render.set_template_variable(content_subnets, "table_dim", "col-xs-12 col-sm-12 col-md-6 col-lg-6");
		content_subnets = template_render.set_template_variable(content_subnets, "table_content", subnet_table);


		res.send(
			template_render.get_index_template(
				counters +
				'<div class="row clearfix">' +
				content_shared_networks + content_subnets +
				'</div>',
				req.url
			) + '<script type="text/javascript">get_stats(); $("select").selectpicker(); </script>'

		);
	}

	/* If server = inactive */
	else {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({ 'Err': 'Server Error: Verify Server Status and CA address' }));
	}

});

function round(num, places) {
	var multiplier = Math.pow(10, places);
	return Math.round(num * multiplier) / multiplier;
}

module.exports = router;