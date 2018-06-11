/*
© Anthrino > Network detailed info route
*/
var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

router.get('/', function (req, res, next) {

    var pools, subnet;
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
        }
    });


    pool_range = '';
    if (pools) {
        pools.forEach(p => {
            pool_range += p.pool + '<br>';
        });
        if (pool_range == '')
            pool_range = ' - undefined - ';
    }
    console.log(pool_range, subnet);

    var content = "";
    content = template_render.get_template("nw_detail_info");

    content = template_render.set_template_variable(content, "title", "Subnet [" + subnet + "] Information");
    content = template_render.set_template_variable(content, "subnet", subnet);
    content = template_render.set_template_variable(content, "utilzn_bar", utilization_html);
    content = template_render.set_template_variable(content, "pools", pool_range)
    content = template_render.set_template_variable(content, "assgn_addr", kea_stats['subnet[' + id + '].assigned-addresses'][0][0]);
    content = template_render.set_template_variable(content, "total_addr", kea_stats['subnet[' + id + '].total-addresses'][0][0]);
    content = template_render.set_template_variable(content, "free_addr", kea_stats['subnet[' + id + '].total-addresses'][0][0] - kea_stats['subnet[' + id + '].assigned-addresses'][0][0]);

    res.send(template_render.get_index_template(content, req.url));
});

module.exports = router;