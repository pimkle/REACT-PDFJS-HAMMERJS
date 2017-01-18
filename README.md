# REACT-PDFJS-HAMMERJS
A PDF VIEWER USING PDFJS &amp; HAMMERJS. SUPPORTING PINCHIN AND PINCHOUT
This project is not a plugin, it's a demo, a pdf viewer supporting gestures, zoom in and zoom out.
It's a reactjs project, using gulp and webpack.
#INSTALL
(sudo) npm install  
gulp  
Sometimes gulp doesn't work very well, restart it would be fine.Sometimes start more than one gulp would cause some problems, shut down others would be fine.
#COR
react-pdfjs is not supporting cor files, there are 2 solutions:
1. using pdfs on same origins only.
2. open cor on the pdf server. (suppliers like aliyun provide such services)

## ATTENTION
PDF WITH SIGNATURE
react-pdfjs has been modified to enable signatures. issue link: https://github.com/mozilla/pdf.js/issues/4743
react-pdfjs: https://www.npmjs.com/package/react-pdf-js
react-hammerjs: https://github.com/JedWatson/react-hammerjs
flexible
this project is using flexible to fit all screen types.
# TODO
scroll gesture is not smooth, looking forward to better solutions.


