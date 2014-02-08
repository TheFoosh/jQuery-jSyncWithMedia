/* jQuery jSyncWithMedia - Beta 1.0.0  - 2014/02
 *
 * @file
 * Copyright (c) 2012-2014 Richard Fouchaux
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
 * http://rcfouchaux.ca/jquery.syncwithmedia/
 */
(function($) {

	var DEBUG = true, /* true | false set true for console feedback */
		methods = {
		init : function(options) {
			/*
			 * These styles enable you to change nearly 
			 * anything about the appearance. You can 
			 * also quite easily add your own. 
			 *  *  *  *  *  *  *  *  *  *  *  *  *  *  */
			var /* The first group need to be declared before the 
			     * "defaults" object, because we use them inside it
			     */
				jswmTitleId = "jswmTitle",
				jswmSubtitlesId = "jswmSubtitles",
				jswmFirstPId = "jswmFirstP",
				jswmAudioClassName = "jswm-audio",
				syncItemClassName = "jswm-syncItem",
				objDisplayId = "jswmObjDisplay", /* TODO: This becomes a fully stylable display area. */  /*[ true | false ] Displays currentTime */
				defaults = {
				setMinHeight : true,
				setMaxHeight : false, // These two booleans set classes that can be used by $.ready().
				setupMode : false,
				mode : 'subtitles', /* [ 'replace' | 'bullets' ] Experimental. "Bullets" meant to be more like PowerPoint */
				moduleClass : 'jswm  jswm-bg_gradient_pearl', /* Extend styling in .css file */
				titleElement : 'h3:first', /* Defaults to the first <h3 /> enclosure, can be any valid jQuery selector, e.g., 'div' */
				subtitleElement : 'ul:first', /* valid jQuery selector, e.g., 'div' */
				moduleAttr : {
					"title" : "jQuery.jSyncWithMedia",
					"role" : "application",
					"aria-labelledby" : jswmTitleId,
					"aria-hidden" : "false",
					"aria-describedby" : jswmFirstPId /* This tells assistive technology first p describes the module. Thus, your first p should describe the module. */
				},
				moduleCSS : {
					"position" : "relative",
					"margin" : "18px auto",
					"margin-top" : "36px",
					"padding" : "18px",
					"text-align" : "left",
					"width" : "720px",
					"border" : "3px solid #ddd",
					"border-radius" : "9px",
					"min-height" : "360px"
				},
				titleAttr : {
					"id" : jswmTitleId
				},
				titleCSS : {
					"position" : "absolute",
					"top" : "-45px",
					"left" : "45px",
					"font-size" : "1.54em",
					"font-family" : "sans-serif",
					"background-color" : "#dedeef",
					"padding" : "3px 9px",
					"border" : "1px solid #333",
					"border-radius" : "3px"
				},
				subtitlesAttr : {
					"id" : jswmSubtitlesId,
					"class" : "subtitles"
				},
				subtitlesCSS : {
					"position" : "absolute",
					"top" : "102px",
					"left" : "0"
				},
				subtitlesLiAttr : {
					"aria-expanded": "false" /* Initializes false, do not change: functionality depends on this setting */
				},
				subtitlesLiCSS : { "color":"rgb(33,33,33)" },
				firstPAttr : {
					"id" : jswmFirstPId
				},
				firstPCSS : {
					"font-size" : "1.15em",
					"line-height" : "1.1"
				},
				normalPAttr : {},
				normalPCSS : {
					"font-size" : ".95em",
					"line-height" : "normal"
				},
				audioAttr : {
					"controls" : "controls",
					"autoplay" : false,
					"accesskey" : "A",
					"tabindex" : "0",
					"class" : jswmAudioClassName+" rad3"
				},
				audioCSS : {
					"margin" : "15px 0 0 0",
					"background-color" : "#ccbbaa",
					"box-shadow" : "-2px-2px rgba(96,96,96,0.3)",
					"max-width" : "42%",
					"height" : "39px"
				}/*
				  *,
				videoAttr : {
					"controls" : "controls",
					"autoplay" : false,
					"accesskey" : "A",
					"tabindex" : "0"
				},
				videoCSS : {
					"margin" : "15px 0 0 0",
					"background-color" : "#ccbbaa",
					"border" : "2px solid #AABBCC",
					"border-radius" : "3px 3px 3px 3px",
					"box-shadow" : "-2px-2pxrgba(96,96,96,0.3)",
					"max-width" : "42%"
				}
				*
				**/,
				showCTCSS : {				    
                                        "position" : "absolute",
                                        "bottom" : "-21px",
                                        "right" : "-21px",
                                        "max-width" : "24px",
                                        "min-width" : "24px",
                                        "vertical-align" : "middle",
                                        "text-align" : "center",
                                        "max-height" : "21px",
                                        "min-height" : "21px",
                                        "padding" : "6px 3px 1px 3px",
                                        "font-size" : "72%",
                                        "border" : "2px solid #773",
                                        "border-radius" : "90px",
                                        "color" : "#111",
                                        "background-color" : "#dda",
                                        "box-shadow" : "1px 1px 3px #223"
				}
			},
			  _addBrowserClass = function(){
			// Add a className based on user-agent. Yes, user-agent. I might *want* it to be spoofable.
			   var browserClass = '',
				   ua = navigator.userAgent,
				   brwsArr = [/Chrome/,/MSIE/,/Firefox/,/Opera/,/browser-not-recognized/],
				   className = ''
			   ;
				   
				   // loop through array and check for match
				   for (var i=0; i<brwsArr.length; i++) {
					   className = brwsArr[i].toString().toLowerCase().replace(/\//g,''); // console.info(i,brwsArr[i].test(ua));
					   if (brwsArr[i].test(ua)){ break; }
				   }
				   
			//	   console.info('browserClass:',b);
				   $('html').addClass(className);
			},
			_showEnding = function(){
				$('[data-jswm-on="0"]').attr({"aria-expanded":"false"});
				$('[data-jswm-off="-1"]').attr({"aria-expanded":"true"});
				if ( DEBUG ) { console.log('Called _showEnding();'); }
			},
			_setInitOpacity = function(el){
			var $media = el.find('.jswm-audio-element, .jswm-video-element') ;
				if ( DEBUG ) { console.log('Called _setInitOpacity(el);'); }
				$media.on('timeupdate',function(event){
				var
				 cT = this.currentTime,
				 currentOpacity = $('.jswm .jswm-syncItem.jswm-noHideOnLoad').css('opacity') ;
					
					/* Setting initial opacity of special items:
					 * (data-jswm-on <= 0 && data-jswm-on > -1) should be showing at start; Previous versions
					 * data-jswm-on <= -1 should be showing at start;
					 * hasEnding
					 *  */
					if(cT <= 0 && currentOpacity !== '1 !important')
					{
				     $('.jswm .jswm-syncItem.jswm-noHideOnLoad').css('opacity','1 !important');
				if ( DEBUG ) { console.log('Set \'opacity\',\'1 !important\''); }
					}
				});				
			},
			_showNoHideOnLoad = function(){
				$('.jswm [data-jswm-on^="0"], .jswm [data-jswm-on="-1"]').not('[data-jswm-off="-1"]').attr('aria-expanded','true');
				if ( DEBUG ) { console.log('Called _showNoHideOnLoad()'); }
			},
		    _sync = function(el) {
			/* TODO: check into 
			 * http://benalman.com/code/projects/jquery-dotimeout/examples/delay-poll/ jQ object example.
			 * TODO: Currently this will bind to all media elements present, 
			 * wreaking havoc if played. 
			 * ... finish jswmObjDisplay. 
			 * IMPORTANT: Must retain "aria-owns". 
			 * TODO: Re alpha 1 memo '...making fully ARIA compliant' see my blog post.
			 *       Add broad semantic structure role=application and ownership/labels.
			 * Meanwhile probably very sloppy to permit both, but I trust myself 
			 * not to add extra elements, intend to work on it.
			 */
			var $media = el.find('audio, video'),
				 $syncItems = $('.jswm-syncItem'), // .not('[data-jswm-on="-1"]')
				 $theEnd = $('[data-jswm-off="-1"]'),
				 hasEnding = $theEnd.length >= 1 ? true : false	 ;	
				 	
				if ( DEBUG ) { console.log('Found '+$syncItems.length+' items to be synched.'); }
				if ( hasEnding ) { console.log('Ending contains',$theEnd.length,'item(s).'); }
				
				if($media.length === 0){ console.log('Warning... $media.length===0'); }
				if( DEBUG && settings.setupMode ) {
						if ( DEBUG ) { console.log('setupMode. Showing Sync Helper'); }
					 }
			
			/**
			 * TODO: get/set
			 */
				/* Check items' on/off as media plays */
			$media.on({
			timeupdate : function(event)
			{
				var
				 cT = this.currentTime, cTd = cT.toFixed(1) ;
		//		if ( DEBUG ) { console.log('Syncing items... '); }

				// Update the time shown in the 'setup' helper.
				if( settings.setupMode ) {
					 	$('#showCT').text(cTd);			 	
				}
				 
		//		if ( DEBUG ) { console.log('timeupdate event'); }

				$syncItems.each(function(i, item) {
				var neg1, on, off, turnMeOn, turnMeOff, n, msg, theTxt = $(item).text() ; /* ^end declare vars */
				   
				   /* I break the logic up so I can visualize and understand it:
				    * give variables meaningful english names, then I lay them 
				    * out in a line and tyr to account for all possibilities. I
				    * know I have a conflict because I originally wanted -1 to mean 
				    * one thing then I changed my mind.  
				    *  
				    * How would a programmer do this? [ To see what a programmers would do, see popcorn.js ]  */
				    neg1 = parseFloat(-1.0); /* just being clear */
				    on = parseFloat( $(item).attr('data-jswm-on') ) || neg1 ;
				    off = parseFloat( $(item).attr('data-jswm-off') ) || 0 ; /* Set data-jswm-off="-1" for a "The End" or credits screen */
				    turnMeOff = (    off <= 0    || ( off  >  0  && cT >= off )                          ) ? true : false ;
				    turnMeOn =  (    ( on  <= 0 && on  > -1 )    || ( cT   >= on && cT < off && turnMeOff === false  )   ) ? true : false ;
				    n = i + 1 ;
					
					if(turnMeOn === true && turnMeOff === false)
					{
				    	$(item).attr('aria-expanded','true')/*.removeClass('jswm-off').addClass('jswm-on')*/;
				    	msg = 'Turn me on!'; 
						// 
					} else if (turnMeOn === true && turnMeOff === true || (turnMeOn === false && turnMeOff === false) || (turnMeOn === false && turnMeOff === true ) )
					{
						$(item).attr('aria-expanded','false')/*.removeClass('jswm-on').addClass('jswm-off')*/;

				    	msg = 'Turn me off!' ;
						
					}
					
				// Heavy console output, emergency use only: if ( DEBUG ) { console.log(n,msg); }
				/* You can also throttle/restrict output somewhat: cT >= 3.9 && cT <= 4.25 || cT >= 4.9 && cT <= 5.25 ||  */
				if ( cT == 0 || (cT >= 1.9 && cT <= 2.25) || cT >= 6.9 && cT <= 7.2 || cT == 10 ) {			
						//	if ( DEBUG ) { console.log('cT:', cT, '\nItem',n,'On:', on,'  Off:', off, msg, '\n', theTxt); }
					}
				});
			} /* ^end function */
			,
			ended : function (event) {	  
			if ( DEBUG ) { console.log('Media ended.'); }
			_showNoHideOnLoad();		
			if(hasEnding){ setTimeout(function () {
			  _showEnding();
			}, 200) }
			
			} 
			} /* ^end object */);
			if(settings.setupMode) {				
			 $media.wrap('<span style="position:relative;" class="shadowMedium rad18" />').parent()
			 .append('<div id="showCT">0.0</div>').find('#showCT').css(settings.showCTCSS);	
			}
			/* A tenth of a second is now enough to make sure it fully inits. */
			setTimeout(function(){
				$('.jswm audio:first').focus();
			},100);
			 
		}, settings = $.extend(true, defaults, options), /* 'true' is required with data map notation to make $extend merge rather than replace. These variable names clarify we're combining defaults + options to get our settings. */
			mediaType = 'none', /* local variable to store type. 
			                     * TODO: should support [ 'audio' | 'video' | 'mixed' ] 
			                     * But until it does stick to one instance of one type of media only!! */
			modeClassName = {subtitles:"subtitlesmode",bullets:"bulletsmode"},
			setMinHeight = settings.setMinHeight,
			setMaxHeight = settings.setMaxHeight,
			minmaxH = (setMinHeight ? ' setMinHeight' : '') + (setMaxHeight ? ' setMaxHeight' : '')
		; // END var dec
		if ( DEBUG === true ) { console.log('minmaxH:"'+minmaxH+'".'); }
		// The buck STARTs here.
			if(this.has('audio,video')) { 
				if ( DEBUG === true ) { console.log('Found media... \napplying settings...'); }

			/* STYLING
			 * Applying all the styles
			 * Added hide() after watching, from Canada, slow init on my Icelandic server.
			 * Later: I've tried many other ways too. aria-hidden="true" applies visibility:none
			 * but I still see a flash of unformatted objects just as the app initializes. 
			 */
			this.hide().addClass('jswm '+modeClassName[settings.mode] + minmaxH).attr(settings.moduleAttr).css(settings.moduleCSS);
			this.find(settings.titleElement).attr(settings.titleAttr).css(settings.titleCSS);
			/* TODO: switch/case to make settings.mode account for other than ul   */
			this.find(settings.subtitleElement).addClass('jswm-syncItems')
			         .attr(settings.subtitlesAttr).css(settings.subtitlesCSS)
			         .children('li').addClass(syncItemClassName).attr(settings.subtitlesLiAttr);
			
			/*  I should use error handling like this more often */
			if (this.find('audio').length >= 1 )
			{
				if ( DEBUG ) { console.log('Audio present.'); }
				try
				{
				this.find('audio').addClass(jswmAudioClassName).attr(settings.audioAttr).css(settings.audioCSS);
				mediaType = 'audio';
				} catch(err)
				{ 
					if( err.message === 'a is undefined' || err.message === 'Cannot read property \'nodeType\' of undefined' ){
					if ( DEBUG ) { console.log('No audio present.'); }
					} else {
					if ( DEBUG ) { console.log('ERROR while styling audio:', err.message); }
				mediaType = 'none'; /* Presumably redundant */
				}
			} 
			
			if(this.find('video').length >= 1 )
			{
			if ( DEBUG ) { console.log('Video present.' ); }
				try
				{
				 this.find('video').addClass('jswm-video-element').attr(settings.videoAttr).css(settings.videoCSS);
				} catch(err)
				{ 
					if( err.message === 'a is undefined' || err.message === 'Cannot read property \'nodeType\' of undefined' )
					{
					if ( DEBUG ) { console.log('No video present.'); }
					} else {
					if ( DEBUG ) { console.log('ERROR while styling video:', err.message); }
					}
					 /* mediaType = 'none'; Presumably redundant */
					}
				}
			}
			this.find('p:first').attr(settings.firstPAttr).css(settings.firstPCSS);
			this.find('p').not('p:first').attr(settings.normalPAttr).css(settings.normalPCSS);

			} else {
			if ( DEBUG ) { console.log('No media found.'); }
			$('body').prepend('<div class="jswm-alert">No media found.</div>');
			}
			if ( DEBUG ) { console.log('mediaType',mediaType); }			
/* 
 * Call private method _sync()
 * to bind items to timecode
 * and then _showNoHideOnLoad to 
 * display splash screen, titles
 * * * * * * * * * * * * * * * */	
	try
	{
		_sync(this);
		this.show('slow');
		// if ( DEBUG ) { console.log('_sync OK'); }
	}
	catch(err){ if ( DEBUG ) { console.log('_sync ERROR',err.message); } }
	 _showNoHideOnLoad(); /*  */
	 _setInitOpacity(this); /* 0s and -1s */			
	 _addBrowserClass(); /* this sets up stuff in jswm.css */
	},
	
	/* I [still] wonder how to go about the next two... [but I have a better idea] */
		jswmShow : function(item,animType) {
			/* TODO: Make configurable. Prefer animation */ 
			item.attr('aria-expanded','true');
		},
		jswmHide : function(item,animType) {
			/* TODO: Make configurable. Prefer animation */ 
			item.attr('aria-expanded','false');
		}
	/*
	 * and if ducks are in a row should now be able to call my methods.
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */ 
	};

	$.fn.jSWM = function(method) {

		// Method calling logic
		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1)); /* Was curious. See 
			                                                                               *  http://stackoverflow.com/questions/2125714/explanation-of-slice-call-in-javascript
			                                                                               * */
		} else if( typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.jSyncWithMedia');
		}

	};

})(jQuery); 
