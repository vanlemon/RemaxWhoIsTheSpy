import * as React from 'react';
import { 
  View, 
  Input, 
  navigateBack, 
  Label,
  Text, 
  Image
} from 'remax/wechat';
import AddButton from '@/components/AddButton';
import { TodoContext } from '@/app';
import {Button, Popup,Tag,Icon} from 'anna-remax-ui';
import './index.css';
import { usePageEvent } from 'remax/macro';
import {useState} from "react";
import MyCard from "./first-card";
import MyCard_left from "./first-card-left";
import MyCard_right from "./first-card-right";

import MyCard2 from "./second-card";
import AnswerCard from "./answer-card";
import RulesCard from "./rules-card";
import WxPostRequest from '../../hooks/wxPostRequest'
import logo from '@/assets/logo.jpg';
import none from '@/assets/logo.jpg';
const DefaultPostHeader = {
  "Content-Type": "application/x-www-form-urlencoded"
};
const FilePostHeader = {
    "Content-Type": "multipart/form-data"
};
const JsonPostHeader = {
    "Content-Type": "application/json"
};
const TextPostHeader = {
    "Content-Type": "text/xml"
};
const server = "https://coding8zz.com";    // http://something/user/wx_login
const WxLoginUrl = server + "/user/wx_login";
const UpdateUserInfoUrl = server + "/user/update_userInfo";
const CreateNewRoomUrl = server + "/room/new_room"; // http://something/user/room/new_room
const EnterRoomUrl = server + "/room/enter_room";
const ExitRoomUrl = server + "/room/exit_room";
const RefreshRoomUrl = server + "/room/refresh_room";
const ReadyGameUrl = server + "/game/ready_game";
const StartGameUrl = server + "/game/start_game";
const EndGameUrl = server + "/game/end_game";
const RestartGameUrl = server + "/game/restart_game";
var interval = null;


