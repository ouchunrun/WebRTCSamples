/**
 * Main js file for WebRTC-Camera-Resolution finder
 * Created by chad on 7/19/2014.
 * Modified January 1, 2016
 */

'use strict';

//Global variables
var video = $('#video')[0],     //where we will put & test our video output
//var video = document.querySelector('video'), //where we will put & test our video output
	deviceList = $('#devices')[0],          //device list dropdown
	devices = [],                        //getSources object to hold various camera options
	stream,
	selectedCamera = [],            //used to hold a camera's ID and other parameters
	tests,                          //holder for our test results
	r = 0,                          //used for iterating through the array
	camNum = 0,                     //used for iterating through number of camera
	scanning = false;               //variable to show if we are in the middle of a scan

function gotDevices(deviceInfos) {
	$('#selectArea').show();
	var camcount = 1;   //used for labeling if the device label is not enumerated
	for (var i = 0; i !== deviceInfos.length; ++i) {
		if (adapter.browserDetails.isWebRTCPluginInstalled == true
			&& deviceInfos[i].label.match("ScreenCapturer (Grandstream)*") != undefined) {
			continue; //Do not show the screen capture.
		} else {
			var deviceInfo = deviceInfos[i];
			var option = document.createElement('option');
			option.value = deviceInfo.deviceId;
			if (deviceInfo.kind === 'videoinput') {
				option.text = deviceInfo.label || 'camera ' + camcount;
				devices.push(option);
				deviceList.add(option);
				camcount++;
			}
		}
	}
}

function errorCallback(error) {
	console.log('navigator.getUserMedia error: ', error);
}


$(document).ready(function () {

	$('button').prop("disabled", false);
	console.log("adapter.js says this is " + adapter.browserDetails.browser + " " + adapter.browserDetails.version);

	if (!navigator.getUserMedia) {
		alert('You need a browser that supports WebRTC');
		$("div").hide();
		return;
	}

	//Localhost unsecure http connections are allowed
	if (document.location.hostname !== "localhost") {
		//check if the user is using http vs. https & redirect to https if needed
		if (document.location.protocol != "https:") {
			$(document).html("This doesn't work well on http. Redirecting to https");
			console.log("redirecting to https");
			document.location.href = "https:" + document.location.href.substring(document.location.protocol.length);
		}
	}
	//Show text of what res's are used on QuickScan
	var quickText = "Sizes:";
	for (var q = 0; q < quickScan.length; q++) {
		quickText += " " + quickScan[q].label
	}
	$('#quickLabel').text(quickText);

	function getCameraList() {
		console.log("getCameraList !!!!!!!");
		if (adapter.browserDetails.isSupportWebRTC == true) {
			//find & list camera devices on load
			navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(errorCallback);
		} else {
			adapter.browserShim.loadPlugin();
			setTimeout(getCameraList, 300);
		}
	}

	getCameraList();

});

//Start scan by controlling the quick and full scan buttons
$('button').click(function () {

	//setup for a quick scan using the hand-built quickScan object
	if (this.innerHTML == "Quick Scan") {
		console.log("Quick scan");
		//tests = quickScan.reverse();
		tests = quickScan;
	}
	//setup for a full scan and build scan object based on inputs
	else if (this.innerHTML == "Full Scan") {
		var highRes = $('#hiRes').val();
		var lowRes = $('#loRes').val();
		console.log("Full scan from " + lowRes + " to " + highRes);
		tests = createAllResolutions(parseInt(lowRes), parseInt(highRes));
	} else {
		return
	}

	scanning = true;
	$('button').prop("disabled", true);
	$('table').show();
	$('#jump').show();

	//if there is device enumeration
	if (devices) {

		//run through the deviceList to see what is selected
		for (var deviceCount = 0, d = 0; d < deviceList.length; d++) {
			if (deviceList[d].selected) {
				//if it is selected, check the label against the getSources array to select the proper ID
				for (var z = 0; z < devices.length; z++) {
					if (devices[z].value == deviceList[d].value) {

						//just pass along the id and label
						var camera = {};
						camera.id = devices[z].value;
						camera.label = devices[z].text;
						selectedCamera[deviceCount] = camera;
						console.log(selectedCamera[deviceCount].label + "[" + selectedCamera[deviceCount].id + "] selected");
						deviceCount++;
					}
				}
			}
		}

		//Make sure there is at least 1 camera selected before starting
		if (selectedCamera[0]) {
			gum(tests[r], selectedCamera[0]);
		} else {
			console.log("No camera selected. Defaulting to " + deviceList[0].text);
			//$('button').prop("disabled",false);

			selectedCamera[0] = {id: deviceList[0].value, label: deviceList[0].text};
			gum(tests[r], selectedCamera[0]);

		}
	}
	//if no device enumeration don't pass a Camera ID
	else {
		selectedCamera[0] = {label: "Unknown"};
		gum(tests[r]);
	}

});

