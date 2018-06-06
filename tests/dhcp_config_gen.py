'''
© Anthrino > DHCP configuration file generator
'''
import sys
import json
from random import randint
from pprint import pprint

# import configparser
# parser = configparser.ConfigParser()
# config = parser.read('/usr/local/etc/kea/kea-dhcp4.conf')

'''Recursive Method to replace IP addressses in json as per pool'''
def replace_addr(item, index, indexB, mode):

    if isinstance(item, dict):
        new = {}
        for key, val in item.items():
            val = replace_addr(val, index, indexB, mode)
            new[key] = val
        return new

    elif isinstance(item, list):
        item = [replace_addr(i, index, indexB, mode) for i in item]
        return item

    elif isinstance(item, str):
        if mode == 0:
            return item.replace('192.0.2', '192.0.'+str(index+1))
        else:
            return item.replace('192.1.5', '192.'+str(indexB+1)+'.'+str(index+1))

    return item


def process_config(mode, subnet_count, shared_nw_count):
    ''' Load default sample config file '''
    with open('kea-dhcp4-bkp.conf') as def_config:
        conf_str = ''
        for x in def_config.readlines():
            if not x.strip().startswith('//'):
                conf_str += x

    def_config = json.loads(conf_str)
    # pprint(config)

    ''' Subnet/shared nw templates for generation'''
    subnet_config = def_config['Dhcp4']['subnet4'][0]
    subnet_config_min = def_config['Dhcp4']['shared-networks'][0]['subnet4'][0]
    shared_nw_config = def_config['Dhcp4']['shared-networks'][0]

    ''' Initialize empty lists to contain new config'''
    def_config['Dhcp4']['subnet4'] = []
    def_config['Dhcp4']['shared-networks'] = []
    sn_id = 0

    ''' Loop to Generate subnets'''
    for i in range(subnet_count % 256):
        # pprint(replace_addr(subnet_config, i))
        sn_id += 1
        new_subnet = replace_addr(subnet_config, i, 0, 0)
        new_subnet['id'] = sn_id
        def_config['Dhcp4']['subnet4'].append(new_subnet)

    ''' Loop to generate shared nws'''
    for i in range(shared_nw_count % 256):
        shared_nw_config['subnet4'] = []
        for j in range(randint(1, 5)):
            sn_id += 1
            new_subnet = replace_addr(subnet_config_min, j, i, 1)
            new_subnet['id'] = sn_id
            shared_nw_config['subnet4'].append(new_subnet)
            shared_nw_config['name'] = 'subnet-cluster'+str(i+1)
        # print(i ,[(x['id'], x['subnet']) for x in shared_nw_config['subnet4']])

        def_config['Dhcp4']['shared-networks'].append(dict(shared_nw_config))
        def_config['Dhcp4']['shared-networks']
        # for y in def_config['Dhcp4']['shared-networks']:
        #     print(i ,[(x['id'], x['subnet']) for x in y['subnet4']])

    if mode == 0:
        ''' Print generated config'''
        pprint(def_config)
        # print()

    elif mode == 1:
        ''' Write generated config to file'''
        with open('/usr/local/etc/kea/kea-dhcp4.conf', 'w') as file:
            json.dump(def_config, file)

    else:
        ''' Dislpay exisitng config file'''
        with open('/usr/local/etc/kea/kea-dhcp4.conf', 'r') as file:
            pprint(json.loads(file.read()))


if __name__ == '__main__':
    ''' Read command line args [mode, subnet_count, shared_nw_count] and call processor'''
    process_config(int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]))
