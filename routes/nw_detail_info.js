/*
© Anthrino > Network detailed info route
*/
var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

router.get('/', function (req, res, next) {

    var pools, subnet, host_res;
    let id = req.query.id.replace('?v_ajax', '');

    utilization = parseFloat(kea_stats['subnet[' + id + '].assigned-addresses'][0][0]
        / kea_stats['subnet[' + id + '].total-addresses'][0][0]) * 100;
    if (isNaN(utilization))
        utilization = 0;

    utilization_color = 'green';

    if (utilization >= 80)
        utilization_color = 'orange';
    if (utilization >= 90)
        utilization_color = 'red';

    utilization_html = '<div class="progress-bar bg-' + utilization_color +
        '" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" style="width: ' + utilization + '%"></div>';

    kea_config['Dhcp4']['subnet4'].forEach(s => {
        if (s.id == id) {
            pools = s.pools;
            subnet = s.subnet;
            host_res = s.reservations;
        }
    });

    // console.log(host_res);
    
    // Host reservation parser

	host_res_table = '';

	for (var i = 0; i < host_res.length; i++) {
		// console.log(kea_config.Dhcp4.subnet4[i].pools[0].pool, kea_stats['subnet[' + i+1 + '].assigned-addresses'][0][0], subnet_util[i].utilization, )

		// Define reservation row for table
		table_row = '';
        table_row = table_row + '<td>' + host_res[i]['ip-address'] + '</td>';
		table_row = table_row + '<td>' + host_res[i]['server-hostname'] + '</td>';        
		table_row = table_row + '<td>' + host_res[i].hostname + '</td>';
		table_row = table_row + '<td>' + host_res[i]['client-id'] + '</td>';
		table_row = table_row + '<td>' + host_res[i]['next-server'] + '</td>';
		table_row = table_row + '<td>' + host_res[i]['hw-address'] + '</td>';
        
        // TODO: modify for edit link
        // table_row = table_row + '<td><b><a href="/nw_detail_info?id=' + kea_config.Dhcp4.subnet4[i].id + '" pjax="1">' + kea_config.Dhcp4.subnet4[i].subnet + '</a></b></td>'; //Subnet details link
        table_row = table_row.replace(/<td><\/td>/g, '<td> -- </td>');
        console.log(table_row);
		host_res_table = host_res_table + '<tr>' + table_row + '</tr>';
    }
    
    pool_range = '';
    if (pools) {
        pools.forEach(p => {
            pool_range += p.pool + '<br>';
        });
        if (pool_range == '')
            pool_range = ' - undefined - ';
    }
    // console.log(pool_range, subnet);

    var content = "";
    content = template_render.get_template("nw_detail_info");

    content = template_render.set_template_variable(content, "title", "Subnet [" + subnet + "] Information");
    content = template_render.set_template_variable(content, "subnet", subnet);
    content = template_render.set_template_variable(content, "utilzn_bar", utilization_html);
    content = template_render.set_template_variable(content, "host_res_table", host_res_table);
    content = template_render.set_template_variable(content, "pools", pool_range)
    content = template_render.set_template_variable(content, "assgn_addr", kea_stats['subnet[' + id + '].assigned-addresses'][0][0]);
    content = template_render.set_template_variable(content, "total_addr", kea_stats['subnet[' + id + '].total-addresses'][0][0]);
    content = template_render.set_template_variable(content, "free_addr", kea_stats['subnet[' + id + '].total-addresses'][0][0] - kea_stats['subnet[' + id + '].assigned-addresses'][0][0]);

    res.send(template_render.get_index_template(content, req.url));
});

module.exports = router;