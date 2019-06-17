var FORMAT_LABEL = {
	'17': '3GP 144p',
	'18': 'MP4 360p',
	'22': 'MP4 720p',
	'43': 'WebM 360p',
	'44': 'WebM 480p',
	'45': 'WebM 720p',
	'46': 'WebM 1080p',
	'135': 'MP4 480p - no audio',
	'136': 'MP4 720p - no audio',
	'137': 'MP4 1080p - no audio',
	'138': 'MP4 2160p - no audio',
	'140': 'M4A 128kbps - audio',
	'247': 'WebM 720p - no audio',
	'264': 'MP4 1440p - no audio',
	'266': 'MP4 2160p - no audio',
	'298': 'MP4 720p60 - no audio',
	'299': 'MP4 1080p60 - no audio'
};
var FORMAT_TYPE = {
	'17': '3gp',
	'18': 'mp4',
	'22': 'mp4',
	'43': 'webm',
	'44': 'webm',
	'45': 'webm',
	'46': 'webm',
	'135': 'mp4',
	'136': 'mp4',
	'137': 'mp4',
	'138': 'mp4',
	'140': 'm4a',
	'247': 'webm',
	'264': 'mp4',
	'266': 'mp4',
	'298': 'mp4',
	'299': 'mp4'
};
var FORMAT_ORDER = ['17', '18', '43', '135', '44', '22', '298', '45', '137', '299', '46', '264', '138', '266', '140', '136', '247'];
var FORMAT_RULE = {
	'flv': 'max',
	'3gp': 'max',
	'mp4': 'all',
	'webm': 'none',
	'm4a': 'none'
};
// all=display all versions, max=only highest quality version, none=no version
// the default settings show all MP4 videos
var SHOW_DASH_FORMATS = false;
var BUTTON_TEXT = {
	'ar': 'تنزيل',
	'cs': 'Stáhnout',
	'de': 'Herunterladen',
	'en': 'Download As',
	'es': 'Descargar',
	'fr': 'Télécharger',
	'hi': 'डाउनलोड',
	'hu': 'Letöltés',
	'id': 'Unduh',
	'it': 'Scarica',
	'ja': 'ダウンロード',
	'ko': '내려받기',
	'pl': 'Pobierz',
	'pt': 'Baixar',
	'ro': 'Descărcați',
	'ru': 'Скачать',
	'tr': 'İndir',
	'zh': '下载',
	'zh-TW': '下載'
};
var BUTTON_TOOLTIP = {
	'ar': 'تنزيل هذا الفيديو',
	'cs': 'Stáhnout toto video',
	'de': 'Dieses Video herunterladen',
	'en': 'Download this video',
	'es': 'Descargar este vídeo',
	'fr': 'Télécharger cette vidéo',
	'hi': 'वीडियो डाउनलोड करें',
	'hu': 'Videó letöltése',
	'id': 'Unduh video ini',
	'it': 'Scarica questo video',
	'ja': 'このビデオをダウンロードする',
	'ko': '이 비디오를 내려받기',
	'pl': 'Pobierz plik wideo',
	'pt': 'Baixar este vídeo',
	'ro': 'Descărcați acest videoclip',
	'ru': 'Скачать это видео',
	'tr': 'Bu videoyu indir',
	'zh': '下载此视频',
	'zh-TW': '下載此影片'
};

var version = 1.0;
var LISTITEM_ID = 'download-youtube-video-fmt-ytdl';
var DEBUG_ID = 'download-youtube-video-debug-info';
var isMat = false;
var noLinks = false;
var dbg = false;
var STORAGE_URL = 'download-youtube-script-url';
var STORAGE_CODE = 'download-youtube-signature-code';
var STORAGE_DASH = 'download-youtube-dash-enabled';
var DECODE_RULE = [];
var isDecodeRuleUpdated = false;

function debug(str) {
	if (dbg == true) {
		console.log(str);
	};
}

window.addEventListener('spfdone', checkold, false);
window.addEventListener('DOMContentLoaded', checkold, false);
window.addEventListener('yt-page-data-updated', start, false); //yt-navigate-finish , yt-page-data-updated
window.addEventListener('yt-navigate-finish', removeElements);

function removeElements() {
	debug('yt-navigate-finish');
	//Reset itag localstorage
	// iterate localStorage
	for (var i = 0; i < localStorage.length; i++) {
		// set iteration key name
		var key = localStorage.key(i);
		var isTagVal = key.includes("itag");
		if (key.includes("itag") || key.includes("videoManifestURL")) {
			isTagVal = true;
			//console.log("Key " + key + " " + isTagVal);
		}

		if (isTagVal) {
			localStorage.removeItem(key);
			//console.log(localStorage.getItem(key));
		}

	}
}

//CHECK NEW DESIGN
function isMaterial() {
	var temp;
	temp = document.querySelector("ytd-app, [src*='polymer'],link[href*='polymer']");
	if (temp) {
		return true;
	}
}
isMat = isMaterial();
//END

