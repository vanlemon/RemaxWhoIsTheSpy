import React, { useState } from "react";
import { View, Label, Image, Text } from "remax/wechat";
import { TodoContext } from '@/app'
import {Button, Popup,Tag} from 'anna-remax-ui';
import logo from '@/assets/logo.jpg';

export default () => {
    const todo = React.useContext(TodoContext);
    var roomInfo = todo.roomInformation.roomInfo; // 用户信息需要实时更新的
    var tmp_images = roomInfo.player_list; // 得到用户nickName, avatar信息等
    const myPicImage = tmp_images.map((date) => { // 循环找到该用户对应的word信息
        if (date.open_id == todo.globalData.id || date.nick_name == todo.globalData.userInfo.nickName){
        // if (date.open_id == "000003"){
          return (
          <View key={date.open_id}>
            <View>{date.word}</View>
          </View>    
          );
      }
    }); 
    return(
        <View className="card rule-card">
            <View className="white-text">谁是卧底 . 游戏规则:</View>
            <View className="special-bottom">
              <View>本游戏为谁是卧底发牌器。房主点击页面的黄色提示按钮，可以提示答案。
              每一轮在场的每位玩家都要描述自己的词，描述完毕后大家投票指派卧底，票数最多的人出局。
              </View>
            </View>
        </View>
    ); 
};

