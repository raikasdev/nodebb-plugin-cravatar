"use strict";

define("admin/plugins/cravatar", ["settings"], function (Settings) {
  var ACP = {};

  ACP.init = function () {
    Settings.load("cravatar", $(".cravatar-settings"));

    $("#save").on("click", function () {
      Settings.save("cravatar", $(".cravatar-settings"));
    });
  };

  return ACP;
});
