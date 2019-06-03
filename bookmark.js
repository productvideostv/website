/**
 *
 * Add to bookmark
 * Several tests are necessary in order for this "simple" action to work in most of the browsers
 *
 */

 // window.onload
window.onload = function () 
{

	// First, we define the element where the "Add to bookmark" action will trigger
	var triggerBookmark = $("#bookmarkbutton"); // It must be an `a` tag

	triggerBookmark.click(function() {
		
		if (window.sidebar && window.sidebar.addPanel) { // Firefox <23
			
			window.sidebar.addPanel(document.title,window.location.href,'');

		} else if(window.external && ('AddFavorite' in window.external)) { // Internet Explorer

			window.external.AddFavorite(location.href,document.title); 

		} else if(window.opera && window.print || window.sidebar && ! (window.sidebar instanceof Node)) { // Opera <15 and Firefox >23
			/**
			 * For Firefox <23 and Opera <15, no need for JS to add to bookmarks
			 * The only thing needed is a `title` and a `rel="sidebar"`
			 * To ensure that the bookmarked URL doesn't have a complementary `#` from our trigger's href
			 * we force the current URL
			 */
			triggerBookmark.attr('rel', 'sidebar').attr('title', document.title).attr('href', window.location.href);
			return true;
		
		} else { // For the other browsers (mainly WebKit) we use a simple alert to inform users that they can add to bookmarks with ctrl+D/cmd+D
			
			alert('You can add this page to your bookmarks by pressing ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D on your keyboard.');
		
		}
		// If you have something in the `href` of your trigger
		return false;
	});

}