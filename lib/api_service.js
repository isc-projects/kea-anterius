/*
© Anthrino > API call and result processing services
*/
var http = require('http');

/* Read Config */
var json_file = require('jsonfile');
var anter_config = json_file.readFileSync('config/anterius_config.json');

module.exports = {
    fire_kea_api: function (req_data) {
        // console.log(req_data);
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
        return new Promise(function (resolve, reject) {
            var req = http.request(options, function (res) {
                // console.log('STATUS: ' + res.statusCode);
                // console.log('HEADERS: ' + JSON.stringify(res.headers));
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new Error('Status Code : ' + res.statusCode));
                }
                res.setEncoding('utf8');

                var response_data;
                res.on('data', function (body) {
                    // console.log('BODY: ' + body);
                    response_data = JSON.parse(body)[0];
                });
                res.on('end', function () {
                    try {
                        if ('text' in response_data)
                            response_data = response_data.text;
                        else
                            response_data = response_data.arguments;
                    } catch (error) {
                        reject(error);
                    }
                    resolve(response_data);
                });
            });
            req.on('error', (e) => {
                console.error(`Request Error: ${e.message}`);
                reject(error);
            });
            req.write(req_data);
            req.end();
        });
    }
};                