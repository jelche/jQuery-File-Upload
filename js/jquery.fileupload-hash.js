/*
 * jQuery File Upload Hash Plugin
 **
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define([
      'jquery',
      './jquery.fileupload-process'
    ], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS:
    factory(require('jquery'));
  } else {
    // Browser globals:
    factory(
      window.jQuery
    );
  }
}(function ($) {
  'use strict';
  // Append to the default processQueue:
  $.blueimp.fileupload.prototype.options.processQueue.unshift({
      action: 'generateHash'
  });

  $.widget('blueimp.fileupload', $.blueimp.fileupload, {

    processActions:{
      generateHash: function (data){
        var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
          file = data.files[data.index],
          that = this,
          chunkSize = 2097152,                             // Read in chunks of 2MB
          chunks = Math.ceil(file.size / chunkSize),
          currentChunk = 0,
          spark = new SparkMD5.ArrayBuffer(),
          fileReader = new FileReader(),
          dfd = $.Deferred();

        fileReader.onload = function (e) {
          // console.log('read chunk nr', currentChunk + 1, 'of', chunks);
          spark.append(e.target.result);                   // Append array buffer
          currentChunk++;

          if (currentChunk < chunks) {
            loadNext();
          } else {
            var hash = spark.end();
            // console.log('finished loading');
            // console.info('computed hash', hash);  // Compute hash
            file.hash = hash;
            dfd.resolveWith(that,[data]);
          }

        };

        fileReader.onerror = function () {
          console.warn('oops, something went wrong with the hash generation.');
        };

        function loadNext() {
          var start = currentChunk * chunkSize,
            end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

          fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }

        loadNext();
        return dfd.promise();
      }

    }

  });

}));
