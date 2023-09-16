const fs = require("fs");
const path = require("path");
const PdfPrinter = require("pdfmake");
const PDFDocument = require('pdfkit');
const User = require("../../models/User");
const Scan = require("../../models/Scan");
const { success, error, validation } = require("../../helpers/responseApi");
const { validationResult } = require("express-validator");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
//const cloud = require('./cloudinary')
const cloud = require (path.join(__dirname, './Cloudinary.js'));



var fonts = {
  Roboto: {
    normal: path.join(__dirname, '..', '..', '/fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '..', '..', '/fonts/Roboto-Medium.ttf'),
    italics: path.join(__dirname, '..', '..', '/fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '..', '..', '/fonts/Roboto-MediumItalic.ttf')
  }
};

var printer = new PdfPrinter(fonts);
// reading parameters from the command line
var params = process.argv;
var data = [];



let isFirstVisit = 1
let value2 = 0



var options = {};

exports.genReport = async (req, res) => {
    try {

    const { height, weight, bmi, 
        fhr, ga, placentaLocation, 
        mvp, summary, scannedByDoctor, isFirstVisit, isCopyReceived } = req.body;


    var docDefinition = {
        background: function (currentPage, pageSize) {
              return {
                  table: {
                  widths: [pageSize.width - 30],
                  heights: [pageSize.height - 30],
                  body: [['']]
              },
              margin: 10
          };
      },
      header: function(currentPage, pageCount) { 
               return {
              style: 'tableExampleHeader',
              table: {
                  body: [
                          ['Study Number ICBE-s-00779', 'Subject Number: XXXX']
                      
                  ],
              }
          }
      },
      footer: function(currentPage, pageCount) { 
               return {
              style: 'tableExampleFooter',
              table: {
                  body: [
                      //['Visit Date'],
                          ['DecID ICBE-5-000779', 'Version: 5', 'Date: 2023-Aug-27', 'Status: Approved', 'Page 1 of 3', 'Confidential']
                      
                  ],
              }
          }
      },
      content: [
              {
              stack: [
                  'CASE REPORT FORM - India Site',
                  [   {   
                          
                          text: 'Subject Number: XXXXX',
                          style: 'subheader',
                          
                      },
                      {
                          text: 'Site Number 01\nPrincipal Investigator: Dr. Suresh.\nMedican systems\nNo. 197, Dr. Natesan Road, Mylapore\nChennai 600000, India',
                          style: 'subheader'
                      }
                  ],
                      
              ],
              style: 'header'
          },
          {
              style: 'tableExample',
              table: {
                  body: [
                          [{
                              border: [true, true, true, true],
                              fillColor: '#eeeeee',
                              text: 'Visit Date'
                          }]
                      
                  ],
                  widths: [530],
              }
          },
          {   
                          
                          text: 'Date of inclusion visit (date informed consent is signed dd/MM/yyyy):',
                          style: 'subheader',
                          
          },
          {
              columns: [
                  {
                      width: 'auto',
                      margin: [0, 10, 0, 10],
                          table: {
                              body: [
                                      [{
                                          border: [true, true, true, true],
                                          text: '13/08/2022'
                                      }]
                      
                              ],
                          }
                  }
              ]
          },
          {   
                          
                      text: 'Did the subject receive a copy of the signed consent?',
                      style: 'subheader',
                          
          },
          {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (isCopyReceived ===1?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'Yes' 
                              }
                          ]
                      ]
                  },
          },
          {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (isCopyReceived===1?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'No' 
                              }
                          ]
                      ]
                  },
          },
          {   
                          
                  text: 'Project scan visit number',
                  style: 'subheader',
                          
          },
          {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (isFirstVisit===1?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'First' 
                              }
                          ]
                      ]
                  },
          },
          {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (isFirstVisit===0?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'Second' 
                              }
                          ]
                      ]
                  },
          },
          {
              text: 'Patient Details', fontSize: 16, bold: true, pageBreak: 'before', margin: [0, 20, 0, 8]
              
          },
          {
              style: 'tableExample',
              table: {
                  body: [
                      ['Height', 'Weight', 'BMI'],
                      [height, weight, bmi]
                  ]
              }
          },
          {
              text: 'Ultrasound parameters', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              style: 'tableExample',
              table: {
                  body: [
                      ['FHR', 'GA', 'Placenta Location', 'MVP'],
                      [fhr, ga, placentaLocation, mvp]
                  ]
              }
          },
          {
              text: 'Image:', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          /*{
              image: path.join(__dirname, '..', '..', '/lib/assets/img.png'),
              margin: [0, 20, 0, 8],
              width: 100,
			  height: 100
          },*/
          {
              text: 'Summary', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              text: summary, 
              fontSize: 12, bold: false, margin: [0, 20, 0, 8]
              
          },
          {
              text: 'Signed By', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              text: scannedByDoctor,
              fontSize: 12, bold: false, margin: [0, 10, 0, 8]
              
          },
          
    
      ],
      images: {
        checked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF+2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTItMzBUMDE6Mzc6MjArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMSIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkRvdCBHYWluIDIwJSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowNzVjYjZmMy1jNGIxLTRiZjctYWMyOS03YzUxMWY5MWJjYzQiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5ZTM1YTc3ZC0zNDM0LTI5NGQtYmEwOC1iY2I5MjYyMjBiOGIiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowYzc2MDY3Ny0xNDcwLTRlZDUtOGU4ZS1kNTdjODJlZDk1Y2UiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjBjNzYwNjc3LTE0NzAtNGVkNS04ZThlLWQ1N2M4MmVkOTVjZSIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozNzoyMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjA3NWNiNmYzLWM0YjEtNGJmNy1hYzI5LTdjNTExZjkxYmNjNCIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozODoyOCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+jHsR7AAAAUNJREFUOMvN1T9Lw0AYx/EviLVFxFH8M3USgyAFoUsQ0UV8F6Ui4qCTbuJg34HgptBdUATrUoxiqYMgiOBoIcW9BVED+jgkntGm9i6CmN+Sg/vAcc89dwBd5Clzj6uZGg7LJAC62UFipEgKcmroaeZj/gpcIAhl5rE1M0cJQbiCOsIrs5h8WZ4R6j72yBrhcRo+dhE8bCOcoYng/hFOMxAXb/DAHTNxcCGo7JE5LqhjsW2KP6nDcGecCv1vRdC2eJQDLllooach2hbvIghvLJJgM0QHdeq8F0x/5ETRM4b0DonF7be+Pf+y4A4bZnETok4E/XG3xxR3WhasUWeLCg2OGYnXGP1MkPwnLRmJf3UN+RfgtBGe5MnHVQShxBQZzdgcIgjXsKSu/KZmXgKxBkmKsZ6bffoAelilQs3goauyTi+8A8mhgeQlxdNWAAAAAElFTkSuQmCC',
        unchecked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF+2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTItMzBUMDE6Mzc6MjArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjU3KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjU3KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMSIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkRvdCBHYWluIDIwJSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpjMGUyMmJhZC1lY2VkLTQzZWUtYjIzZC1jNDZjOTNiM2UzNWMiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5M2FhOTEzYy1hZDVmLWZmNGEtOWE5Ny1kMmUwZjdmYzFlYmUiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozYmY2ODFlMy1hMTRhLTQyODMtOGIxNi0zNjQ4M2E2YmZlNjYiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjNiZjY4MWUzLWExNGEtNDI4My04YjE2LTM2NDgzYTZiZmU2NiIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozNzoyMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmMwZTIyYmFkLWVjZWQtNDNlZS1iMjNkLWM0NmM5M2IzZTM1YyIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozODo1NyswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+6AB6cQAAAPxJREFUOMvF1b1Kw1AYBuAnFf8QL8WlIHQJIriIdyEu4qCTXop7dwenTgUHpYvgJVhob8AuakE+h9hapJqcFDXvFDgPIXlzvgNLjnQ9GlRM340TK7DsUtRI2zqH09txxUzWn3IrhK4DecXs6wjhnqHwZk/K1fIiDAs81krCW54KPBDG8iTcNBIGf4ND1MWTdmrgqIOL5TM0S8SRhmMu1dAo+2DZ57t9eWajtKrvN1GVnrMK9HewhbBy+nPPJbTsJwmymOn8P7fkfLzQGCoG4G4S3vZc4J4QOnY0KyZ3LYQHjqcjf1Qxrx/inDXtWsfNlU1YdeZOP+Gg67mwwTvIDqR1iAowgQAAAABJRU5ErkJggg=='
    }, 
    styles: {
        header: {
            fontSize: 24,
            bold: true,
            alignment: 'center',
            margin: [0, 60, 0, 10]
        },
        subheader: {
            fontSize: 14,
            margin: [0, 50, 0, 0],
        },
        superMargin: {
            margin: [20, 0, 40, 0],
            fontSize: 15
        },
        tableExample: {
            //alignment: 'center',
            margin: [0, 10, 0, 10],
            bold: false
        },
        tableExampleHeader: {
            margin: [30, 15, 0,0]
        },
        tableExampleFooter: {
            margin: [30, -5, 0, 15]
        }
    }
    
  }

    /*var docDefinition = {
        content: [
            'First paragraph',
            'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines'
        ]
        
    }*/

    const filename = 'debo_report';
    var pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    var pdfPath = path.join(__dirname, '..', '..','..','output/my_report.pdf');

    pdfDoc.pipe(fs.createWriteStream(pdfPath));
        
        
        cloud.uploads(pdfPath).then((result) => {
          const pdfFile = {
          pdfName: filename,
          pdfUrl: result.url,
          pdfId: result.id
           }
           console.log('pdf results--', pdfFile.pdfUrl)
           res.status(201).json(
            success(
              "File successfully uploaded!! Please download the file from following url.",
              {
                file: {
                    pdfName: 'my_report',
                    pdfUrl: result.url,
                    pdfId: result.id
                }
              },
              res.statusCode
            )
        );
        })
        pdfDoc.end();
    }
        catch (err) {
            console.log(err)
            res.status(400).json({ message: 'An error occured in process' });
        }
    }

    exports.deleteReport = async (req, res) => {
        try {
    
        const { publicId } = req.body;
         cloud.deleteFile(publicId).then((response) => {
           console.log('response: ', response); 
           const innerResult = response.result.result;
           if (innerResult === 'ok') {
            res.status(201).json(
                success( "File successfully deleted!",{},
                res.statusCode
              )
            );
           }
            else
                res.status(400).json({ message: 'File Not Found' });

        }) 
        } catch (err) {
            console.log(err)
            res.status(400).json({ message: 'An error occured in process' });
        }
    }
