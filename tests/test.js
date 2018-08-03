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


describe('Test Log Streaming from ')


describe('API mechanism - fire_kea_api()', function () {
  
  it('should connect succesfully with CA')
  function fire_api(request){
    api_agent.fire_kea_api(request, anterius_config.server_addr, anterius_config.server_port).then(function (api_data) {
      if (api_data.result == 0){
        expect(api_data).to.be.an('object');
        return api_data.arguments;
      }
      else
        console.log("CA Error: " + api_data.text);
    }).catch(function () {
      console.log("Kea CA API error");
    });
  }
  
  it('should fetch stats data from API ', function () {
    stats_req_data = JSON.stringify({ "command": "statistic-get-all", "service": ["dhcp4"] });
    stats = fire_api(stats_req_data);
    expect(stats).should.all.
  });

  it('should fetch config data from API ', function () {
    config_get_req_data = JSON.stringify({ "command": "config-get", "service": ["dhcp4"] });
    expect()
  });

  it('should fetch stats data from API ', function () {
    lease_get_req_data = JSON.stringify({ "command": "lease4-get-all", "service": ["dhcp4"], "arguments": { "subnets": id } });

  });

  it('should fetch stats data from API ', function () {
    config_test_req_data = JSON.stringify({ "command": "config-test", "service": ["dhcp4"], "arguments": JSON.parse(request.dhcp_config_file) });

    response_data = api_agent.fire_kea_api()
    expect(sum2).to.be.equal(sum1);

  });

  
});