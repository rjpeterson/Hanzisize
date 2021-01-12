# Hanzisize

## Donate
Hi there. I'm Ryan, the sole developer of Hanzisize. I've spent hundreds of hours working on Hanzisize while making it available for anyone to use for free. If you are able, please consider donating so I can continue to improve this tool for all of us. If you're not able to donate, please leave a review of this extension on the extension webstore of your choice so more people can find it. Thanks for your support!
You can show your appreciation for Hanzisize by donating in the following ways:
* Buy me a matcha latte\!

<a href="https://www.buymeacoffee.com/djmouthguard"><img src="https://github.com/rjpeterson/Hanzisize/blob/issue74/src/images/BMC.png" height="50px" alt="buy me a coffee button"></a>

* Donate Bitcoin\!

<img src="https://github.com/rjpeterson/Hanzisize/blob/issue74/src/images/btcdonation.jpeg" width="100px" height="100px" alt="bitcoin qr code">

* Or check out my [Redbubble store](www.redbubble.com/people/djmouthguard/shop)\!

## What is Hanzisize?
Hanzisize is a browser extension that allows selective resizing of text according to the language selected by the user.

## Why do I need it?
The inspiration for this browser extension came from my own frustration trying to read very small Chinese script online. I wanted to enlarge the font-size of Chinese characters without changing the size of English text or any other elements on the page.

## How does it work?
The current version of Hanzisize is able to selectively resize Arabic, Burmese, Chinese, English, Georgian, Korean, Hebrew, Hindi, Japanese, and Thai text. Other languages may be added later based on demand.

The current functionality allows for easy increasing and decreasing font-size on the page with a few limitations.
The font size of an element can never be smaller than it was when the page was first loaded. This prevents headers and other large font size elements from shrinking while small paragraph text is enlarged.

## Privacy
Hanzisize does not collect or transmit any user data. The only information that is stored are the most recent language and font size settings for user convenience. This data is stored in the user's browser and is not transmitted externally or used for any other purpose.

## Have a suggestion about how to improve Hanzisize?
You can email me at hanzisizeextension@gmail.com, or if you have a Github account you can create an "Issue" and let me know how you think Hanzisize can be improved!

## How do I install it?

### Production
[Install on Google Chrome](https://chrome.google.com/webstore/detail/hanzisize/jcljolcajgicemckjlgndbmoaeoobodk)
[Install on Mozilla Firefox](https://addons.mozilla.org/en-US/firefox/addon/hanzisize/)

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
6. Open Firefox Developer Edition and navigate to about:debugging
7. Click 'This Firefox', then click 'Load Temporary Add-on...'
8. Navigate to 'Hanzisize/build/web-ext-artifacts', select the zip file and click 'Open'