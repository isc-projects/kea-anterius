var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(require('chai-match-pattern'));
chai.use(require('chai-http'));

var api_agent = require('./lib/api_service.js');
var json_file = require('jsonfile');

var anterius_config;

describe('Anterius Config Validation', () => {
  it('should validate config file exists', () => {
    expect('config/anterius_config').to.be.a.file('Anterius config file found.');
  });
  anterius_config = json_file.readFileSync('config/anterius_config.json');
  ant_config_pattern = JSON.stringify(json_file.readFileSync('public/config_templates/ant_config.json'));
  ant_config_pattern = JSON.parse(ant_config_pattern.replace(/: ".*"/g, ': _.isString'));

  it('should match parameters in config file with template', function () {
    expect(anterius_config).to.matchPattern(ant_config_pattern);
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


// describe('Test Log Streaming syslog output', () => {


// });


describe('API mechanism - fire_kea_api()', function () {

  it('should connect succesfully with CA')
  function fire_api(request) {
    api_agent.fire_kea_api(request, anterius_config.server_addr, anterius_config.server_port).then(function (api_data) {
      if (api_data.result == 0) {
        expect(api_data).to.matchPattern({ result: _.isNumber, argument: _.isObject });
      }
      else
        expect(api_data).to.matchPattern({ result: _.isNumber, argument: _.isObject });

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
    expect(this.result).to.be.String()
  });
});

describe('Authorization Check', function () {
  it('should verify frontend authentication', function () {
    var auth_agent = require('./lib/authorize.js');
  })
});

describe('Authorization Check', function () {
  it('should verify frontend authentication', function () {
    var auth_agent = require('./lib/authorize.js');

  })
});

describe('Config Snapshot Check', function () {
  var bkp_mtime;
  it('should verify config snapshot creation feature', function () {
    var dhcp_config_file = json_file.readFileSync('../public/config_templates/' + anterius_config.current_server + '_config.json')
    bkp_mtime = new Date().getTime();
    chai.request('http://localhost:3000').post('/dhcp_config_snapshots')
      .send({ "mode": "save", "dhcp_config_file": dhcp_config_file }).auth(anterius_config.admin_user, anterius_config.admin_password)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.matchPattern({ "message": _.isString });
      });
  });
  it('should verify config snapshot deletion', function () {
    var dhcp_snapshot = global.anterius_config.current_server + "_conf_snap_" + bkp_mtime;
    chai.request('http://localhost:3000').post('/dhcp_config_snapshots')
      .send({ "mode": "delete", "affirm": true, "snapshot": dhcp_snapshot }).auth(anterius_config.admin_user, anterius_config.admin_password)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.matchPattern({ "message": _.isString });
      });
  });
});

describe('Network detail info check', function() {
  it('should verify details for network')
})