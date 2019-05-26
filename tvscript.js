							var parsedResults;
							
							startPapaParse();
							
							async function startPapaParse()
							{
								Papa.parse("https://productvideostv.github.io/website/ProductVideosPlaylist.csv", 
									{
										download: true,
										delimiter: ';',
										header: true,
										complete: function(results) 
										{
												parsedResults = results;
												console.log(results);
												buildPlaylist(parsedResults.data);
										}
									});
							}
							
							function Sleep(ms) 
							{
							  return new Promise(resolve => setTimeout(resolve, ms));
							}
							
							function getYouTubeVideoIdFromUrl(youTubeVideoURL)
							{
								var videoId = youTubeVideoURL.match(				/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
								return videoId[1];
							}
							
							function getVideoIndex(parsedVideos, videoId)
							{
								var videoIndex = 0;
								while(videoIndex < parsedVideos.length)
								{
									var videoURL = parsedVideos[videoIndex]["VideoURL"];
									var videoIdFromURL = getYouTubeVideoIdFromUrl(videoURL);
									if (videoIdFromURL == videoId)
										return videoIndex;
									videoIndex++;
								}
								return null;
							}
							
							function getVideoIdToPlayNext(parsedVideos, currentVideoId)
							{
								var videoIndex = 0;
								if (currentVideoId != null)
								{
									var videoIndex = getVideoIndex(parsedVideos, currentVideoId);
									if (videoIndex == null)
										return null;
									++videoIndex;
								}
								var videoId;
								while(videoIndex < parsedVideos.length)
								{
									var videoURL = parsedVideos[videoIndex]["VideoURL"];
									var timeWhenAdded = parsedVideos[videoIndex]["timeWhenAdded"];
									if (!isVideoWatched(videoURL, timeWhenAdded))
									{
										videoId = getYouTubeVideoIdFromUrl(videoURL);
										break;
									}
									videoIndex++;
								}
								return videoId;
							}
							
							var localStorageKey = "WatchedProductVideos";
							function storePlayedVideo(videoURL, timeWhenAdded)
							{
								var watchedVideoRecord = {videoURL : videoURL, timeWhenAdded : timeWhenAdded};
								var watchedVideos = localStorage.getItem(localStorageKey);
								if (watchedVideos == null)
								{
									watchedVideos = [watchedVideoRecord];
									localStorage.setItem(localStorageKey, watchedVideos);
									return;
								}
								watchedVideos.push(watchedVideoRecord);
								localStorage.setItem(localStorageKey, watchedVideos);
							}
							
							function storePlayedVideoId(parsedVideos, videoId)
							{
								var videoIndex = getVideoIndex(videoId, parsedVideos);
								if (videoIndex == null)
									return;
								storePlayedVideo(parsedVideos[videoIndex]["videoURL"], parsedVideos[videoIndex]["timeWhenAdded"]);
							}
							
							function isVideoWatched(videoURL, timeWhenAdded)
							{
								var watchedVideos = localStorage.getItem(localStorageKey);
								if (watchedVideos == null)
									return false;
								for(var index = 0; index < watchedVideos.length; ++index)
								{
									if (watchedVideos[index]["videoURL"] == videoURL && 
										watchedVideos[index]["timeWhenAdded"] == timeWhenAdded)
										{
											return true;
										}
								}
								return false;
							}
							
							var playlist;
							function buildPlaylist(parsedVideos)
							{
								playlist = new tTable( {
										titles : [
											{ "title": "Title", "type" : "string" },
											{ "title": "VideoURL", "type" : "string" },
											{ "title": "TimeWhenAdded", "type" : "string" }
										],
										row_numbers : true,
//										data : parsedVideos,
										goto : false, 
										hover_cols : false, 
										nav_arrows : false, 
										sorting : false,
										search : true,
										search_auto : true,
										search_container : "#table_id_search",
										search_sensitive : true,
										search_value : "",
										container : "#table_id",
										pager : "#table_id_pager"
									} );
									
									for(var index = 0; index < parsedVideos.length; ++index)
									{
										var parsedVideo = parsedVideos[index];
										var row = [parsedVideo["Title"], 
											"<a href=\"" + parsedVideo["VideoURL"] + "\">" + parsedVideo["VideoURL"] + "</a>", 
											parsedVideo["TimeWhenAdded"]];
										playlist.addRow(row);
									}
							}

							var ytplayer;
							function onYouTubeIframeAPIReady()
							{
								// currentVideoId = getVideoIdToPlayNext(parsedResults.data);
								// ytplayer = new YT.Player('myytplayer', {
													// width: 640,
													// height: 480,
													// //videoId: "8tPnX7OPo0Q",
													// //videoId: "04F4xlWSFh0",
													// //videoId: "GlCmAC4MHek",
													// videoId: currentVideoId,
													// playerVars: {
													  // iv_load_policy: 3  // hide annotations
													// },
													// events: {
														// 'onReady': onPlayerReady,
														// 'onStateChange': onytplayerStateChange
													// }
												// });
									createYTPlayer();
							}
							
							var playingVideoId;
							async function createYTPlayer()
							{
								await waitForParsedResults();
								playingVideoId = getVideoIdToPlayNext(parsedResults.data, playingVideoId);
								ytplayer = new YT.Player('myytplayer', {
													width: 640,
													height: 480,
													//videoId: "8tPnX7OPo0Q",
													//videoId: "04F4xlWSFh0",
													//videoId: "GlCmAC4MHek",
													videoId: playingVideoId,
													playerVars: {
													  iv_load_policy: 3,  // hide annotations
													  autoplay : 1
													},
													events: {
														'onReady': onPlayerReady,
														'onStateChange': onytplayerStateChange
													}
												});
							}
							
							function onPlayerReady(event) 
							{
								 event.target.playVideo();
								// event.target.pauseVideo();
								//waitForParsedResults();
								// Papa.parse("https://productvideostv.github.io/website/ProductVideosPlaylist.csv", {
										// download: true,
										// delimiter: ';',
										// header: true,
										// complete: function(results) 
										// {
												// parsedResults = results;
												// console.log(results);
												// playFirstVideo(parsedResults.data);
												// buildPlaylist(parsedResults.data);
										// }
									// });
							}
							
							async function waitForParsedResults()
							{
								while(true)
								{
									await Sleep(500);
									if (parsedResults != null)
										break;
								}
							}
							
							
							function onytplayerStateChange(a)
							{
								if(a.data==YT.PlayerState.ENDED)
								{
									storePlayedVideoId(parsedResults.data, playingVideoId);
									playingVideoId = getVideoIdToPlayNext(parsedResults.data, playingVideoId);
									if(playingVideoId != null) 
									{
									   ytplayer.loadVideoById(playingVideoId);
									} 
									else 
									{ 
										console.log("The youtube video ID is not valid.");
										ytplayer.stopVideo();
									}
								}
							}