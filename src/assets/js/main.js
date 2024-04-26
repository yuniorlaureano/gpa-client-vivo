// Sidebars JS
jQuery(function ($) {
  // Added by Srinu
  $(function () {
    // When the window is resized,
    $(window).resize(function () {
      // When the width and height meet your specific requirements or lower
      if ($(window).width() <= 768) {
        $(".page-wrapper").removeClass("pinned");
      }
    });
    // When the window is resized,
    $(window).resize(function () {
      // When the width and height meet your specific requirements or lower
      if ($(window).width() >= 768) {
        $(".page-wrapper").removeClass("toggled");
      }
    });
  });
});

// Toggle graph day selection
$(function () {
  $(".graph-day-selection .btn").on("click", function () {
    $(".graph-day-selection .btn").removeClass("active");
    $(this).addClass("active");
  });
});

// Download File
$(".download-reports").on("click", function () {
  $.ajax({
    url: "sample.txt",
    crossOrigin: null,
    xhrFields: {
      responseType: "blob",
    },
    success: function (blob) {
      console.log(blob.size);
      var link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "Reports" + ".txt";
      link.click();
    },
  });
});

// Todays Date
$(function () {
  var interval = setInterval(function () {
    var momentNow = moment();
    $(".todaysDate").html(momentNow.format("LLLL"));
  }, 100);
});

// Toggle Pricing Plan
$(".pricing-change-plan a").on("click", function () {
  if ($(this).hasClass("active-plan")) {
    $(".pricing-change-plan a").removeClass("active-plan");
  } else {
    $(".pricing-change-plan a").removeClass("active-plan");
    $(this).addClass("active-plan");
  }
});

/***********
***********
***********
	Bootstrap JS 
***********
***********
***********/

// Tooltip
var tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Popover
var popoverTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="popover"]')
);
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl);
});
