var current_scrollY;

$(document).ready(function() {

	// 子モーダルを開く
	$('#myBtn1').click(function() {
		current_scrollY = $(window).scrollTop();
		$('#wrapper').css({
			top: -1 * current_scrollY,
			position: 'fixed',
		    width: '100%',
		});
		$('#myModal1').modal({show: true});
	});

	// 孫モーダルを開く
	$('#myBtn2').click(function() {
		$('#myModal2').show('fast');
		isLaunchedMyModal2 = true;
	});

	// 子モーダルを閉じる
	$('#myModal1').on('hidden.bs.modal', function () {
		$('#wrapper').attr( { style: '' } );
		$('html, body').prop({ scrollTop: current_scrollY });
	});

	// 孫モーダルを閉じる
	$(document).on('click', function(evt){
		if(!$(evt.target).closest('.modal-dialog').length){
	    	$('#myModal2').hide('fast');
		}
	});
});
