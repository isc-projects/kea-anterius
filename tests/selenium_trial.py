'''
©Anthrino / Selenium test script trial for Anterius

'''

import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait

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


	# browser_open('www.google.com')
	# fb_login_check(browser, 'jerinjohn101@gmail.com', '...')

	# google_search_results(browser, 'Urus', 10)

	# custom_website_test(browser, 'http://www.phptravels.net/register', 'signup')
	# custom_website_test(browser, 'http://www.phptravels.net/login', 'login')
	custom_website_test(browser, 'http://www.phptravels.net', 'nav')
