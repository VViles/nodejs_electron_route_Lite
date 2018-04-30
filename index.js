 

const electron = require('electron');
var dgram = require('dgram');

//var $ = require('./node_modules/jquery/dist/jquery');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
var net = require('net');
var mainWindows;
const ipc = electron.ipcMain; 
var HOST = '127.0.0.1';
var PORT = 4999;
var HOST2 = "127.0.0.1"
var PORT2 = 6003;
var Sound_soc;
var jsdom = require("jsdom");
var serverSocket;
const ipcRenderer =  electron.ipcRenderer;
    app.on('ready',function(){
        mainWindows = new BrowserWindow({width:480,height:720,backgroundColor:'#eee',autoHideMenuBar:true,resizable:false});
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
        ipc.on("flush_devinfo",flush_devinfo_func);
        process.on('uncaughtException', (reason, p) => {
            console.log(reason);
            if(reason.code == "ECONNREFUSED"){
                    if( reason.port == 4999 ){
                        mainWindows.webContents.send("Service4999:unline");
                    }else if(reason.port == 6003){
                        mainWindows.webContents.send("Service6003:unline");     
                    }
            }
            console.error(reason, 'uncaughtException at Promise' );    
        });
        ipc.on("Go__c",function(v1,v2){
            console.log(v1);   
            if(true){
                //do_get_devices sev info;
                

                //OK---next
                serverSocket = dgram.createSocket('udp4');
                serverSocket.bind(v1);
                serverSocket.on("message",function(msg,info){

                });
                //OK---Start emit;

                //---------------
            }             
        });       
    });
    
    function flush_devinfo_func(){
        console.log("flush_devinfo_func _ here");
        var client = new net.Socket();
        client.connect(PORT2, HOST, function(error){                   
            console.log('CONNECTED TO:' + HOST + ':' + PORT);
            client.write('{"mode":1001}');//lient.write('{"cmd":"list"}');
        });
        client.on("data",function(data){
            console.log("backdata:"+data);
            Sound_soc = JSON.parse(data);
            mainWindows.webContents.send("clear_Dev_list"); 
            if(Sound_soc.res){
                Sound_soc.list.forEach(v => {
                    console.log(v.sn+v.vol+v.status+v.ux+v.l_ip);  
                    mainWindows.webContents.send("adddevice_node",v.sn,v.status,v.l_ip);                        
                });    
            }
            client.destroy();
        });
        client.on('close',function(){
            console.log('Connection closed');
        });
    }
    function flush_portinfo_func(){
                console.log("main_ here");
                var client = new net.Socket();
                client.connect(PORT, HOST, function(error){
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

   
 