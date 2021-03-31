import * as React from 'react';
import './app.css';
import 'anna-remax-ui/dist/anna.css';
import 'anna-remax-ui/esm/button/style/css';
import { useAppEvent } from 'remax/macro';

export const TodoContext = React.createContext({});



const App = ({ children }) => { // 默认input

  const [globalData,setGlobalData]= React.useState({
    userInfo:null,
    id:null,
  });

  const [roomSetting, setRoomSetting] = React.useState(
    { spy_num:1,
      blank_num:0,
      total_num:3, // nums of rooms
    }
  );
  
  const [roomInformation, setRoomInfo] = React.useState(
    { roomId:"", // 这个ID并没有返回
      roomInfo:{
        begin_player: "",
        room_setting: {spy_num:1,blank_num:1,total_num:7},
        master_open_id:"000000", // string 房主的open_id
        player_list:[
          {open_id:"000000",nick_name:"user0",avatar_url:"null",state:"Ready",word:"word1",role:"Normal",number:0},
          {open_id:"000001",nick_name:"user1",avatar_url:"null",state:"Ready",word:"word2",role:"Spy",number:1},
          {open_id:"000002",nick_name:"user2",avatar_url:"null",state:"Ready",word:"",role:"Blank",number:2},
          {open_id:"000003",nick_name:"user3",avatar_url:"null",state:"Wait",word:"word1",role:"Normal",number:3},
          {open_id:"000004",nick_name:"user4",avatar_url:"null",state:"Ready",word:"word1",role:"Normal",number:4},
          {open_id:"000005",nick_name:"user5",avatar_url:"null",state:"Ready",word:"word1",role:"Normal",number:5},
        ], // player[] : open_id,nick_name,avatar_url, state, word, role, number
        state:"123", // enum[Open, Wait, Ready, Playing]
        word:{
          id:"01", // string
          normal:"word1", // string
          spy:"word2", // string
          blank:"", // string
        },
        word_cache:[],//此房间已经玩过的词汇列表

      }
      
    }
  );

  const [onGame, setOnGame] = React.useState(false); // 判断用户是否在游戏中，若在，则再次进入房间时，不回产生请求
  
  const [items, setItems] = React.useState( // 没用的参数，可以删
    { masteropen_id: "default userName", // the number of Room
      password:"default password", // password
      loginSuccess: false,
      roomID:0,
      playerList:null,
      state: null,
    }
  );

  return (
    <TodoContext.Provider
      value={{
        items,
        setItems,
        globalData,
        setGlobalData,
        roomSetting,
        setRoomSetting,
        roomInformation,
        setRoomInfo,
        onGame, 
        setOnGame
      }}
    >
      {children}
    </TodoContext.Provider>
 
  );
};

export default App;
