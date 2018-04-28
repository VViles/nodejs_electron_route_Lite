const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');

var mainWindows;
 
app.on('ready',function(){
    mainWindows = new BrowserWindow({width:370,height:600,backgroundColor:'#eee',autoHideMenuBar:true});
    mainWindows.loadURL(url.format({
        pathname:path.join(__dirname,'index.html'),
        protocol :'file',
        slashes:true
        }));
        mainWindows.webContents.openDevTools()
        mainWindows.on('close',function(){
            win= null;
        });    
    

});
 
 

