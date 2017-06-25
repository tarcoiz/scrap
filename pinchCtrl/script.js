// 要素ら

var $document = $(document);
var $hitarea = $('#hitarea');
var $eventname = $('#eventname');
var $x = $('#x');
var $y = $('#y');
var $x_2 = $('#x_2');
var $y_2 = $('#y_2');

// タッチイベントが利用可能かの判別

var supportTouch = 'ontouchend' in document;

// イベント名

var EVENTNAME_TOUCHMOVE = supportTouch ? 'touchmove' : 'mousemove';
var EVENTNAME_TOUCHEND = supportTouch ? 'touchend' : 'mouseup';

// 表示をアップデートする関数群

var updateXY = function(event) {
  // jQueryのイベントはオリジナルのイベントをラップしたもの。
  // changedTouchesが欲しいので、オリジナルのイベントオブジェクトを取得
  var original = event.originalEvent;
  var x, y, x_2, y_2 ;
  if(original.changedTouches) {
    x = original.changedTouches[0].pageX;
    y = original.changedTouches[0].pageY;

    if( original.touches.length == 2 ) {
      $x_2.text(original.changedTouches[1].pageX);
      $x_2.text(original.changedTouches[1].pageY);
    }

  } else {
    x = event.pageX;
    y = event.pageY;
  }
  $x.text(x);
  $y.text(y);
};
var updateEventname = function(eventname) {
  $eventname.text(eventname);
};

// イベント設定
var handleStart = function(event) {
  updateEventname(EVENTNAME_TOUCHSTART);
  updateXY(event);
  $hitarea.css('background-color', 'red');
  bindMoveAndEnd();
};
var handleMove = function(event) {
  event.preventDefault(); // タッチによる画面スクロールを止める
  updateEventname(EVENTNAME_TOUCHMOVE);
  updateXY(event);
};
var handleEnd = function(event) {
  updateEventname(EVENTNAME_TOUCHEND);
  updateXY(event);
  $hitarea.css('background-color', 'blue');
  unbindMoveAndEnd();
};
var bindMoveAndEnd = function() {
  $document.on(EVENTNAME_TOUCHMOVE, handleMove);
  $document.on(EVENTNAME_TOUCHEND, handleEnd);
};
var unbindMoveAndEnd = function() {
  $document.off(EVENTNAME_TOUCHMOVE, handleMove);
  $document.off(EVENTNAME_TOUCHEND, handleEnd);
};

$hitarea.on(EVENTNAME_TOUCHSTART, handleStart);


