"use strict";

const user = require.main.require("./src/user");
const meta = require.main.require("./src/meta");
const winston = require.main.require("winston");

const controllers = require("./lib/controllers");

const plugin = {};

plugin.init = async (params) => {
  const { router } = params;
  const hostMiddleware = params.middleware;

  router.get(
    "/admin/plugins/cravatar",
    hostMiddleware.admin.buildHeader,
    controllers.renderAdminPage
  );
  router.get("/api/admin/plugins/cravatar", controllers.renderAdminPage);
};

plugin.addAdminNavigation = async (header) => {
  header.plugins.push({
    route: "/plugins/cravatar",
    icon: "fa-picture",
    name: "Cravatar",
  });

  return header;
};

plugin.list = async (data) => {
  const { username } = await user.getUserFields(data.uid, ["username"]);
  data.pictures.push({
    type: "cravatar",
    url: await getCravatarUrl(username),
    text: "Cravatar",
  });

  return data;
};

plugin.get = async (data) => {
  if (data.type === "cravatar") {
    const { username } = await user.getUserFields(data.uid, ["username"]);
    data.picture = await getCravatarUrl(username);
  }

  return data;
};

plugin.updateUser = async (data) => {
  const { default: useDefault } = await meta.settings.get("cravatar");
  if (useDefault === "on") {
    winston.verbose(
      `[plugin/cravatar] Updating uid ${data.user.uid} to use cravatar`
    );
    data.user.picture = await getCravatarUrl(data.user.username);
  }

  return data;
};

plugin.onForceEnabled = async (users) => {
  const { default: useDefault, force } = await meta.settings.get("cravatar");

  if (force === "on") {
    users = await Promise.all(
      users.map(async (userObj) => {
        if (!userObj) {
          return userObj;
        }

        userObj.picture = await getCravatarUrl(userObj.username);
        return userObj;
      })
    );
  } else if (plugin.hasOwnProperty("settings") && useDefault === "on") {
    users = await Promise.all(
      users.map(async (userObj) => {
        if (!userObj) {
          return userObj;
        }

        if (userObj.picture === null || userObj.picture === "") {
          userObj.picture = await getCravatarUrl(userObj.username);
        }
        return userObj;
      })
    );
  }

  return users;
};

async function getCravatarUrl(username) {
  return `https://cravatar.eu/avatar/${username}/192.png`;
}

module.exports = plugin;
