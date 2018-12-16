'''
©Anthrino / Browser automation test script for Anterius UI using Selenium

'''

import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import os
import json
import requests
import time

config_request_url = ""
script_dir = os.path.dirname(__file__)


def authenticate(browser):
    wait = WebDriverWait(browser, 10)
    wait.until(EC.alert_is_present())
    alert = browser.switch_to_alert()
    print(alert.text)
    alert.send_keys('keaadmin')
    alert.send_keys(Keys.TAB)
    alert.send_keys('keaadmin')
    alert.accept()


def get_ant_config():

    with open(os.path.join(script_dir, '../config/anterius_config.json')) as f:
        ant_config = json.load(f)

    # print(ant_config)

    return ant_config


def anterius_settings(browser):

    browser.get("http://keaadmin:keaadmin@localhost:3000/anterius_settings")

    # authenticate(browser)
    print('\n === Anterius Settings Test === ')

    # Switch server host check
    print('\n>> Server Host Machine selection check')

    svr_host_select = browser.find_element_by_xpath(
        "//select[@name='svr-host-select']")

    svr_hosts = svr_host_select.find_elements_by_tag_name("option")

    for i in range(len(svr_hosts)):

        # print(svr_hosts[i].text)
        # if browser.find_element_by_id('server-host'+str(i)):
        if svr_hosts[i].is_enabled():
            print("`` Attempting Option: %s" % svr_hosts[i].text, end="")
            svr_hosts[i].click()

            ant_config = get_ant_config()

            config_sel_host = ant_config['server_host_list'][int(ant_config['current_host_index'])]

            assert config_sel_host['hostname'] in svr_hosts[i].text and config_sel_host['svr_addr'] == ant_config['server_addr'] and config_sel_host['svr_port'] == ant_config['server_port'], " FAIL: Server Host Selection"

            print(" > SUCCESS")

            time.sleep(2)

            browser.get("http://keaadmin:keaadmin@localhost:3000/anterius_settings")

            svr_host_select = browser.find_element_by_xpath("//select[@name='svr-host-select']")
            svr_hosts = svr_host_select.find_elements_by_tag_name("option")

    time.sleep(1)

    # Switch default server (v4/v6) check
    print('\n>> Default server (v4/v6) switch check')

    print("`` Attempting Option: DHCPv4", end="")
    # svrselect = browser.find_element_by_id("dhcp4")
    # svrselect.click()

    browser.execute_script("document.getElementById('dhcp4').click()")
    ant_config = get_ant_config()

    assert ant_config['current_server'] == "dhcp4", "FAIL: v4 Server select"

    print(" > SUCCESS")

    time.sleep(1)

    print("`` Attempting Option: DHCPv6", end='')
    # svrselect = browser.find_element_by_id("dhcp6")
    # svrselect.click()
    browser.execute_script("document.getElementById('dhcp6').click()")
    ant_config = get_ant_config()

    assert ant_config['current_server'] == "dhcp6", "FAIL: v6 Server select"

    print(" > SUCCESS")

    time.sleep(2)

    print('\n>> ADD/DEL Kea server host machine check')

    # Add server host
    # svr_add_btn = browser.find_element_by_id("svr-add-btn")
    # svr_add_btn.click()
    browser.execute_script("document.getElementById('svr-add-btn').click()")

    ant_config = get_ant_config()
    add_svr_host_form = browser.find_element_by_xpath(
        "//form[@id='anterius-settings-form']")
    sh_count = len(ant_config['server_host_list'])

    ip = browser.find_element_by_id('hostname')
    ip.send_keys("Trial Server")

    ip = browser.find_element_by_id('svr_addr')
    ip.send_keys("localhost")

    ip = browser.find_element_by_id('svr_port')
    ip.send_keys("8010")

    print("`` Attempting addition: Trial Server [localhost:8010]", end="")

    browser.execute_script("document.getElementById('sb"+str(sh_count)+"').click()")

    # Verify trial server entry is added to config file
    time.sleep(1)
    ant_config = get_ant_config()

    new_svr_host = ant_config['server_host_list'][sh_count]

    assert new_svr_host['hostname'] == "Trial Server" and new_svr_host['svr_addr'] == "localhost" and new_svr_host['svr_port'] == "8010", "FAIL: Server host addition"

    print(" > SUCCESS")

    # Delete server host entry
    browser.execute_script("document.getElementById('db"+str(sh_count-1)+"').click()")

    # Verify trial server entry is deleted from config file
    time.sleep(1)
    ant_config = get_ant_config()
    print("`` Attempting deletion: Trial Server [localhost:8010]", end='')

    assert len(ant_config['server_host_list']) == sh_count, "FAIL: Server Host entry deletion"

    print(" > SUCCESS")

    print('\n>> Anterius Credentials/interval checks', end='')

    stat_refr_int = browser.find_element_by_id("stat_refr_int")
    admin_username = browser.find_element_by_id("admin_user")
    admin_password = browser.find_element_by_id("admin_password")
    save_btn = browser.find_element_by_id("ant-set-btn")

    sfr = stat_refr_int.get_attribute("value")
    au = admin_username.get_attribute("value")
    ap = admin_password.get_attribute("value")

    stat_refr_int.clear()
    admin_username.clear()
    admin_password.clear()

    stat_refr_int.send_keys("101")
    admin_username.send_keys("101")
    admin_password.send_keys("101")

    browser.execute_script("arguments[0].click();", save_btn)
    # save_btn.click()

    ant_config = get_ant_config()

    assert ant_config['stat_refresh_interval'] == "101" and ant_config[
        'admin_user'] == "101" and ant_config[
            'admin_password'] == "101", "FAIL: Anterius Settings Update"

    browser.execute_script("arguments[0].value = '" + sfr + "';",
                           stat_refr_int)
    browser.execute_script("arguments[0].value = '" + au + "';",
                           admin_username)
    browser.execute_script("arguments[0].value = '" + ap + "';",
                           admin_password)

    browser.execute_script("arguments[0].click();", save_btn)

    print('> SUCCESS')


