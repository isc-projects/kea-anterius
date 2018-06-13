[![npm](https://img.shields.io/npm/v/npm.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# kea-anterius
- The Anterius project is developed as part of the [Google Summer of Code '18](https://summerofcode.withgoogle.com) program, with the objective to create a GUI dashboard for the Kea DHCP server that provides monitoring and configuration capabilities to users. 

- The GUI has been adapted from the [GLASS](https://github.com/Akkadius/glass-isc-dhcp) dashboard created for ISC DHCP server.

- Anterius functionality has been modified to support interaction with Kea servers running on remote systems, by incorporating features from the REST API exposed by the Kea Control Agent.

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
sudo npm install forever -g
sudo npm start
</pre>

- 'npm start' command launches the nodejs server, browse to http://localhost:3000 to use the interface.