/*exports.genReport = async (scan) => {
var pdfUrl = "";   
    

  try {
    
    console.log("height: " + scan.height)

    //data["doctor"] = user.name  
    isFirstVisit = scan.isFirstVisit ? 1 : 0;
    data["height"] = scan.height
    height = scan.height
    data["weight"] = scan.weight
    data["bmi"] = scan.bmi
    data["fhr"] = scan.fhr;  
    data["ga"] = scan.ga; 
    data["placenta"] = scan.placentaLocation;  
    data["mvp"] = scan.mvp;
    data["summary"] = scan.summary;  


    var docDefinition = {
        background: function (currentPage, pageSize) {
              return {
                  table: {
                  widths: [pageSize.width - 30],
                  heights: [pageSize.height - 30],
                  body: [['']]
              },
              margin: 10
          };
      },
      header: function(currentPage, pageCount) { 
               return {
              style: 'tableExampleHeader',
              table: {
                  body: [
                          ['Study Number ICBE-s-00779', 'Subject Number: XXXX']
                      
                  ],
              }
          }
      },
      footer: function(currentPage, pageCount) { 
               return {
              style: 'tableExampleFooter',
              table: {
                  body: [
                      //['Visit Date'],
                          ['DecID ICBE-5-000779', 'Version: 5', 'Date: 2023-Aug-27', 'Status: Approved', 'Page 1 of 3', 'Confidential']
                      
                  ],
              }
          }
      },
      content: [
              {
              stack: [
                  'CASE REPORT FORM - India Site',
                  [   {   
                          
                          text: 'Subject Number: XXXXX',
                          style: 'subheader',
                          
                      },
                      {
                          text: 'Site Number 01\nPrincipal Investigator: Dr. Suresh.\nMedican systems\nNo. 197, Dr. Natesan Road, Mylapore\nChennai 600000, India',
                          style: 'subheader'
                      }
                  ],
                      
              ],
              style: 'header'
          },
          {
              style: 'tableExample',
              table: {
                  body: [
                          [{
                              border: [true, true, true, true],
                              fillColor: '#eeeeee',
                              text: 'Visit Date'
                          }]
                      
                  ],
                  widths: [530],
              }
          },
          {   
                          
                          text: 'Date of inclusion visit (date informed consent is signed dd/MM/yyyy):',
                          style: 'subheader',
                          
          },
          {
              columns: [
                  {
                      width: 'auto',
                      margin: [0, 10, 0, 10],
                          table: {
                              body: [
                                      [{
                                          border: [true, true, true, true],
                                          text: '13/08/2022'
                                      }]
                      
                              ],
                          }
                  }
              ]
          },
          {   
                          
                      text: 'Did the subject receive a copy of the signed consent?',
                      style: 'subheader',
                          
          },
          {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (value2===1?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'Yes' 
                              }
                          ]
                      ]
                  },
          },
          {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (value2===1?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'No' 
                              }
                          ]
                      ]
                  },
          },
          {   
                          
                  text: 'Project scan visit number',
                  style: 'subheader',
                          
          },
              {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (isFirstVisit===1?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'First' 
                              }
                          ]
                      ]
                  },
          },
          {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (isFirstVisit===0?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'Second' 
                              }
                          ]
                      ]
                  },
          },
          {
              text: 'Patient Details', fontSize: 16, bold: true, pageBreak: 'before', margin: [0, 20, 0, 8]
              
          },
          {
              style: 'tableExample',
              table: {
                  body: [
                      ['Height', 'Weight', 'BMI'],
                      [data.height, data.weight, data.bmi]
                  ]
              }
          },
          {
              text: 'Ultrasound parameters', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              style: 'tableExample',
              table: {
                  body: [
                      ['FHR', 'GA', 'Placenta Location', 'MVP'],
                      [data.fhr, data.ga, data.placenta, data.bmi]
                  ]
              }
          },
          {
              text: 'Image:', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              image: path.join(__dirname, '..', '..', '/lib/assets/img.png'),
              margin: [0, 20, 0, 8],
              width: 200,
              height: 200
          },
          {
              text: 'Summary', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              text: scan.summary, 
              fontSize: 12, bold: false, margin: [0, 20, 0, 8]
              
          },
          {
              text: 'Signed By', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              text: scan.scannedBy,
              fontSize: 12, bold: false, margin: [0, 10, 0, 8]
              
          },
          
    
      ],
      images: {
        checked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF+2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTItMzBUMDE6Mzc6MjArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMSIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkRvdCBHYWluIDIwJSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowNzVjYjZmMy1jNGIxLTRiZjctYWMyOS03YzUxMWY5MWJjYzQiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5ZTM1YTc3ZC0zNDM0LTI5NGQtYmEwOC1iY2I5MjYyMjBiOGIiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowYzc2MDY3Ny0xNDcwLTRlZDUtOGU4ZS1kNTdjODJlZDk1Y2UiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjBjNzYwNjc3LTE0NzAtNGVkNS04ZThlLWQ1N2M4MmVkOTVjZSIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozNzoyMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjA3NWNiNmYzLWM0YjEtNGJmNy1hYzI5LTdjNTExZjkxYmNjNCIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozODoyOCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+jHsR7AAAAUNJREFUOMvN1T9Lw0AYx/EviLVFxFH8M3USgyAFoUsQ0UV8F6Ui4qCTbuJg34HgptBdUATrUoxiqYMgiOBoIcW9BVED+jgkntGm9i6CmN+Sg/vAcc89dwBd5Clzj6uZGg7LJAC62UFipEgKcmroaeZj/gpcIAhl5rE1M0cJQbiCOsIrs5h8WZ4R6j72yBrhcRo+dhE8bCOcoYng/hFOMxAXb/DAHTNxcCGo7JE5LqhjsW2KP6nDcGecCv1vRdC2eJQDLllooach2hbvIghvLJJgM0QHdeq8F0x/5ETRM4b0DonF7be+Pf+y4A4bZnETok4E/XG3xxR3WhasUWeLCg2OGYnXGP1MkPwnLRmJf3UN+RfgtBGe5MnHVQShxBQZzdgcIgjXsKSu/KZmXgKxBkmKsZ6bffoAelilQs3goauyTi+8A8mhgeQlxdNWAAAAAElFTkSuQmCC',
        unchecked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF+2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTItMzBUMDE6Mzc6MjArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjU3KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjU3KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMSIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkRvdCBHYWluIDIwJSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpjMGUyMmJhZC1lY2VkLTQzZWUtYjIzZC1jNDZjOTNiM2UzNWMiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5M2FhOTEzYy1hZDVmLWZmNGEtOWE5Ny1kMmUwZjdmYzFlYmUiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozYmY2ODFlMy1hMTRhLTQyODMtOGIxNi0zNjQ4M2E2YmZlNjYiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjNiZjY4MWUzLWExNGEtNDI4My04YjE2LTM2NDgzYTZiZmU2NiIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozNzoyMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmMwZTIyYmFkLWVjZWQtNDNlZS1iMjNkLWM0NmM5M2IzZTM1YyIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozODo1NyswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+6AB6cQAAAPxJREFUOMvF1b1Kw1AYBuAnFf8QL8WlIHQJIriIdyEu4qCTXop7dwenTgUHpYvgJVhob8AuakE+h9hapJqcFDXvFDgPIXlzvgNLjnQ9GlRM340TK7DsUtRI2zqH09txxUzWn3IrhK4DecXs6wjhnqHwZk/K1fIiDAs81krCW54KPBDG8iTcNBIGf4ND1MWTdmrgqIOL5TM0S8SRhmMu1dAo+2DZ57t9eWajtKrvN1GVnrMK9HewhbBy+nPPJbTsJwmymOn8P7fkfLzQGCoG4G4S3vZc4J4QOnY0KyZ3LYQHjqcjf1Qxrx/inDXtWsfNlU1YdeZOP+Gg67mwwTvIDqR1iAowgQAAAABJRU5ErkJggg==',
    }, 
    styles: {
        header: {
            fontSize: 24,
            bold: true,
            alignment: 'center',
            margin: [0, 60, 0, 10]
        },
        subheader: {
            fontSize: 14,
            margin: [0, 50, 0, 0],
        },
        superMargin: {
            margin: [20, 0, 40, 0],
            fontSize: 15
        },
        tableExample: {
            alignment: 'center',
            margin: [0, 10, 0, 10],
            bold: false
        },
        tableExampleHeader: {
            margin: [30, 15, 0,0]
        },
        tableExampleFooter: {
            margin: [30, -5, 0, 15]
        }
    }
    
  }


    var pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    var pdfPath = path.join(__dirname, '..', '..','..','output/my_report.pdf');

    pdfDoc.pipe(fs.createWriteStream(pdfPath));
    
    const result = await cloud.uploads(pdfPath);

    const pdfFile = {
        pdfName: 'my_report',
        pdfUrl: result.url,
        pdfId: result.id
    }

    console.log('pdf results--', pdfFile.pdfUrl)
    
    pdfDoc.end();

    return pdfFile.pdfUrl; 


  
} catch (err) {
  console.error(err.message);
}

return "";
};*/

