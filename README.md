[![npm](https://img.shields.io/npm/v/npm.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# kea-anterius
- The Anterius project is developed as part of the [Google Summer of Code '18](https://summerofcode.withgoogle.com) program, with the objective to create a GUI dashboard for the Kea DHCP server that provides monitoring and configuration capabilities to users. 

- The GUI has been adapted from the [GLASS](https://github.com/Akkadius/glass-isc-dhcp) dashboard created for ISC DHCP server.

- Anterius functionality has been modified to support interaction with Kea servers running on remote systems, by incorporating features from the REST API exposed by the Kea Control Agent.

- Anterius currently only supports DHCPv4 server monitoring, and can be interfaced with only a single Kea server instance at a time. DHCPv6 support and multiple servers are features planned to be incorporated in future releases.

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

- To run the Kea Server in its default configuration or with config file, use the kea control command as shown:
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

- Check status(must be active) of Kea DHCPv4 and Kea Control Agent using the command:
<pre>
~$ keactrl status
</pre>

- Kea Control Agent(CA) runs on port 8000 by default, defined in the CA config file. Please refer to the [Kea Control Agent Documentation](https://kea.isc.org/docs/kea-guide.html#kea-ctrl-agent) for setting CA parameters and addtional info.

![anterius_settings_ca_address](https://raw.githubusercontent.com/isc-projects/kea-anterius/master/public/images/screenshots/anterius_settings.png)

- From Anterius Settings option in the menu, set the CA address(port:host) accordingly to select mode of operation.

  - For local server (default mode), set address = localhost:8000
  - For remote server, set address = <public_ip:port>