def alert_settings(browser):

    print('\n === Anterius Alert Settings Test === ')

    browser.get("http://keaadmin:keaadmin@localhost:3000/anterius_alerts")

    # authenticate(browser)
    print('\n>> Alert Settings updation checks', end='')

    sn_critical = browser.find_element_by_id(
        "shared_network_critical_threshold")
    sn_warn = browser.find_element_by_id("shared_network_warning_threshold")
    lpm_thresh = browser.find_element_by_id("leases_per_minute_threshold")
    save_btn = browser.find_element_by_id("alert-set-btn")

    snc = sn_critical.get_attribute("value")
    snw = sn_warn.get_attribute("value")
    lpmth = lpm_thresh.get_attribute("value")

    sn_critical.clear()
    sn_warn.clear()
    lpm_thresh.clear()

    sn_critical.send_keys("101")
    sn_warn.send_keys("101")
    lpm_thresh.send_keys("101")

    browser.execute_script("arguments[0].click();", save_btn)
    # save_btn.click()

    ant_config = get_ant_config()

    assert ant_config[
        'shared_network_critical_threshold'] == "101" and ant_config[
            'shared_network_warning_threshold'] == "101" and ant_config[
                'leases_per_minute_threshold'] == "101", "Alert Settings update failed"

    browser.execute_script("arguments[0].value = '" + snc + "';", sn_critical)
    browser.execute_script("arguments[0].value = '" + snw + "';", sn_warn)
    browser.execute_script("arguments[0].value = '" + lpmth + "';", lpm_thresh)

    browser.execute_script("arguments[0].click();", save_btn)

    print(" > SUCCESS")


if __name__ == '__main__':

    browser = webdriver.Chrome(
        'D:\Software\chromedriver_win32\chromedriver.exe')

    anterius_settings(browser)
    alert_settings(browser)
