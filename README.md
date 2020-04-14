[![npm](https://img.shields.io/npm/v/npm.svg)]()
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

## NOTE
This is an archive of a project that is no longer updated. There are known security vulnerabilities in Anterius. 
You may want to take a look at [Stork](https://github.com/isc-projects/stork), which is under heavy development by ISC.

# kea-anterius
- The Anterius project is developed as part of the [Google Summer of Code '18](https://summerofcode.withgoogle.com) program, with the objective to create a GUI dashboard for the Kea DHCP server that provides monitoring and configuration capabilities to users. 

- The GUI and base functionality has been adapted from the [GLASS](https://github.com/Akkadius/glass-isc-dhcp) dashboard created for ISC DHCP server.

- Anterius functionality has been modified to support interaction with Kea servers running on remote systems, by incorporating features from the REST API exposed by the Kea Control Agent.

- Anterius supports monitoring and configuration of both DHCPv4 and DHCPv6 servers (provided they are operational at the selected control agent interface).

- Anterius is also designed to interface with multiple server host machines by switching between control agent destination addresses.

## Features

### Dashboard
  The home page provides a monitoring dashboard for the connected server that compiles realtime statistics and critical operating information:
  * Current Kea Server Hostname
  * Operational status of Kea servers (DHCP v4/v6) and current selection.
  * DHCP Leases per second / minute
  * Total Active Leases
  * Shared Network Distribution & Utilization
  * Subnet Distribution & Utilization
  
  ![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_dashboard.png)
  

### Network Information
- A detailed information page can be viewed for each individual shared network and subnet defined by the server that provides entity specific data such as **utilization, pools, total, assigned and available no. of leases.**

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_sharednw_info.png)

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_subnet_info.png)

- Page also presents tables listing the **Host Reservations** defined in n/w configuration and **Lease Information** for currently active leases from the network. Shared network page includes a list of subnets contained in the network.

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_hostresv_info.png)

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_lease_info.png)


### DHCP Config Management
   
- The DHCP configuration interface can be used to view and make modifications to the current server config file.

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_config_view.png)

- Config changes can be validated with the server thru the CA API to test for errors.

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_config_test.png)

- Updated and validated config files can be applied to the server if confirmed by the user.

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_config_update.png)

- Anterius also provides a feature to apply configuration changes for specific networks entities (subnet/shared-network) accessible thru the edit config button available in the network detailed info pages.

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_config_entity.png)

- Config modifications can be reviewed from the File Editor tab where changes are highlighted.

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_config_file_editor.png)

- Config page also provides an option to save a snapshot of the current config file which can be accessed as depicted below. 


### DHCP Config Snapshots

- The Snapshot centre provides admins features like viewing previously created config checkpoints and also validate and restore the config files with user confirmation.

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_config_snapshots1.png)

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_config_snapshots2.png)


### DHCP Server Boot Operations <local-server-feature>

- Anterius provides a server operation management page to execute start / stop / restart commands for DHCP v4/v6 servers. (Please note this feature is only supported for a local machine server until these commands are added to the Control Agent API) 

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_boot_ops1.png)

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_boot_ops2.png)


### Kea Log Streaming <local-server-feature>

- Anterius includes a Log streaming page displays the syslogd output from Kea servers in real-time allowing admins to review and save logs to a text file. (Please note this feature is only supported for a local machine server, remote log streaming feature is planned to be added in a future release)

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_log_stream.png)

### Anterius Alerting

- The alerting function allows admins to set custom thresholds for subnet and shared network utilization

- Alert Levels:
  - Default 80 (Warning)
  - Default 95 (Critical)

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_alerts1.png)

- Alert Delivery Methods
  - E-Mail
  - SMS

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_alerts2.png)


## Installation
(Instructions for Debian/Ubuntu based systems)

### Prerequisites

#### Kea Server installation and startup

- Installation and operational instructions for Kea can be found in the [Kea Admin Reference Guide](https://kea.isc.org/docs/kea-guide.html)
- To run the Kea Server with its default configuration or specified config file, use the kea control command as shown below.
(\*server\* = dhcp4 *or* dhcp6) :
<pre>
~$ keactrl start -s *server*  
</pre>

<pre>
~$ keactrl start -s *server* -c */path/to/kea-*server*.conf* 
</pre>


#### Configure Kea Control Agent (CA)

- Activate the Kea Control Agent using the following command (change -c conf file path if required):
<pre>
~$ kea-ctrl-agent -c /usr/local/etc/kea/kea-ctrl-agent.conf
</pre>

- The CA runs on port 8000 by default, defined in the CA config file. Please refer to the [Kea Control Agent Documentation](https://kea.isc.org/docs/kea-guide.html#kea-ctrl-agent) for setting CA parameters and addtional info.

- Check status of Kea DHCPv4/v6 servers and Kea Control Agent (must be active) using the command:
<pre>
~$ keactrl status
</pre>

#### Setup Hooks Library for Leases Commands

- Anterius employs a set of commands from the Leases hooks library to fetch current lease information from the server via the CA API. This information would be absent from the dashboard in case this hook is not configured.

- Add the following lines to the server(v4/v6) config file to enable lease hook library:

<pre>
"hooks-libraries": [{
        "library": "/usr/local/lib/hooks/libdhcp_lease_cmds.so"
}]
</pre>

#### Install NodeJS (primary dependency)
<pre>
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
</pre>


### Anterius Installation
- Clone source code from Github
<pre>
git clone https://github.com/isc-projects/kea-anterius.git
cd kea-anterius
</pre>

- Install node modules (application dependencies) 
<pre>
sudo npm install
</pre>

- Launch the nodejs server, browse to http://localhost:3000 to use the interface.
<pre>
sudo npm start
</pre>


### Configuration with Kea Server
- Anterius interface can be configured to work with one or more Kea server instances running either on a remote system or the local machine. 

- This characteristic is defined by the address parameter set for the Kea Control Agent that provides API access to the server.

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_settings1.png)

- To select server host machine, browse to the Anterius Settings option from the menu and select from the list of available hostnames. 
- Navigate to the Kea Hostname List in the settings page to add/edit/delete server host machine details. 

  - For local server (default mode), set address = localhost:8000
  - For remote server, set address = <public_ip:port>

![anterius_screenshots](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_settings2.png)

