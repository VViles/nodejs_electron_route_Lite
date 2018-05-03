 

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
var skyscraper_port = 6002;
var Sound_soc;
var jsdom = require("jsdom");
var serverSocket;
var clientfordev,clientfordev_data;
const ipcRenderer =  electron.ipcRenderer;
    app.on('ready',function(){
        mainWindows = new BrowserWindow({width:480,height:720,backgroundColor:'#eee',autoHideMenuBar:true,resizable:true});
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
                    if( reason.port == PORT ){
                        mainWindows.webContents.send("Service4999:unline");
                    }else if(reason.port == PORT2){
                        mainWindows.webContents.send("Service6003:unline");     
                    }else if(reason.port == skyscraper_port){
                        mainWindows.webContents.send("Service6002:unline");    
                    }
            }
            console.error(reason, 'uncaughtException at Promise' );    
        });
        ipc.on("Go__c",function(v1,v2){
            console.log(v1);   
            if(true){
                //do_get_devices sev info;                
                clientfordev_data = new net.Socket();   
                clientfordev_data.connect(skyscraper_port,HOST2,function(error){
                    console.log('CONNECTED TO:' + HOST2 + ':' + skyscraper_port);
                    clientfordev_data.write('{"cmd":"PLAYLIST","ulevel":99,"plevel":2,"Umask":"test","Umagic":3,"snlist":['+v2+']}');
                    /*
                    ulevel   等级U  int 类型  1~999
                    plevel   等级P   int 类型 1~9
                    Umask    使用标记 string  max length 20	 
                    Umagic   魔数 不重复 int	
                    snlist   json数组[sn1,sn2,sn3,sn4,sn..]  期待响应的设备序列号 列表     
                    eg:
                        {
                            "cmd":"PLAYLIST",
                            "ulevel":99,
                            "plevel":2,
                            "Umask":"test",
                            "Umagic":3,
                            "snlist":[
                                "34ffd7054352373951410243",
                                "35ffd8054353343639611043"
                            ]
                        }               
                    */
                });
                clientfordev_data.on("data",function(data){
                    console.log("backdata:"+data);
                    if(data.length  == 5){
                         //do nothing here   
                    }else if(data=="WELL"){
                        //WELL now Create Dgram Listener and lets Mic Start emit Data;
                        //OK---next
                        serverSocket = dgram.createSocket('udp4');
                        serverSocket.bind(v1);
                        serverSocket.on("message",function(msg,info){
                            console.log("udp len：",msg.length);
                            clientfordev_data.write(msg);
                        });
                        //OK---Start emit;
                        clientforMic_start();    
                        //---------------

                    }else if(data == "DISS"){
                        clientfordev_data.destroy();   
                        //emit Something error in Json;
                        mainWindows.webContents.send("Devservice_JSONERROR");
                    }else{
                        //do nothing
                    }      
                    
                });
                




                
            }             
        });       
    });
    
    function clientforMic_start(){
        var clientforStart = new net.Socket();
        clientforStart.connect(PORT, HOST, function(error){                   
            console.log('CONNECTED TO clientforMic_start:' + HOST + ':' + PORT);
            clientforStart.write('{"mode":3007,"id":0}'); //'{"cmd":"START","id":0}'
        });
        clientforStart.on("data",function(data){
            console.log("backdata:"+data);
            Sound_soc = JSON.parse(data);            
            if(Sound_soc.res){
                console.log("Start already"); 

                clientfordev_data.on('close',function(){
                    clientforMic_stop();                      
                    console.log('Connection closed');
                }); 

            }
            clientforStart.destroy();
        });
        clientforStart.on('close',function(){
            console.log('Connection closed');
        });
    }
    
    function clientforMic_stop(){
        var clientforStop = new net.Socket();
        clientforStop.connect(PORT, HOST, function(error){                   
            console.log('CONNECTED TO clientforMic_stop:' + HOST + ':' + PORT);
            clientforStop.write('{"mode":3008}'); //'{"cmd":"STOP"}'
        });
        clientforStop.on("data",function(data){
            console.log("backdata:"+data);
            Sound_soc = JSON.parse(data);
            mainWindows.webContents.send("clear_Dev_list"); 
            if(Sound_soc.res){
                console.log("Stoped Over");                
            }
            clientforStop.destroy();
        });
        clientforStop.on('close',function(){
            console.log('Connection closed');
        });
    }

    function flush_devinfo_func(){
        console.log("flush_devinfo_func _ here");
        var client = new net.Socket();
        client.connect(PORT2, HOST2, function(error){                   
            console.log('CONNECTED TO:' + HOST + ':' + PORT);
            client.write('{"mode":1001}');//client.write('{"cmd":"list"}');
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

   
 