/*
© Anthrino > API call and result processing services
*/
var http = require('http');

/* Read Config */
var json_file = require('jsonfile');
var anter_config = json_file.readFileSync('config/anterius_config.json');

function process_api_result(body) {
    body = JSON.parse(body)[0];
    if ('text' in body) {
        return body.text;
        // TODO: Add result status display code
    }
    else {
        body = body.arguments;
        set_stats(body, 'Dhcp4' in body);
    }
}

function set_stats(api_data, mode) {
    // console.log(mode, api_data);
    if (mode)
        kea_config = api_data;
    else
        kea_stats = api_data;
}

module.exports = {
    fire_kea_api: function (req_data) {
        var options = {
            host: anter_config.server_addr,
            port: anter_config.server_port,
            path: '/',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': req_data.length
            },
            method: 'POST'
        };
        var req = http.request(options, function (res) {
            // console.log('STATUS: ' + res.statusCode);
            // console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (body) {
                // console.log('BODY: ' + body);
                process_api_result(body);
            });
            res.on('end', function () {
                // console.log(kea_stats);
                return
            });
        });

        req.on('error', (e) => {
            console.error(`Request Error: ${e.message}`);
        });
        req.write(req_data);
        req.end();
    }

};
