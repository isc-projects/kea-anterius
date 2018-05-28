#!/usr/bin/env bash

/usr/bin/forever --minUptime 10000 --spinSleepTime 10000 -a -o ./logs/anterius-process.log -e ./logs/anterius-error.log ./bin/www &