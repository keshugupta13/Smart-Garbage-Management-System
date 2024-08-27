// Karma configuration for Angular Unit Tests
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: false, // Disable random execution of tests
      },
      clearContext: false // Leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // Removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};

// VS Code `launch.json` Configuration
const vscodeLaunchConfig = `
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ng serve",
      "type": "pwa-chrome",
      "request": "launch",
      "preLaunchTask": "npm: start",
      "url": "http://localhost:4200/",
      "webRoot": "\${workspaceFolder}"
    },
    {
      "name": "ng test",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: test",
      "url": "http://localhost:9876/debug.html",
      "webRoot": "\${workspaceFolder}"
    }
  ]
}
`;

// VS Code Tasks Configuration
const vscodeTasksConfig = `
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "ng serve",
      "type": "npm",
      "script": "start",
      "isBackground": true,
      "problemMatcher": {
        "owner": "typescript",
        "pattern": "$tsc",
        "background": {
          "activeOnStart": true,
          "beginsPattern": {
            "regexp": "Starting Angular"
          },
          "endsPattern": {
            "regexp": "Compiled successfully"
          }
        }
      }
    },
    {
      "label": "ng test",
      "type": "npm",
      "script": "test",
      "isBackground": true,
      "problemMatcher": {
        "owner": "typescript",
        "pattern": "$tsc",
        "background": {
          "activeOnStart": true,
          "beginsPattern": {
            "regexp": "Starting tests"
          },
          "endsPattern": {
            "regexp": "Tests completed"
          }
        }
      }
    }
  ]
}
`;

// Passport.js Authentication Setup with JWT

const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

// User model (assuming it's already defined)
const User = mongoose.model('User');

// Passport local strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'useremail',
    passwordField: 'userpassword'
  },
  (useremail, userpassword, done) => {
    User.findOne({ email: useremail }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      if (!user.verifyPassword(userpassword)) {
        return done(null, false, { message: 'Password does not match' });
      }
      return done(null, user);
    });
  }
));

// JWT verification middleware
module.exports.verifyToken = (req, res, next) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return res.status(404).json({ message: "Token not found" });
  }

  jwt.verify(token, "ABC123", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: err });
    }

    req._id = decoded.id;
    next();
  });
};
