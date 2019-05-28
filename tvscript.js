							var parsedResults;
							var sortedParsedVideos;
							
							//localStorage.clear();
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
												showTotalVideos(sortedParsedVideos);
												buildPlaylist(sortedParsedVideos);
										}
									});
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
							
							function Sleep(ms) 
							{
							  return new Promise(resolve => setTimeout(resolve, ms));
							}
							
							const isToday = (someDate) => {
							  const today = new Date()
							  return someDate.getDate() == today.getDate() &&
								someDate.getMonth() == today.getMonth() &&
								someDate.getFullYear() == today.getFullYear()
							}
							
							function isYesterday(someDate)
							{
							  var yesterday = new Date();
							  yesterday.setDate(yesterday.getDate() - 1);
							  return someDate.getDate() == yesterday.getDate() &&
								someDate.getMonth() == yesterday.getMonth() &&
								someDate.getFullYear() == yesterday.getFullYear();
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
							
							function storePlayedVideo(videoURL, timeWhenAdded)
							{
								if (localStorage.getItem(timeWhenAdded) == null)
									localStorage.setItem(timeWhenAdded, videoURL);
							}
							
							function isVideoWatched(videoURL, timeWhenAdded)
							{
								var watchedVideoURL = localStorage.getItem(timeWhenAdded);
								return watchedVideoURL == videoURL;
							}
							
							var playlist;
							function buildPlaylist(allVideos)
							{
								playlist = new tTable( {
										titles : [
											{ "title": "Title", "type" : "string" },
											{ "title": "URL", "type" : "string" },
											{ "title": "Added", "type" : "string" },
											{ "title": "TimeWhenAdded", "type" : "string" }
										],
										hidden_cols : [4],
										page_size : 50,
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
									
									fillPlaylist(allVideos, false);
							}
							
							function fillPlaylist(allVideos, fillWatchedVideos)
							{
								for(var index = 0; index < allVideos.length; ++index)
								{
									var singleVideo = allVideos[index];
									if (!fillWatchedVideos && isVideoWatched(singleVideo.VideoURL, singleVideo.TimeWhenAdded))
									{
										continue;
									}
									var timeWhenAdded = singleVideo["TimeWhenAdded"].toString();
									var formattedTimeWhenAdded = singleVideo["TimeWhenAdded"].toLocaleDateString();
									if (isToday(singleVideo["TimeWhenAdded"]))
										formattedTimeWhenAdded = "Today";
									if (isYesterday(singleVideo["TimeWhenAdded"]))
										formattedTimeWhenAdded = "Yesterday";
									var row = [singleVideo["Title"], 
										"<a href=\"" + singleVideo["VideoURL"] + "\">" + singleVideo["VideoURL"] + "</a>", formattedTimeWhenAdded, timeWhenAdded];
									playlist.addRow(row);
								}
							}
							
							function showTotalVideos(allVideos)
							{
								$("#videostotal").text(allVideos.length + " total videos");
							}
							
							function showWatchedVideos(checkboxElem) 
							{
								if (checkboxElem.checked) 
								{
									alert("checked")
									return;
								} 
								
								alert("notchecked")
							}
							
							function markAsPlayingInPlaylist(allVideos, videoToMark)
							{
								var videoToMarkDateString = videoToMark["TimeWhenAdded"].toString();
								var title = "<strong>" + videoToMark["Title"] + "</strong>";
								var videoURL = "<strong>" + "<a href=\"" + videoToMark["VideoURL"] + "\">" +videoToMark["VideoURL"] + "</a></strong>";
								var timeWhenAdded = "<strong>" + videoToMark["TimeWhenAdded"].toLocaleDateString() + "</strong>";
								var updatedRow = {"1" : title, "2" : videoURL, "3" : timeWhenAdded, "4" : videoToMarkDateString};
								var rowToUpdate = {"4" : videoToMarkDateString};
								playlist.updateRow(updatedRow, rowToUpdate);
							}
							
							function markAsPlayedInPlaylist(allVideos, videoToMark)
							{
								var videoToMarkDateString = videoToMark["TimeWhenAdded"].toString();
								var openTag = "<I>";
								var closeTag = "</I>";
								var title = openTag + videoToMark["Title"] + closeTag;
								var videoURL = openTag + "<a href=\"" + videoToMark["VideoURL"] + "\">" + videoToMark["VideoURL"] + "</a>" + closeTag;
								var timeWhenAdded = openTag + videoToMark["TimeWhenAdded"].toLocaleDateString() + closeTag;
								var updatedRow = {"1" : title, "2" : videoURL, "3" : timeWhenAdded, "4" : videoToMarkDateString};
								var rowToUpdate = {"4" : videoToMarkDateString};
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
													width: "100%",
													height: "510",
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