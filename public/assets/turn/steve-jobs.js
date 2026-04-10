/* Steve jobs' book */

function updateDepth(book, newPage) {

	var page = book.turn('page'),
		pages = book.turn('pages'),
		depthWidth = 16 * Math.min(1, page * 2 / pages);

	newPage = newPage || page;

	if (newPage > 3)
		$('.sj-book .p2 .depth').css({
			width: depthWidth,
			left: 20 - depthWidth
		});
	else
		$('.sj-book .p2 .depth').css({ width: 0 });

	depthWidth = 16 * Math.min(1, (pages - page) * 2 / pages);

	if (newPage < pages - 3)
		$('.sj-book .p111 .depth').css({
			width: depthWidth,
			right: 20 - depthWidth
		});
	else
		$('.sj-book .p111 .depth').css({ width: 0 });

}

function loadPage(page) {
	let filename = document.querySelector('meta[name="filename"]')
	console.log(filename);
	let pageNumber = document.querySelector('meta[name="pageNumber"]')
	console.log(filename.content + '.html');
	$.ajax({ url: filename.content + '.html' }).
		done(function (pageHtml) {
			// console.log(pageHtml);
			console.log(page);
			var a = $('.sj-book .p' + page).html(pageHtml.replace('samples/steve-jobs/', ''));
			console.log(a);
			filename.content = ""
			console.log(a);
		});

}

function addPage(page, book) {

	var id, pages = book.turn('pages');

	if (!book.turn('hasPage', page)) {

		var element = $('<div />',
			{
				'class': 'own-size',
				css: { width: 460, height: 582 }
			}).
			html('<div class="loader"></div>');

		if (book.turn('addPage', element, page)) {
			loadPage(page);
		}

	}
}
// add pages to the book
// function addPagesToBook() {
// 	var book = $('.sj-book'); // Your book container
// 	var pagesData = [
// 		{
// 			id: "book-15",
// 			src: "./assets/images/Poems-Collection.png",
// 			dataId: "poems_front.jpg",
// 			dataPage: "assets/pages/filter"
// 		},
// 		{
// 			id: "book-16",
// 			src: "./assets/images/poem-one-love.png",
// 			dataId: "40-poems_front.jpg",
// 			dataPage: "assets/pages/40-poem"
// 		},
// 		{
// 			id: "book-17",
// 			src: "./assets/images/Quotes-Collection.png",
// 			dataId: "quotes_front.jpg",
// 			dataPage: "assets/pages/quotes"
// 		},
// 		{
// 			id: "book-18",
// 			src: "./assets/images/Daily-Quotes-Weekly-Poems.png",
// 			dataId: "daily-quotes_front.jpg",
// 			dataPage: "assets/pages/daily-quote"
// 		}
// 	];

// 	for (var i = 2; i < pagesData.length; i++) {
// 		var pageData = pagesData[i];
// 		var newPage = $('<div class="own-size"></div>');

// 		// You can add content to the newPage here, like an image or other HTML elements.
// 		newPage.append('<img src="' + pageData.src + '" data-id="' + pageData.dataId + '" data-page="' + pageData.dataPage + '" class="initBook" alt="">');

// 		// Add the newPage to the book using the addPage function
// 		if (book.turn('addPage', newPage)) {
// 			// Load content into the newPage using your loadPage function
// 			loadPage(i + 1); // You may need to adjust this index as needed
// 		}
// 	}
// }
// addPagesToBook();

function numberOfViews(book) {

	return book.turn('pages') / 2 + 1;

}

function getViewNumber(book, page) {

	return parseInt((page || book.turn('page')) / 2 + 1, 10);

}

function zoomHandle(e) {

	if ($('.sj-book').data().zoomIn)
		zoomOut();
	else if (e.target && $(e.target).hasClass('zoom-this')) {
		zoomThis($(e.target));
	}

}

