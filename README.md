# Hanzisize

## What is it?
Hanzisize is a multi-browser extension built using React that allows selective resizing of page content based on the selected language.

## Why do I need it?
The inspiration for this browser extension came from my own frustration trying to read very small Chinese script online. I wanted to enlarge the font-size of Chinese characters without changing the size of any other elements on the page.

## How does it work?
The current version of Hanzisize is able to selectiely resize Chinese, English, or Japanese script. Other languages may be added later based on demand.

The current functionality allows for easy increasing and descreasing font-size on the page with a few limitations.
For example, the font size of an element can never be smaller than it was when the page was first loaded. This prevents headers and other large font size elements from shrinking while paragraph text grows.

## How do I install it?

### Production
Go to https://chrome.google.com/webstore/detail/hanzisize/jcljolcajgicemckjlgndbmoaeoobodk to install the extension on Google Chrome or https://addons.mozilla.org/en-US/firefox/addon/hanzisize/ to install on Firefox.

### Development
#### Chrome
1. Clone repository OR download and extract ZIP file from github.com/rjpeterson/Hanzisize
2. Install Node Package Manager and run 'npm install' from the Hanzisize root directory you just extracted/cloned to
3. Run 'npm run build' from the Hanzisize root directory
4. Open Chrome and go to this address: chrome://extensions/ (or the applicable extensions page if using other Chrome-based browsers)
5. Click 'Load Unpacked' and select the 'build' folder in the Hanzisize root directory

#### Firefox
1. Clone repository OR download and extract ZIP file from github.com/rjpeterson/Hanzisize
2. Install Node Package Manager and run 'npm install' from the Hanzisize root directory you just extracted/cloned to
3. Run 'npm run build' from the Hanzisize root directory
4. Run 'npm install --global web-ext'
5. Navigate to the 'build' directory and run 'web-ext build'
6. Open Firefox Developer Edition and navigate to about:debugging
7. Click 'This Firefox', then click 'Load Temporary Add-on...'
8. Navigate to 'Hanzisize/build/web-ext-artifacts', select the zip file and click 'Open'

## Donate
Enjoy using this extension? You can show your appreciation by donating in the following ways:
* buymeacoffee.com/djmouthguard
* Bitcoin: bc1q4524l0qtj5ucjw8qvxdpd7vta7x9peyazd8ykc
* Or check out my Redbubble store: [www.redbubble.com/people/djmouthguard/shop]
