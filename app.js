/*
© Anthrino > Express APP
*/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var tail_module = require('always-tail2');

const execSync = require('child_process').execSync;

var app = express();

var api_agent = require('./lib/api_service.js');

/* Read Config */
var json_file = require('jsonfile');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* URL Routes */
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/get_stats', require('./routes/get_stats'));
app.use('/nw_detail_info', require('./routes/nw_detail_info'));
app.use('/dhcp_statistics', require('./routes/dhcp_statistics_page'));
app.use('/get_mac_device_stats', require('./routes/get_mac_device_stats'));
app.use('/dhcp_leases', require('./routes/dhcp_leases'));
app.use('/dhcp_lease_search', require('./routes/dhcp_lease_search'));
app.use('/dhcp_log', require('./routes/dhcp_log'));
app.use('/dhcp_config', require('./routes/dhcp_config'));
app.use('/dhcp_config_snapshots', require('./routes/dhcp_config_snapshots'));
app.use('/dhcp_config_snapshot_view', require('./routes/dhcp_config_snapshot_view'));
app.use('/dhcp_config_update', require('./routes/dhcp_config_update'));
app.use('/dhcp_boot_ops', require('./routes/dhcp_boot_ops'));
app.use('/anterius_settings', require('./routes/anterius_settings'));
app.use('/anterius_alerts', require('./routes/alerts_config'));
app.use('/anterius_alert_settings_save', require('./routes/anterius_alert_settings_save'));
app.use('/anterius_settings_save', require('./routes/anterius_settings_save'));

/* Glass API Routes - disabled */
// app.use('/api/get_subnet_details/', require('./api/get_subnet_details'));
// app.use('/api/get_vendor_count/', require('./api/get_vendor_count'));
// app.use('/api/get_mac_oui_count_by_vendor/', require('./api/get_mac_oui_count_by_vendor'));
// app.use('/api/get_dhcp_requests/', require('./api/get_dhcp_requests'));
// app.use('/api/get_server_info/', require('./api/get_server_info'));
// app.use('/api/get_mac_oui_list/', require('./api/get_mac_oui_list'));

app.set('view engine', 'html');

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/* Error handler */
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send(err.message);
});

module.exports = app;

/* Anterius Data Model - Global Statistics Variables */
kea_stats = {};
kea_config = {};
anterius_config = json_file.readFileSync('config/anterius_config.json');

/* Identifiers for current server */
server = { 'server_config[server.svr_tag]': {}, 'svr_tag': '', 'sn_tag': '', 'server.addr_tag': '' };

/* Dir for config file snapshots */
bkp_dir = "config_backups/" + anterius_config.current_server;

leases_per_minute = 0;
cpu_utilization = -1;
total_leases = -1;
current_time = 0;
lps = -1;
leases_per_sec = 0;
leases_last_update_time = -1;

listening_to_log_file = 0;

subnet_list = [];

options = {};
options.interval = 1000;

debug_watch_lease_parse_stream = 0;

if (anterius_config.ip_ranges_to_allow != "") {
    var ip_filter = require('express-ipfilter').IpFilter;
    var ips = anterius_config.ip_ranges_to_allow;
    app.use(ip_filter(ips, { mode: 'allow' }));
}

// TODO: Mechanism to retrieve below sections from remote machine
host_name = execSync("cat /etc/hostname").toString().replace("\n", "");
run_status = execSync("keactrl status").toString();

/* Poll: CPU Utilization */
cpu_utilization_poll = setInterval(function () {
    cpu_utilization = parseFloat(execSync("top -bn 1 | awk 'NR>7{s+=$9} END {print s/4}'").toString())
}, (15 * 1000));


/* Kea CA REST API call - config-get and statistics-get */
stats_req_data = JSON.stringify({ "command": "statistic-get-all", "service": [anterius_config.current_server] });
config_get_req_data = JSON.stringify({ "command": "config-get", "service": [anterius_config.current_server] });

/* Fetch and set server stats*/
api_agent.fire_kea_api(stats_req_data, anterius_config.server_addr, anterius_config.server_port).then(function (api_data) {
    // console.log(api_data);
    if (api_data.result == 0)
        kea_stats = api_data.arguments;
    else
        console.log("CA Error:" + api_data.text);
});

