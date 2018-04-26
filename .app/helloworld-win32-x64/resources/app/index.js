const electron = require('electron');
const app = electron.app;

const BrowserWindow = electron.BrowserWindow;

var mainWindows;
app.on('ready',function(){
    mainWindows = new BrowserWindow({width:1024,height:768,backgroundColor:'#2e2c29'});
    mainWindows.loadURL('https://github.com');

});