//calls getUserMedia for a given camera and constraints
function gum(candidate, device) {
	console.log("trying " + candidate.label + " on " + device.label);

	//Kill any running streams;
	if (stream && adapter.browserDetails.browser != "firefox") {
		stream.getTracks().forEach(function (track) {
			console.log('stop stream track...')
			track.stop();
		});
	}

	//create constraints object
	var constraints;
	if (adapter.browserDetails.isWebRTCPluginInstalled != true) {
		constraints = {
			audio: false,
			video: {
				deviceId: device.id ? {exact: device.id} : undefined,
				width: {exact: candidate.width},    //new syntax
				height: {exact: candidate.height},   //new syntax
				frameRate: {exact: candidate.frameRate}
			}
		};
	} else {
		constraints = {
			audio: false,
			video: {
				mandatory: {
					minWidth: candidate.width * 0.8,
					minHeight: candidate.height * 0.8,
					maxWidth: candidate.width * 1.2,
					maxHeight: candidate.height * 1.2,
					minFrameRate: candidate.frameRate * 0.8,
					maxFrameRate: candidate.frameRate * 1.2
				},
				deviceId: device.id
			}
		};

	}

	setTimeout(function () {
		if ((window.stream == undefined) || (adapter.browserDetails.browser != "firefox")) {
			console.log('candidate:', candidate)
			console.log('GUM constraints:', constraints)
			console.log('gotStream constraints: \r\n', JSON.stringify(constraints, null, '    '))
			navigator.getUserMedia(constraints, gotStream,
				function (error) {
					console.log('getUserMedia error!', error);
					if (scanning) {
						captureResults("fail: " + error.name);
					}
				});
		} else if (adapter.browserDetails.browser == "firefox") {

			window.stream.getVideoTracks()[0].applyConstraints({
				width: {ideal: candidate.width, max: candidate.width},
				height: {ideal: candidate.height, max: candidate.height},
				frameRate: {ideal: candidate.frameRate, max: candidate.frameRate},
				aspectRatio: {exact: candidate.width / candidate.height}
			}).then(function () {
				setTimeout(displayVideoDimensions, 900);
			});
		}
	}, 1000);  //official examples had this at 200


	function gotStream(mediaStream) {
		//change the video dimensions
		console.log("Display size for " + candidate.label + ": " + candidate.width + "x" + candidate.height);

		window.stream = mediaStream; // make globally available

		//video.srcObject = mediaStream;
		window.attachMediaStream(video, mediaStream);
		if (adapter.browserDetails.isWebRTCPluginInstalled === true) {
			video = $('#video')[0];
			setTimeout(displayVideoDimensions, 2000);
		}

	}
}


function displayVideoDimensions() {
	console.log("Video onloadedmetadata call~~~");

	if (!video.videoWidth) {
		if (adapter.browserDetails.browser != "firefox") {
			setTimeout(displayVideoDimensions, 500);  //was 500
		}
	}

	if (video.videoWidth * video.videoHeight > 0) {

		if (tests[r].width + "x" + tests[r].height != video.videoWidth + "x" + video.videoHeight) {
			captureResults("fail: mismatch");
		} else {
			captureResults("pass");
		}
	}
}