/* Fetch and set server config*/
api_agent.fire_kea_api(config_get_req_data, anterius_config.server_addr, anterius_config.server_port).then(function (api_data) {
    // console.log(api_data);
    if (api_data.result == 0)
        kea_config = api_data.arguments;
    else
        console.log("CA Error:" + api_data.text);
});

/* Ingest OUI Database */
fs = require('fs');
var oui_database_file = "bin/oui_table.txt";

/* Global oui_data bucket */
oui_data = {};
if (fs.existsSync(oui_database_file)) {
    fs.readFile(oui_database_file, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        else {
            /* Iterate through file */
            lines = data.split("\n");
            for (l = 0; l < lines.length; l++) {
                /* Trim whitespaces at each ends of the line */
                lines[l] = lines[l].trim();
                var oui_line_data = lines[l].split(":::");

                if (typeof oui_line_data[1] !== "undefined")
                    oui_data[oui_line_data[0].trim()] = oui_line_data[1].trim();
            }
            console.log("Anterius Server> OUI Database Loaded");
        }
    });
}

/**
 * Ingest Current Lease File (On System File)
 */
// var lease_parser = require('./lib/lease_parser.js');
// dhcp_lease_data = {};
// lease_read_buffer = "";

// fs = require('fs');
// fs.readFile(anterius_config.leases_file, 'utf8', function (err, data) {
//     if (err) {
//         return console.log(err);
//     }
//     else {
//         lease_parser.parse(data);
//         console.log("Anterius Server> Leases file loaded");
//     }
// });

/**
 * Leases File Listener <memfile> - calculate leases/sec
 */
// tail = new tail_module(
//     anterius_config.leases_file,
//     "\n",
//     options
// );

// tail.on("line", function (data) {
//     unix_time = Math.floor(new Date() / 1000);

//     /* Buffering lines until we get full lease data */
//     lease_read_buffer = lease_read_buffer + data + "\n";

//     /* End of lease - cut off and parse the buffer */
//     if (/}/i.test(data)) {
//         lease_parser.parse(lease_read_buffer);
//         lease_read_buffer = "";
//     }

//     /* Count leases per second */
//     if (/lease/.test(data)) {
//         lps++;
//     }
//     if (current_time != unix_time) {
//         current_time = unix_time;
//         leases_per_sec = lps;
//         leases_last_update_time = unix_time;
//         lps = 0;
//     }
// });


var dashboard_timer = setInterval(function () {
    // console.log("Checking timers...");
    unix_time = Math.floor(new Date() / 1000);
    if ((unix_time - 5) > leases_last_update_time) {
        leases_per_sec = 0;
    }

    // console.log(JSON.stringify(dhcp_lease_data, null, 2));

}, 5000);


/* Leases per minute calculator */
var lps_list = [0];
var lpm_counter = 0;

