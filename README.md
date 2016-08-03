Gulp Flow
====================================

This repository contains the source files of the Gulp Flow.


## Prerequisites

The following packages and libraries are used in the project. 
Before developing, make sure you have the following tools installed and available globally:

* [Node.js](http://nodejs.org)
* [NPM](http://npmjs.com) package manager
* [Gulp](http://gulpjs.com) task runner
* [Bower](http://bower.io) package manager
* Various Gulp plugins


## Instalation

Before initiating the first build, run `npm install` to make sure all the dependencies are installed properly.

The following Gulp tasks are available:

| Command             | Description                                                 |
|---------------------|-------------------------------------------------------------|
| `gulp`              | Runs all tasks to produce development build                 |
| `gulp prod`         | Runs all build and copying tasks to produce final output    |


## Directory Structure

* `app` – top-level directory of the source 
* `app/content` – HTML fragments of the page sections 
* `app/files` – custom files 
* `app/fonts` – custom fonts 
* `app/iconfonts` – custom iconfont 
* `app/img` – custom images 
* `app/js` – custom JavaScript files 
* `app/scss` – SCSS style files 
* `dist` – output of the build, static HTML and assets ready to be served 