video.onloadedmetadata = displayVideoDimensions;


let showVideoDimensions = document.getElementById('showVideoDimensions')
//Save results to the candidate so
function captureResults(status) {
	console.log("Stream dimensions for " + tests[r].label + ": " + video.videoWidth + "x" + video.videoHeight);
	showVideoDimensions.innerHTML = video.videoWidth + "x" + video.videoHeight
	if (!scanning)   //exit if scan is not active
		return;

	tests[r].status = status;
	tests[r].streamWidth = video.videoWidth;
	tests[r].streamHeight = video.videoHeight;

	var row = $('table#results')[0].insertRow(-1);
	var browserVer = row.insertCell(0);
	var deviceName = row.insertCell(1);
	var label = row.insertCell(2);
	var ratio = row.insertCell(3);
	var ask = row.insertCell(4);
	var actual = row.insertCell(5);
	var frameRate = row.insertCell(6);
	var statusCell = row.insertCell(7);
	var deviceIndex = row.insertCell(8);
	var resIndex = row.insertCell(9);

	//don't show these
	deviceIndex.style.display = "none";
	resIndex.style.display = "none";

	deviceIndex.class = "hidden";
	resIndex.class = "hidden";

	browserVer.innerHTML = adapter.browserDetails.browser + " " + adapter.browserDetails.version;
	deviceName.innerHTML = selectedCamera[camNum].label;
	label.innerHTML = tests[r].label;
	ratio.innerHTML = tests[r].ratio;
	ask.innerHTML = tests[r].width + "x" + tests[r].height;
	actual.innerHTML = tests[r].streamWidth + "x" + tests[r].streamHeight;
	frameRate.innerHTML = tests[r].frameRate;
	statusCell.innerHTML = tests[r].status;
	deviceIndex.innerHTML = camNum;     //used for debugging
	resIndex.innerHTML = r;             //used for debugging

	r++;

	//go to the next tests
	if (r < tests.length) {
		gum(tests[r], selectedCamera[camNum]);
	} else if (camNum < selectedCamera.length - 1) {     //move on to the next camera
		camNum++;
		r = 0;
		gum(tests[r], selectedCamera[camNum])
	} else { //finish up
		video.removeEventListener("onloadedmetadata", displayVideoDimensions); //turn off the event handler
		$('button').off("click"); //turn the generic button handler  off

		scanning = false;

		$(".pfin").show();
		$('#csvOut').click(function () {
			exportTableToCSV.apply(this, [$('#results'), 'gumResTestExport.csv']);
		});

		//allow to click on a row to test (only works with device Enumeration
		if (devices) {
			clickRows();
		}
	}
}

//allow clicking on a row to see the camera capture
//To do: figure out why this doesn't work in Firefox
function clickRows() {
	$('tr').click(function() {
		r = $(this).find("td").eq(9).html();
		console.log('click rows line: ', r)

		//lookup the device id based on the row label
		for (let z = 0; z < selectedCamera.length; z++) {
			if (selectedCamera[z].label === $(this).find("td").eq(1).html()) {
				var thisCam = selectedCamera[z]; //devices[z].value;
				console.log(thisCam)
			}
		}

		console.log("table click! clicked on " + thisCam + ":" + tests[r].label);
		gum(tests[r], thisCam);
	})
}


