$(document).ready(function(){
	//---------- Start Facebook SDK ----------
	window.fbAsyncInit = function(){
		FB.init({
			appId: "257713377752019",
			xfbml: true,
			version: "v2.0",
			status: true,
			cookie: true,
			oauth: true,
		});
		// FB.getLoginStatus(function(response){
		// 	if(response.status === "connected"){
		// 		console.log("Logged in.");
		// 	}
		// 	else{
		// 		$(".AskLikeContainer").removeClass("Hide");
		// 	}
		// });
	};
	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/zh_TW/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, "script", "facebook-jssdk"));

	$(".AskLikeContainer").click(function(){
		FB.login(function(response){
			console.log(response);
		}, {scope: "public_profile"});
	});
	//---------- End Facebook SDK ----------

	//---------- Start Panel Control ----------
	$(".PromotionButton1, .CancelChoosePhoto, .CameraButton").click(function(){
		$(".PromotionButton1").toggleClass("Active");
		$(".PromotionButton2").removeClass("Active");
		if($(".PromotionButton1").hasClass("Active")){
			$(".PhotoActionContainer").removeClass("Hide");
			$(".EventPanelContainer").addClass("Hide");
		}
		else{
			$(".PhotoActionContainer").addClass("Hide");
			$(".EventPanelContainer").addClass("Hide");
		}
	});
	$(".PromotionButton2").click(function(){
		$(".PromotionButton1").removeClass("Active");
		$(".PromotionButton2").toggleClass("Active");
		if($(".PromotionButton2").hasClass("Active")){
			$(".PhotoActionContainer").addClass("Hide");
			$(".EventPanelContainer").removeClass("Hide");
		}
		else{
			$(".PhotoActionContainer").addClass("Hide");
			$(".EventPanelContainer").addClass("Hide");
		}
	});
	//---------- End Panel Control ----------

	//---------- Start Event Panel Control ----------
	$(".EventButton1").click(function(){
		$(".EventButton1").addClass("Active");
		$(".EventButton2").removeClass("Active");
		$(".TermsContainer").removeClass("Hide");
		$(".AwardContainer").addClass("Hide");
	});
	$(".EventButton2").click(function(){
		$(".EventButton1").removeClass("Active");
		$(".EventButton2").addClass("Active");
		$(".TermsContainer").addClass("Hide");
		$(".AwardContainer").removeClass("Hide");
	});
	$(".EventButton3").click(function(){
		alert("得獎名單尚未公佈");
	});
	//---------- End Event Panel Control ----------

	//---------- Start Image Group ----------
	var currentImagePositionX = 0;
	var currentImagePositionY = 0;
	var currentImageSizeWidth = 427;
	var currentImageSizeHeight = 332;

	var frameImage = new Image();
	frameImage.src = "/images/CanvasFrame.png";
	var image;

	$(".SelectFileButton").click(function(event){
		$(".FileInput").click();
		event.preventDefault();
		return false;
	});

	$(".SubmitPhoto").click(function(event){
		// if(typeof window.FileReader !== "function"){
		// 	alert("抱歉，您使用的瀏覽器不支援圖片合成功能，請使用其他瀏覽器再試試看，謝謝！1");
		// 	return;
		// }
		var fileInput = $(".FileInput")[0];
		var fileReader;
		var imageFile;

		if(!fileInput){
			alert("抱歉，好像有哪些地方出錯了，請重新整理再試一次，謝謝！");
		}
		else if(!fileInput.files){
			alert("抱歉，您使用的瀏覽器不支援圖片合成功能，請使用其他瀏覽器再試試看，謝謝！2");
		}
		else if(!fileInput.files[0]){
			alert("請先選擇圖片再繼續下去，謝謝！");
		}
		else{
			$(".ChoosePhotoPanel").addClass("Hide");
			$(".EditPhotoPanel").removeClass("Hide");
			imageFile = fileInput.files[0];
			fileReader = new FileReader();
			fileReader.onload = function(){
				image = new Image();
				image.onload = drawCanvas;
				image.src = fileReader.result;
			};
			fileReader.readAsDataURL(imageFile);
		}
		event.preventDefault();
		return false;
	});

	$(".ZoomIn").click(function(){
		currentImageSizeWidth = currentImageSizeWidth * 1.1;
		currentImageSizeHeight = currentImageSizeHeight * 1.1;
		drawCanvas();
	});
	$(".ZoomOut").click(function(){
		currentImageSizeWidth = currentImageSizeWidth / 1.1;
		currentImageSizeHeight = currentImageSizeHeight / 1.1;
		drawCanvas();
	});
	$(".MoveUp").click(function(){
		currentImagePositionY = currentImagePositionY - 10;
		drawCanvas();
	});
	$(".MoveDown").click(function(){
		currentImagePositionY = currentImagePositionY + 10;
		drawCanvas();
	});
	$(".MoveLeft").click(function(){
		currentImagePositionX = currentImagePositionX - 10;
		drawCanvas();
	});
	$(".MoveRight").click(function(){
		currentImagePositionX = currentImagePositionX + 10;
		drawCanvas();
	});

	function drawCanvas(){
		var canvas = $(".CanvasContainer canvas")[0];
		var context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(image, currentImagePositionX, currentImagePositionY, currentImageSizeWidth, currentImageSizeHeight);
		context.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
	}

	var shareUrl = "";

	$(".EditPhotoPanel .Confirm").click(function(){
		var canvas = $(".CanvasContainer canvas")[0];
		$(".EditPhotoPanel").addClass("Hide");
		$(".UploadingPhotoPanel").removeClass("Hide");
		$.post("/photo", {
			"facebook_id": "123456789",
			"photo": canvas.toDataURL("image/jpeg")
		}, function(data){
			shareUrl = "http:\/\/lgmobileevent.com\/photo\/" + data._id + "\/share";
			console.log(shareUrl);
			$(".UploadingPhotoPanel").addClass("Hide");
			$(".ShareToFacebookPanel").removeClass("Hide");
		}, "json");
	});

	$(".ShareButton").click(function(){
		FB.ui({
			method: "share",
			href: shareUrl,
		}, function(response){
			console.log(response);
			window.location = "/";
		});
	});

	//---------- End Image Group ----------

	$(".CancelChoosePhoto").click(function(event){
		event.preventDefault();
		return false;
	});

	//---------- Start Load Image ----------
	var currentImagePageIndex = 0;
	var maxIndexOfImageList = 0;
	$.get("/photo", function(data){
		data.forEach(function(photoObject){
			$(".ImageContainer .ImageList").append("<img src=\"\/photo\/" + photoObject._id + "\/url\">");
		});
		maxIndexOfImageList = data.length;
	});
	$(".PreviousPage").click(function(){
		if(currentImagePageIndex > 0){
			currentImagePageIndex--;
		}
		$(".ImageContainer .ImageList").animate({
			"left": (currentImagePageIndex * -492) + "px"
		});
	});
	$(".NextPage").click(function(){
		if(currentImagePageIndex < Math.ceil(maxIndexOfImageList / 3) - 1){
			currentImagePageIndex++;
		}
		$(".ImageContainer .ImageList").animate({
			"left": (currentImagePageIndex * -492) + "px"
		});
	});
	//---------- End Load Image ----------
});