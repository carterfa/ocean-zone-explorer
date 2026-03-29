const distUnits = ["m", "ft", "mi", "km"];
const presUnits = ["atm", "psi", "bar"];
let distIdx = 0;
let presIdx = 0;
const minDepth = 1;
const maxDepth = 11000;

//depth gauge changes with scrolling
function depthGauge() {
  //calculates correct height
  let topHt = parseInt($(".top").css("height"));
  const winAdj = $(window).scrollTop() + ($(window).height() / 2);
  let deepm = parseInt((winAdj - topHt) / 10);

  if (deepm > maxDepth) {
    deepm = maxDepth
  }

  let presTxt = "";
  let deepTxt = "";
  let sfd = distUnits[distIdx];
  let sfp = presUnits[presIdx];
  let isOptionsOpen = false;

  //sets toggle display
  $("#presTogl").text(sfp);
  $("#distTogl").text(sfd);

  const base = deepm < 0 ? 1 : deepm
  //runs pressure conversions
  switch (presIdx) {
    case 0:
      //atmospheres
      presTxt = parseInt(1 + (base / 10));
      break;
    case 1:
      //psi
      presTxt = parseInt(14.6 + (14.6 * (base / 10)));
      break;
    case 2:
      //bar
      presTxt = parseInt(1 + (base / 10));
      break;
  }

  //runs distance conversions
  switch (distIdx) {
    case 0:
      //meters
      deepTxt = base;
      break;
    case 1:
      //feet
      deepTxt = parseInt(base * 3.28);
      break;
    case 2:
      //miles
      deepTxt = (base / 1609.344).toFixed(2);
      break;
    case 3:
      //kilometers
      deepTxt = (base / 1000).toFixed(2);
      break;
  }

  //displays text in the DOM
  if (deepm > 11000) {
    $("#depthTxt").css("display", "none");
    $("#presTxt").css("display", "none");
  } else {
    $("#depthTxt").css("display", "block");
    $("#depthTxt").text(deepTxt + sfd);

    $("#presTxt").css("display", "block");
    $("#presTxt").text(presTxt + sfp);
  }
}

function mapScroll(windowTop) {

  let windowHt = $(window).height();
  let mapHt = parseInt($(".minimap").css("height"));
  let oceanDpth = parseInt($("#wholeocean").css("height"));
  //adjusts thickness of slider based on height
  let winscale = (windowHt * parseInt(mapHt)) / parseInt(oceanDpth);
  let slider = $("#mapslider");
  let sliderHt = parseInt($("#mapslider").css("height"));

  //sets mapslider size based on window
  $("#mapslider").css("height", winscale);

  //scrolls map slider based on window
  let scrollscale = (windowTop / oceanDpth) * mapHt;
  if (windowTop > 500 && scrollscale < (mapHt - sliderHt)) {
    slider.css({ top: scrollscale });
    //prevents slider from going past bottom of map
  } else if (scrollscale > (mapHt - sliderHt)) {
    slider.css({ top: (mapHt - sliderHt) });
  }
  else {
    slider.css({ top: 0 });
  }
}

function zoneScroll(windowTop) {
  let zone;
  let topHt = parseInt($(".top").css("height"));

  //epipelagic zone scrolling
  if (windowTop > topHt && windowTop < 2000 + topHt) {
    zone = $("#epiZone");
  } else {
    $("#epiZone").css("position", "static");
  }
  //mesopelagic zone scrolling
  if (windowTop > 2000 + topHt && windowTop < 10000 + topHt) {
    zone = $("#mesoZone");
  } else {
    $("#mesoZone").css("position", "static");
  }
  //bathypelagic zone scrolling
  if (windowTop > 10000 + topHt && windowTop < 40000 + topHt) {
    zone = $("#bathyZone");
  } else {
    $("#bathyZone").css("position", "static");
  }
  //abyssopelagic zone scrolling
  if (windowTop > 40000 + topHt && windowTop < 60000 + topHt) {
    zone = $("#abyssZone");
  } else {
    $("#abyssZone").css("position", "static");
  }
  //hadopelagic zone scrolling
  if (windowTop > 60000 + topHt) {
    zone = $("#hadoZone");
  } else {
    $("#hadoZone").css("position", "static");
  }

  if (zone) {
    zone.css("position", "fixed");
    zone.css("top", 0);
    zone.css("left", 0);
  }

}

$(document).ready(function () {
  let windowTop = $(window).scrollTop();
  //HUD persistence
  depthGauge();
  mapScroll(windowTop);
  //sets top and ocean floor
  $(".oceanfloor").css("height", (($(window).height() / 1.5)));
  //$(".top").css("height", (($(window).height() / 1.5)));

  //sticky title functions
  $(window).scroll(function () {
    windowTop = $(window).scrollTop();
    depthGauge();
    zoneScroll(windowTop);
    mapScroll(windowTop);

  });

  //responsiveness for window resizing
  $(window).resize(function () {
    //adjusts top and ocean floor to match gauge height
    $(".oceanfloor").css("height", (($(window).height() / 1.5)));
    $(".top").css("height", (($(window).height() / 1.5)));
    mapScroll($(window).scrollTop());
  });

  //changes distance units
  $("#distTogl").on("click", function () {
    if (distIdx < distUnits.length - 1) {
      distIdx++;
    } else {
      distIdx = 0;
    }
    depthGauge();
  });

  //changes pressure units
  $("#presTogl").on("click", function () {
    if (presIdx < presUnits.length - 1) {
      presIdx++;
    } else {
      presIdx = 0;
    }
    depthGauge();
  });

  //change map visibility
  $("#mapTogl").on("click", function () {
    $(".minimap").toggle();
    if ($("#mapTogl").css("text-decoration") === "none solid rgb(255, 255, 255)") {
      $("#mapTogl").css("text-decoration", "line-through");
    } else {
      $("#mapTogl").css("text-decoration", "none");
    }
  });

  //lines visibility
  $("#linesTogl").on("click", function () {
    const hasOutline = $(".ocean").css("outline") === 'rgb(255, 255, 255) solid 2px'
    console.log( $(".ocean").css("outline"), hasOutline)
    if (hasOutline) {
      $(".ocean").css("outline", "none");
    } else {
      $(".ocean").css("outline", "2px solid white");
    }
  });

  $(".mapNav").click(function (event) {
    const mapSectionClicked = $(this).data("zone-id")
    console.log('map', mapSectionClicked)
    $(`#${mapSectionClicked}`)[0].scrollIntoView({ behavior: 'smooth' })
  });

  //changes options visibility
  $("#menuIcon").on("click", function () {
    $("#options").toggle();
    $("#menuIcon").css("display", "none");
    $("#closeIcon").css("display", "block");
  });

  $("#closeIcon").on("click", function () {
    $("#options").toggle();
    $("#closeIcon").css("display", "none");
    $("#menuIcon").toggle();
  });
})