[![npm](https://img.shields.io/npm/v/npm.svg)]()
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

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
  
  ![anterius_settings_ca_address](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_dashboard.png)
  
  ### Network Information
- A detailed information page can be viewed for each individual shared network and subnet defined by the server that provides entity specific data such as **utilization, pools, total, assigned and available no. of leases.**

![anterius_settings_ca_address](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_sharednw_info.png)

![anterius_settings_ca_address](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_subnet_info.png)

- Page also presents tables listing the **Host Reservations** defined in n/w configuration and **Lease Information** for currently active leases from the network. Shared network page includes a list of subnets contained in the network.

![anterius_settings_ca_address](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_hostresv_info.png)

![anterius_settings_ca_address](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_lease_info.png)


## Installation
(Instructions for Debian/Ubuntu based systems)

#### Install NodeJS (primary dependency)

<pre>
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
</pre>

### Install Anterius
- Clone source code from Github
<pre>
git clone https://github.com/isc-projects/kea-anterius.git
cd kea-anterius
</pre>

- Install node modules and run
<pre>
sudo npm install
sudo npm start
</pre>

- 'npm start' command launches the nodejs server, browse to http://localhost:3000 to use the interface.

### Configuration with Kea Server
- Anterius interface can be configured to work with a Kea server instance running either on a remote system or the local machine. 

- This characteristic is dependant on the address parameter set for the Kea Control Agent that provides API access to the server.

- To run the Kea Server with its default configuration or specified config file, use the kea control command as shown:
<pre>
~$ keactrl start -s dhcp4  
</pre>
<pre>
~$ keactrl start -s dhcp4 -c /path/to/kea-dhcp4.conf 
</pre>

- Activate the Kea Control Agent using the following command (change -c conf file path if required):
<pre>
~$ kea-ctrl-agent -c /usr/local/etc/kea/kea-ctrl-agent.conf
</pre>

- Check status of Kea DHCPv4 and Kea Control Agent (both must be active) using the command:
<pre>
~$ keactrl status
</pre>

- Kea Control Agent(CA) runs on port 8000 by default, defined in the CA config file. Please refer to the [Kea Control Agent Documentation](https://kea.isc.org/docs/kea-guide.html#kea-ctrl-agent) for setting CA parameters and addtional info.

![anterius_settings_ca_address](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_settings.png)

- To select server host machine, browse to the Anterius Settings option from the menu and select from the list of available hostnames. 
- Navigate to the Kea Hostname List in the settings page to add/edit/delete server host machine details. 

  - For local server (default mode), set address = localhost:8000
  - For remote server, set address = <public_ip:port>

