#!/bin/sh
echo 'Running Clients simulation script.' 

while true
do
sudo perfdhcp -r 20 -R 25 -t 2 -n 100 -l enp0s8 10.0.0.1
sudo perfdhcp -r 50 -R 10 -t 1 -n 500 -l enp0s9 192.168.57.1
sudo perfdhcp -r 30 -R 150 -t 5 -n 300 -l enp0s10 192.168.58.1
sudo perfdhcp -r 25 -R 5 -t 2 -n 200 -l enp0s8 10.0.0.1
sudo perfdhcp -r 70 -R 25 -t 1 -n 350 -l enp0s9 192.168.57.1
sudo perfdhcp -r 10 -R 80 -t 5 -n 50 -l enp0s10 192.168.58.1
sudo perfdhcp -r 50 -R 45 -t 2 -n 200 -l enp0s8 10.0.0.1
sudo perfdhcp -r 20 -R 40 -t 1 -n 220 -l enp0s9 192.168.57.1
sudo perfdhcp -r 80 -R 20 -t 5 -n 400 -l enp0s10 192.168.58.1
sudo perfdhcp -r 20 -R 15 -t 2 -n 160 -l enp0s8 10.0.0.1
sudo perfdhcp -r 50 -R 15 -t 1 -n 450 -l enp0s9 192.168.57.1
sudo perfdhcp -r 25 -R 10 -t 5 -n 500 -l enp0s10 192.168.58.1

done
wait
echo 'Clients simulation complete.' 