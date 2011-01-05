# The embed code is compressed and minified using the closure compiler.
# Please run ./compile to build the embed code.
#
# Lines starting with #<space> will be removed during compilation.
# Lines starting with #<A> will be included only for target A.
# A line can be included in multiple targets if the target names
# are separated with '|', e.g. #spacebook|myface alert('hello');

/**
 * If the code is included twice, the second instance will not adversely
 * affect the first.  
 *   @param {Object} params - see bottom of this file for the definition
 *       of params.  It contains the partner settings for the Meebo Bar. 
 */
window.Meebo || (function(params) {
	var win = window;
	
	/**
	* Return early for extensions if either:
	*	we are on http(s)?://www.meebo.com/
	*	we are on a *.dev.meebo.com page
	*	the page is iframed (top window is not this window)
	*	the page is a popout (win.opener exists)
	*/
	
	#everywhere|dogfood	if (win.location.toString().match(/^https?:\/\/www\.meebo\.com\/?(messenger)?\/?$/)
	#everywhere|dogfood		|| win.location.hostname.toString().match(/\.dev\.meebo\.com$/)
	#everywhere|dogfood		|| win.location.hostname == '127.0.0.1' || win.location.hostname == 'localhost'
	#everywhere|dogfood		|| win.location.protocol != 'http:'
	#everywhere|dogfood		|| win.top != win) { return; }
	
	/**
	 * This is the exported Meebo API function 'Meebo' that lives in the 
	 * global scope.  Partners can execute API functions by calling
	 *     Meebo("<name of API method>", arg1, arg2, ...);
	 * Some partners also set custom parameters on the Meebo object for
	 * controlling certain aspects of the bar.
	 * 
	 * The Meebo object also acts as an onload handler for Meebo.  To
	 * be notified when the Meebo Bar loads, a partner can call:
	 *     Meebo(function() {
	 *         ... this function runs once the Meebo Bar loads ...
	 *     });
	 */
	
	var Meebo = win.Meebo = win.Meebo || function() { (Meebo._ = Meebo._ || []).push(arguments); },
		
		doc = document,
		body = 'body',
		bodyEl = doc[body],
		caller;
	
	/**
	 * If the embed code is placed (incorrectly) in the HEAD of a document,
	 * we will try initializing the bar again once the BODY element exists. 
	 */
	
	if(!bodyEl) {
		caller = arguments.callee;
		return setTimeout(function() { caller(params); }, 100);
	}
	
	/**
	 * These properties are used for logging certain events that happen
	 * while the Meebo Bar loads.  We use these to monitor, tune, and
	 * optimize the performance of the Meebo Bar to ensure it doesn't 
	 * block partner sites and minimize the impact of loading the bar.
	 */
	Meebo.$ = {0: +new Date};
	Meebo.T = function(key) {
		Meebo.$[key] = new Date - Meebo.$[0];
	};
	
	/**
	 * This is the internal version number of the Meebo Bar embed code.
	 */
	Meebo.v = 4;
	
	/**
	 * Storing string values for certain properties improves the minification of
	 * the code when using the closure compiler.
	 */
	var load = 'load',
		appendChild = 'appendChild',
		createElement = 'createElement',
		src = 'src',
		lang = 'lang',
		network = 'network',
		domain = 'domain',
		
		/**
		 * Create placeholder DOM where the Meebo Bar will go.
		 */
		meeboDiv = doc[createElement]('div'),
		el = meeboDiv[appendChild](doc[createElement]('m')),
		iframe = doc[createElement]('iframe'),
		
		/**
		 * Here we listen for the load event of the page to monitor page 
		 * load times.  This must be done in the embed code since the bar
		 * itself defers to the page for loading priority.  In some cases,
		 * this means the bar will load after the page loads, in which case
		 * we wouldn't be able to measure this value.
		 */
		addEventListener = 'addEventListener',
		attachEvent = 'attachEvent',
		documentS = 'document',
		contentWindow = 'contentWindow',
		domainSrc,
		onload = function() {
			Meebo.T(load);
			Meebo(load);
		};
	
	if (win[addEventListener]) {
		win[addEventListener](load, onload, false);
	} else {
		win[attachEvent]('on' + load, onload);
	}
	
	/**
	 * Prepare the placeholder DOM (make it invisible) and insert it
	 * into the DOM.
	 */
	meeboDiv.style.display = 'none';

	/**
	 * For the extensions, we'd like to append the #meebo div to the bottom of
	 * the page so that we're drawn on top of elements with the same z-index.
	 * Unfortunately, there is an IE issue when appending elements with
	 * innerHTML'ed contents while parsing happening. This special case should
	 * be safe for extensions, in which the DOM has finished loading at the time
	 * of embed code execution.
	 */
	#everywhere|dogfood bodyEl[appendChild](meeboDiv).id = 'meebo';
	#dashboard|meebo-site|spacebook|myface bodyEl.insertBefore(meeboDiv, bodyEl.firstChild).id = 'meebo';
	iframe.frameBorder = "0";
	iframe.id = "meebo-iframe";
	iframe.allowTransparency = "true";
	el[appendChild](iframe);

	/**
	 * Try to start writing into the blank iframe. In IE, this will fail if document.domain has been set, 
	 * so fail back to using a javascript src for the frame. In IE > 6, these urls will normally prevent 
	 * the window from triggering onload, so we only use the javascript url to open the document and set 
	 * its document.domain
	 */
	try {
		iframe[contentWindow][documentS].open();
	} catch(e) {
		params[domain] = doc[domain];
		domainSrc = "javascript:var d=" + documentS + ".open();d.domain='" + doc.domain + "';";
		iframe[src] = domainSrc + "void(0);";
	}

	/**
	 * html() builds the string for the HTML of the iframe.
	 */	
	function html() {
		return [
			'<', body, ' onload="var d=', documentS, ";d.getElementsByTagName('head')[0].",
			appendChild, '(d.', createElement, "('script')).", src, "='//",
			#spacebook|myface /dev\.meebo\.com/.test(document.location.host)?document.location.host : params.host || 'cim.meebo.com',
			#meebo-site '{{ bar_hostname }}',
			#dashboard 'cim.meebo.com',
			#everywhere|dogfood window.MeeboExtensionOptions && MeeboExtensionOptions.domain ||
				#everywhere 'www.meebo.com',
				#dogfood 'alpha.meebo.com',
			'/cim?iv=', Meebo.v, '&',
			network, '=', params[network],
			#meebo-site '&v={{ bar_version }}',
			#everywhere|dogfood '&extension=true',
			#spacebook|myface params['barType'] == 'extension' || params['barType'] == 'mini' ? '&'+params['barType']+'=true' : '',
			params[lang] ? '&' + lang + '=' + params[lang] : '',
			params[domain] ? '&' + domain + '=' + params[domain] : '',
			'\'"></', body, '>'
		].join('');
	};

	/**
	 * Set the HTML of the iframe. In IE 6, the document.domain from the iframe src hasn't had time to 
	 * "settle", so trying to access the contentDocument will throw an error. Luckily, in IE 7 we can 
	 * finish writing the html with the iframe src without preventing the page from onloading
	 */
	try {
		var d = iframe[contentWindow][documentS];
		d.write(html());
		d.close();
	} catch(e) {
		iframe[src] = domainSrc + 'd.write("' + html().replace(/"/g, '\\"') + '");d.close();';
	}

	/**
	 * All done! Record the time it took to run this code (should be < 10ms).
	 */
	Meebo.T(1);
})({
	#spacebook|myface|meebo-site host: (function(){var match=document.cookie.match(/build=([\w\.-]+)/); return match ? match[1] : null})(),
	#spacebook|myface barType: (function(){var match=document.cookie.match(/barType=([\w]+)/); return match ? match[1] : null})(),
	#spacebook  network: 'spacebook'
	#myface     network: 'myface'
	#meebo-site network: 'meebo-site'
	#everywhere|dogfood network: 'everywhere'
	#dashboard  network: '%(partner)s'
});