/* Recurrent Loop for lease stats */
var lease_stats_monitor = function () {

    /* Fetch running status */
    // TODO: Mechanism to retrieve below sections from remote machine
    run_status = execSync("keactrl status").toString();

    /* Kea CA REST API call - config-get and statistics-get */
    stats_req_data = JSON.stringify({ "command": "statistic-get-all", "service": [anterius_config.current_server] });
    config_get_req_data = JSON.stringify({ "command": "config-get", "service": [anterius_config.current_server] });


    /* Fetch and set server config*/
    var response_data = api_agent.fire_kea_api(config_get_req_data, anterius_config.server_addr, anterius_config.server_port).then(function (api_data) {
        return api_data;
    });
    response_data.then(function (data) {
        if (data.result == 0 && data.arguments != undefined) {
            kea_config = data.arguments;
            subnet_list = [];
            server.server_config = kea_config;

            /* Set identifiers based on current server */
            if (anterius_config.current_server == 'dhcp4') {
                server.svr_tag = 'Dhcp4';
                server.sn_tag = 'subnet4';
                server.addr_tag = 'addresses';
            }
            else {
                server.svr_tag = 'Dhcp6';
                server.sn_tag = 'subnet6';
                server.addr_tag = 'pds';
            }

            // console.log(server.server_config[server.svr_tag], server.sn_tag, server.addr_tag);

            /* Retrieve and store subnets defined within shared nw */
            server.server_config[server.svr_tag]['shared-networks'].forEach(shnw => {
                shnw[server.sn_tag].forEach(x => {
                    x['shared_nw_name'] = shnw.name;
                    subnet_list.push(x);
                });
            });

            /* Retrieve and store subnets defined*/
            server.server_config[server.svr_tag][server.sn_tag].forEach(x => {
                subnet_list.push(x);
            });

            /* Subnet sorting by ID */
            subnet_list.sort(function (a, b) {
                return parseInt(a.id) - parseInt(b.id);
            });

            total_leases = 0;
            subnet_count = subnet_list.length;
            shared_nw_count = server.server_config[server.svr_tag]['shared-networks'].length;

            /* Fetch and set server stats*/
            var response_data = api_agent.fire_kea_api(stats_req_data, anterius_config.server_addr, anterius_config.server_port).then(function (sapi_data) {
                return sapi_data;
            });
            response_data.then(function (sdata) {
                if (sdata.result == 0) {
                    kea_stats = sdata.arguments;
                    for (var i = 1; i <= subnet_count; i++) {
                        total_leases += kea_stats['subnet[' + i + '].assigned-' + server.addr_tag][0][0];
                    }

                    /* Update metric - leases / sec  */
                    if (lpm_counter > 0)
                        leases_per_sec = total_leases - tl0;

                    lps_list[lpm_counter] = leases_per_sec;
                    lpm_counter++;

                    leases_per_minute = 0;
                    for (i = 0; i < 59; i++) {
                        if (lps_list[i] > 0) {
                            leases_per_minute += lps_list[i];
                            // console.log("iteration " + i + " val: " + lps_list[i] + " lpm: " + leases_per_minute);
                        }
                        else {
                            // console.log("no data " + i);
                        }
                    }

                    if (lpm_counter == 60)
                        lpm_counter = 0;

                    tl0 = total_leases

                }
                else
                    console.log("CA Error:" + sdata.text);
            });
            // console.log(kea_stats, kea_config);
        }
        else
            console.log("CA Error:" + data.text);
    });

    // console.log(leases_per_minute, leases_per_sec, total_leases);

    /* Websockets statistics subscription broadcast */
    // if (ws_event_subscribers('dhcp_statistics')) {
    //     return_data = {
    //         "cpu_utilization": cpu_utilization,
    //         "lps": leases_per_sec,
    //         "leases_per_minute": leases_per_minute
    //     };
    //     wss.broadcast_event(JSON.stringify(return_data), 'dhcp_statistics');
    // }

};

/* Call and export stats function */
lease_stats_monitor();
exports.reload = lease_stats_monitor;

/**
 * Clean Expired Leases
 */
// lease_clean_timer = setInterval(function () {
//     lease_parser.clean();
// }, (60 * 1000));

// function get_socket_clients_connected_count() {
//     wss.clients.forEach(function each(client) {
//         if (client.readyState === WebSocket.OPEN) {
//             socket_clients++;
//         }
//     });
//     return socket_clients;
// }

/* Watch Anterius settings file changes and reload */
fs.watch('config/anterius_config.json', function (event, filename) {
    if (filename) {
        setTimeout(function () {
            anterius_config = json_file.readFileSync('config/anterius_config.json');
            console.log("Anterius Server> Config Loaded");
        }, 1000);
    } else {
        console.log('filename not provided');
    }
});

/* Websocket Server */

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

options.interval = 300;
var tail_dhcp_log = new tail_module(
    anterius_config.log_file,
    "\n",
    options
);

dhcp_requests = {};

