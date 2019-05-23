							var parsedResults;
							
							function startPapaParse()
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
							
									
							function setUpYouTubePlayer()
							{
								var tag = document.createElement('script');
								tag.src = "https://www.youtube.com/iframe_api";
								var firstScriptTag = document.getElementsByTagName('script')[0];
								firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
							}
							
							function Sleep(ms) 
							{
							  return new Promise(resolve => setTimeout(resolve, ms));
							}
							
							function getYouTubeVideoIdFromUrl(url)
							{
								var videoId = url.match(				/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
								return videoId[1];
							}
							
							var videoIndex = 0;
							function getVideoIdToPlayNext(parsedVideos)
							{
								if (videoIndex >= parsedVideos.length)
								{
									return null;
								}
								var videoId;
								while(videoIndex < parsedVideos.length)
								{
									var url = parsedVideos[videoIndex]["VideoURL"];
									console.log(url);
									videoId = getYouTubeVideoIdFromUrl(url);
									console.log(videoId);	
									if (localStorage.getItem(videoId) == null)
									{
										break;
									}
									videoIndex++;
								}
								if (videoIndex >= parsedVideos.length)
								{
									return null;
								}
								return videoId;
							}
							
							function storePlayedVideoId(videoId)
							{
								localStorage.setItem(videoId, videoId);
								videoIndex++;
							}
							
							var playlist;
							function buildPlaylist(parsedVideos)
							{
								playlist = new tTable( {
										titles : [
											{ "title": "Title", "type" : "string" },
											{ "title": "VideoURL", "type" : "string" },
											{ "title": "Description", "type" : "string" },
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
										var row = [parsedVideo["Title"], parsedVideo["VideoURL"], 
													parsedVideo["Description"], parsedVideo["TimeWhenAdded"]];
										playlist.addRow(row);
									}
							}

							var ytplayer;
							var currentVideoId;
							function onYouTubeIframeAPIReady()
							{
								createYTPlayer();
							}
							
							async function createYTPlayer()
							{
								while(true)
								{
									await Sleep(500);
									if (parsedResults != null)
										break;
								}
								var currentVideoId = getVideoIdToPlayNext(parsedResults.data);
								ytplayer = new YT.Player('myytplayer', {
													width: 640,
													height: 480,
													//videoId: "8tPnX7OPo0Q",
													//videoId: "04F4xlWSFh0",
													videoId: currentVideoId,
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
							
							// function playFirstVideo(parsedVideos)
							// {
								// currentVideoId = getVideoIdToPlayNext(parsedVideos);
								// ytplayer.stopVideo();
								// ytplayer.loadVideoById(currentVideoId);
								// ytplayer.playVideo();
							// }
							
							
							function onytplayerStateChange(a)
							{
								if(a.data==YT.PlayerState.ENDED)
								{
									storePlayedVideoId(currentVideoId);
									var videoId = getVideoIdToPlayNext(parsedResults.data);
									if(videoId != null) 
									{
									   ytplayer.loadVideoById(videoId);
									} 
									else 
									{ 
										console.log("The youtube url is not valid.");
										ytplayer.stopVideo();
									}
								}
							}