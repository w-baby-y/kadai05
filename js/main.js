/////////////////////////////////
//グローバル変数
/////////////////////////////////
let randomStation = "";
let stationLat = "";
let StationLon = "";
let clickCount = 0;
let gamePoint = 1010;
let firstPoint = 0;
let secondPoint = 0;
let thirdPoint = 0;
let totalPoint = 0;
let gameCount = 0;
let prefData = "";

game();

$("#guess").on("click", function () {
  gameCount++;
  //   console.log("ゲス！クリック");

  if (gameCount === 1) {
    firstPoint = pointCalc();
    $("#first-point").append(firstPoint);
    console.log(firstPoint, "1回目のポイント");
    $("#answer").text("答え：" + prefData);
    gamePoint = 1010; //ゲームポイントを初期化
    clickCount = 0;
    game();
  } else if (gameCount === 2) {
    secondPoint = pointCalc();
    $("#second-point").append(secondPoint);
    console.log(secondPoint, "2回目のポイント");
    $("#answer").text("答え：" + prefData);
    gamePoint = 1010; //ゲームポイントを初期化
    clickCount = 0;
    game();
  } else {
    thirdPoint = pointCalc();
    $("#third-point").append(thirdPoint);
    console.log(thirdPoint, "3回目のポイント");
    $("#answer").text("答え：" + prefData);
  }
});

$("#restart").on("click", function () {
  game();
});

function pointCalc() {
  if ($("#pref").val() === "") {
    console.log("再度選んでください。");
  } else if ($("#pref").val() === prefData) {
    console.log("成功");
    gamePoint = gamePoint - clickCount * 10;
    return gamePoint;
  } else {
    console.log("失敗");
    gamePoint = 0;
    return gamePoint;
  }
}

function game() {
  /////////////////////////////////
  //ランダムな駅を抽出する（APIはやめてJSON呼び出し）
  /////////////////////////////////
  fetch("station.json")
    // https://ekidata.jp/dl/?p=1
    .then((response) => response.json())
    .then((data) => {
      console.log(data, "駅データ");
      randomIndex = Math.floor(Math.random() * data.length);
      // console.log(randomIndex, "ランダム");
      randomStation = data[randomIndex].station_name;
      stationLat = data[randomIndex].lat;
      stationLon = data[randomIndex].lon;
      stationLatRound = Math.round(stationLat * 1000) / 1000; //詳細すぎるとストリートビューに反映されないので小数点４桁まで
      stationLonRound = Math.round(stationLon * 1000) / 1000;

      console.log(
        randomStation + " lat=" + stationLat + " lon=" + stationLon,
        "ランダムな駅名"
      );
      console.log(stationLatRound + stationLonRound);
      /////////////////////////////////
      //Googleストリートビューを表示
      /////////////////////////////////
      const panorama = new google.maps.StreetViewPanorama(
        document.getElementById("map"),
        {
          position: { lat: stationLatRound, lng: stationLonRound },
          pov: {
            heading: 34,
            pitch: 10,
          },
          disableDefaultUI: true, //すべてのコントロールを消す
        }
        //https://developers.google.com/maps/documentation/javascript/reference/street-view
      );
      panorama.addListener("position_changed", function () {
        clickCount++; // カウンタをインクリメント
        console.log(`Position changed ${clickCount} times.`);
      });
      // console.log(stationLat + stationLon);

      /////////////////////////////////
      //GoogleMap表示
      /////////////////////////////////
      // var MyLatLng = new google.maps.LatLng(stationLat, StationLon);
      // console.log(MyLatLng, "Googlemapへの引数");
      // var Options = {
      //   zoom: 15, //地図の縮尺値
      //   center: MyLatLng, //地図の中心座標
      //   mapTypeId: "roadmap", //地図の種類
      // };
      // var map = new google.maps.Map(document.getElementById("map"), Options);

      /////////////////////////////////
      //緯度経度からどの都道府県か導き出すAPI
      /////////////////////////////////
      // APIのエンドポイントURL
      x = stationLon; //lon x
      y = stationLat; //lat y
      const url = `https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${x}&y=${y}`;
      //http://geoapi.heartrails.com/api.html#geolocation
      // fetch APIを使用してデータを取得
      fetch(url)
        .then((response) => {
          // HTTPレスポンスのステータスチェック
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          // レスポンスが成功した場合、JSONとしてパース
          return response.json();
        })
        .then((data) => {
          // データの使用
          // console.log(data);
          console.log(
            data.response.location[0].prefecture,
            "緯度経度から都道府県を指定"
          );
          prefData = data.response.location[0].prefecture;
        })
        .catch((error) => {
          // エラー処理
          console.error(
            "There has been a problem with your fetch operation:",
            error
          );
        });
    })
    .catch((error) => console.error("Error:", error));
}