/* Watch DHCP Log File */
tail_dhcp_log.on("line", function (data) {
    if (listening_to_log_file) {
        wss.broadcast_event(data, 'dhcp_log_subscription');
    }

    /* Collect Excessive DHCP Request Data */
    if (/DHCPREQUEST/i.test(data)) {

        var request_from = "";
        var request_for = "";
        var request_via = "";

        var request_data = data.split(" ");
        var length = request_data.length;
        for (var i = 0; i < length; i++) {
            if (request_data[i] == "from") {
                request_from = request_data[i + 1];
            }
            if (request_data[i] == "for") {
                request_for = request_data[i + 1];
            }
            if (request_data[i] == "via") {
                request_via = request_data[i + 1];
            }
        }

        if (typeof dhcp_requests[request_from] === "undefined")
            dhcp_requests[request_from] = {};

        if (typeof dhcp_requests[request_from].request_for === "undefined")
            dhcp_requests[request_from].request_for = request_for;

        if (typeof dhcp_requests[request_from].request_via === "undefined")
            dhcp_requests[request_from].request_via = request_via;

        if (typeof dhcp_requests[request_from].request_count === "undefined")
            dhcp_requests[request_from].request_count = 0;

        if (typeof request_from !== "undefined") {
            if (request_from.length == 17 && /:/.test(request_from)) {
                var mac_oui = request_from.split(":").join("").toUpperCase().slice(0, 6);

                if (typeof dhcp_requests[request_from].request_vendor === "undefined")
                    dhcp_requests[request_from].request_vendor = oui_data[mac_oui];
            }
        }

        dhcp_requests[request_from].request_count++;
    }
});

// const purge_request_data = setInterval(function () {
//     for (var key in dhcp_requests) {
//         if (dhcp_requests[key].request_count <= 10)
//             delete dhcp_requests[key];
//     }
// }, 600 * 1000);
// /* 10 Minutes */

// const purge_request_data_hour = setInterval(function () {
//     dhcp_requests = {};
// }, 3600 * 1000);
/* 60 Minutes */

wss.on('connection', function connection(ws) {
    socket_clients++;
    console.log("[WS] CLIENT_CONNECT: Socket clients (" + socket_clients + ")");

    if (!listening_to_log_file) {
        /* Watch log file for new information */
        var tail_module = require('always-tail2');

        listening_to_log_file = 1;
    }

});

wss.on('close', function close() {
    socket_clients--;
    console.log("[WS] CLIENT_DISCONNECT: Socket clients (" + socket_clients + ")");
});

function heartbeat() {
    this.isAlive = true;
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function ws_event_subscribers(event) {
    if (typeof wss === "undefined")
        return false;

    var is_listening = false;

    wss.clients.forEach(function each(ws) {

        /* Count event listeners */
        for (var event_listening in ws.event_subscription) {
            if (event_listening == event) {
                is_listening = true;
                return true;
            }
        }

    });

    if (is_listening) {
        return true;
    }

    return false;
}

wss.on('connection', function connection(ws) {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    ws.event_subscription = [];
    ws.on('message', function incoming(data) {
        if (data != "" && isJson(data)) {
            var json = JSON.parse(data);
            if (typeof json["event_subscription"] !== "undefined") {
                console.log("[WS] Incoming Subscription '%s'", json['event_subscription']);
                ws.event_subscription[json["event_subscription"]] = 1;
            }
            if (typeof json["event_unsubscribe"] !== "undefined") {
                console.log("[WS] event_unsubscribe '%s'", json['event_unsubscribe']);
                delete ws.event_subscription[json["event_unsubscribe"]];
            }
            if (typeof json["all_events"] !== "undefined") {
                console.log("[WS] event_unsubscribe '%s'", json['event_unsubscribe']);
                ws.event_subscription = [];
            }
        }
    });

    stale_connections_audit();
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

wss.broadcast_event = function broadcast(data, event) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            if (client.event_subscription[event])
                client.send(JSON.stringify({ "event": event, "data": data }));
        }
    });
};

function stale_connections_audit() {
    socket_clients = 0;
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping('', false, true);

        socket_clients++;
    });

    console.log("[WS] STATUS: Socket clients (" + socket_clients + ")");
}

/* Keepalive - kill stale connections (30s poll) */
const interval = setInterval(function ping() {
    stale_connections_audit();
}, 30000);

var socket_clients = 0;


/**
 * Slack Hooks
 */

// var Slack = require('slack-node');

// webhookUri = anterius_config.slack_webhook_url;

// slack = new Slack();
// slack.setWebhook(webhookUri);

