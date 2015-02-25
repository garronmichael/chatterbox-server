var fs = require('fs');
var forbidden = [
  '../'
];

var webHandler = function(request,response){
  //TODO: implement guard against attackers, e.g. ".." in URL

  console.log('original url: ' + request.url);
  var url = request.url;
  var searchIndex = request.url.indexOf('?');
  if (searchIndex !== -1) {
    url = request.url.slice(0,searchIndex);
  }
  if (url === '/') url = './www/index.html';
  else url = './www' + url;

  console.log('Serving request for: ' + url);
  fs.readFile(url,function(err,data){
    var statusCode;
    var headers = {};
    //catch if a file isn't found
    if (err){
      if (err.code === 'ENOENT'){
        statusCode = 404;
        data = "Error 404: File not found."
        headers['Content-Type'] = "text/plain";
        response.writeHead(statusCode,headers);
        response.end(data);
      } else throw err;
    }
    //else serve the page
    else{
      statusCode = 200;
      // headers['Content-Type'] = 'text/html';
      response.writeHeader(statusCode,headers);
      response.write(data);
      response.end();
    }
  });
};

// var servePage = function(err,data,request,response){
//   var statusCode, headers;
//   response.writeHead(statusCode,headers);
//   if (err){
//     if (err.code === 'ENOENT'){
//       statusCode = 404;
//       data = "File not found."
//       headers['Content-Type'] = "text/plain";
//       response.writeHead(statusCode,headers);
//       resposne.end();
//     } else throw err;
//   }
// };

exports.webHandler = webHandler;