function zoomThis(pic) {

	var position, translate,
		tmpContainer = $('<div />', { 'class': 'zoom-pic' }),
		transitionEnd = $.cssTransitionEnd(),
		tmpPic = $('<img />'),
		zCenterX = $('#book-zoom').width() / 2,
		zCenterY = $('#book-zoom').height() / 2,
		bookPos = $('#book-zoom').offset(),
		picPos = {
			left: pic.offset().left - bookPos.left,
			top: pic.offset().top - bookPos.top
		},
		completeTransition = function () {
			$('#book-zoom').unbind(transitionEnd);

			if ($('.sj-book').data().zoomIn) {
				tmpContainer.appendTo($('body'));

				$('body').css({ 'overflow': 'hidden' });

				tmpPic.css({
					margin: position.top + 'px ' + position.left + 'px'
				}).
					appendTo(tmpContainer).
					fadeOut(0).
					fadeIn(500);
			}
		};

	$('.sj-book').data().zoomIn = true;

	$('.sj-book').turn('disable', true);

	$(window).resize(zoomOut);

	tmpContainer.click(zoomOut);

	tmpPic.load(function () {
		var realWidth = $(this)[0].width,
			realHeight = $(this)[0].height,
			zoomFactor = realWidth / pic.width(),
			picPosition = {
				top: (picPos.top - zCenterY) * zoomFactor + zCenterY + bookPos.top,
				left: (picPos.left - zCenterX) * zoomFactor + zCenterX + bookPos.left
			};


		position = {
			top: ($(window).height() - realHeight) / 2,
			left: ($(window).width() - realWidth) / 2
		};

		translate = {
			top: position.top - picPosition.top,
			left: position.left - picPosition.left
		};

		$('.samples .bar').css({ visibility: 'hidden' });
		$('#slider-bar').hide();


		$('#book-zoom').transform(
			'translate(' + translate.left + 'px, ' + translate.top + 'px)' +
			'scale(' + zoomFactor + ', ' + zoomFactor + ')');

		if (transitionEnd)
			$('#book-zoom').bind(transitionEnd, completeTransition);
		else
			setTimeout(completeTransition, 1000);

	});

	tmpPic.attr('src', pic.attr('src'));

}

function zoomOut() {

	var transitionEnd = $.cssTransitionEnd(),
		completeTransition = function (e) {
			$('#book-zoom').unbind(transitionEnd);
			$('.sj-book').turn('disable', false);
			$('body').css({ 'overflow': 'auto' });
			moveBar(false);
		};

	$('.sj-book').data().zoomIn = false;

	$(window).unbind('resize', zoomOut);

	moveBar(true);

	$('.zoom-pic').remove();
	$('#book-zoom').transform('scale(1, 1)');
	$('.samples .bar').css({ visibility: 'visible' });
	$('#slider-bar').show();

	if (transitionEnd)
		$('#book-zoom').bind(transitionEnd, completeTransition);
	else
		setTimeout(completeTransition, 1000);
}


function moveBar(yes) {
	if (Modernizr && Modernizr.csstransforms) {
		$('#slider .ui-slider-handle').css({ zIndex: yes ? -1 : 10000 });
	}
}

function setPreview(view) {

	var previewWidth = 115,
		previewHeight = 73,
		previewSrc = 'pages/preview.jpg',
		preview = $(_thumbPreview.children(':first')),
		numPages = (view == 1 || view == $('#slider').slider('option', 'max')) ? 1 : 2,
		width = (numPages == 1) ? previewWidth / 2 : previewWidth;

	_thumbPreview.
		addClass('no-transition').
		css({
			width: width + 15,
			height: previewHeight + 15,
			top: -previewHeight - 30,
			left: ($($('#slider').children(':first')).width() - width - 15) / 2
		});

	preview.css({
		width: width,
		height: previewHeight
	});

	if (preview.css('background-image') === '' ||
		preview.css('background-image') == 'none') {

		preview.css({ backgroundImage: 'url(' + previewSrc + ')' });

		setTimeout(function () {
			_thumbPreview.removeClass('no-transition');
		}, 0);

	}

	preview.css({
		backgroundPosition:
			'0px -' + ((view - 1) * previewHeight) + 'px'
	});
}

function isChrome() {

	// Chrome's unsolved bug
	// http://code.google.com/p/chromium/issues/detail?id=128488

	return navigator.userAgent.indexOf('Chrome') != -1;

}