// function slack_message(message) {
//     console.log("[Slack] %s", message);

//     slack.webhook({
//         channel: anterius_config.slack_alert_channel,
//         username: "Glass",
//         icon_emoji: "https://imgur.com/wD3CcBi",
//         text: "(" + host_name + ") " + message
//     }, function (err, response) {
//         console.log(response);
//     });
// }

/**
 * Alert Checks - disabled
 */

// alert_status = [];
// alert_status['leases_per_minute'] = 0;
// setTimeout(function () {
//     console.log("Anterius Server> Alert loop started");

//     // Server LPM Alert timer - 5s loop
//     alert_check_timer = setInterval(function () {
//         // console.log("[Timer] Alert Timer check");
//         if (anterius_config.leases_per_minute_threshold > 0) {
//             // console.log("[Timer] lpm: %s lpm_th: %s", leases_per_minute, anterius_config.leases_per_minute_threshold);
//             if (leases_per_minute <= anterius_config.leases_per_minute_threshold && alert_status['leases_per_minute'] == 0) {
//                 alert_status['leases_per_minute'] = 1;

//                 // TODO: enable slack warning hook if required
//                 // slack_message(":warning: CRITICAL: DHCP leases per minute have dropped below threshold " +
//                 //     "(" + parseInt(anterius_config.leases_per_minute_threshold).toLocaleString('en') + ") " +
//                 //     "Current (" + parseInt(leases_per_minute).toLocaleString('en') + ")");

//                 email_alert("CRITICAL: Leases Per Minute Threshold", "DHCP leases per minute dropped below critical threshold <br><br>" +
//                     "Threshold: (" + parseInt(anterius_config.leases_per_minute_threshold).toLocaleString('en') + ") <br>" +
//                     "Current: (" + parseInt(leases_per_minute).toLocaleString('en') + ") <br><br>" +
//                     "This is usually indicative of a process or hardware problem and needs to be addressed immediately");
//             }
//             else if (leases_per_minute >= anterius_config.leases_per_minute_threshold && alert_status['leases_per_minute'] == 1) {
//                 alert_status['leases_per_minute'] = 0;

//                 // TODO: enable slack warning hook if required
//                 // slack_message(":white_check_mark: CLEAR: DHCP leases per minute have returned to above threshold " +
//                 //     "(" + parseInt(anterius_config.leases_per_minute_threshold).toLocaleString('en') + ") " +
//                 //     "Current (" + parseInt(leases_per_minute).toLocaleString('en') + ")");

//                 email_alert("CLEAR: Leases Per Minute Threshold", "DHCP leases per minute have returned to normal <br><br>" +
//                     "Threshold: (" + parseInt(anterius_config.leases_per_minute_threshold).toLocaleString('en') + ") <br>" +
//                     "Current: (" + parseInt(leases_per_minute).toLocaleString('en') + ")"
//                 );

//             }
//         }
//     }, (5 * 1000));

//     alert_status_networks_warning = [];
//     alert_status_networks_critical = [];

//     /*
//      ** TODO: Replace shared nw location attribute as per kea_stats results
//     */
//     // Shared nw utilzn Alert timer - 5s loop   
//     alert_subnet_check_timer = setInterval(function () {
//         // console.log("[Timer] Alert Timer check - subnets");

//         if (anterius_config.shared_network_warning_threshold > 0 || anterius_config.shared_network_critical_threshold > 0) {

//             // TODO: remove local dhcpd-pools parser tools if deemed not required 
//             // const execSync = require('child_process').execSync;
//             // output = execSync('./bin/dhcpd-pools -c ' + anterius_config.config_file + ' -l ' + anterius_config.leases_file + ' -f j -A -s e');
//             // var dhcp_data = JSON.parse(output);

//             // Calculate Shared network utilization
//             shared_nw_count = kea_config['Dhcp4']['shared-networks'].length;
//             shared_nw_util = [];
//             for (var i = 0; i < shared_nw_count; i++) {
//                 // TODO: verify shared nw stats are received as below usage
//                 utilization = round(parseFloat(kea_stats['shared-network[' + i + '].assigned-addresses'][0][0] / kea_stats['shared-network[' + i + '].total-addresses'][0][0]) * 100, 2);

