/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    app.receivedEvent('deviceready');
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
    app.attachListeners();
  },
  // See the following URLs which explain HTML5 filesystem API and cordova PDF
  // http://www.html5rocks.com/en/tutorials/file/filesystem/
  // https://coderwall.com/p/nc8hia
  attachListeners: function() {
    $(document).ready(function() {
      $('#createPDFButton').on('click', function() {
        app.fileOps.filenames.push("myCordovaJSPDFExample.pdf"); // filename for handlers to use.
        app.fileOps.initFS(app.fileOps.createPDF, app.fileOps.errorHandler);
      });
      $('#openPDFButton').on('click', function() {
        app.fileOps.filenames.push("myCordovaJSPDFExample.pdf"); // filename for handlers to use.
        app.fileOps.initFS(app.fileOps.openPDF, app.fileOps.errorHandler);
      });
    });
  },
  fileOps: {
    filenames: [], // use push() and shift() 
    initFS: function(successCallback, errorCallback) {
      console.log('requesting filesystem');
      if (app.fileOps.filenames && app.fileOps.filenames.length > 0) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, successCallback, errorCallback);
      } else {
        console.error('No filenames provided. Use app.fileOps.filenames.push("myFile.pdf").');
      }
    },
    createPDF: function(fileSystem) {
      console.log('createPDF');
      fileSystem.root.getFile(app.fileOps.filenames.shift(), {create: true, exclusive: false}, app.fileOps.gotFileForWriting, app.fileOps.errorHandler);
    },
    gotFileForWriting: function(fileEntry) {
      console.log('gotFileForWriting');
      fileEntry.createWriter(app.fileOps.gotFileWriter, app.fileOps.errorHandler);
    },
    gotFileWriter: function(writer) {
      console.log('gotFileWriter');
      var doc = new jsPDF();
      doc.setFontSize(14);

      doc.text(20, 20, 'Hello world! ' + new Date().toLocaleString());
      var data = doc.output();
      var buffer = new ArrayBuffer(data.length);
      var array = new Uint8Array(buffer);
      for (var i = 0; i < data.length; i++) {
        array[i] = data.charCodeAt(i);
      }
      writer.write(buffer);

    },
    gotPDFForReading: function(fileEntry) {
      console.log('gotPDFForReading');
      console.log('fileEntry is: ');
      console.log(fileEntry);
      // get the URL of the file
      var windowOptions;
      var windowTarget = "_blank";
      var PDF_or_pdfFilePath = fileEntry.toURL();

      // we're in a cordova app. Options for inAppBrowser
      if ("android" === cordova.platformId) {
        // use fileOpener plugin.
        window.plugins.fileOpener.open(PDF_or_pdfFilePath);
      } else { // ios
        windowOptions = "EnableViewPortScale=yes,location=no,disallowoverscroll=yes,allowInlineMediaPlayback=yes,toolbarposition=top,transitionstyle=fliphorizontal";

        var ref = window.open(PDF_or_pdfFilePath, windowTarget, windowOptions);
        return ref;
      }
    },
    errorHandler: function(e) {
      console.log('errorHandler');
      var msg = '';

      switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
          msg = 'QUOTA_EXCEEDED_ERR';
          break;
        case FileError.NOT_FOUND_ERR:
          msg = 'NOT_FOUND_ERR';
          break;
        case FileError.SECURITY_ERR:
          msg = 'SECURITY_ERR';
          break;
        case FileError.INVALID_MODIFICATION_ERR:
          msg = 'INVALID_MODIFICATION_ERR';
          break;
        case FileError.INVALID_STATE_ERR:
          msg = 'INVALID_STATE_ERR';
          break;
        default:
          msg = 'Unknown Error';
          break;
      }
      ;

      console.error('Error: ' + msg);
      console.error(e);
    },
    openPDF: function(fileSystem) {
      console.log('openPDF');
      fileSystem.root.getFile(app.fileOps.filenames.shift(), {create: false, exclusive: false}, app.fileOps.gotPDFForReading, app.fileOps.errorHandler);

    }
  }
};