/*exports.genReport = async (req, res) => {
    try {
        const filename = 'my_report';
        const pdfPath = path.join('data', 'pdf', filename + '.pdf')
        const pdfDoc = new PDFDocument()
        
        //res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '" ')
        //res.setHeader('Access-Control-Allow-Origin', '*');
        //res.setHeader('Content-Type', 'application/pdf')
        //res.status(201)
        pdfDoc.pipe(fs.createWriteStream(pdfPath));
        //await pdfDoc.pipe(res);
       // const content = await req.body.content
        const content = 'Hello this is the content';
        pdfDoc.text(content)
        
       
        const result = await cloud.uploads(pdfPath);
        const pdfFile = {
            pdfName: filename,
            pdfUrl: result.url,
            pdfId: result.id
        };
        console.log('pdf results--', pdfFile.pdfUrl)

        pdfDoc.end();
        return pdfFile.pdfUrl;
    }
        catch (err) {
            console.log('error: ', err);
            //res.status(400).json({ message: 'An error occured in process' });
        }
    }*/


    /*exports.genReport = async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty())
              return res.status(422).json(validation(errors.array()));

            const { summary } = req.body;
    
            //const filename = req.body.filename;
            //const pdfPath = path.join(_dirname, '..','data', 'pdf', "report" + '.pdf')
            const pdfPath = path.join(__dirname, '..', '..', '..', '/data/pdf/my_report.pdf')
            const pdfDoc = new PDFDocument()
            console.log('pdf ---', pdfPath)
            
            //res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '" ')
            //res.setHeader('Access-Control-Allow-Origin', '*');
            //res.setHeader('Content-Type', 'application/pdf')
            //res.status(201)
            pdfDoc.pipe(fs.createWriteStream(pdfPath));
            //await pdfDoc.pipe(res);
            //const content = await req.body.content
            pdfDoc.text(summary)
            console.log('pdf results-- summary : ', summary)
            cloud.uploads(pdfPath).then((result) => {
                const pdfFile = {
                pdfName: 'my_report',
                pdfUrl: result.url,
                pdfId: result.id
                 }
                 console.log('pdf results--', pdfFile.pdfUrl)
              })
            //const result = await cloud.uploads(pdfPath);
           
            console.log('pdf results-- 2 ', result.url)
            res.status(201).json(
                success(
                  "File successfully uploaded!! Please download the file from following url.",
                  {
                    file: {
                        pdfName: 'my_report',
                        pdfUrl: result.url,
                        pdfId: result.id
                    }
                  },
                  res.statusCode
                )
            );
            pdfDoc.end();
            
        }
            catch (err) {
                res.status(400).json({ message: 'An error occured in process' });
            }
    }*/

