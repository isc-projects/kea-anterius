'''
© Anthrino > DHCP configuration file generator
'''
import sys
import json
from pprint import pprint

# import configparser
# parser = configparser.ConfigParser()
# config = parser.read('/usr/local/etc/kea/kea-dhcp4.conf')

'''Method to replace IP addressses for given pool'''
def replace_addr(item, index):

    if isinstance(item, dict):
        new = {}
        for key, val in item.items():
            val = replace_addr(val, index)
            new[key] = val
        return new

    elif isinstance(item, list):
        item = [replace_addr(i, index) for i in item]
        return item

    else:
        return item.replace('192.0.2', '192.0.'+str(index+1))

    return item

def process_config(subnet_count, shared_nw_count):
    
    ''' Load default sample config file '''
    with open('/usr/local/etc/kea/kea-dhcp4.conf') as def_config:
        conf_str = ''
        for x in def_config.readlines():
            if not x.strip().startswith('//'):
                conf_str += x

    def_config = json.loads(conf_str)
    # pprint(config)

    subnet_config = def_config['Dhcp4']['subnet4'][0]

    def_config['Dhcp4']['subnet4'] = []
    for i in range(int(subnet_count)):
        # pprint(replace_addr(subnet_config, i))
        new_subnet = replace_addr(subnet_config, i)
        def_config['Dhcp4']['subnet4'].append(new_subnet)

    pprint(def_config)
    
if __name__ == '__main__':
    ''' Read command line args [ subnet_count, shared_nw_count ] and call processor'''
    process_config(sys.argv[1], sys.argv[2])