export default () => {
  const todo = React.useContext(TodoContext); // back
  const [test,setTest] = React.useState(100);
  const [seeAnswer,setSeeAnswer] = React.useState(false);
  // const [roomInformation,setRoomInfo] = React.use
  const roomInformation = todo.roomInformation;
  const userId = todo.globalData.id;

  usePageEvent('onShareAppMessage',(res)=>{
    console.log("转发！");
    if (res.from === 'button') { // 说明是通过邀请得到的
      return {
        title: '朋友邀请您玩谁是卧底！',
        path: 'pages/index/index?room_ID='+roomInformation.roomId,
        success: function(res) {
        // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
      console.log(res.target)
    }else{ // 正常转发
      return {
        title: '朋友邀请您玩谁是卧底！',
        path: 'pages/index/index'
      }
    } 
  });

  usePageEvent('onLoad', (option) => {
    console.log(" on game!~~~");
    startInter();
    if(!todo.onGame){ // 没有游戏中的话
      todo.setOnGame(true);
    }
  });

  usePageEvent('onHide', (option) => {
    console.log("-------------new 页面hide------------");
  });
  
  usePageEvent('onUnload', (option) => {
    console.log("-------------new 页面unload------------");
    stopInter();
    // todo.setOnGame(true);
  });

  const leaveHome = () => { // 离开房间后再进入，todo可能对它就是null了，因此最好refresh一下
    // 判断状态是否是ready, 如果是，则调用ready_game, 然后再调用exit
    var find = false;
    let exit_successFunc = function(){
      navigateBack();
      todo.setOnGame(false);
      console.log("是否在游戏中:", todo.onGame);
      stopInter();
    }
    for(var i = 0;i<roomInformation.roomInfo.player_list.length;i++){  //循环LIST，实现浅拷贝
      var veh = roomInformation.roomInfo.player_list[i];
      console.log("对比",veh.nick_name," ",todo.globalData.userInfo.nickName);
      if(veh.is_self){ 
        // return veh.open_id == "Ready";
        find = true;
        console.log("找到了这个用户");
        let data = {};
        data.tempId = userId;
        // if(veh.is_self == "true"){
        if(veh.state == "Ready"){
          console.log("it was ready");    
          console.log("执行ready");
          let successFunc = function (resp) { 
            console.log("执行exit!");
            WxPostRequest(ExitRoomUrl, DefaultPostHeader, data,exit_successFunc);
          };
          WxPostRequest(ReadyGameUrl, DefaultPostHeader, data,successFunc);
        }else{
          WxPostRequest(ExitRoomUrl, DefaultPostHeader, data,exit_successFunc);
        }
        break;
      }
    }   
    if(!find){
      console.log("你没在这个房间里");
      normalPost(ExitRoomUrl);
    }
    
  };

  
  // refresh接口测试按钮
  const handleRefresh = () => {
    refreshGame();
  };


  const beginGame = () => {
    if(isNotBegin()){
      if(roomInformation.roomInfo.state == "Playing"){
        wx.showToast({
          title: '已在游戏中，无需点击开始按钮',
          icon: 'none'
        })
      }else{
        wx.showToast({
          title: '还有人没准备，无法开始',
          icon: 'none'
        })
      }    
    }else{
    // 判断是否准备
      normalPost(StartGameUrl);   
    }
  };


  // 准备按钮
  const readyGame = () => {
    console.log("ready game");
    wx.showToast({
      title: '操作成功',
      icon: 'true'
    })
    normalPost(ReadyGameUrl);
  };


  // 在房主结束游戏, 显示房间的卧底牌
  const endGame = () => {
    normalPost(EndGameUrl);
  }
  

  // 更换房间卧底词按钮
  const changeWord = () => {
    normalPost(RestartGameUrl);
    refreshGame();
  }


  // 用来测试房间状态的改变对前端界面的影响
  const changeState = () =>{
    console.log("---change state: ---");
    var tmp_info = {};
    tmp_info.roomId = roomInformation.roomId;
    tmp_info.roomInfo = roomInformation.roomInfo;
    
    if(tmp_info.roomInfo.state == "Ready"){
      console.log("Clearing"); 
      tmp_info.roomInfo.state = "Clear";
    }else if(tmp_info.roomInfo.state == "Clear") {
      console.log("playing"); 
      tmp_info.roomInfo.state = "Playing";
    }else{
      tmp_info.roomInfo.state = "Ready";
      console.log("Ready"); 
    }
    todo.setRoomInfo(tmp_info);
  }
  

  // 判断房间的状态是否等于playing
  const isNotBegin = () =>{
    if(roomInformation.roomInfo.state == "Ready" ||roomInformation.roomInfo.state == "Clear" ){     
      return false;
    }
    else{
      return true;
    }
  }

  
  // 判断人的状态是否等于playing
  const isReady = ()=>{
    // 找到这个用户，并且判断状态
    for(var i = 0;i<roomInformation.roomInfo.player_list.length;i++){  //循环LIST，实现浅拷贝
      var veh =roomInformation.roomInfo.player_list[i];
      if(veh.is_self){    // 其实不应该判断用户的nick_name
        console.log("找到了这个用户");
        if(veh.state == "Ready"){
          console.log("用户的状态是ready");
          return true;
        }else{
          console.log("用户还没准备，马上！");
          return false;
        }}}
    return false;
  }


  // 测试按钮响应
  const changeRoot = () => {  // react只要props改变，就会重新渲染
    var tmp_info = {};  // 只要setTest里面赋的值拥有的是新的地址，就可以即使渲染。
    tmp_info.roomId = roomInformation.roomId;  // 但如果直接等于indexRoomInfo，则不会导致渲染
    tmp_info.roomInfo = roomInformation.roomInfo;
    if(tmp_info.roomInfo.master_open_id == userId){
      tmp_info.roomInfo.master_open_id="00000";
    }else{
      tmp_info.roomInfo.master_open_id = userId;
    }
    console.log("change root了");
    todo.setRoomInfo(tmp_info);
  }


  // 测试按钮响应
  const getRoonInfo = () =>{
    console.log(roomInformation);
  }
  

  // 测试按钮响应
  const addPeople = () =>{
    var tmp_info = {};  // 只要setTest里面赋的值拥有的是新的地址，就可以即使渲染。但如果直接等于indexRoomInfo，则不会导致渲染
    tmp_info.roomId = roomInformation.roomId;
    tmp_info.roomInfo = roomInformation.roomInfo;
    var userLists = tmp_info.roomInfo.player_list;
    userLists.push({open_id:test,nick_name:"beauty",avatar_url:logo, state:"Ready",word:"",role:"",number:null});
    setTest(test+1); // 加上这个就会多刷新一次, 但是临时增加的人的id不会重复
    tmp_info.roomInfo.player_list = userLists;
    todo.setRoomInfo(tmp_info);
    console.log("add people");
  };


  function normalPost(url,successFunc){
    let data = {};
    data.tempId = userId;
    if(successFunc){
      WxPostRequest(url, DefaultPostHeader, data,successFunc);
    }else{
      WxPostRequest(url, DefaultPostHeader, data);
    }
    
  }

  
  // 更新信息
  function refreshGame(){  
    let data = {};
    data.tempId = userId; // 用户ID
    let successFunc = function (resp) { 
      console.log("refresh请求数据：",data);
      console.log("refresh返回数据: ",resp);
      if(resp.Data!= null){ 
        if(resp.Data.roomInfo.is_master && !isReady()){
          normalPost(ReadyGameUrl);
        }
        var new_data = {
          "roomId":roomInformation.roomId,
          "roomInfo":resp.Data.roomInfo
        };
        todo.setRoomInfo(new_data); 
        console.log("------房间状态: ",roomInformation.roomInfo.state,"--> new data: ",new_data.roomInfo.state); 
      }
    };
    let requestFailFunc = function () {
      wx.showToast({
        title: '服务器维护中',
        icon: 'none'
      })
    };
    let responseFailFunc = function (message) {
      wx.showToast({
        title: message,
        icon: 'none'
      })
    };
    WxPostRequest(RefreshRoomUrl, DefaultPostHeader, data, successFunc, requestFailFunc, responseFailFunc,true);
  }


  // 开始轮询调用refresh
  function startInter(){
    if(interval){
      clearInterval(interval);
      interval = null;
    }
    interval = setInterval(refreshGame,1100);//启动计时器，调用overs函数，
    console.log("启动轮询访问--");
  }
  

  // 停止轮询调用refresh
  function stopInter(){
    console.log("停止轮询访问--");
    clearInterval(interval);
    interval = null;
  }
  
  return (
    <View className="total-content">
      <View className="top-yellow-background">
        {/* left */}
        <MyCard_left/>

        {/* mid  */}
        <View className = "mid-content">
          <View className="mid-button-content">
            {/* 开始和准备按钮 */}
            {roomInformation.roomInfo.is_master?<Button size="superlarge"  onTap={beginGame}
             ></Button>:
              <Button size="superlarge" disabled={roomInformation.roomInfo.state=="Playing"} onTap={readyGame}>{isReady()}</Button>
            }          
          </View>
          <View className="mid-draw-content"> 
            <View className="staff"></View>
            {roomInformation.roomInfo.state =="Playing" && <MyCard2/>}
            {roomInformation.roomInfo.state == "Clear"&&<AnswerCard/>  }
            {roomInformation.roomInfo.state != "Playing" && roomInformation.roomInfo.state != "Clear"  &&<RulesCard/>  }
          </View>
        </View>
        
        {/* left */}
        <MyCard_right/>
      </View>      
        <View className="low-content">
          <View className="buttons-view">

            {/* 离开按钮 */}
            <Button plain = "none" size="large"  disabled={roomInformation.roomInfo.state=="Playing"} onTap={leaveHome}
              icon={<Icon type="exit" size="85px" color="#ffc107" />}>
              离开
              </Button>

            {/* 分享按钮 */}
            <Button  plain = "none"  size="large" open-type="share" icon={<Icon type="addressbook" size="85px" color="#ffc107" />}>
            邀请
            </Button> 

            {/* 看答案 */}
            {roomInformation.roomInfo.is_master 
            &&<Button  plain="none" size="large" disabled={roomInformation.roomInfo.state!="Playing"} onTap={endGame}
              icon={<Icon type="creativefill" size="85px" color="#ffc107" />}>
              答案
            {/* 改词按钮 */}
            </Button>}
            {roomInformation.roomInfo.is_master 
            &&<Button plain="none" size="large" disabled={roomInformation.roomInfo.state!="Playing"} onTap={changeWord}
              icon={<Icon type="forwardfill" size="85px" color="#ffc107" />}>换词</Button>}
          </View>
          {/* 测试按钮们 */}
          {/* <AddButton text="~开始计时" onClick={startInter}/>  */}
          {/* <Button onTap={stopInter}>~停止计时</Button>         */}
          {/* <AddButton text="~更新" onClick={handleRefresh}/>  */}
          {/* <Button  onTap={changeState}>~改状态</Button> */}
          {/* <AddButton text="~改房主" onClick={changeRoot}/>  */}
          {/* <AddButton text="~加用户" onClick={addPeople}/>  */}
          {/* <Button type="primary" plain color="black" onTap={getRoonInfo}>roomInfo:</Button> */}
        </View>
    </View>
  );
};

