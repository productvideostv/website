							var parsedResults;
							var sortedParsedVideos;
							
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
												sortedParsedVideos = sortParsedVideos(parsedResults.data);
												buildPlaylist(sortedParsedVideos);
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
							
							function getVideoIndex(allVideos, video)
							{
								var videoIndex = 0;
								while(videoIndex < allVideos.length)
								{
									var videoURL = allVideos[videoIndex]["VideoURL"];
									var timeWhenAdded = allVideos[videoIndex]["TimeWhenAdded"];
									if (videoURL == video["VideoURL"] && timeWhenAdded == video["TimeWhenAdded"])
										return videoIndex;
									videoIndex++;
								}
								return null;
							}
							
							function getVideoToPlayNext(allVideos, currentVideo)
							{
								var videoIndex = 0;
								if (currentVideo != null)
								{
									var videoIndex = getVideoIndex(allVideos, currentVideo);
									if (videoIndex == null)
										return null;
									++videoIndex;
								}
								var nextVideo;
								while(videoIndex < allVideos.length)
								{
									var videoURL = allVideos[videoIndex]["VideoURL"];
									var timeWhenAdded = allVideos[videoIndex]["TimeWhenAdded"];
									if (!isVideoWatched(videoURL, timeWhenAdded))
									{
										nextVideo = allVideos[videoIndex];
										break;
									}
									videoIndex++;
								}
								return nextVideo;
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
							
							function isVideoWatched(videoURL, timeWhenAdded)
							{
								var watchedVideos = localStorage.getItem(localStorageKey);
								if (watchedVideos == null)
									return false;
								for(var index = 0; index < watchedVideos.length; ++index)
								{
									if (watchedVideos[index]["VideoURL"] == videoURL && 
										watchedVideos[index]["TimeWhenAdded"] == timeWhenAdded)
										{
											return true;
										}
								}
								return false;
							}
							
							var playlist;
							function buildPlaylist(allVideos)
							{
								playlist = new tTable( {
										titles : [
											{ "title": "Title", "type" : "string" },
											{ "title": "URL", "type" : "string" },
											{ "title": "Added", "type" : "string" }
										],
										row_numbers : true,
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
									
									for(var index = 0; index < allVideos.length; ++index)
									{
										var singleVideo = allVideos[index];
										var timeWhenAdded = singleVideo["TimeWhenAdded"].toLocaleDateString();
										var row = [singleVideo["Title"], 
											"<a href=\"" + singleVideo["VideoURL"] + "\">" + singleVideo["VideoURL"] + "</a>", timeWhenAdded];
										playlist.addRow(row);
									}
							}
							
							function sortParsedVideos(parsedVideos)
							{
								var sortedVideos = [];
								for(var index = 0; index < parsedVideos.length; ++index)
								{
									var parsedVideo = parsedVideos[index];
									var timeWhenAdded = moment(parsedVideo["TimeWhenAdded"]).toDate();
									var videoWithDate = {Title : parsedVideo["Title"], VideoURL : parsedVideo[	"VideoURL"], TimeWhenAdded : timeWhenAdded};
									sortedVideos.push(videoWithDate);
								}
								
								sortedVideos.sort((a,b) => (a.TimeWhenAdded > b.TimeWhenAdded) ? -1 : ((b.TimeWhenAdded > a.TimeWhenAdded) ? 1 : 0));
								
								return sortedVideos;
							}
							
							function markAsPlayingInPlaylist(allVideos, videoToMark)
							{
								var videoIndex = getVideoIndex(allVideos, videoToMark);
								if (videoIndex == null)
									return;
								var strongTitle = "<strong>" + videoToMark["Title"] + "</strong>";
								var strongVideoURL = "<strong>" + "<a href=\"" + videoToMark["VideoURL"] + "\">" +videoToMark["VideoURL"] + "</a></strong>";
								var strongTimeWhenAdded = "<strong>" + videoToMark["TimeWhenAdded"].toLocaleDateString() + "</strong>";
								var updatedRow = {"1" : strongTitle, "2" : strongVideoURL, "3" : strongTimeWhenAdded};
								var displayedRow = playlist.data[videoIndex];
								console.log(displayedRow);
								var rowToUpdate = {"1" : displayedRow[0], "2" : displayedRow[1], "3" : displayedRow[2]};
								playlist.updateRow(updatedRow, rowToUpdate);
							}
							
							function markAsPlayedInPlaylist(allVideos, videoToMark)
							{
								var videoIndex = getVideoIndex(allVideos, videoToMark);
								if (videoIndex == null)
									return;
								var fontOpenTag = "<I>";
								var fontCloseTag = "</I>";
								var strongTitle = fontOpenTag + videoToMark["Title"] + fontCloseTag;
								var strongVideoURL = fontOpenTag + "<a href=\"" + videoToMark["VideoURL"] + "\">" + videoToMark["VideoURL"] + "</a>" + fontCloseTag;
								var strongTimeWhenAdded = fontOpenTag + videoToMark["TimeWhenAdded"].toLocaleDateString() + fontCloseTag;
								var updatedRow = {"1" : strongTitle, "2" : strongVideoURL, "3" : strongTimeWhenAdded};
								var displayedRow = playlist.data[videoIndex];
								console.log(displayedRow);
								var rowToUpdate = {"1" : displayedRow[0], "2" : displayedRow[1], "3" : displayedRow[2]};
								playlist.updateRow(updatedRow, rowToUpdate);
							}

							var ytplayer;
							function onYouTubeIframeAPIReady()
							{								
									createYTPlayer();
							}													
							
							var playingVideo;
							async function createYTPlayer()
							{
								await waitForParsedResults();
								
								playingVideo = getVideoToPlayNext(sortedParsedVideos, playingVideoId);
								markAsPlayingInPlaylist(sortedParsedVideos, playingVideo);
								
								var playingVideoId = getYouTubeVideoIdFromUrl(playingVideo["VideoURL"]);
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
							}
							
							async function waitForParsedResults()
							{
								while(true)
								{
									await Sleep(100);
									if (parsedResults != null)
										break;
								}
							}
							
							
							function onytplayerStateChange(a)
							{
								if(a.data==YT.PlayerState.ENDED)
								{
									storePlayedVideo(playingVideo.VideoURL, playingVideo.TimeWhenAdded);
									markAsPlayedInPlaylist(sortedParsedVideos, playingVideo);
									playingVideo = getVideoToPlayNext(sortedParsedVideos, playingVideo);
									markAsPlayingInPlaylist(sortedParsedVideos, playingVideo);
									
									var playingVideoId = getYouTubeVideoIdFromUrl(playingVideo["VideoURL"]);
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