//Variables to use in the quick scan
/*const*/
var quickScan = [
	// {
	// 	"label": "4K(UHD)",
	// 	"width": 3840,
	// 	"height": 2160,
	// 	"ratio": "16:9",
	// 	"frameRate": 30
	// },
	// {
	// 	"label": "4K(UHD)",
	// 	"width": 3840,
	// 	"height": 2160,
	// 	"ratio": "16:9",
	// 	"frameRate": 15
	// },
	// {
	// 	"label": "1080p(FHD)",
	// 	"width": 1920,
	// 	"height": 1080,
	// 	"ratio": "16:9",
	// 	"frameRate": 30
	// },
	{
		"label": "1080p(FHD)",
		"width": 1920,
		"height": 1080,
		"ratio": "16:9",
		"frameRate": 15
	},
	{
		"label": "UXGA",
		"width": 1600,
		"height": 1200,
		"ratio": "4:3",
		"frameRate": 30
	},
	{
		"label": "UXGA",
		"width": 1600,
		"height": 1200,
		"ratio": "4:3",
		"frameRate": 15
	},
	{
		"label": "720p(HD)",
		"width": 1280,
		"height": 720,
		"ratio": "16:9",
		"frameRate": 30
	},
	{
		"label": "720p(HD)",
		"width": 1280,
		"height": 720,
		"ratio": "16:9",
		"frameRate": 15
	},
	{
		"label": "SVGA",
		"width": 800,
		"height": 600,
		"ratio": "4:3",
		"frameRate": 30
	},
	{
		"label": "SVGA",
		"width": 800,
		"height": 600,
		"ratio": "4:3",
		"frameRate": 15
	},
	{
		"label": "VGA",
		"width": 640,
		"height": 480,
		"ratio": "4:3",
		"frameRate": 30
	},
	{
		"label": "VGA",
		"width": 640,
		"height": 480,
		"ratio": "4:3",
		"frameRate": 15
	},
	{
		"label": "360p(nHD)",
		"width": 640,
		"height": 360,
		"ratio": "16:9",
		"frameRate": 30
	},
	{
		"label": "360p(nHD)",
		"width": 640,
		"height": 360,
		"ratio": "16:9",
		"frameRate": 15
	},
	// {
	// 	"label": "CIF",
	// 	"width": 352,
	// 	"height": 288,
	// 	"ratio": "4:3",
	// 	"frameRate": 30
	// },
	// {
	// 	"label": "CIF",
	// 	"width": 352,
	// 	"height": 288,
	// 	"ratio": "4:3",
	// 	"frameRate": 15
	// },
	// {
	// 	"label": "QVGA",
	// 	"width": 320,
	// 	"height": 240,
	// 	"ratio": "4:3",
	// 	"frameRate": 30
	// },
	// {
	// 	"label": "QVGA",
	// 	"width": 320,
	// 	"height": 240,
	// 	"ratio": "4:3",
	// 	"frameRate": 15
	// },
	// {
	// 	"label": "QCIF",
	// 	"width": 176,
	// 	"height": 144,
	// 	"ratio": "4:3",
	// 	"frameRate": 30
	// },
	// {
	// 	"label": "180p?",
	// 	"width": 320,
	// 	"height": 180,
	// 	"ratio": "16:9"
	// },
	// {
	// 	"label": "QCIF",
	// 	"width": 176,
	// 	"height": 144,
	// 	"ratio": "4:3",
	// 	"frameRate": 15
	// },
	// {
	// 	"label": "QQVGA",
	// 	"width": 160,
	// 	"height": 120,
	// 	"ratio": "4:3",
	// 	"frameRate": 30
	// },
	// {
	// 	"label": "QQVGA",
	// 	"width": 160,
	// 	"height": 120,
	// 	"ratio": "4:3",
	// 	"frameRate": 15
	// }

];

//creates an object with all HD & SD video ratios between two heights
function createAllResolutions(minHeight, maxHeight) {
	/*const*/
	var ratioHD = 16 / 9;
	/*const*/
	var ratioSD = 4 / 3;

	var resolutions = [],
		res;

	for (var y = maxHeight; y >= minHeight; y--) {
		//HD
		res = {
			"label": (y * ratioHD).toFixed() + "x" + y,
			"width": parseInt((y * ratioHD).toFixed()), //this was returning a string
			"height": y,
			"ratio": "16:9"
		};
		resolutions.push(res);

		//SD
		res = {
			"label": (y * ratioSD).toFixed() + "x" + y,
			"width": parseInt((y * ratioSD).toFixed()),
			"height": y,
			"ratio": "4:3"
		};
		resolutions.push(res);

		//square
		//noinspection JSSuspiciousNameCombination
		res = {
			"label": y + "x" + y,
			"width": y,
			"height": y,
			"ratio": "1:1"
		};
		resolutions.push(res);

	}
	console.log("resolutions length: " + resolutions.length);
	return resolutions;
}


