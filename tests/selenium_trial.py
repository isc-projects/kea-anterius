'''
©Anthrino / Selenium test script trial for Anterius

'''

import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait

import json
import requests

config_request_url = "" 

def browser_open(browser, link):
	browser.get(link)

def (browser, username, passwd):
	
	browser.get("http://localhost:3000")
	assert "Kea-Anterius" in browser.title

	elem = browser.find_element_by_id("email")
	elem.send_keys(username)

	elem = browser.find_element_by_id("pass")
	elem.send_keys(passwd)

	elem.send_keys(Keys.RETURN)

	wait = WebDriverWait(browser, 25)
	  
	try:

		page_loaded = wait.until( lambda browser: "login.php?login_attempt" in browser.current_url)
		
		if browser.current_url == 'https://www.facebook.com':
	 		print("Successful Login")

	except TimeoutException:
		print( "Loading timeout expired" )


def verify_table_entries(server):

	with open('../config/anterius_config.json') as f:
		ant_config = json.load(f)

	config_request_url = 'http://'+ant_config.server_addr+':'+ant_config.server_port 

	data = { "command": "config-get", "service": [ server ] }
 
	resp = requests.post(url = config_request_url, data = data)
	# print(resp.arguments)
	server_config = resp.arguments

	data =  {"command": "statistic-get-all", "service": [ server ] }
	resp = requests.post(url = config_request_url, data = data)
	# print(resp.arguments)
	server_stats = resp.arguments

	// Generate subnet and shared nw lists from API for cross validationn
	subnet_list = [], sharednw_list = []
	for shnw in server_config[server]['shared-networks']:
		sharednw_list.append(shnw)
		for x in shnw[server.sn_tag]:
			x['shared_nw_name'] = shnw.name
			subnet_list.appendn(x)

	for x in server_config[server]['subnet'+server.replace('dhcp')]:
		subnet_list.append(x)
	
	
	browser.get("http://localhost:3000/")

	table = driver.find_element_by_xpath("//table[@id='shared-networks']")
	rows = table.find_element_by_xpath(".//tr")
	for i in len(rows):
		cols = rows[i].find_elements_by_xpath(".//td"):
		assert cols[0].text() == sharednw_list[i].name, "Shared NW name mismatch" 
		assert cols[1].text() == sharednw_list[i]., "Shared NW name mismatch" 
		assert cols[2].text() == sharednw_list[i].name, "Shared NW name mismatch" 
		assert cols[0].text() == sharednw_list[i].name, "Shared NW name mismatch" 
			


def nw_config_edit(nw_type, nw_id):

	config_request_url = "" 
	browser.get("http://localhost:3000/")
	table = driver.find_element_by_xpath("//table[@id='"+nw_type+"']")
	row = table.find_elements_by_xpath(".//tr")[nw_id]:
	for td in row.find_elements_by_xpath(".//td")

def google_search_results(browser, search_phrase, n_results):

	browser.get("http://www.google.com")
	search_field = browser.find_element_by_id("lst-ib")
	search_field.clear()

	search_field.send_keys(search_phrase)
	search_field.submit()

	browser.implicitly_wait(10)

	page_list = browser.find_elements_by_xpath("//div[@class='rc']/h3[@class='r']/a")
	count = len(page_list)

	if count < n_results:
		n_results = count

	print(str(count), 'results retrieved. \nTop', n_results, 'results: \n')

	for i in range(n_results):
	   print(page_list[i].text)


def custom_website_test(browser, url, mode):

	browser.get(url)
	
	if mode == 'login':

		input_field = browser.find_element_by_name('username')
		input_field.send_keys('stinson@gnb.com')

		input_field = browser.find_element_by_name('password')
		input_field.send_keys('legendary')

		b_submit = browser.find_element_by_id("loginfrm")
		b_submit.submit()


	if mode == 'signup':

		input_field = browser.find_element_by_name('firstname')
		input_field.send_keys('Barney')

		input_field = browser.find_element_by_name('lastname')
		input_field.send_keys('Stinson')

		input_field = browser.find_element_by_name('phone')
		input_field.send_keys('9564857764')

		input_field = browser.find_element_by_name('email')
		input_field.send_keys('stinson@gnb.com')

		input_field = browser.find_element_by_name('password')
		input_field.send_keys('legendary')

		input_field = browser.find_element_by_name('confirmpassword')
		input_field.send_keys('legendary')

		b_submit = browser.find_element_by_id("headersignupform")
		b_submit.submit()


	if mode == 'nav':

		option = input('Entered desired tab name: ')

		b_selection = browser.find_element_by_xpath("//a[@class='loader']/span[.='"+option+"  ']/..")
		b_selection.click()


if __name__ == '__main__':

	# browser = webdriver.Chrome()
	browser = webdriver.Firefox()

	nw_config_edit('shared-networks', 1)
	nw_config_edit('shared-networks', 2)

	nw_config_edit('subnets', 1)
	nw_config_edit('subnets', 2)


	# browser_open('www.google.com')
	# fb_login_check(browser, 'jerinjohn101@gmail.com', '...')

	# google_search_results(browser, 'Urus', 10)

	# custom_website_test(browser, 'http://www.phptravels.net/register', 'signup')
	# custom_website_test(browser, 'http://www.phptravels.net/login', 'login')
	custom_website_test(browser, 'http://www.phptravels.net', 'nav')
	