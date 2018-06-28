/*
© Anthrino > Network detailed info route
*/
var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');
var api_agent = require('../lib/api_service.js');

router.get('/', function (req, res, next) {

    var content = "";
    content = template_render.get_template("nw_detail_info");

    /* Network Info variables */
    var id = [], pools = [], subnets = [], subnet_util = [], host_res = [], leases_data = [], shared_nw;
    var nw_total_addr = 0, nw_free_addr = 0, nw_assgn_addr = 0;
    var content_subnets = '', subnet_table = '', host_res_table = '', leases_data_table = '';

    // console.log(subnet_list);

    /* Filter info specific to requested subnet */
    if (req.query.type == sn_tag) {
        id = req.query.id.replace('?v_ajax', '');
        subnet_list.forEach(s => {
            if (s.id == id) {
                pools.push(s.pools);
                subnets.push(s);
                s.reservations.forEach(resv => {
                    resv['subnet-id'] = s.id;
                    host_res.push(resv);
                });
                // TODO: make effecient
                // break;
            }
        });
        nw_assgn_addr += kea_stats['subnet[' + id + '].assigned-' + addr_tag][0][0];
        nw_total_addr += kea_stats['subnet[' + id + '].total-' + addr_tag][0][0];
        content = template_render.set_template_variable(content, "title", "Subnet [" + subnets[0].subnet + "] Information");

    }
    /* Filter info specific to requested shared network */
    else {
        shared_nw = req.query.id.replace('?v_ajax', '');
        server_config['shared-networks'].forEach(s => {

            if (s.name == shared_nw) {
                s[sn_tag].forEach(x => {
                    id.push(x['id']);
                });

                /* Identify subnets defined within shared nw */
                subnet_list.forEach(sn => {
                    if (id.includes(sn.id)) {
                        pools.push(sn.pools);
                        subnets.push(sn);
                        sn.reservations.forEach(resv => {
                            resv['subnet-id'] = sn.id;
                            host_res.push(resv);
                        });
                        sn_assgn = kea_stats['subnet[' + sn.id + '].assigned-' + addr_tag][0][0];
                        sn_total = kea_stats['subnet[' + sn.id + '].total-' + addr_tag][0][0];
                        nw_assgn_addr += sn_assgn;
                        nw_total_addr += sn_total;

                        subnet_util.push([sn_assgn, sn_total, parseFloat(sn_assgn / sn_total) * 100]);
                    }
                });
                // TODO: make effecient
                // break;
                // console.log(subnets);

                /* Generate Subnet Table */
                for (var i = 0; i < subnets.length; i++) {

                    sn_utilzn = subnet_util[i][2];
                    if (isNaN(sn_utilzn))
                        sn_utilzn = 0;

                    pool_range = '';
                    pools[i].forEach(p => {
                        if (p.pool != undefined)
                            pool_range += p.pool + '<br>';
                    });
                    if (pool_range == '')
                        pool_range = ' - undefined - ';

                    table_row = '';
                    table_row = table_row + '<td>' + subnets[i].id + '</td>'; //Subnet ID
                    table_row = table_row + '<td><b><a href="/nw_detail_info?type=' + sn_tag + '&id=' + subnets[i].id + '" pjax="1">' + subnets[i].subnet + '</a></b></td>'; //Subnet details link
                    table_row = table_row + '<td>' + pool_range + '</td>'; //Subnet Pool range
                    table_row = table_row + '<td>' + subnet_util[i][0].toLocaleString('en') + ' (' + sn_utilzn + '%)</td>';
                    table_row = table_row + '<td>' + subnet_util[i][1].toLocaleString('en') + '</td>';
                    table_row = table_row + '<td>' + (subnet_util[i][1] - subnet_util[i][0]).toLocaleString('en') + '</td>';

                    utilization_color = 'green';

                    if (sn_utilzn >= 80)
                        utilization_color = 'orange';
                    if (sn_utilzn >= 90)
                        utilization_color = 'red';

                    table_row = table_row + '<td><div class="progress">' +
                        '<div class="progress-bar bg-' + utilization_color + '" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" style="width: ' + sn_utilzn + '%"></div>' +
                        '</div></td>';

                    subnet_table = subnet_table + '<tr>' + table_row + '</tr>';
                }

                content = template_render.set_template_variable(content, "title", "Shared Network [" + shared_nw + "] Information");

                /* Display Subnets table */
                content_subnets = template_render.get_template("subnet_table");
                content_subnets = template_render.set_template_variable(content_subnets, "title", "Shared Network Subnets");
                content_subnets = template_render.set_template_variable(content_subnets, "table_id", "sharednw-subnet-table");
                content_subnets = template_render.set_template_variable(content_subnets, "table_content", subnet_table);
                content_subnets = template_render.set_template_variable(content_subnets, "table_dim", "col-lg-12 col-md-12 col-sm-12 col-xs-12");
            }
        });
    }

    // console.log(pools, subnets, host_res, subnet_util);

    nw_free_addr = nw_total_addr - nw_assgn_addr;
    var utilization = parseFloat(nw_assgn_addr / nw_total_addr) * 100;

    if (isNaN(utilization))
        utilization = 0;

    utilization_color = 'green';

    if (utilization >= 80)
        utilization_color = 'orange';
    if (utilization >= 90)
        utilization_color = 'red';

    utilization_html = '<td><div class="progress"><div class="progress-bar bg-' + utilization_color +
        '" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" style="width: ' + utilization + '%"></div>' +
        '<span>' + utilization + '%</span></div></td>';


    /* Host reservation parser - generate table*/
    for (var i = 0; i < host_res.length; i++) {
        // console.log(subnets[i].pools[0].pool, kea_stats['subnet[' + i+1 + '].assigned-'+addr_tag][0][0], subnet_util[i].utilization, )

        /* Define reservation row for table */
        table_row = '';
        table_row = table_row + '<td>' + host_res[i]['ip-address'] + '</td>';
        table_row = table_row + '<td>' + host_res[i]['server-hostname'] + '</td>';
        table_row = table_row + '<td>' + host_res[i].hostname + '</td>';
        table_row = table_row + '<td>' + host_res[i]['client-id'] + '</td>';
        table_row = table_row + '<td>' + host_res[i]['next-server'] + '</td>';
        table_row = table_row + '<td>' + host_res[i]['hw-address'] + '</td>';
        table_row = table_row + '<td><button type="button" class="btn waves-effect" onclick="edit_params(\'' + host_res[i]['ip-address'] + ':' + host_res[i]['subnet-id'] + '\')">'
            + '<i class="material-icons">edit</i></button></td >';

        /* remove subnet-id explicitly added property */
        delete host_res[i]['subnet-id'];

        // TODO: modify for edit link
        // table_row = table_row + '<td><b><a href="/nw_detail_info?id=' + subnets[i].id + '" pjax="1">' + subnets[i].subnet + '</a></b></td>'; //Subnet details link
        table_row = table_row.replace(/<td><\/td>/g, '<td> -- </td>');
        // console.log(table_row);
        host_res_table = host_res_table + '<tr>' + table_row + '</tr>';
    }

    if (!Array.isArray(id))
        id = [Number(id)];
    // console.log(id);

    /* Construct lease-get command for specified subnets */
    if (anterius_config.current_server == 'dhcp4')
        lease_get_req_data = JSON.stringify({ "command": "lease4-get-all", "service": [anterius_config.current_server], "arguments": { "subnets": id } });
    else
        lease_get_req_data = JSON.stringify({ "command": "lease6-get-all", "service": [anterius_config.current_server], "arguments": { "subnets": id } });

    /* Fetch lease data for network*/
    var response_data = api_agent.fire_kea_api(lease_get_req_data).then(function (api_data) {
        // console.log(api_data);
        return api_data;
    });

    response_data.then(function (data) {

        if (data.result == 1) {
            notification(data.text, 'bg-red', 3000);
            console.log("CA Error:" + data.text);
        }
        else {
            leases_data = data.arguments.leases;
            // console.log(leases_data);

            /* Leases Data parser - generate table */
            for (var i = 0; i < leases_data.length; i++) {

                /* Define lease row for table */
                table_row = '';
                table_row = table_row + '<td>' + leases_data[i]['ip-address'] + '</td>';
                table_row = table_row + '<td>' + leases_data[i]['client-id'] + '</td>';
                table_row = table_row + '<td>' + leases_data[i]['valid-lft'] + '</td>';
                table_row = table_row + '<td>' + leases_data[i].hostname + '</td>';
                table_row = table_row + '<td>' + '</td>';
                table_row = table_row + '<td><button type="button" class="btn waves-effect" onclick="edit_params(\'' + leases_data[i]['ip-address'] + ':' + leases_data[i]['subnet-id'] + '\')">'
                    + '<i class="material-icons">edit</i></button></td >';

                /* remove explicitly added property */
                // delete leases_data[i]['username'];

                // TODO: modify for edit link
                // table_row = table_row + '<td><b><a href="/nw_detail_info?id=' + subnets[i].id + '" pjax="1">' + subnets[i].subnet + '</a></b></td>'; //Subnet details link
                table_row = table_row.replace(/<td><\/td>/g, '<td> -- </td>');
                // console.log(table_row);
                leases_data_table = leases_data_table + '<tr>' + table_row + '</tr>';
            }

            // console.log(subnet_table, host_res_table);    

            pool_range = '';
            if (pools) {
                pools.forEach(pl => {
                    pl.forEach(p => {
                        if (p.pool != undefined)
                            pool_range += p.pool + '<br>';
                    });
                    if (pool_range == '')
                        pool_range = ' - undefined - ';
                });
            }
            // console.log(pool_range, subnet);
        }

        /* Load diplay element values onto template and return page */
        content = template_render.set_template_variable(content, "utilzn_bar", utilization_html);
        content = template_render.set_template_variable(content, "utilizn", utilization);
        content = template_render.set_template_variable(content, "subnet_table", content_subnets);
        content = template_render.set_template_variable(content, "host_res_table", host_res_table);
        content = template_render.set_template_variable(content, "leases_data_table", leases_data_table);
        content = template_render.set_template_variable(content, "pools", pool_range)
        content = template_render.set_template_variable(content, "assgn_addr", nw_assgn_addr);
        content = template_render.set_template_variable(content, "total_addr", nw_total_addr);
        content = template_render.set_template_variable(content, "free_addr", nw_free_addr);

        res.send(template_render.get_index_template(content, req.url) + '<script type="text/javascript">get_stats(); </script>');
    });

});

module.exports = router;