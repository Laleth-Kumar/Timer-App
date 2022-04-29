/**
 * @author Laleth I N <laleth.kumar@solitontech.com>
 */
const EXPRESS = require("express");
const APP = EXPRESS();
const PATH = require("path");
const FS = require("fs");

const PORT = 8000;
const LOGIN_PAGE = "./public/login.html";
const MAIN_PAGE = "./public/index.html";
const FILE_DIRECTORY = "./public";
const HTTP_STATUS = {
  success: {
    code: 200,
  },
  notFound: {
    code: 404,
    message: {
      error: "404 Not Found",
    },
  },
  badRequest: {
    code: 400,
    message: {
      error: "Not a valid Request. Please check API Doc",
    },
  },
};

let users = require("./users.json");
APP.get("/", (req, res) => {
  if (req.url === "/") {
    res.sendFile(PATH.resolve(LOGIN_PAGE));
  } else {
    res
      .status(HTTP_STATUS.badRequest.code)
      .json(HTTP_STATUS.badRequest.message);
  }
});

APP.get("/main", (req, res) => {
  if (req.query.user) {
    res.sendFile(PATH.resolve(MAIN_PAGE));
  } else {
    res
      .status(HTTP_STATUS.badRequest.code)
      .json(HTTP_STATUS.badRequest.message);
  }
});

APP.get("/getlog", (req, res) => {
  if (req.query.user) {
    let path = `./userLogs/${req.query.user}.json`;
    if (FS.existsSync(path)) {
      let timeLog = require(path);
      res.send(JSON.stringify(timeLog));
    } else {
      res.status(HTTP_STATUS.notFound.code).json(HTTP_STATUS.notFound.message);
    }
  }
});

APP.use(EXPRESS.json());

APP.post("/login", (req, res) => {
  try {
    let userName = req.body.userName;
    let password = req.body.password;
    if (userName && password) {
      if (users[userName]) {
        if (users[userName] === String(password)) {
          res.send({
            userName: true,
            password: true,
          });
        } else {
          res.send({
            userName: true,
            password: false,
          });
        }
      } else {
        res.send({
          userName: false,
          password: false,
        });
      }
    } else {
      throw new Error();
    }
  } catch {
    res
      .status(HTTP_STATUS.badRequest.code)
      .json(HTTP_STATUS.badRequest.message);
  }
});

APP.post("/signup", (req, res) => {
  try {
    let newUser = req.body.userName;
    let newPassword = req.body.password;

    if (newUser && newPassword) {
      if (users[newUser]) {
        res.json({
          message: "User Already Exists, Try different username",
        });
      } else {
        users[newUser] = newPassword;
        FS.writeFile("users.json", JSON.stringify(users), (err) => {
          if (err) {
            throw new Error();
          }
        });
        FS.writeFile(
          `./userLogs/${newUser}.json`,
          JSON.stringify({}),
          (err) => {
            if (err) {
              throw new Error();
            }
          }
        );
        res.json({ message: "User added. Try logging in" });
      }
    } else {
      throw new Error();
    }
  } catch {
    res
      .status(HTTP_STATUS.badRequest.code)
      .json(HTTP_STATUS.badRequest.message);
  }
});

APP.post("/updatelog", (req, res) => {
  if (req.query.user) {
    let path = `./userLogs/${req.query.user}.json`;
    let timeLog = require(path);
    let newLog = req.body;
    let updatedLog = Object.assign(timeLog, newLog);
    FS.writeFile(path, JSON.stringify(updatedLog), (err) => {
      if (err) {
        res
          .status(HTTP_STATUS.badRequest.code)
          .json(HTTP_STATUS.badRequest.message);
      }
    });
    res.status(HTTP_STATUS.success.code);
    res.end();
  } else {
    res
      .status(HTTP_STATUS.badRequest.code)
      .json(HTTP_STATUS.badRequest.message);
  }
});

APP.post("/deletelog", (req, res) => {
  if (req.query.user) {
    let path = `./userLogs/${req.query.user}.json`;
    let timeLog = require(path);
    let newLog = req.body;
    delete timeLog[newLog.id];
    FS.writeFile(path, JSON.stringify(timeLog), (err) => {
      if (err) {
        res
          .status(HTTP_STATUS.badRequest.code)
          .json(HTTP_STATUS.badRequest.message);
      }
    });
    res.status(HTTP_STATUS.success.code);
    res.end();
  } else {
    res
      .status(HTTP_STATUS.badRequest.code)
      .json(HTTP_STATUS.badRequest.message);
  }
});

APP.use(EXPRESS.static(FILE_DIRECTORY));
APP.listen(PORT);
