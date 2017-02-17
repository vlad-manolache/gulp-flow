/*******************************************************************************
* $Id: npm-setup.js 12907 2016-02-20 20:22:46Z sthames $
* ==============================================================================
* Parameters: 'links' - Create links in local environment, optional.
*
* <p>NodeJS script to install common development environment packages in global
* environment. <c>packages</c> object contains list of packages to install.</p>
*
* <p>Including 'links' creates links in local environment to global packages.</p>
*
* <p><b>npm ls -g --json</b> command is run to provide the current list of
* global packages for comparison to required packages. Packages are installed
* only if not installed. If the package is installed but is not the required
* package version, the existing package is removed and the required package is
* installed.</p>.
*
* <p>When provided as a "preinstall" script in a "package.json" file, the "npm
* install" command calls this to verify global dependencies are installed.</p>
*******************************************************************************/
var exec = require('child_process').exec;
var fs   = require('fs');
var path = require('path');

/*---------------------------------------------------------------*/
/* List of packages to install and 'from' value to pass to 'npm  */
/* install'. Value must match the 'from' field in 'npm ls -json' */
/* so this script will recognize a package is already installed. */
/*---------------------------------------------------------------*/
var packages = {
    "bower"                      :                      "bower@latest",
    "autoprefixer"               :               "autoprefixer@latest",
    "del"                        :                        "del@latest",
    "gulp"                       :                       "gulp@latest",
    "gulp-clean"                 :                 "gulp-clean@latest",
    "gulp-combine-mq"            :            "gulp-combine-mq@latest",
    "gulp-concat"                :                "gulp-concat@latest",
    "gulp-connect"               :               "gulp-connect@latest",
    "gulp-debug"                 :                 "gulp-debug@latest",
    "gulp-exec"                  :                  "gulp-exec@latest",
    "gulp-file-include"          :          "gulp-file-include@latest",
    "gulp-filter"                :                "gulp-filter@latest",
    "gulp-group-concat"          :          "gulp-group-concat@latest",
    "gulp-iconfont"              :              "gulp-iconfont@latest",
    "gulp-iconfont-css"          :          "gulp-iconfont-css@latest",
    "gulp-if"                    :                    "gulp-if@latest",
    "gulp-imagemin"              :              "gulp-imagemin@latest",
    "gulp-load-plugins"          :          "gulp-load-plugins@latest",
    "gulp-newer"                 :                 "gulp-newer@latest",
    "gulp-notify"                :                "gulp-notify@latest",
    "gulp-plumber"               :               "gulp-plumber@latest",
    "gulp-postcss"               :               "gulp-postcss@latest",
    "gulp-rename"                :                "gulp-rename@latest",
    "gulp-sass"                  :                  "gulp-sass@latest",
    "gulp-sequence"              :              "gulp-sequence@latest",
    "gulp-sourcemaps"            :            "gulp-sourcemaps@latest",
    "gulp-uglify"                :                "gulp-uglify@latest",
    "gulp-uglifycss"             :             "gulp-uglifycss@latest",
    "gulp-useref"                :                "gulp-useref@latest",
    "gulp-util"                  :                  "gulp-util@latest",
    "gulp-watch-sequence"        :        "gulp-watch-sequence@latest",
    "imagemin-mozjpeg"           :           "imagemin-mozjpeg@latest",
    "imagemin-pngquant"          :          "imagemin-pngquant@latest",
    "main-bower-files"           :           "main-bower-files@latest",
    "markdown"                   :                   "markdown@latest",
    "npm-check-updates"          :          "npm-check-updates@latest",
    "postcss-quantity-queries"   :   "postcss-quantity-queries@latest",

//  "lazypipe"                   :                   "lazypipe@1.0.1",
//  "merge2"                     :                     "merge2@1.0.1",
//  "q"                          :                          "q@1.4.1",
//  "through2"                   :                   "through2@2.0.0",

  /*---------------------------------------------------------------*/
  /* fork of 0.2.14 allows passing parameters to main-bower-files. */
  /*---------------------------------------------------------------*/
  "bower-main"                 : "git+https://github.com/Pyo25/bower-main.git"
  }

/*******************************************************************************
* run */
/**
* Executes <c>cmd</c> in the shell and calls <c>cb</c> on success. Error aborts.
*
* Note: Error code -4082 is EBUSY error which is sometimes thrown by npm for
* reasons unknown. Possibly this is due to antivirus program scanning the file
* but it sometimes happens in cases where an antivirus program does not explain
* it. The error generally will not happen a second time so this method will call
* itself to try the command again if the EBUSY error occurs.
*
* @param  cmd  Command to execute.
* @param  cb   Method to call on success. Text returned from stdout is input.
*******************************************************************************/
var run = function(cmd, cb)
  {
  /*---------------------------------------------*/
  /* Increase the maxBuffer to 10MB for commands */
  /* with a lot of output. This is not necessary */
  /* with spawn but it has other issues.         */
  /*---------------------------------------------*/
  exec(cmd, { maxBuffer: 10000*1024 }, function(err, stdout)
    {
    if      (!err)                   cb(stdout);
    else if ((err.code|0) == -4082) run(cmd, cb);
    else throw err;
    });
  };

/*******************************************************************************
* runCommand */
/**
* Logs the command and calls <c>run</c>.
*******************************************************************************/
var runCommand = function(cmd, cb)
  {
  console.log(cmd);
  run(cmd, cb);
  }

/*******************************************************************************
* Main line
*******************************************************************************/
var doLinks  = (process.argv[2] || "").toLowerCase() == 'links';
var names    = Object.keys(packages);
var name;
var installed;
var links;

/*------------------------------------------*/
/* Get the list of installed packages for   */
/* version comparison and install packages. */
/*------------------------------------------*/
console.log('Configuring global Node environment...')
run('npm ls -g --json', function(stdout)
  {
  installed = JSON.parse(stdout).dependencies || {};
  doWhile();
  });

/*--------------------------------------------*/
/* Start of asynchronous package installation */
/* loop. Do until all packages installed.     */
/*--------------------------------------------*/
var doWhile = function()
  {
  if (name = names.shift())
    doWhile0();
  }

var doWhile0 = function()
  {
  /*----------------------------------------------*/
  /* Installed package specification comes from   */
  /* 'from' field of installed packages. Required */
  /* specification comes from the packages list.  */
  /*----------------------------------------------*/
  var current  = (installed[name] || {}).from;
  var required =   packages[name];

  /*---------------------------------------*/
  /* Install the package if not installed. */
  /*---------------------------------------*/
  if (!current)
    runCommand('npm install -g '+required, doWhile1);

  /*------------------------------------*/
  /* If the installed version does not  */
  /* match, uninstall and then install. */
  /*------------------------------------*/
  else if (current != required)
    {
    delete installed[name];
    runCommand('npm remove '+name, function()
      {
      runCommand('npm remove -g '+name, doWhile0);
      });
    }

  /*------------------------------------*/
  /* Skip package if already installed. */
  /*------------------------------------*/
  else
    doWhile1();
  };

var doWhile1 = function()
  {
  /*-------------------------------------------------------*/
  /* Create link to global package from local environment. */
  /*-------------------------------------------------------*/
  if (doLinks && !fs.existsSync(path.join('node_modules', name)))
    runCommand('npm link '+name, doWhile);
  else
    doWhile();
  };