/*exports.genReport = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json(validation(errors.array()));

  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log("user id: " + user._id)
    const scan = await Scan.findOne({
        userId: user._id
    });

    // Check the user just in case
    if (!user)
      return res.status(404).json(error("User not found", res.statusCode));

    console.log("height: " + scan.height)

    data["doctor"] = user.name  
    isFirstVisit = scan.isFirstVisit ? 1 : 0;
    data["height"] = scan.height
    height = scan.height
    data["weight"] = scan.weight
    data["bmi"] = scan.bmi
    data["fhr"] = scan.fhr;  
    data["ga"] = scan.ga; 
    data["placenta"] = scan.placentaLocation;  
    data["mvp"] = scan.mvp;
    data["summary"] = scan.summary;  


    var docDefinition = {
        background: function (currentPage, pageSize) {
              return {
                  table: {
                  widths: [pageSize.width - 30],
                  heights: [pageSize.height - 30],
                  body: [['']]
              },
              margin: 10
          };
      },
      header: function(currentPage, pageCount) { 
               return {
              style: 'tableExampleHeader',
              table: {
                  body: [
                          ['Study Number ICBE-s-00779', 'Subject Number: XXXX']
                      
                  ],
              }
          }
      },
      footer: function(currentPage, pageCount) { 
               return {
              style: 'tableExampleFooter',
              table: {
                  body: [
                      //['Visit Date'],
                          ['DecID ICBE-5-000779', 'Version: 5', 'Date: 2023-Aug-27', 'Status: Approved', 'Page 1 of 3', 'Confidential']
                      
                  ],
              }
          }
      },
      content: [
              {
              stack: [
                  'CASE REPORT FORM - India Site',
                  [   {   
                          
                          text: 'Subject Number: XXXXX',
                          style: 'subheader',
                          
                      },
                      {
                          text: 'Site Number 01\nPrincipal Investigator: Dr. Suresh.\nMedican systems\nNo. 197, Dr. Natesan Road, Mylapore\nChennai 600000, India',
                          style: 'subheader'
                      }
                  ],
                      
              ],
              style: 'header'
          },
          {
              style: 'tableExample',
              table: {
                  body: [
                          [{
                              border: [true, true, true, true],
                              fillColor: '#eeeeee',
                              text: 'Visit Date'
                          }]
                      
                  ],
                  widths: [530],
              }
          },
          {   
                          
                          text: 'Date of inclusion visit (date informed consent is signed dd/MM/yyyy):',
                          style: 'subheader',
                          
          },
          {
              columns: [
                  {
                      width: 'auto',
                      margin: [0, 10, 0, 10],
                          table: {
                              body: [
                                      [{
                                          border: [true, true, true, true],
                                          text: '13/08/2022'
                                      }]
                      
                              ],
                          }
                  }
              ]
          },
          {   
                          
                      text: 'Did the subject receive a copy of the signed consent?',
                      style: 'subheader',
                          
          },
          {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (value2===1?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'Yes' 
                              }
                          ]
                      ]
                  },
          },
          {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (value2===1?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'No' 
                              }
                          ]
                      ]
                  },
          },
          {   
                          
                  text: 'Project scan visit number',
                  style: 'subheader',
                          
          },
              {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (isFirstVisit===1?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'First' 
                              }
                          ]
                      ]
                  },
          },
          {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (isFirstVisit===0?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'Second' 
                              }
                          ]
                      ]
                  },
          },
          {
              text: 'Patient Details', fontSize: 16, bold: true, pageBreak: 'before', margin: [0, 20, 0, 8]
              
          },
          {
              style: 'tableExample',
              table: {
                  body: [
                      ['Height', 'Weight', 'BMI'],
                      [data.height, data.weight, data.bmi]
                  ]
              }
          },
          {
              text: 'Ultrasound parameters', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              style: 'tableExample',
              table: {
                  body: [
                      ['FHR', 'GA', 'Placenta Location', 'MVP'],
                      [data.fhr, data.ga, data.placenta, data.bmi]
                  ]
              }
          },
          {
              text: 'Image:', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              image: path.join(__dirname, '..', '..', '/lib/assets/img.png'),
              margin: [0, 20, 0, 8],
              width: 200,
              height: 200
          },
          {
              text: 'Summary', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              text: scan.summary, 
              fontSize: 12, bold: false, margin: [0, 20, 0, 8]
              
          },
          {
              text: 'Signed By', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              text: scan.scannedBy,
              fontSize: 12, bold: false, margin: [0, 10, 0, 8]
              
          },
          
    
      ],
      images: {
        checked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF+2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTItMzBUMDE6Mzc6MjArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMSIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkRvdCBHYWluIDIwJSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowNzVjYjZmMy1jNGIxLTRiZjctYWMyOS03YzUxMWY5MWJjYzQiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5ZTM1YTc3ZC0zNDM0LTI5NGQtYmEwOC1iY2I5MjYyMjBiOGIiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowYzc2MDY3Ny0xNDcwLTRlZDUtOGU4ZS1kNTdjODJlZDk1Y2UiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjBjNzYwNjc3LTE0NzAtNGVkNS04ZThlLWQ1N2M4MmVkOTVjZSIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozNzoyMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjA3NWNiNmYzLWM0YjEtNGJmNy1hYzI5LTdjNTExZjkxYmNjNCIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozODoyOCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+jHsR7AAAAUNJREFUOMvN1T9Lw0AYx/EviLVFxFH8M3USgyAFoUsQ0UV8F6Ui4qCTbuJg34HgptBdUATrUoxiqYMgiOBoIcW9BVED+jgkntGm9i6CmN+Sg/vAcc89dwBd5Clzj6uZGg7LJAC62UFipEgKcmroaeZj/gpcIAhl5rE1M0cJQbiCOsIrs5h8WZ4R6j72yBrhcRo+dhE8bCOcoYng/hFOMxAXb/DAHTNxcCGo7JE5LqhjsW2KP6nDcGecCv1vRdC2eJQDLllooach2hbvIghvLJJgM0QHdeq8F0x/5ETRM4b0DonF7be+Pf+y4A4bZnETok4E/XG3xxR3WhasUWeLCg2OGYnXGP1MkPwnLRmJf3UN+RfgtBGe5MnHVQShxBQZzdgcIgjXsKSu/KZmXgKxBkmKsZ6bffoAelilQs3goauyTi+8A8mhgeQlxdNWAAAAAElFTkSuQmCC',
        unchecked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF+2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTItMzBUMDE6Mzc6MjArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjU3KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjU3KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMSIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkRvdCBHYWluIDIwJSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpjMGUyMmJhZC1lY2VkLTQzZWUtYjIzZC1jNDZjOTNiM2UzNWMiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5M2FhOTEzYy1hZDVmLWZmNGEtOWE5Ny1kMmUwZjdmYzFlYmUiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozYmY2ODFlMy1hMTRhLTQyODMtOGIxNi0zNjQ4M2E2YmZlNjYiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjNiZjY4MWUzLWExNGEtNDI4My04YjE2LTM2NDgzYTZiZmU2NiIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozNzoyMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmMwZTIyYmFkLWVjZWQtNDNlZS1iMjNkLWM0NmM5M2IzZTM1YyIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozODo1NyswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+6AB6cQAAAPxJREFUOMvF1b1Kw1AYBuAnFf8QL8WlIHQJIriIdyEu4qCTXop7dwenTgUHpYvgJVhob8AuakE+h9hapJqcFDXvFDgPIXlzvgNLjnQ9GlRM340TK7DsUtRI2zqH09txxUzWn3IrhK4DecXs6wjhnqHwZk/K1fIiDAs81krCW54KPBDG8iTcNBIGf4ND1MWTdmrgqIOL5TM0S8SRhmMu1dAo+2DZ57t9eWajtKrvN1GVnrMK9HewhbBy+nPPJbTsJwmymOn8P7fkfLzQGCoG4G4S3vZc4J4QOnY0KyZ3LYQHjqcjf1Qxrx/inDXtWsfNlU1YdeZOP+Gg67mwwTvIDqR1iAowgQAAAABJRU5ErkJggg==',
    }, 
    styles: {
        header: {
            fontSize: 24,
            bold: true,
            alignment: 'center',
            margin: [0, 60, 0, 10]
        },
        subheader: {
            fontSize: 14,
            margin: [0, 50, 0, 0],
        },
        superMargin: {
            margin: [20, 0, 40, 0],
            fontSize: 15
        },
        tableExample: {
            alignment: 'center',
            margin: [0, 10, 0, 10],
            bold: false
        },
        tableExampleHeader: {
            margin: [30, 15, 0,0]
        },
        tableExampleFooter: {
            margin: [30, -5, 0, 15]
        }
    }
    
  }


    var pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    var pdfPath = path.join(__dirname, '..', '..','..','output/my_report.pdf');


    pdfDoc.pipe(fs.createWriteStream(pdfPath));
    //await pdfDoc.pipe(res);
    //const content = await req.body.content
    //pdfDoc.text(content)
    
    cloud.uploads(pdfPath).then((result) => {
        const pdfFile = {
        pdfName: 'my_report',
        pdfUrl: result.url,
        pdfId: result.id
        }
        console.log('pdf results--', result.url)
        res.status(201).json(
            success(
              "File successfully uploaded!! Please download the file from following url.",
              {
                file: {
                    pdfName: 'my_report',
                    pdfUrl: result.url,
                    pdfId: result.id
                }
              },
              res.statusCode
            )
          );
    })
    
    pdfDoc.end();

    


  
} catch (err) {
  console.error(err.message);
  res.status(500).json(error("Server error", res.statusCode));
}
};*/






