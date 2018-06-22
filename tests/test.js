var expect = require('chai').expect;
var api_agent = require('./lib/api_service.js');

describe('fire_kea_api()', function () {
  it('Fetch data from API using request argument passed', function () {

    stats_req_data = JSON.stringify({ "command": "statistic-get-all", "service": ["dhcp4"] });
    config_get_req_data = JSON.stringify({ "command": "config-get", "service": ["dhcp4"] });
    lease_get_req_data = JSON.stringify({ "command": "lease4-get-all", "service": ["dhcp4"], "arguments": { "subnets": id } });
    config_test_req_data = JSON.stringify({ "command": "config-test", "service": ["dhcp4"], "arguments": JSON.parse(request.dhcp_config_file) });

    response_data = api_agent.fire_kea_api()
      expect(sum2).to.be.equal(sum1);

  });
});
