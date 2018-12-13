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

    # Switch server host check
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


def alert_settings(browser):

    browser.get("http://keaadmin:keaadmin@localhost:3000/anterius_alerts")

    # authenticate(browser)

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

    print('\n PASS: Anterius Alert Settings')


if __name__ == '__main__':

    browser = webdriver.Chrome(
        'D:\Software\chromedriver_win32\chromedriver.exe')

    # alert_settings(browser)
    anterius_settings(browser)