//                 if (isNaN(utilization))
//                     utilization = 0;


//                 /* Initialize these array buckets */
//                 if (typeof alert_status_networks_warning[kea_stats['shared-networks'][i].location] === "undefined")
//                     alert_status_networks_warning[kea_stats['shared-networks'][i].location] = 0;

//                 if (typeof alert_status_networks_critical[kea_stats['shared-networks'][i].location] === "undefined")
//                     alert_status_networks_critical[kea_stats['shared-networks'][i].location] = 0;

//                 /*
//                  console.log("Location: %s", kea_stats['shared-networks'][i].location);
//                  console.log("Used: %s", dhcp_data['shared-networks'][i].used.toLocaleString('en'));
//                  console.log("Defined: %s", dhcp_data['shared-networks'][i].defined.toLocaleString('en'));
//                  console.log("Free: %s", dhcp_data['shared-networks'][i].free.toLocaleString('en'));
//                  console.log("Utilization: %s", utilization);
//                  console.log(" \n");
//                  */

//                 /* Check Warnings */
//                 if (anterius_config.shared_network_warning_threshold > 0) {
//                     if (
//                         utilization >= anterius_config.shared_network_warning_threshold &&
//                         utilization <= anterius_config.shared_network_critical_threshold &&
//                         alert_status_networks_warning[kea_stats['shared-networks'][i].location] == 0
//                     ) {
//                         alert_status_networks_warning[kea_stats['shared-networks'][i].location] = 1;

//                         // TODO: enable slack warning hook if required
//                         // slack_message(":warning: WARNING: DHCP shared network utilization (" + kea_stats['shared-networks'][i].location + ") " +
//                         //     "Current: (" + utilization + "%) " +
//                         //     "Threshold: (" + anterius_config.shared_network_warning_threshold + "%)"
//                         // );

//                         email_alert("WARNING: DHCP shared network utilization",
//                             "WARNING: DHCP shared network utilization (" + kea_stats['shared-networks'][i].location + ") <br><br>" +
//                             "Threshold: (" + anterius_config.shared_network_warning_threshold + "%) <br>" +
//                             "Current: (" + utilization + "%)"
//                         );

//                     }
//                     else if (
//                         utilization <= anterius_config.shared_network_warning_threshold &&
//                         alert_status_networks_warning[kea_stats['shared-networks'][i].location] == 1
//                     ) {
//                         alert_status_networks_warning[kea_stats['shared-networks'][i].location] = 0;

//                         // TODO: enable slack warning hook if required
//                         // slack_message(":white_check_mark: CLEAR: Warning DHCP shared network utilization (" + kea_stats['shared-networks'][i].location + ") " +
//                         //     "Current: (" + utilization + "%) " +
//                         //     "Threshold: (" + anterius_config.shared_network_warning_threshold + "%)"
//                         // );

//                         email_alert("CLEAR: DHCP shared network utilization warning",
//                             "CLEAR: DHCP shared network utilization (" + kea_stats['shared-networks'][i].location + ") <br><br>" +
//                             "Threshold: (" + anterius_config.shared_network_warning_threshold + "%) <br>" +
//                             "Current: (" + utilization + "%)"
//                         );

//                     }
//                 }

//                 /* Check Critical */
//                 if (anterius_config.shared_network_critical_threshold > 0) {
//                     if (
//                         utilization >= anterius_config.shared_network_critical_threshold &&
//                         alert_status_networks_critical[kea_stats['shared-networks'][i].location] == 0
//                     ) {
//                         alert_status_networks_critical[kea_stats['shared-networks'][i].location] = 1;

//                         // TODO: enable slack warning hook if required
//                         // slack_message(":fire: CRITICAL: DHCP shared network utilization (" + kea_stats['shared-networks'][i].location + ") " +
//                         //     "Current: (" + utilization + "%) " +
//                         //     "Threshold: (" + anterius_config.shared_network_critical_threshold + "%)"
//                         // );