var bZoom = false;    // ズーム中かどうかフラグ
var nowWidth; // 現在の画像の幅
var nowHeight; // 現在の画像の高さ
var pinching = false; // ピンチかどうかフラグ
       var d0 = 1; // 前回の指の位置
       var d1 = 1; // 今回の指の位置

       var startPosX = 0; // タッチが始まったX座標
       var startPosY = 0; // タッチが始まったY座標


       // タッチ開始
       $('#b').on(EVENTNAME_TOUCHSTART, function (e) {
           if (bZoom) {
               // 拡大中の場合のみ
               startPosX = e.originalEvent.touches[0].screenX;
               startPosY = e.originalEvent.touches[0].screenY;
           }
       });

       // タッチ移動
       $("#b").on(EVENTNAME_TOUCHMOVE, function (e) {
           if (e.originalEvent.touches.length == 1) {
               // 指1本。スクロール
               if (bZoom) {
                   // 拡大中の場合のみ
                   // タッチの座標取得
                   var dx = e.originalEvent.touches[0].screenX - startPosX;
                   var dy = e.originalEvent.touches[0].screenY - startPosY;

                   // 現在のtransform値を取得
                   var matrix = $('#b').css('transform');

                   // 値はmatrix(0,0,0,0,0,0)のフォーマットでかえってくる。
                   // 未設定の場合はnone
                   if (matrix != 'none') {
                       // 値の解析
                       matrix = matrix.substring(7, matrix.length - 1);
                       var matList = matrix.split(',');
                       var nowTransX = matList[4].trim(); // 縦位置
                       var nowTransY = matList[5].trim(); // 横位置

                       // 差分を加える
                       dx = parseInt(nowTransX) + parseInt(dx);
                       dy = parseInt(nowTransY) + parseInt(dy);

                       // 移動の位置制御
                       // 何もしないと画面をはみ出してしまうので
                       var minWidth = $('#org-width').val();
                       var minHeight = $('#org-height').val();
                       var maxDx = nowWidth - minWidth;
                       var maxDy = nowHeight - minHeight;

                       // 左端まで
                       if (dx > 0) {
                           dx = 0;
                       }
                       // 右端まで
                       if (Math.abs(dx) > Math.abs(maxDx)) {
                           dx = -(maxDx);
                       }
                       // 下端まで
                       if (Math.abs(dy) > Math.abs(maxDy)) {
                           dy = -(maxDy);
                       }
                       // 上端まで
                       if (dy > 0) {
                           dy = 0;
                       }

                       // これ大事
                       $('#b').css({
                           'transform': 'translate3d(' + dx + 'px, ' + dy + 'px, 0px)',
                           '-webkit-transform': 'translate3d(' + dx + 'px, ' + dy + 'px, 0px)',
                           '-moz-transform': 'translate3d(' + dx + 'px, ' + dy + 'px, 0px)',
                           '-ms-transform': 'translate3d(' + dx + 'px, ' + dy + 'px, 0px)'
                       });

                       // タッチ位置を設定
                       // touchmoveの場合、タッチが離れないのでtouchstartが実行されないのでこちらで更新する必要あり
                       startPosX = e.originalEvent.touches[0].screenX;
                       startPosY = e.originalEvent.touches[0].screenY;
                   }
               }
           }
           else if (e.originalEvent.touches.length == 2) {

               // 指2本。ピンチイン/アウト: 座標表示





               if (!pinching) {
                   // 初回のタッチ
                   // ピンチインをtrueにして、ピンチ状態にする
                   pinching = true;

                   // Xの2乗 + Yの2乗のルート
                   // Math.powは階乗、Math.sqrtはルートをとってるだけ
                   // ここは参考サイトのものをそのまま利用させてもらいました
                   d0 = Math.sqrt(
                     Math.pow(e.originalEvent.touches[1].screenX - e.originalEvent.touches[0].screenX, 2) +
                     Math.pow(e.originalEvent.touches[1].screenY - e.originalEvent.touches[0].screenY, 2)
                   );
               }
               else {
                   d1 = Math.sqrt(
                     Math.pow(e.originalEvent.touches[1].screenX - e.originalEvent.touches[0].screenX, 2) +
                     Math.pow(e.originalEvent.touches[1].screenY - e.originalEvent.touches[0].screenY, 2)
                   );

                   // 前回から何倍の距離を移動したかを計算
                   var zoom = d1 / d0;

                   // ピンチインかアウトか判定するため差分を取る
                   var diff = d1 - d0;

                   // 最小・最大拡大率の設定
                   // 今回は最大3倍までの拡大率
                   var maxWidth = $('#org-width').val() * 3;
                   var maxHeight = $('#org-height').val() * 3;
                   var minWidth = $('#org-width').val();
                   var minHeight = $('#org-height').val();

                   // 前回の距離との倍率を取得
                   var newWidth = $('#img-main-image').width() * zoom;
                   var newHeight = $('#img-main-image').height() * zoom;

                   // 幅
                   if (newWidth > maxWidth) {
                       // 大きすぎるから最大倍率に
                       newWidth = maxWidth;
                   }
                   else if (newWidth < minWidth) {
                       // 小さすぎるから最小倍率に
                       newWidth = minWidth;
                   }

                   // 高さ
                   if (newHeight > maxHeight) {
                       // 大きすぎるから最大倍率に
                       newHeight = maxHeight;
                   }
                   else if (newHeight < minHeight) {
                       // 小さすぎるから最小倍率に
                       newHeight = minHeight;
                   }

                   // ピンチの中心座標を取得
                   var baseDx = (parseInt(e.originalEvent.touches[1].screenX) + parseInt(e.originalEvent.touches[0].screenX)) / 2;
                   var baseDy = (parseInt(e.originalEvent.touches[1].screenY) + parseInt(e.originalEvent.touches[0].screenY)) / 2;

                   // 移動
   　　　　　　　　　 // 元の画像と拡大後の画像の差分を取って位置を移動します
                   // 2で割っているのは、画像は中心から拡大されるので、元画像と比較すると上下左右にはみ出ることになります。
                   // 正しい位置に移動するには中心からの距離が必要になるので、画像のサイズの差分を半分にした値になります（詳細は下部の画像を参照）
                   var dx = (newWidth - $('#b').width()) / 2;
                   var dy = (newHeight - $('#b').height()) / 2;

                   // ピンチインとアウトで距離のプラスマイナスを変えています
                   // ピンチインだとマイナス、ピンチアウトだとプラス
                   if (diff >= 0) {
                       // ピンチアウト
                       dx = parseInt(dx) + baseDx;
                       dy = parseInt(dy) + baseDy;
                   }
                   else {
                       // ピンチイン
                       dx = dx - baseDx;
                       dy = dy - baseDy;

                       // 位置がマイナスにならないようにする
                       // これがないと悲しいことになる　
                       if (dx < 0) {
                           dx = 0;
                       }
                       if (dy < 0) {
                           dy = 0;
                       }
                   }

                   $('#b').css({
                       'transform': 'translate3d(-' + dx + 'px, -' + dy + 'px, 0px)',
                       '-webkit-transform': 'translate3d(-' + dx + 'px, -' + dy + 'px, 0px)',
                       '-moz-transform': 'translate3d(-' + dx + 'px, -' + dy + 'px, 0px)',
                       '-ms-transform': 'translate3d(-' + dx + 'px, -' + dy + 'px, 0px)'
                   });

                   // 画像の拡大/縮小
                   $("#b").css({
                       'width': newWidth + 'px',
                       'height': newHeight + 'px'
                   });

                   nowWidth = newWidth;
                   nowHeight = newHeight;

                   if (newWidth > minWidth) {
                       // 拡大中
                       bZoom = true;
                   }
                   else {
                       // 拡大していない
                       bZoom = false;
                   }
               }
           }

           // ブラウザのイージング抑止
           // iPadで見たときにスクロール終わりにぐにょーんってなるのが変だったので
           e.preventDefault();
       });    // タッチ終了

    $("#b").on(EVENTNAME_TOUCHEND, function (e) {
        // ピンチ終わり
        pinching = false;
    });
