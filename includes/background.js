chrome.runtime.onMessage.addListener(function (message) {
	 console.log('Downloading' + message.url + message.filename);
	 chrome.downloads.download({
		url : message.url,
		filename : message.filename,
		conflictAction : 'uniquify',
		saveAs : true
	}); 
});


