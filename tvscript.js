							var parsedResults;
							var sortedParsedVideos;
							
							//localStorage.clear();
							startPapaParse();
							
							async function startPapaParse()
							{
								Papa.parse("https://productvideos.tech/ProductVideosPlaylist.csv", 
									{
										download: true,
										delimiter: ';',
										header: true,
										complete: function(results) 
										{
												parsedResults = results;
												sortedParsedVideos = sortParsedVideos(parsedResults.data);
												showTotalVideos(sortedParsedVideos);
												showTodayVideos(sortedParsedVideos);
												buildPlaylist(sortedParsedVideos);
												showHideWatchedCheckBox(sortedParsedVideos);
										}
									});
							}
							
							function sortParsedVideos(parsedVideos)
							{
								var sortedVideos = [];
								for(var index = 0; index < parsedVideos.length; ++index)
								{
									var parsedVideo = parsedVideos[index];
									if (parsedVideo["TimeWhenAdded"] == null || parsedVideo["Title"] == null || parsedVideo["VideoURL"] == null)
									{
										continue;
									}
									var timeWhenAdded = moment(parsedVideo["TimeWhenAdded"], "MM/DD/YYYY hh:mm:ss a").toDate();
									var videoWithDate = {Title : parsedVideo["Title"], VideoURL : parsedVideo["VideoURL"], TimeWhenAdded : timeWhenAdded, Description : parsedVideo["Description"], 
									Duration : parsedVideo["Duration"]};
									sortedVideos.push(videoWithDate);
								}
								
								sortedVideos.sort((a,b) => (a.TimeWhenAdded > b.TimeWhenAdded) ? -1 : ((b.TimeWhenAdded > a.TimeWhenAdded) ? 1 : 0));
								
								return sortedVideos;
							}
							
							function calculateLasting(videos)
							{
								var totalSeconds = 0;
								var totalMinutes = 0;
								for(var index = 0; index < videos.length; ++index)
								{
									var duration = videos[index]["Duration"];
									if (duration == null)
										continue;
									var minsec = duration.split(":");
									if (minsec.length != 2)
										continue;
									var seconds = parseInt(minsec[1]);
									var minutes = parseInt(minsec[0]);
									totalSeconds += seconds;
									totalMinutes += minutes;
								}
								if (totalMinutes == 0 && totalSeconds == 0)
								{
									return "";
								}
								
								var minutesToAdd = Math.floor(totalSeconds / 60); 
								totalMinutes += minutesToAdd;
								totalSeconds -= minutesToAdd * 60;
								var totalHours = Math.floor(totalMinutes / 60);
								totalMinutes -= totalHours * 60;
								
								var lasting = " " + totalMinutes + " min. " + totalSeconds + " sec. ";
								if (totalHours != 0)
									lasting = totalHours + " hr." + lasting;
									
								return lasting;
							}
							
							function showTotalVideos(allVideos)
							{
								var lasting = calculateLasting(allVideos);
								if (lasting == "")
								{
									$("#videostotal").text(allVideos.length + " total videos");
									return;
								}								
								$("#videostotal").text(allVideos.length + " total videos lasting" + lasting);
							}
							
							function showTodayVideos(allVideos)
							{
								var todayVideos = [];
								for(var index = 0; index < allVideos.length; ++index)
								{
									if (isToday(allVideos[index]["TimeWhenAdded"]))
									{
										todayVideos.push(allVideos[index]);
									}
								}
								var lasting = calculateLasting(todayVideos);
								if (lasting == "")
								{
									return;
								}								
								$("#videostoday").text(todayVideos.length + " videos added today lasting" + lasting);
								$("#videostoday").show();
							}
							
							function showHideWatchedCheckBox(allVideos)
							{
								$("#showwatchedvideos").prop("checked", false);
								$('#showwatchedvideos').change(showHideWatchedVideos);
								if (anyWatchedVideos(allVideos))
								{
									$("#watchedvideosform").show();
								}
								
							}
							
							function anyWatchedVideos(allVideos)
							{
								for(var index = 0; index < allVideos.length; ++index)
								{
									var videoURL = allVideos[index]["VideoURL"];
									var timeWhenAdded = allVideos[index]["TimeWhenAdded"];
									if (isVideoWatched(videoURL, timeWhenAdded))
									{
										return true;
									}
								}
								return false;
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
								var playlistData = composePlaylistData(allVideos, false);
								playlist = new tTable( {
										titles : [
											{ "title": "Title", "type" : "string" },
											{ "title": "Added", "type" : "string" },
											{ "title": "TimeWhenAdded", "type" : "string" },
											{ "title": "Index", "type" : "number" },
											{ "title": "isWatched", "type" : "number" },
											{ "title": "Duration (mm:ss)", "type" : "string" }
										],
										data : playlistData,
										hidden_cols : [3, 4, 5],
										page_size : 50,
										row_numbers : true,
										goto : false, 
										hover_cols : false, 
										nav_arrows : false, 
										sorting : [4],
										sort_by : 4,
										search : true,
										search_auto : true,
										search_container : "#table_id_search",
										search_sensitive : true,
										search_value : "",
										container : "#table_id",
										pager : "#table_id_pager"
									} );
							}
							
							function composePlaylistData(allVideos, fillWatchedVideos)
							{
								var rows = new Array();
								for(var index = 0; index < allVideos.length; ++index)
								{
									var singleVideo = allVideos[index];
									var isWatched = isVideoWatched(singleVideo.VideoURL, singleVideo.TimeWhenAdded);
									if (!fillWatchedVideos && isWatched)
									{
										continue;
									}
									var row = composeTableRow(singleVideo, index, isWatched);
									rows.push(row);
								}
								return rows;
							}
							
							function composeTableRow(singleVideo, videoIndex, isWatched)
							{
								var timeWhenAdded = singleVideo["TimeWhenAdded"].toString();
								console.log("timeWhenAdded" + timeWhenAdded);
								var formattedTimeWhenAdded = singleVideo["TimeWhenAdded"].toLocaleDateString();
								if (isToday(singleVideo["TimeWhenAdded"]))
									formattedTimeWhenAdded = "Today";
								if (isYesterday(singleVideo["TimeWhenAdded"]))
									formattedTimeWhenAdded = "Yesterday";
								var titleAsLink = "<a href=\"" + singleVideo["VideoURL"] + "\" target=\"_blank\">" + singleVideo["Title"] + "</a>";
								var row = [titleAsLink, formattedTimeWhenAdded, timeWhenAdded, videoIndex, isWatched ? 1 : 0, 
									singleVideo["Duration"]];
								return row;
							}
							
							function showHideWatchedVideos() 
							{
								if($(this).is(":checked")) 
								{
									showWatchedVideos(sortedParsedVideos);
									return;
								}
								hideWatchedVideos();
							}
							
							function showWatchedVideos(allVideos)
							{
								for(var index = 0; index < allVideos.length; ++index)
								{
									var singleVideo = allVideos[index];
									var isWatched = isVideoWatched(singleVideo.VideoURL, singleVideo.TimeWhenAdded);
									if (!isWatched)
									{
										continue;
									}
									
									var videoDateString = singleVideo["TimeWhenAdded"].toString();
									var delRow = {"3" : videoDateString};
									playlist.delRow(delRow);
									
									var row = composeTableRow(singleVideo, index, isWatched);
									row[0] = "<I>" + row[0] + "</I>";
									row[1] = "<I>" + row[1] + "</I>";
									row[2] = "<I>" + row[2] + "</I>";
									row[5] = "<I>" + row[5] + "</I>";
									playlist.data.push(row);
								}
								playlist.goto(playlist.page);
							}
							
							function hideWatchedVideos()
							{
								var delRow = {"5" : 1};
								playlist.delRow(delRow);
							}
							
							function markAsPlayingInPlaylist(allVideos, videoToMark)
							{
								var videoIndex = getVideoIndex(allVideos, videoToMark);
								var videoToMarkDateString = videoToMark["TimeWhenAdded"].toString();
								console.log("videoToMarkDateString: " + videoToMarkDateString);
								var delRow = {"3" : videoToMarkDateString};
								playlist.delRow(delRow);
								
								var row = composeTableRow(videoToMark, videoIndex, false);
								row[0] = "<strong>" + row[0] + "</strong>";
								row[1] = "<strong>" + row[1] + "</strong>";
								row[2] = "<strong>" + row[2] + "</strong>";
								row[5] = "<strong>" + row[5] + "</strong>";
								playlist.addRow(row);
							}
							
							function markAsPlayedInPlaylist(allVideos, videoToMark)
							{
								var videoIndex = getVideoIndex(allVideos, videoToMark);
								var videoToMarkDateString = videoToMark["TimeWhenAdded"].toString();
								
								var delRow = {"3" : videoToMarkDateString};
								playlist.delRow(delRow);
								
								var row = composeTableRow(videoToMark, videoIndex, true);
								row[0] = "<I>" + row[0] + "</I>";
								row[1] = "<I>" + row[1] + "</I>";
								row[2] = "<I>" + row[2] + "</I>";
								row[5] = "<I>" + row[5] + "</I>";
								playlist.addRow(row);
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
								
								playingVideo = getVideoToPlayNext(sortedParsedVideos, playingVideo);
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
														'onStateChange': onPlayerStateChange,
														'onError': onPlayerError
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
							
							
							function onPlayerStateChange(a)
							{
								if(a.data==YT.PlayerState.ENDED)
								{
									playNextVideo();
								}
							}
							
							function playNextVideo()
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
							
							function onPlayerError(a)
							{
								playNextVideo();
							}