function checkold() {
	debug('DOMContentLoaded/SPFDone');
	isMat = isMaterial();
	if (/^https?:\/\/www\.youtube.com\/watch\?/.test(window.location.href) && !isMat) {
		run();
	}
}

function start() {
	debug('yt-updated');
	//Check if we are on watch page
	if (/^https?:\/\/www\.youtube.com\/watch\?/.test(window.location.href)) {
		run();
	}

}

function run() {

	isMat = isMaterial();
	//### Initialize things ###
	//Reset itag localstorage
	removeElements();

	//injectScript('var player_api = document.getElementById("movie_player");if (player_api) {var current_config = player_api.getPlayerResponse();storage=window.localStorage;storage.setItem("video_id",current_config.videoDetails.videoId);storage.setItem("title",current_config.videoDetails.title);current_config.streamingData.formats.forEach(saveiTag);if (current_config.streamingData.adaptiveFormats) {current_config.streamingData.adaptiveFormats.forEach(saveiTagAdp);} else { var videoManifestURL = current_config.streamingData.dashManifestUrl;storage.setItem("videoManifestURL", videoManifestURL);};function saveiTag(item, index) {storage.setItem(current_config.videoDetails.videoId +"_itag_"+current_config.streamingData.formats[index].itag,current_config.streamingData.formats[index].url);};function saveiTagAdp(item, index) {storage.setItem(current_config.videoDetails.videoId +"_itag_"+current_config.streamingData.adaptiveFormats[index].itag,current_config.streamingData.adaptiveFormats[index].url);}}');

	injectScript('storage=window.localStorage;if(ytplayer&&ytplayer.config&&ytplayer.config.args){storage.setItem("url_encoded_fmt_stream_map", ytplayer.config.args.url_encoded_fmt_stream_map);storage.setItem("adaptive_fmts", ytplayer.config.args.adaptive_fmts);storage.setItem("js", ytplayer.config.assets.js);}var player_api = document.getElementById("movie_player");if (player_api) {var current_config = player_api.getVideoData();storage.setItem("video_id",current_config.video_id);storage.setItem("title",current_config.title);}');

	//EXTRACT DATA
	var storage = window.localStorage;
	var videoID = storage.getItem("video_id");
	var videoTitle = storage.getItem("title");
	videoTitle = videoTitle.replace(/\s*\-\s*YouTube$/i, '').replace(/'/g, '\'').replace(/^\s+|\s+$/g, '').replace(/\.+$/g, '');
	videoTitle = videoTitle.replace(/[\\/:"*?<>|]/g, '').replace(/[\|\\\/]/g, '_'); // Mac, Linux, Windows
	var videoFormats;
	var videoAdaptFormats;
	var videoManifestURL;
	var scriptURL;

	//Get video details
	var xhr = new XMLHttpRequest();
	var bodyContent = "";
	xhr.open("GET", "https://www.youtube.com/watch?v=" + videoID + "&el=detailpage", false);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			// JSON.parse does not evaluate the attacker's scripts.
			bodyContent = xhr.responseText;
			//debug(resp);
		}
	}
	xhr.send();

	if (bodyContent != null) {
		videoFormats = findMatch(bodyContent, /\"url_encoded_fmt_stream_map\":\s*\"([^\"]+)\"/);
		videoFormats = videoFormats.replace(/&amp;/g, '\\u0026');
		videoAdaptFormats = findMatch(bodyContent, /\"adaptive_fmts\":\s*\"([^\"]+)\"/);
		videoAdaptFormats = videoAdaptFormats.replace(/&amp;/g, '\\u0026');
		videoManifestURL = findMatch(bodyContent, /\"dashmpd\":\s*\"([^\"]+)\"/);
		if (scriptURL == null) {
			scriptURL = findMatch(bodyContent, /\"js\":\s*\"([^\"]+)\"/);
			if (scriptURL) {
				scriptURL = scriptURL.replace(/\\/g, '');
			}
		}
	}

	debug('Info: Brute mode = ' + videoID);
	//debug('videoFormats = ' + videoFormats);
	//debug('videoAdaptFormats = ' + videoAdaptFormats);
	//debug('videoManifestURL = ' + videoManifestURL);
	//debug('scriptURL = ' + scriptURL);

	if (!isDecodeRuleUpdated) {
		DECODE_RULE = getDecodeRules(DECODE_RULE);
		isDecodeRuleUpdated = true;
	}
	if (scriptURL) {
		scriptURL = absoluteURL(scriptURL);
		debug('Info: Full script URL: ' + scriptURL);
		fetchSignatureScript(scriptURL);
	}

	// parse the formats map
	var sep1 = '%2C',
	sep2 = '%26',
	sep3 = '%3D';
	if (videoFormats.indexOf(',') > -1 || videoFormats.indexOf('&') > -1 || videoFormats.indexOf('\\u0026') > -1) {
		sep1 = ',';
		sep2 = (videoFormats.indexOf('&') > -1) ? '&' : '\\u0026';
		sep3 = '=';
	}
	var videoURL = new Array();
	var videoSignature = new Array();
	if (videoAdaptFormats) {
		videoFormats = videoFormats + sep1 + videoAdaptFormats;
	}

	var videoFormatsGroup = videoFormats.split(sep1);
	for (var i = 0; i < videoFormatsGroup.length; i++) {
		var videoFormatsElem = videoFormatsGroup[i].split(sep2);
		var videoFormatsPair = new Array();
		for (var j = 0; j < videoFormatsElem.length; j++) {
			var pair = videoFormatsElem[j].split(sep3);
			if (pair.length == 2) {
				videoFormatsPair[pair[0]] = pair[1];
			}
		}
		if (videoFormatsPair['url'] == null)
			continue;
		var url = unescape(unescape(videoFormatsPair['url'])).replace(/\\\//g, '/').replace(/\\u0026/g, '&');
		if (videoFormatsPair['itag'] == null)
			continue;
		var itag = videoFormatsPair['itag'];
		var sig = videoFormatsPair['sig'] || videoFormatsPair['signature'];
		debug("videoFormatsPair : " + videoFormatsPair['sig']);
		if (sig) {
			url = url + '&signature=' + sig;
			videoSignature[itag] = null;
		} else if (videoFormatsPair['s']) {
			url = url + '&' + (videoFormatsPair['sp'] || 'signature') + '=' + decryptSignature(videoFormatsPair['s']);
			videoSignature[itag] = videoFormatsPair['s'];
		}
		if (url.toLowerCase().indexOf('ratebypass') == -1) { // speed up download for dash
			url = url + '&ratebypass=yes';
		}
		if (url.toLowerCase().indexOf('http') == 0) { // validate URL
			videoURL[itag] = url + '&title=' + videoTitle;
		}
	}

	var showFormat = new Array();
	for (var category in FORMAT_RULE) {
		var rule = FORMAT_RULE[category];
		for (var index in FORMAT_TYPE) {
			if (FORMAT_TYPE[index] == category) {
				showFormat[index] = (rule == 'all');
			}
		}
		if (rule == 'max') {
			for (var i = FORMAT_ORDER.length - 1; i >= 0; i--) {
				var format = FORMAT_ORDER[i];
				if (FORMAT_TYPE[format] == category && videoURL[format] != undefined) {
					showFormat[format] = true;
					break;
				}
			}
		}
	}

	var is720p = false;
	var is1080p = false;

	var downloadCodeList = [];
	for (var i = 0; i < FORMAT_ORDER.length; i++) {
		debug(FORMAT_LABEL[format] + ', itag = ' + format + ', url = ' + videoURL[format]);
		var format = FORMAT_ORDER[i];
		if (videoURL['22'] == undefined && (videoURL['137'] != undefined || videoURL['247'] != undefined || videoURL['298'] != undefined || videoURL['299'] != undefined)) {
			//We do not have a proper mp4 stream, check for no audio version  298/299
			is720p = true;
		}

		if (videoURL['137'] != undefined) {
			//We do not have a proper mp4 stream, check for no audio version
			is1080p = true;
		}

		if (!SHOW_DASH_FORMATS && format.length > 2)
			continue;
		if (videoURL[format] != undefined && FORMAT_LABEL[format] != undefined && showFormat[format]) {
			downloadCodeList.push({
				url: videoURL[format],
				sig: videoSignature[format],
				format: format,
				label: FORMAT_LABEL[format]
			});
			//debug('Info: itag' + format + ' url:' + videoURL[format]);
		}
	}

	if (downloadCodeList.length == 0) {
		console.log('Error: No download URL found. Probably YouTube uses encrypted streams.');
		return; // no format
	}

	//MISC FUNCTIONS
	function isString(s) {
		return (typeof s === 'string' || s instanceof String);
	}

	function isInteger(n) {
		return (typeof n === 'number' && n % 1 == 0);
	}

	function absoluteURL(url) {
		var link = document.createElement('a');
		link.href = url;
		return link.href;
	}

	function getPref(name) { // cross-browser GM_getValue
		var a = '',
		b = '';
		try {
			a = typeof GM_getValue.toString;
			b = GM_getValue.toString()
		} catch (e) {}
		if (typeof GM_getValue === 'function' &&
			(a === 'undefined' || b.indexOf('not supported') === -1)) {
			return GM_getValue(name, null); // Greasemonkey, Tampermonkey, Firefox extension
		} else {
			var ls = null;
			try {
				ls = window.localStorage || null
			} catch (e) {}
			if (ls) {
				return ls.getItem(name); // Chrome script, Opera extensions
			}
		}
		return;
	}

	function setPref(name, value) { //  cross-browser GM_setValue
		var a = '',
		b = '';
		try {
			a = typeof GM_setValue.toString;
			b = GM_setValue.toString()
		} catch (e) {}
		if (typeof GM_setValue === 'function' &&
			(a === 'undefined' || b.indexOf('not supported') === -1)) {
			GM_setValue(name, value); // Greasemonkey, Tampermonkey, Firefox extension
		} else {
			var ls = null;
			try {
				ls = window.localStorage || null
			} catch (e) {}
			if (ls) {
				return ls.setItem(name, value); // Chrome script, Opera extensions
			}
		}
	}

	function crossXmlHttpRequest(details) { // cross-browser GM_xmlhttpRequest
		if (typeof GM_xmlhttpRequest === 'function') { // Greasemonkey, Tampermonkey, Firefox extension, Chrome script
			GM_xmlhttpRequest(details);
		} else if (typeof window.opera !== 'undefined' && window.opera && typeof opera.extension !== 'undefined' &&
			typeof opera.extension.postMessage !== 'undefined') { // Opera 12 extension
			var index = operaTable.length;
			opera.extension.postMessage({
				'action': 'xhr-' + index,
				'url': details.url,
				'method': details.method
			});
			operaTable[index] = details;
		} else if (typeof window.opera === 'undefined' && typeof XMLHttpRequest === 'function') { // Opera 15+ extension
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (details['onload']) {
						details['onload'](xhr);
					}
				}
			}
			xhr.open(details.method, details.url, true);
			xhr.send();
		}
	}

	function addProp(dest, src) {
		for (var k in src) {
			if (src[k] != null)
				dest[k] = src[k];
		}

		return dest;
	}

	function forLoop(opts, fn) {
		opts = addProp({
				start: 0,
				inc: 1
			}, opts);

		for (var idx = opts.start; idx < opts.num; idx += opts.inc) {
			if (fn.call(opts, idx, opts) === false)
				break;
		}
	}
	function forEach(list, fn) {
		forLoop({
			num: list.length
		}, function (idx) {
			return fn.call(list[idx], idx, list[idx]);
		});
	}
	//MISC FUNCTIONS

	//SIGNATURE BLOCK
	//https://python-pytube.readthedocs.io/en/latest/api.html#module-pytube.cipher
	//https://github.com/philippe44/LMS-YouTube/blob/master/plugin/Signature.pm
	//https://greasyfork.org/en/scripts/5566-youtube-links/code


	function findSignatureCode(sourceCode) {
		debug('Info: signature start ' + getPref(STORAGE_CODE));

		var sigFn;

		forEach([
				/\.signature\s*=\s*(\w+)\(\w+\)/,
				/\.set\(\"signature\",([\w$]+)\(\w+\)\)/,
				/\/yt\.akamaized\.net\/\)\s*\|\|\s*\w+\.set\s*\(.*?\)\s*;\s*\w+\s*&&\s*\w+\.set\s*\(\s*\w+\s*,\s*(?:encodeURIComponent\s*\()?([\w$]+)\s*\(/,
				/;\s*\w+\s*&&\s*\w+\.set\(\w+\s*,\s*(?:encodeURIComponent\s*\()?([\w$]+)\s*\(/,
				/;\s*\w+\s*&&\s*\w+\.set\(\w+\s*,\s*\([^)]*\)\s*\(\s*([\w$]+)\s*\(/
			], function (idx, regex) {
			if (sourceCode.match(regex)) {
				sigFn = RegExp.$1;
				return false;
			}
		});

		if (sigFn == null) {
			console.log('Signature Failure');
			return;
		}

		signatureFunctionName = sigFn;
		debug(signatureFunctionName);

		if (signatureFunctionName == null)
			return setPref(STORAGE_CODE, 'error');
		signatureFunctionName = signatureFunctionName.replace('$', '\\$');
		var regCode = new RegExp(signatureFunctionName + '\\s*=\\s*function' +
				'\\s*\\([\\w$]*\\)\\s*{[\\w$]*=[\\w$]*\\.split\\(""\\);\n*(.+);return [\\w$]*\\.join');
		var regCode2 = new RegExp('function \\s*' + signatureFunctionName +
				'\\s*\\([\\w$]*\\)\\s*{[\\w$]*=[\\w$]*\\.split\\(""\\);\n*(.+);return [\\w$]*\\.join');
		var functionCode = findMatch(sourceCode, regCode) || findMatch(sourceCode, regCode2);
		debug('Info: signaturefunction ' + signatureFunctionName + ' -- ' + functionCode);
		if (functionCode == null)
			return setPref(STORAGE_CODE, 'error');

		var reverseFunctionName = findMatch(sourceCode,
				/([\w$]*)\s*:\s*function\s*\(\s*[\w$]*\s*\)\s*{\s*(?:return\s*)?[\w$]*\.reverse\s*\(\s*\)\s*}/);
		debug('Info: reversefunction ' + reverseFunctionName);
		if (reverseFunctionName)
			reverseFunctionName = reverseFunctionName.replace('$', '\\$');
		var sliceFunctionName = findMatch(sourceCode,
				/([\w$]*)\s*:\s*function\s*\(\s*[\w$]*\s*,\s*[\w$]*\s*\)\s*{\s*(?:return\s*)?[\w$]*\.(?:slice|splice)\(.+\)\s*}/);
		debug('Info: slicefunction ' + sliceFunctionName);
		if (sliceFunctionName)
			sliceFunctionName = sliceFunctionName.replace('$', '\\$');

		var regSlice = new RegExp('\\.(?:' + 'slice' + (sliceFunctionName ? '|' + sliceFunctionName : '') +
				')\\s*\\(\\s*(?:[a-zA-Z_$][\\w$]*\\s*,)?\\s*([0-9]+)\\s*\\)'); // .slice(5) sau .Hf(a,5)
		var regReverse = new RegExp('\\.(?:' + 'reverse' + (reverseFunctionName ? '|' + reverseFunctionName : '') +
				')\\s*\\([^\\)]*\\)'); // .reverse() sau .Gf(a,45)
		var regSwap = new RegExp('[\\w$]+\\s*\\(\\s*[\\w$]+\\s*,\\s*([0-9]+)\\s*\\)');
		var regInline = new RegExp('[\\w$]+\\[0\\]\\s*=\\s*[\\w$]+\\[([0-9]+)\\s*%\\s*[\\w$]+\\.length\\]');
		var functionCodePieces = functionCode.split(';');
		var decodeArray = [];
		for (var i = 0; i < functionCodePieces.length; i++) {
			functionCodePieces[i] = functionCodePieces[i].trim();
			var codeLine = functionCodePieces[i];
			if (codeLine.length > 0) {
				var arrSlice = codeLine.match(regSlice);
				var arrReverse = codeLine.match(regReverse);
				debug(i + ': ' + codeLine + ' --' + (arrSlice ? ' slice length ' + arrSlice.length : '') + ' ' + (arrReverse ? 'reverse' : ''));
				if (arrSlice && arrSlice.length >= 2) { // slice
					var slice = parseInt(arrSlice[1], 10);
					if (isInteger(slice)) {
						decodeArray.push(-slice);
					} else
						return setPref(STORAGE_CODE, 'error');
				} else if (arrReverse && arrReverse.length >= 1) { // reverse
					decodeArray.push(0);
				} else if (codeLine.indexOf('[0]') >= 0) { // inline swap
					if (i + 2 < functionCodePieces.length &&
						functionCodePieces[i + 1].indexOf('.length') >= 0 &&
						functionCodePieces[i + 1].indexOf('[0]') >= 0) {
						var inline = findMatch(functionCodePieces[i + 1], regInline);
						inline = parseInt(inline, 10);
						decodeArray.push(inline);
						i += 2;
					} else
						return setPref(STORAGE_CODE, 'error');
				} else if (codeLine.indexOf(',') >= 0) { // swap
					var swap = findMatch(codeLine, regSwap);
					swap = parseInt(swap, 10);
					if (isInteger(swap) && swap > 0) {
						decodeArray.push(swap);
					} else
						return setPref(STORAGE_CODE, 'error');
				} else
					return setPref(STORAGE_CODE, 'error');
			}
		}

		if (decodeArray) {
			setPref(STORAGE_URL, scriptURL);
			setPref(STORAGE_CODE, decodeArray.toString());
			DECODE_RULE = decodeArray;
			debug('Info: signature ' + decodeArray.toString() + ' ' + scriptURL);
			// update download links and add file sizes
			for (var i = 0; i < downloadCodeList.length; i++) {
				var elem = document.getElementById(LISTITEM_ID + downloadCodeList[i].format);
				var url = downloadCodeList[i].url;
				var sig = downloadCodeList[i].sig;
				if (elem && url && sig) {
					url = url.replace(/\&signature=[\w\.]+/, '&signature=' + decryptSignature(sig));
					elem.parentNode.setAttribute('href', url);
					addFileSize(url, downloadCodeList[i].format);
				}
			}
		}
	}

	function isValidSignatureCode(arr) { // valid values: '5,-3,0,2,5', 'error'
		if (!arr)
			return false;
		if (arr == 'error')
			return true;
		arr = arr.split(',');
		for (var i = 0; i < arr.length; i++) {
			if (!isInteger(parseInt(arr[i], 10)))
				return false;
		}
		return true;
	}

	function fetchSignatureScript(scriptURL) {
		var storageURL = getPref(STORAGE_URL);
		var storageCode = getPref(STORAGE_CODE);
		if (!(/,0,|^0,|,0$|\-/.test(storageCode)))
			storageCode = null; // hack for only positive items
		if (storageCode && isValidSignatureCode(storageCode) && storageURL &&
			scriptURL == absoluteURL(storageURL))
			return;
		try {
			debug('fetch ' + scriptURL);
			isSignatureUpdatingStarted = true;
			crossXmlHttpRequest({
				method: 'GET',
				url: scriptURL,
				onload: function (response) {
					debug('fetch status ' + response.status);
					if (response.readyState === 4 && response.status === 200 && response.responseText) {
						findSignatureCode(response.responseText);
					}
				}
			});
		} catch (e) {}
	}

	function getDecodeRules(rules) {
		var storageCode = getPref(STORAGE_CODE);
		if (storageCode && storageCode != 'error' && isValidSignatureCode(storageCode)) {
			var arr = storageCode.split(',');
			for (var i = 0; i < arr.length; i++) {
				arr[i] = parseInt(arr[i], 10);
			}
			rules = arr;
			debug('Info: signature ' + arr.toString() + ' ' + scriptURL);
		}
		return rules;
	}

	function decryptSignature(sig) {
		function swap(a, b) {
			var c = a[0];
			a[0] = a[b % a.length];
			a[b] = c;
			return a
		};
		function decode(sig, arr) { // encoded decryption
			if (!isString(sig))
				return null;
			var sigA = sig.split('');
			for (var i = 0; i < arr.length; i++) {
				var act = arr[i];
				if (!isInteger(act))
					return null;
				sigA = (act > 0) ? swap(sigA, act) : ((act == 0) ? sigA.reverse() : sigA.slice(-act));
			}
			var result = sigA.join('');
			return result;
		}

		if (sig == null)
			return '';
		var arr = DECODE_RULE;
		if (arr) {
			var sig2 = decode(sig, arr);
			if (sig2)
				return sig2;
		} else {
			setPref(STORAGE_URL, '');
			setPref(STORAGE_CODE, '');
		}

		debug('decryptSignature : ' + sig);
		return sig;
	}
	//SIGNATURE BLOCK


	//If existing button remove it
	function removeElement(element) {
		element && element.parentNode && element.parentNode.removeChild(element);
	}

	// Usage:
	var isthere = document.getElementById('ytdl_btn');
	if (isthere) {

		//Remove old clickevent
		var noClickEvent = true;

		removeElement(document.getElementById('ytdl_btn'));
		removeElement(document.getElementById('ytdl_list'));

		//Remove iFrame DIV
		var frm_div = document.getElementById('EXT_DIV');
		if (frm_div) {
			frm_div.parentElement.removeChild(frm_div);
		}
	}

	var parentElement = document.querySelector("ytd-watch #meta");

	// get button labels
	var language = document.documentElement.getAttribute('lang');
	var buttonText = (BUTTON_TEXT[language]) ? BUTTON_TEXT[language] : BUTTON_TEXT['en'];
	var buttonLabel = (BUTTON_TOOLTIP[language]) ? BUTTON_TOOLTIP[language] : BUTTON_TOOLTIP['en'];

	//Get and populate menu
	//Populate available itags


	//Populate link items
	let listItems = [];
	if (((window.navigator.userAgent || '').toLowerCase()).indexOf('windows') >= 0) {
		videoTitle = videoTitle.replace(/#/g, '').replace(/&/g, '_'); // Windows
	} else {
		videoTitle = videoTitle.replace(/#/g, '%23').replace(/&/g, '%26'); //  Mac, Linux
	}

	for (var i = 0; i < downloadCodeList.length; i++) {
		listItems.push({
			id: downloadCodeList[i].format,
			'href': downloadCodeList[i].url,
			'download': videoTitle + '.' + FORMAT_TYPE[downloadCodeList[i].format],
			'label': downloadCodeList[i].label,
			'uid': LISTITEM_ID + downloadCodeList[i].format,
			'loop': i + ''
		});
	}

	//Extra buttons
	//Support
	listItems.push({
		id: 'support',
		'href': 'http://123ytdl.github.io',
		'download': videoTitle,
		'label': 'About',
		'uid': LISTITEM_ID + '-support'
	});

	let style = `#ytdl_list {
		background-color: white;
		position: absolute;
		width: 250px;
		box-shadow: 1px 5px 25px 1px gray;
		padding: 5px 0;
		display: none;
		z-index: 55555;
		
	}
	
	.ytdl_list_item {
		height: 40px;
		cursor: pointer;
		display: flex;
		-ms-flex-direction: row;
		-webkit-flex-direction: row;
		flex-direction: row;
		-ms-flex-align: center;
		-webkit-align-items: center;
		align-items: center;
		font-family: 'Roboto', 'Noto', sans-serif;
		-webkit-font-smoothing: antialiased;
		font-size: 16px;
		font-weight: 400;
		line-height: 24px;
		white-space: nowrap;
		padding: 0 16px;
		color: black;
	}
	
	
	.ytdl_icon{
		width: 25px;
		height: 25px;
		margin-right: 31px;
		vertical-align: middle;
	}
	.ytdl_list_item a{
		width: 100%;
		display: block;
		text-decoration: none;
	}
	.ytdl_list_item a:visited{
		color: hsl(0, 0%, 6.7%);
		text-decoration: none;
		
	}
	
	.ytdl_list_item:hover {
		background-color: #f5f5f5;
	}
	
	#ytdl_btn {
	background-color: green;
	border-radius: 2px;
	padding: 10px 16px;
	margin: auto 4px;
	white-space: nowrap;
	font-size: 1.4rem;
	font-weight: 500;
	letter-spacing: .007px;
	text-transform: uppercase;
	-ms-flex-direction: row;
	-webkit-flex-direction: row;
	flex-direction: row;
	display: inline-block;
	position: relative;
	box-sizing: border-box;
	min-width: 5.14em;
	border: none;
	color: white;
	
}`;

	let styleDom = document.createElement("style");
	styleDom.setAttribute("type", "text/css");
	document.head.appendChild(styleDom);
	styleDom.innerHTML = style;

	//console.log(videoID + videoTitle);
	//console.log('LIST : ' + JSON.stringify(listItems));

	function createList(list) {
		let listStr = "";

		list.forEach(function (item) {

			if (item.click) {
				var clean_url = encodeURIComponent(item.href);
				clean_url = "";
				//console.log(clean_url);
				listStr += `<div class='ytdl_list_item' id="${item.uid}"><a href="javascript:void(0);">${item.label}</a></div>`;

			} else {
				//'loop', i + ''
				if (item.mayday) {
					listStr += `<div class='ytdl_list_item' id="${item.uid}" loop="${item.loop}"><a href="${item.href}" onclick="alert('Oops!!! There seems to be no links in the download list');">${item.label}</a></div>`;
				} else {
					listStr += `<div class='ytdl_list_item' id="${item.uid}" loop="${item.loop}"><a href="${item.href}" target="_blank">${item.label}</a></div>`;
				}
			}
		});

		listStr += '';

		let listDom = document.createElement("div");
		listDom.setAttribute("id", "ytdl_list");
		listDom.setAttribute("style", "display: none;");
		listDom.innerHTML = listStr;

		return listDom;
	}

	let c = setInterval(function () {
			if (document.querySelector("ytd-video-owner-renderer") || document.getElementById("watch7-action-buttons") || document.getElementById("watch8-secondary-actions") || document.getElementById('ytm-item-section-renderer>lazy-list')) {
				clearInterval(c);
				let button = document.createElement("button");
				button.setAttribute("id", "ytdl_btn");
				button.textContent = ' ' + buttonText + ': ▼' + ' ';
				button.setAttribute('data-tooltip-text', buttonLabel);

				if (isMat) {
					insertAfter(button, document.querySelector("ytd-video-owner-renderer"));
				} else {
					var parentElement = document.getElementById('watch7-action-buttons');
					if (parentElement == null) {
						parentElement = document.getElementById('watch8-secondary-actions');
						if (parentElement == null) {
							console.log('Error - Old Youtube Code No container for adding the download button. YouTube must have changed the code.');
							return;
						} else {
							newWatchPage = true;
						}
					}

					// add the button
					if (!newWatchPage) { // watch7
						parentElement.appendChild(button);
					} else { // watch8
						parentElement.insertBefore(button, parentElement.firstChild);
					}
					//insertAfter(button, document.querySelector("watch8-action-buttons"));
				};
			}
		}, 10);

	if (!noClickEvent) { //Only if not a reload
		live("click", "ytdl_btn", function () {
			let button = document.querySelector("#ytdl_btn");
			let list = document.querySelector("#ytdl_list");
			let position = offset(button);
			list.style.display = isHidden(list) ? "block" : "none";
			list.style.top = position.top + button.offsetHeight + 5 + "px";
			list.style.left = position.left - (list.offsetWidth - button.offsetWidth) / 2 + "px";
		});
	}

	//Add event handlers
	document.addEventListener("click", function (e) {
		let t = e.target,
		id = t.getAttribute("id"),
		css = t.getAttribute("class");
		if (!(id === "ytdl_btn" || id === "ytdl_list" || (css && css.includes("ytdl_list_item")))) {
			document.querySelector("#ytdl_list").style.display = "none";

		}
	});

	function addEvent(el, type, handler) {
		if (el.attachEvent)
			el.attachEvent('on' + type, handler);
		else
			el.addEventListener(type, handler);
	}

	//Attach list
	document.body.appendChild(createList(listItems));

	//Attach Click Event
	for (var i = 0; i < downloadCodeList.length; i++) {
		var downloadFMT = document.getElementById(LISTITEM_ID + downloadCodeList[i].format);
		var url = (downloadCodeList[i].url).toLowerCase();
		//console.log("URL : " + LISTITEM_ID + downloadCodeList[i].format + " - " + url);
		if ((url.indexOf('clen=') > 0 && url.indexOf('dur=') > 0 && url.indexOf('gir=')) || (url.indexOf('dur=') > 0 && url.indexOf('itag=22') > 0) > 0
			 && url.indexOf('lmt=') > 0) {
			downloadFMT.addEventListener('click', notifyExtension, false);
		}
	}

	//AFTER LIST ATTACH
	for (var i = 0; i < downloadCodeList.length; i++) {
		addFileSize(downloadCodeList[i].url, downloadCodeList[i].format);
	}

	//Add welcome box
	//showWelcomeBox();

	function live(event, selector, callback, context) {
		addEvent(context || document, event, function (e) {
			var found,
			el = e.target || e.srcElement;
			while (el && !(found = el.id == selector))
				el = el.parentElement;
			if (found)
				callback.call(el, e);
		});
	}

	function offset(el) {
		var rect = el.getBoundingClientRect(),
		scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
		scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		return {
			top: rect.top + scrollTop,
			left: rect.left + scrollLeft
		};
	}

	function isHidden(el) {
		var style = window.getComputedStyle(el);
		return (style.display === 'none');
	}

	function insertAfter(el, referenceNode) {
		referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
	}

	function notifyExtension(e) {
		var elem = e.currentTarget;
		e.returnValue = false;
		if (e.preventDefault) {
			e.preventDefault();
		}
		var loop = elem.getAttribute('loop');
		if (loop) {
			//console.log('Started downloading === ' + downloadCodeList[loop].url + ' URL === ' + videoTitle + '.' + FORMAT_TYPE[downloadCodeList[loop].format]);
			chrome.runtime.sendMessage({
				"url": downloadCodeList[loop].url,
				"filename": videoTitle + '.' + FORMAT_TYPE[downloadCodeList[loop].format]
			});

		}
		return false;
	}

	function injectScript(code) {
		var script = document.createElement('script');
		script.type = 'application/javascript';
		script.textContent = code;
		document.body.appendChild(script);
		document.body.removeChild(script);
	}

	function addFileSize(url, format) {

		function updateVideoLabel(size, format) {
			var elem = document.getElementById(LISTITEM_ID + format);
			if (elem) {
				size = parseInt(size, 10);
				if (size >= 1073741824) {
					size = parseFloat((size / 1073741824).toFixed(1)) + ' GB';
				} else if (size >= 1048576) {
					size = parseFloat((size / 1048576).toFixed(1)) + ' MB';
				} else {
					size = parseFloat((size / 1024).toFixed(1)) + ' KB';
				}
				if (elem.childNodes.length > 1) {
					elem.lastChild.nodeValue = ' (' + size + ')';
				} else if (elem.childNodes.length == 1) {
					elem.appendChild(document.createTextNode(' (' + size + ')'));
				}
			}
		}
		var matchSize = findMatch(url, /[&\?]clen=([0-9]+)&/i);

		if (matchSize) {
			updateVideoLabel(matchSize, format);
		} else {
			try {

				crossXmlHttpRequest({
					method: 'HEAD',
					url: url,
					onload: function (response) {
						if (response.readyState == 4 && response.status == 200) { // add size
							var size = 0;
							if (typeof response.getResponseHeader === 'function') {
								size = response.getResponseHeader('Content-length');
							} else if (response.responseHeaders) {
								var regexp = new RegExp('^Content\-length: (.*)$', 'im');
								var match = regexp.exec(response.responseHeaders);
								if (match) {
									size = match[1];
								}
							}
							if (size) {
								updateVideoLabel(size, format);
							}
						}
					}
				});
			} catch (e) {
				console.log('URL : ' + e);
			}
		}
	}

	function findMatch(text, regexp) {
		var matches = text.match(regexp);
		return (matches) ? matches[1] : null;
	}

	function crossXmlHttpRequest(details) { // cross-browser GM_xmlhttpRequest
		if (typeof GM_xmlhttpRequest === 'function') { // Greasemonkey, Tampermonkey, Firefox extension, Chrome script
			GM_xmlhttpRequest(details);
		} else if (typeof window.opera !== 'undefined' && window.opera && typeof opera.extension !== 'undefined' &&
			typeof opera.extension.postMessage !== 'undefined') { // Opera 12 extension
			var index = operaTable.length;
			opera.extension.postMessage({
				'action': 'xhr-' + index,
				'url': details.url,
				'method': details.method
			});
			operaTable[index] = details;
		} else if (typeof window.opera === 'undefined' && typeof XMLHttpRequest === 'function') { // Opera 15+ extension
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (details['onload']) {
						details['onload'](xhr);
					}
				}
			}
			xhr.open(details.method, details.url, true);
			xhr.send();
		}
	}

}