/*exports.genReport = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json(validation(errors.array()));

  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log("user id: " + user._id)
    const scan = await Scan.findOne({
        userId: user._id
    });

    // Check the user just in case
    if (!user)
      return res.status(404).json(error("User not found", res.statusCode));

    console.log("height: " + scan.height)

    data["doctor"] = user.name  
    isFirstVisit = scan.isFirstVisit ? 1 : 0;
    data["height"] = scan.height
    height = scan.height
    data["weight"] = scan.weight
    data["bmi"] = scan.bmi
    data["fhr"] = scan.fhr;  
    data["ga"] = scan.ga; 
    data["placenta"] = scan.placentaLocation;  
    data["mvp"] = scan.mvp;
    data["summary"] = scan.summary;  


    var docDefinition = {
        background: function (currentPage, pageSize) {
              return {
                  table: {
                  widths: [pageSize.width - 30],
                  heights: [pageSize.height - 30],
                  body: [['']]
              },
              margin: 10
          };
      },
      header: function(currentPage, pageCount) { 
               return {
              style: 'tableExampleHeader',
              table: {
                  body: [
                          ['Study Number ICBE-s-00779', 'Subject Number: XXXX']
                      
                  ],
              }
          }
      },
      footer: function(currentPage, pageCount) { 
               return {
              style: 'tableExampleFooter',
              table: {
                  body: [
                      //['Visit Date'],
                          ['DecID ICBE-5-000779', 'Version: 5', 'Date: 2023-Aug-27', 'Status: Approved', 'Page 1 of 3', 'Confidential']
                      
                  ],
              }
          }
      },
      content: [
              {
              stack: [
                  'CASE REPORT FORM - India Site',
                  [   {   
                          
                          text: 'Subject Number: XXXXX',
                          style: 'subheader',
                          
                      },
                      {
                          text: 'Site Number 01\nPrincipal Investigator: Dr. Suresh.\nMedican systems\nNo. 197, Dr. Natesan Road, Mylapore\nChennai 600000, India',
                          style: 'subheader'
                      }
                  ],
                      
              ],
              style: 'header'
          },
          {
              style: 'tableExample',
              table: {
                  body: [
                          [{
                              border: [true, true, true, true],
                              fillColor: '#eeeeee',
                              text: 'Visit Date'
                          }]
                      
                  ],
                  widths: [530],
              }
          },
          {   
                          
                          text: 'Date of inclusion visit (date informed consent is signed dd/MM/yyyy):',
                          style: 'subheader',
                          
          },
          {
              columns: [
                  {
                      width: 'auto',
                      margin: [0, 10, 0, 10],
                          table: {
                              body: [
                                      [{
                                          border: [true, true, true, true],
                                          text: '13/08/2022'
                                      }]
                      
                              ],
                          }
                  }
              ]
          },
          {   
                          
                      text: 'Did the subject receive a copy of the signed consent?',
                      style: 'subheader',
                          
          },
          {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (value2===1?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'Yes' 
                              }
                          ]
                      ]
                  },
          },
          {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (value2===1?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'No' 
                              }
                          ]
                      ]
                  },
          },
          {   
                          
                  text: 'Project scan visit number',
                  style: 'subheader',
                          
          },
              {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (isFirstVisit===1?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'First' 
                              }
                          ]
                      ]
                  },
          },
          {
                  table: {
                      widths: [1,'auto'],
                      body: [
                          [
                              {   margin: [-3,7,0,0],
                                  border: [false,false,false,false], 
                                  image: (isFirstVisit===0?'checked':'unchecked'), 
                                  width: 14
                                  
                              },
                              {   margin: [5,5,0,0], 
                                  border: [false,false,false,false], 
                                  fontSize: 14, 
                                  text: 'Second' 
                              }
                          ]
                      ]
                  },
          },
          {
              text: 'Patient Details', fontSize: 16, bold: true, pageBreak: 'before', margin: [0, 20, 0, 8]
              
          },
          {
              style: 'tableExample',
              table: {
                  body: [
                      ['Height', 'Weight', 'BMI'],
                      [data.height, data.weight, data.bmi]
                  ]
              }
          },
          {
              text: 'Ultrasound parameters', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              style: 'tableExample',
              table: {
                  body: [
                      ['FHR', 'GA', 'Placenta Location', 'MVP'],
                      [data.fhr, data.ga, data.placenta, data.bmi]
                  ]
              }
          },
          {
              text: 'Image:', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              image: path.join(__dirname, '..', '..', '/lib/assets/img.png'),
              margin: [0, 20, 0, 8],
              width: 200,
              height: 200
          },
          {
              text: 'Summary', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              text: scan.summary, 
              fontSize: 12, bold: false, margin: [0, 20, 0, 8]
              
          },
          {
              text: 'Signed By', fontSize: 16, bold: true, margin: [0, 20, 0, 8]
              
          },
          {
              text: scan.scannedBy,
              fontSize: 12, bold: false, margin: [0, 10, 0, 8]
              
          },
          
    
      ],
      images: {
          checked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF+2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTItMzBUMDE6Mzc6MjArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMSIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkRvdCBHYWluIDIwJSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowNzVjYjZmMy1jNGIxLTRiZjctYWMyOS03YzUxMWY5MWJjYzQiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5ZTM1YTc3ZC0zNDM0LTI5NGQtYmEwOC1iY2I5MjYyMjBiOGIiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowYzc2MDY3Ny0xNDcwLTRlZDUtOGU4ZS1kNTdjODJlZDk1Y2UiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjBjNzYwNjc3LTE0NzAtNGVkNS04ZThlLWQ1N2M4MmVkOTVjZSIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozNzoyMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjA3NWNiNmYzLWM0YjEtNGJmNy1hYzI5LTdjNTExZjkxYmNjNCIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozODoyOCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+jHsR7AAAAUNJREFUOMvN1T9Lw0AYx/EviLVFxFH8M3USgyAFoUsQ0UV8F6Ui4qCTbuJg34HgptBdUATrUoxiqYMgiOBoIcW9BVED+jgkntGm9i6CmN+Sg/vAcc89dwBd5Clzj6uZGg7LJAC62UFipEgKcmroaeZj/gpcIAhl5rE1M0cJQbiCOsIrs5h8WZ4R6j72yBrhcRo+dhE8bCOcoYng/hFOMxAXb/DAHTNxcCGo7JE5LqhjsW2KP6nDcGecCv1vRdC2eJQDLllooach2hbvIghvLJJgM0QHdeq8F0x/5ETRM4b0DonF7be+Pf+y4A4bZnETok4E/XG3xxR3WhasUWeLCg2OGYnXGP1MkPwnLRmJf3UN+RfgtBGe5MnHVQShxBQZzdgcIgjXsKSu/KZmXgKxBkmKsZ6bffoAelilQs3goauyTi+8A8mhgeQlxdNWAAAAAElFTkSuQmCC',
          unchecked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF+2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTItMzBUMDE6Mzc6MjArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjU3KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjU3KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMSIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkRvdCBHYWluIDIwJSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpjMGUyMmJhZC1lY2VkLTQzZWUtYjIzZC1jNDZjOTNiM2UzNWMiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5M2FhOTEzYy1hZDVmLWZmNGEtOWE5Ny1kMmUwZjdmYzFlYmUiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozYmY2ODFlMy1hMTRhLTQyODMtOGIxNi0zNjQ4M2E2YmZlNjYiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjNiZjY4MWUzLWExNGEtNDI4My04YjE2LTM2NDgzYTZiZmU2NiIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozNzoyMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmMwZTIyYmFkLWVjZWQtNDNlZS1iMjNkLWM0NmM5M2IzZTM1YyIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozODo1NyswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+6AB6cQAAAPxJREFUOMvF1b1Kw1AYBuAnFf8QL8WlIHQJIriIdyEu4qCTXop7dwenTgUHpYvgJVhob8AuakE+h9hapJqcFDXvFDgPIXlzvgNLjnQ9GlRM340TK7DsUtRI2zqH09txxUzWn3IrhK4DecXs6wjhnqHwZk/K1fIiDAs81krCW54KPBDG8iTcNBIGf4ND1MWTdmrgqIOL5TM0S8SRhmMu1dAo+2DZ57t9eWajtKrvN1GVnrMK9HewhbBy+nPPJbTsJwmymOn8P7fkfLzQGCoG4G4S3vZc4J4QOnY0KyZ3LYQHjqcjf1Qxrx/inDXtWsfNlU1YdeZOP+Gg67mwwTvIDqR1iAowgQAAAABJRU5ErkJggg==',
      }, 
      styles: {
          header: {
              fontSize: 24,
              bold: true,
              alignment: 'center',
              margin: [0, 60, 0, 10]
          },
          subheader: {
              fontSize: 14,
              margin: [0, 50, 0, 0],
          },
          superMargin: {
              margin: [20, 0, 40, 0],
              fontSize: 15
          },
          tableExample: {
              alignment: 'center',
              margin: [0, 10, 0, 10],
              bold: false
          },
          tableExampleHeader: {
              margin: [30, 15, 0,0]
          },
          tableExampleFooter: {
              margin: [30, -5, 0, 15]
          }
      }
      
    }


    var pdfDoc = printer.createPdfKitDocument(docDefinition, options);

    pdfDoc.pipe(fs.createWriteStream('output/my_report.pdf'));
    pdfDoc.end();

    var file = path.join(__dirname, '..', '..','..','output/my_report.pdf');
    res.download(file, function (err) {
        if (err) {
            console.log("Error");
            console.log(err);
        } else {
            console.log("Success");
        }
    });

    //     res.sendFile(file);


    //res.send('Hello World!')

  } catch (err) {
    console.error(err.message);
    res.status(500).json(error("Server error", res.statusCode));
  }
};
*/

