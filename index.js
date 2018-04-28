 

const electron = require('electron');
var $ = require('./node_modules/jquery/dist/jquery');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
var net = require('net');
var mainWindows;
const ipc = electron.ipcMain; 
var HOST = '127.0.0.1';
var PORT = 4999;
var Sound_soc;
var jsdom = require("jsdom");
const ipcRenderer =  electron.ipcRenderer;
    app.on('ready',function(){
        mainWindows = new BrowserWindow({width:380,height:720,backgroundColor:'#eee',autoHideMenuBar:true,resizable:false});
        mainWindows.loadURL(url.format({
            pathname:path.join(__dirname,'index.html'),
            protocol :'file',
            slashes:true
        }));
        mainWindows.webContents.openDevTools()
        mainWindows.on('close',function(){
            win= null;
        });  
      
        ipc.on("flush_portinfo",flush_portinfo_func);  
    });

    function flush_portinfo_func(){
            console.log("main_ here");
            var client = new net.Socket();
            client.connect(PORT, HOST, function(){
                console.log('CONNECTED TO:' + HOST + ':' + PORT);
                client.write('{"mode":3006}');//lient.write('{"cmd":"list"}');
            });
            client.on("data",function(data){
                console.log("backdata:"+data);
                Sound_soc = JSON.parse(data);
                mainWindows.webContents.send("clear_select_list");       

                if(Sound_soc.res){
                    Sound_soc.list.forEach(v => {
                        console.log(v.id+v.name+v.status+v.port);  
                        mainWindows.webContents.send("addselect_node",v.name,v.port);                        
                    });    
                }
                client.destroy();
            });
            client.on('close',function(){
                console.log('Connection closed');
            });
    }

   
 