//                         email_alert("CRITICAL: DHCP shared network utilization",
//                             "CRITICAL: DHCP shared network utilization (" + kea_stats['shared-networks'][i].location + ") <br><br>" +
//                             "Threshold: (" + anterius_config.shared_network_critical_threshold + "%) <br>" +
//                             "Current: (" + utilization + "%)"
//                         );

//                     }
//                     else if (
//                         utilization <= anterius_config.shared_network_critical_threshold &&
//                         alert_status_networks_critical[kea_stats['shared-networks'][i].location] == 1
//                     ) {
//                         alert_status_networks_critical[kea_stats['shared-networks'][i].location] = 0;

//                         // TODO: enable slack warning hook if required
//                         // slack_message(":white_check_mark: CLEAR: Critical DHCP shared network utilization (" + kea_stats['shared-networks'][i].location + ") " +
//                         //     "Current: (" + utilization + "%) " +
//                         //     "Threshold: (" + anterius_config.shared_network_critical_threshold + "%)"
//                         // );

//                         email_alert("CLEAR: DHCP shared network utilization",
//                             "CLEAR: DHCP shared network utilization (" + kea_stats['shared-networks'][i].location + ") <br><br>" +
//                             "Threshold: (" + anterius_config.shared_network_critical_threshold + "%) <br>" +
//                             "Current: (" + utilization + "%)"
//                         );
//                     }
//                 }
//             }
//         }
//     }, (5 * 1000));
//     // Shared ne
// }, 60 * 1000);

// // function round(num, places) {
// //     var multiplier = Math.pow(10, places);
// //     return Math.round(num * multiplier) / multiplier;
// // }

// /* Load Mailer */
// const nodemailer = require('nodemailer');

// let transporter = nodemailer.createTransport({
//     sendmail: true,
//     newline: 'unix',
//     path: '/usr/sbin/sendmail'
// });

// function email_alert(alert_title, alert_message) {

//     console.log("Anterius Server> Loading E-Mail template...");
//     fs = require('fs');
//     var email_body = fs.readFileSync('./public/templates/email_template.html', "utf8");
//     console.log("Anterius Server> Loading E-Mail template... DONE...");

//     /* E-Mail Template Load */
//     console.log("Anterius Server> Sending E-Mail Alert...\n");

//     if (typeof anterius_config.email_alert_to === "undefined" && typeof anterius_config.sms_alert_to === "undefined")
//         return false;

//     if (anterius_config.email_alert_to == "" && anterius_config.sms_alert_to != "") {
//         console.log("Anterius Server> No email_to specified - returning...");
//         return false;
//     }

//     /* Populate E-Mail Template */
//     email_body = email_body.replace("[body_content_placeholder]", alert_message);
//     email_body = email_body.replace("[alert_title]", alert_title);
//     email_body = email_body.replace("[local_time]", new Date().toString());

//     /* Clean extra commas etc. */
//     anterius_config.email_alert_to = anterius_config.email_alert_to.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,[,\s]*,/g, ',');

//     /* Publish HTML E-Mail Alert (regular mail) */
//     if (anterius_config.email_alert_to.trim() != "") {
//         var mailOptions = {
//             from: "Kea-Anterius Monitor Alerts kea-anterius@noreply.com",
//             to: anterius_config.email_alert_to,
//             subject: "Kea-Anterius " + "(" + host_name + ") " + alert_title,
//             html: email_body,
//         };
//         transporter.sendMail(mailOptions, function (error, info) {
//             if (error) {
//                 console.log(error);
//             }
//             else {
//                 console.log('Message sent: ' + info.response);
//             }
//         });
//     }

//     /* Publish SMS Alert */
//     if (anterius_config.sms_alert_to.trim() != "") {
//         var mailOptions = {
//             from: "Kea-Anterius Monitor Alerts kea-anterius@noreply.com",
//             to: anterius_config.sms_alert_to,
//             subject: "Kea-Anterius " + "(" + host_name + ") " + alert_title,
//             html: (alert_message.substring(0, 130) + "..."),
//         };
//         transporter.sendMail(mailOptions, function (error, info) {
//             if (error) {
//                 console.log(error);
//             }
//             else {
//                 console.log('Message sent: ' + info.response);
//             }
//         });
//     }
// }

console.log("Anterius Server> Bootup complete");
