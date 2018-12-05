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


def alert_settings(browser):

    browser.get("http://keaadmin:keaadmin@localhost:3000/anterius_alerts")

    # authenticate(browser)

    sn_critical = browser.find_element_by_id(
        "shared_network_critical_threshold")
    sn_warn = browser.find_element_by_id("shared_network_warning_threshold")
    lpm_thresh = browser.find_element_by_id("leases_per_minute_threshold")
    save_btn = browser.find_element_by_class_name("ant-btn")

    snc = sn_critical.get_attribute("value")
    snw = sn_warn.get_attribute("value")
    lpmth = lpm_thresh.get_attribute("value")

    sn_critical.send_keys("101")
    sn_warn.send_keys("101")
    lpm_thresh.send_keys("101")

    browser.execute_script("arguments[0].click();", save_btn)

    with open(os.path.join(script_dir, '../config/anterius_config.json')) as f:
        ant_config = json.load(f)

    # print(ant_config)

    assert ant_config[
        'shared_network_critical_threshold'] == "101" and ant_config[
            'shared_network_warning_threshold'] == "101" and ant_config[
                'leases_per_minute_threshold'] == "101", "Alert Settings update failed"

    browser.execute_script("arguments[0].value = '" + snc + "';", sn_critical)
    browser.execute_script("arguments[0].value = '" + snw + "';", sn_warn)
    browser.execute_script("arguments[0].value = '" + lpmth + "';", lpm_thresh)

    browser.execute_script("arguments[0].click();", save_btn)


if __name__ == '__main__':

    browser = webdriver.Chrome(
        'D:\Software\chromedriver_win32\chromedriver.exe')

    alert_settings(browser)
