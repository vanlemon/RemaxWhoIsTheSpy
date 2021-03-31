import React, { useState } from "react";
import { View, Label, Image, Text } from "remax/wechat";
import { TodoContext } from '@/app'
import {Button, Popup,Tag, Icon} from 'anna-remax-ui';
import logo from '@/assets/logo.jpg';
import none from '@/assets/none.png';
import WxPostRequest from '../../hooks/wxPostRequest'


// var default_user_Info = {open_id:"#1",nick_name:"",avatar_url:none,state:"",word:"",role:"",number:null};
const userProductInfo = [
  {
    title: "房间",  // + 房间ID 
    specialBottom: {
      imageSrc: "/images/all.png",
      description: "请等玩家都准备好再开始游戏",
    },
  },
];


function MyCardAndPic(props) {
  const todo = React.useContext(TodoContext);
  var roomInfo = todo.roomInformation.roomInfo; 
  var total_num = roomInfo.room_setting.total_num;
  const flexWidthClass =
    total_num >= 4 ? "flex-width-4" : "flex-width-3";
  // 得到用户nick_name, avatar信息等
  var tmp_images_not_full = [];
  // tmp_images_not_full = roomInfo.player_list; // 如果像这样直接赋值，就会改变roomInfo的内容，因为赋值成了地址（深拷贝
  for(var i = 0;i<roomInfo.player_list.length;i++){  //循环LIST，实现浅拷贝
     var veh = roomInfo.player_list[i];
     tmp_images_not_full.push(veh);  
  }
  var num_diff = total_num- roomInfo.player_list.length; 
 
  if (num_diff <= 0){  // 房间已经满了  
    console.log("房间满了",roomInfo.player_list.length);
  }
  else{  // 房间没有满
    for(var i = 0;i<num_diff ; i++){
      var default_user_Info = {open_id:i,nick_name:"空座位",avatar_url:none,state:"",word:"",role:"",number:null};
      tmp_images_not_full.push(default_user_Info); // 房间没满，硬生生增添几个人数
    }    
  }

  console.log("all",tmp_images_not_full);
  console.log("total num ",tmp_images_not_full.length);
  var temp_left = [];
  var begin_index = Math.ceil(tmp_images_not_full.length/2);
  console.log(begin_index);
  for(var i = begin_index;i<tmp_images_not_full.length;i++){
      temp_left.push(tmp_images_not_full[i]);
  }
  console.log("right: ",temp_left);
  
  const myPicImage = temp_left.map((date) => {
    return (
      <View key={date.open_id} className={flexWidthClass}>
        <View className="img-view">
          {date.state=="Ready" && <Image className="myPic-image-ready" src={date.avatar_url=="null"?logo:date.avatar_url} /> }
          {date.state!="Ready" && <Image className="myPic-image" src={date.avatar_url=="null"?logo:date.avatar_url} /> }
          {date.state=="Ready" && <Icon type="roundcheck" size="25px" color="#a8f55fe7" />}
          <View className="nick-name">{date.nick_name}</View> 
        </View>
         
        {/* <View>{date.state}</View>   */}
      </View>
    );
  });

  return (
      <View className="myCard">
        {myPicImage}
      </View>
  );
}

export default () => {
  

  const MyCardAndPics = userProductInfo.map((date) => {
    return (
      <MyCardAndPic
        key={date.title}
        title={date.title}
        arrayImage={date.arrayImage}
        specialBottom={date.specialBottom}
      />
    );
  });
  return  <View className="first-card">{MyCardAndPics}</View>;
};
