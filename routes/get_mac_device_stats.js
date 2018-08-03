var express = require('express');
var router = express.Router();
var fs = require('fs');
var api_agent = require('../lib/api_service.js');

router.get('/', function (req, res, next) {

    /* Construct lease-get command for specified subnets */
    if (global.anterius_config.current_server == 'dhcp4')
        lease_get_req_data = JSON.stringify({ "command": "lease4-get-all", "service": [global.anterius_config.current_server] });
    else
        lease_get_req_data = JSON.stringify({ "command": "lease6-get-all", "service": [global.anterius_config.current_server] });

    /* Fetch lease data for network*/
    var response_data = api_agent.fire_kea_api(lease_get_req_data, global.anterius_config.server_addr, global.anterius_config.server_port).then(function (api_data) {
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
            var vendor_stats = {}, device_stats = {};
            var count = 0;

            /* Leases Data parser - retrieve mac oui data */
            for (var i = 0; i < leases_data.length; i++) {

                /* Mac OUI Lookup */
                var mac_oui = leases_data[i]['hw-address'].split(":").join("").toUpperCase().slice(0, 6);

                /* Vendor List and Device Count block*/
                leases_data[i].mac_oui_vendor = '';
                if (typeof global.oui_data[mac_oui] !== "undefined") {
                    leases_data[i].mac_oui_vendor = global.oui_data[mac_oui];
                }

                if ((typeof leases_data[i].mac_oui_vendor !== "undefined" ? leases_data[i].mac_oui_vendor : 'Misc') == "")
                    continue;

                if (typeof vendor_stats[(typeof leases_data[i].mac_oui_vendor !== "undefined" ? leases_data[i].mac_oui_vendor : 'Misc')] === "undefined")
                    vendor_stats[(typeof leases_data[i].mac_oui_vendor !== "undefined" ? leases_data[i].mac_oui_vendor : 'Misc')] = 0;

                vendor_stats[(typeof leases_data[i].mac_oui_vendor !== "undefined" && leases_data[i].mac_oui_vendor != "" ? leases_data[i].mac_oui_vendor : 'Misc')]++;


                /* MAC OUI Count by vendor code block */
                if (mac_oui == "")
                    continue;

                if (typeof device_stats[mac_oui] === "undefined")
                    device_stats[mac_oui] = {};

                if (typeof device_stats[mac_oui].count === "undefined")
                    device_stats[mac_oui].count = 0;

                device_stats[mac_oui].count++;

                if (device_stats[mac_oui].mac_prefix !== "undefined") {
                    device_stats[mac_oui].mac_prefix = mac_oui;
                }

                if (device_stats[mac_oui].vendor !== "undefined") {
                    if (typeof global.oui_data[mac_oui] !== "undefined") {
                        device_stats[mac_oui].vendor = global.oui_data[mac_oui];
                    }
                }
            }

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ 'vendor_stats': vendor_stats, 'device_stats': device_stats }));
        }
    });
});
module.exports = router;