/*
 Export results table to a CSV file in new window for download
 source: http://jsfiddle.net/terryyounghk/KPEGU/
 */
function exportTableToCSV($table, filename) {

	var $rows = $table.find('tr:has(th), tr:has(td)'),

		// Temporary delimiter characters unlikely to be typed by keyboard
		// This is to avoid accidentally splitting the actual contents
		tmpColDelim = String.fromCharCode(11), // vertical tab character
		tmpRowDelim = String.fromCharCode(0), // null character

		// actual delimiter characters for CSV format
		colDelim = '","',
		rowDelim = '"\r\n"',

		// Grab text from table into CSV formatted string
		csv = '"' + $rows.map(function (i, row) {
			var $row = $(row),
				$cols = $row.find('th, td');

			return $cols.map(function (j, col) {
				var $col = $(col),
					text = $col.text();

				return text.replace(/"/g, '""'); // escape double quotes

			}).get().join(tmpColDelim);

		}).get().join(tmpRowDelim)
			.split(tmpRowDelim).join(rowDelim)
			.split(tmpColDelim).join(colDelim) + '"',

		// Data URI
		csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

	$(this)
		.attr({
			'download': filename,
			'href': csvData,
			'target': '_blank'
		});
}

var getUserMediaConstraintsDiv = document.querySelector('textarea#getUserMediaConstraints');
var gumTestVideo = document.getElementById('gumTestVideo')
var showTestVideoDimensions = document.getElementById('showTestVideoDimensions')
gumTestVideo.onloadedmetadata = function (){
	console.log("Stream dimensions for " + gumTestVideo.videoWidth + "x" + gumTestVideo.videoHeight);
	showTestVideoDimensions.innerHTML = gumTestVideo.videoWidth + "x" + gumTestVideo.videoHeight
}

function gumWidthMediaConstraints(){
	if (stream && adapter.browserDetails.browser !== "firefox") {
		stream.getTracks().forEach(function (track) {
			console.log('stop stream track...')
			track.stop();
		});
	}

	var constraints = { };
	if (getUserMediaConstraintsDiv.value) {
		constraints = JSON.parse(getUserMediaConstraintsDiv.value);
	}
	if(selectedCamera[camNum]){
		constraints.video.deviceId = {
			exact: selectedCamera[camNum] ? (selectedCamera[camNum].id ? selectedCamera[camNum].id : undefined) : undefined
		}
	}else if($("#devices")[0] && $("#devices")[0].options.length){
		constraints.video.deviceId = {
			exact: $("#devices")[0].options[0].value ? $("#devices")[0].options[0].value : undefined
		}
	}


	console.log('constraints:', constraints)

	navigator.getUserMedia(constraints, function (mediaStream){
			console.warn('getUserMedia success: ', JSON.stringify(constraints, null, '    '))
			window.stream = mediaStream; // make globally available
			window.attachMediaStream(gumTestVideo, mediaStream);
			showVideoDimensions.innerHTML = video.videoWidth + "x" + video.videoHeight
		},
		function (error) {
		console.error('getUserMedia error!', error);
	});
}

window.onload = function (){
	var defaultCon = {
		audio: false,
		video: {
			width: {
				ideal: 640,
				max: 1280
			},
			height: {
				ideal: 360,
				max: 720
			},
			frameRate: {
				ideal: 15,
				max: 30
			}
		}
	};

	getUserMediaConstraintsDiv.value = JSON.stringify(defaultCon, null, '    ' );
}
