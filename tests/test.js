var chai = require('chai');
chai.use(require('chai-fs'));
var expect = require('chai').expect;
var api_agent = require('./lib/api_service.js');
var json_file = require('jsonfile');

describe('Anterius Config Validation', () => {
  it('should validate config file exists', () => {
    expect('config/anterius_config').to.be.a.file('Anterius config file found.');
  });
  anterius_config = json_file.readFileSync('config/anterius_config.json');
  it('should validate parameters in config file', function () {
    anterius_config.forEach(param => {
      expect(anterius_config[param]).to.be.a('string');
    });
  });
});

describe('Local Server Counter Information', () => {
  it('should validate counter info fetched from local command execution', () => {
    if (anterius_config.server_addr == 'localhost') {
      host_name = execSync("cat /etc/hostname").toString().replace("\n", "");
      expect(host_name).to.be.a('string');

      /* Split run status and check if active/inactive */
      run_status = execSync("keactrl status").toString().toLowerCase().split('\n');
      expect(run_status).to.be.an('array');
      run_status.should.all.include('active');

      cpu_utilization = parseFloat(execSync("top -bn 1 | awk 'NR>7{s+=$9} END {print s/4}'"));
      expect(cpu_utilization).to.be('float');
    }

  });
})

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
