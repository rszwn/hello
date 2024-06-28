import $ from 'jquery';
import '../../css/common/reset.css';
import '../../js/common/common.js';
import './pwa.js';
import '../../css/common/common.css';
import '../../font/iconfont.css';
import './index.less';
import imgBgSvg from '../../images/img/bg.svg';
import {
  queryURLParams,
  myOpen,
  _setData,
  _getData,
  throttle,
  debounce,
  _getTarget,
  imgjz,
  _mySlide,
  _progressBar,
  downloadFile,
  imgPreview,
  toLogin,
  longPress,
  isMobile,
  getTextImg,
  hdOnce,
  isBigScreen,
  getIn,
  getPathFilename,
  getFilePath,
  _getDataTem,
  _setDataTem,
  hdPath,
  myShuffle,
  deepClone,
  isLogin,
  isRoot,
} from '../../js/utils/utils.js';
import _d from '../../js/common/config';
import _msg from '../../js/plugins/message';
import realtime from '../../js/plugins/realtime';
import loadingPage from '../../js/plugins/loading/index.js';
import { reqChatNews, reqChatReadMsg } from '../../api/chat.js';
import { reqTodoList } from '../../api/todo.js';
import { reqUserInfo, reqUserUpdateToken } from '../../api/user.js';
import { reqBgRandom, reqChangeBg } from '../../api/bg.js';
// 时钟
import './clock.js';
import {
  hideUserInfo,
  renderUserinfo,
  settingMenu,
  showBmk,
  showFileManage,
  showHistory,
  showNote,
  showNotepad,
  showPicture,
  showRightMenu,
  showTrash,
  updateRightBoxUsername,
  updateTipsFlag,
} from './rightSetting/index.js';
import {
  closeTodoBox,
  getTodoList,
  setTodoUndone,
  todoMsg,
} from './todo/index.js';
import { delBg, renderBgList, showBgBox } from './bg/index.js';
import { getBookMarkList, showAside, toggleAside } from './aside/index.js';
import {
  getHomeBmList,
  searchBoxIsHide,
  showSearchBox,
} from './searchBox/index.js';
import {
  chatMessageNotification,
  chatRoomWrapIsHide,
  chatimgLoad,
  closeChatRoom,
  renderMsgList,
  setCurChatAccount,
  showChatRoom,
} from './chat/index.js';
import './timer.js';
import { closeAllIframe, hideAllIframe } from './iframe.js';
import {
  closeMusicPlayer,
  setMediaVolume,
  getSongList,
  hideMusicPlayBox,
  musicPlayerIsHide,
  remoteVol,
  setCurPlayingList,
  setPlayVolume,
  showMusicPlayerBox,
  updateSongInfo,
} from './player/index.js';
import {
  changePlayState,
  getPlaytimer,
  hdSongInfo,
  initMusicLrc,
  musicPlay,
  pauseSong,
  playNextSong,
  playPrevSong,
  playerRemoteBtnState,
  setPlayingSongInfo,
  setRemotePlayState,
  setSongCurrentTime,
  setSongPlayMode,
  songIspaused,
  switchPlayMode,
  updatePlayingSongTotalTime,
  updateSongProgress,
} from './player/lrc.js';
import {
  closeEditLrcBox,
  closeMvBox,
  musicMvIsHide,
  mvIspaused,
  pauseVideo,
  playVideo,
  toggleMiniLrc,
} from './player/widget.js';
import {
  playingListHighlight,
  renderPlayingList,
  setPlayingList,
} from './player/playlist.js';
import {
  reqPlayerGetLastPlay,
  reqPlayerGetPlayList,
} from '../../api/player.js';
import rMenu from '../../js/plugins/rightMenu/index.js';
import {
  closeCountBox,
  countMsg,
  getCountList,
  setExpireCount,
} from './count_down/index.js';
import { reqCountList } from '../../api/count.js';
const $pageBg = $('.page_bg'),
  $mainid = $('#main'),
  $document = $(document),
  $userLogoBtn = $('.user_logo_btn'),
  $rightMenuMask = $('.right_menu_mask'),
  $rightBox = $rightMenuMask.find('.right_box'),
  $chatRoomWrap = $('.chat_room_wrap'),
  $chatHeadBtns = $chatRoomWrap.find('.c_head_btns'),
  $chatListBox = $chatRoomWrap.find('.chat_list_box'),
  $showChatRoomBtn = $('.show_chat_room_btn'),
  $randomChangeBgBtn = $('.random_change_bg_btn'),
  $searchBoxBtn = $('.search_box_btn');
let curFilterBg = _getData('filterbg'),
  gentlemanLockPd = _getData('gentlemanLockPd');
let userInfo = {};
// 设置用户数据
export function setUserInfo(val) {
  if (val === undefined) {
    return userInfo;
  }
  userInfo = val;
}
// 判断登录
if (!isLogin()) {
  toLogin();
} else {
  // 君子锁
  ~(function getGentlemanLock() {
    if (gentlemanLockPd) {
      const pd = _getDataTem('gentlemanLockPd') || prompt('请输入君子锁密码：');
      if (pd !== gentlemanLockPd) {
        getGentlemanLock();
      } else {
        _setDataTem('gentlemanLockPd', pd);
      }
    }
  })();
}
// 背景模糊
function bgFilter(value) {
  curFilterBg = value;
  if (value <= 0) {
    $pageBg.removeClass('mh');
  } else {
    $pageBg.addClass('mh');
  }
  $pageBg.css({
    filter: `blur(${value}px)`,
  });
  _setData('filterbg', value);
}
bgFilter(curFilterBg);
// 调节模糊度
export function resizeBgFilter(e) {
  _progressBar(
    e,
    curFilterBg / 100,
    throttle(function (per) {
      bgFilter(parseInt(per * 100));
    }, 500)
  );
}
export function setMainTransform(val) {
  if (val) {
    $mainid.css({
      transform: `translateX(${val}px)`,
    });
    return;
  }
  $mainid.css({
    transform: 'none',
  });
}
// 风车
const windmill = {
  start() {
    $randomChangeBgBtn.addClass('open').find('img').addClass('open');
  },
  stop() {
    $randomChangeBgBtn.removeClass('open').find('img').removeClass('open');
  },
};
// 设置壁纸
export function setBg(obj, cb) {
  windmill.start();
  const url = getFilePath(`/bg/${obj.url}`);
  cb && cb();
  imgjz(
    url,
    () => {
      windmill.stop();
      reqChangeBg({ type: obj.type, id: obj.id })
        .then((result) => {
          if (parseInt(result.code) === 0) {
            _msg.success(result.codeText);
            updateUserInfo();
            return;
          }
        })
        .catch(() => {});
    },
    () => {
      _msg.error('壁纸加载失败');
      windmill.stop();
    }
  );
}
// 随机切换背景
function changeBg() {
  const type = isBigScreen() ? 'bg' : 'bgxs';
  windmill.start();
  reqBgRandom({ type })
    .then((result) => {
      if (parseInt(result.code) === 0) {
        setBg(result.data);
        return;
      }
      windmill.stop();
    })
    .catch(() => {
      windmill.stop();
    });
}
function timeMsg() {
  const hour = new Date().getHours();
  let msg = '';
  let icon = '';
  if (hour < 6) {
    msg = '晚上好丫';
    icon = 'iconfont icon-icon_yejian-yueliang';
  } else if (hour < 11) {
    msg = '早上好丫';
    icon = 'iconfont icon-a-056_richu';
  } else if (hour < 13) {
    msg = '中午好丫';
    icon = 'iconfont icon-taiyangtianqi';
  } else if (hour < 17) {
    msg = '下午好丫';
    icon = 'iconfont icon-xiawucha';
  } else if (hour < 19) {
    msg = '傍晚好丫';
    icon = 'iconfont icon-yewan-bangwan';
  } else {
    msg = '晚上好丫';
    icon = 'iconfont icon-icon_yejian-yueliang';
  }
  return { msg, icon };
}
// 关闭页面加载
_d.isHome = true;
function closeLoading() {
  loadingPage.end();
  $searchBoxBtn.stop().slideDown(_d.speed, () => {
    const { msg, icon } = timeMsg();
    _msg.msg({ message: `${msg} ${userInfo.username}`, icon });
    // 查看消息
    reqChatNews()
      .then((result) => {
        if (parseInt(result.code) === 0) {
          const { group, friend } = result.data;
          if (group + friend > 0) {
            $showChatRoomBtn.attr(
              'class',
              'show_chat_room_btn run iconfont icon-xiaoxi'
            );
            _msg.msg(
              {
                message: '您有新的消息，请注意查收',
                type: 'warning',
                icon: 'iconfont icon-new1',
                duration: 8000,
              },
              (type) => {
                if (type == 'click') {
                  showChatRoom();
                }
              },
              1
            );
          } else {
            $showChatRoomBtn.attr(
              'class',
              'show_chat_room_btn iconfont icon-liaotian'
            );
          }
        }
      })
      .catch(() => {});
    // 查看是否有未完成事项
    reqTodoList().then((res) => {
      if (res.code == 0) {
        setTodoUndone(res.data.undoneCount);
        todoMsg();
      }
    });
    reqCountList().then((res) => {
      if (res.code == 0) {
        setExpireCount(res.data.expireCount);
        countMsg();
      }
    });
  });
  $pageBg.removeClass('sce');
}
// 初始化
const onceInit = hdOnce(function () {
  // 设置默认聊天页为文件传输
  setCurChatAccount(userInfo.account);
  if (!isRoot()) {
    $rightBox.find('.admin').remove();
  }
  const urlParmes = queryURLParams(myOpen());
  // 立即打开指定聊天页
  if (urlParmes.c) {
    if (urlParmes.c === userInfo.account) {
      myOpen('/');
      return;
    }
    setCurChatAccount(urlParmes.c);
    showChatRoom();
  }
  // 打开播放器
  if (urlParmes.p) {
    showMusicPlayerBox();
  }
  // 没有壁纸随机设置壁纸
  const isBig = isBigScreen();
  const { bg, bgxs } = userInfo;
  if ((isBig && !bg) || (!isBig && !bgxs)) {
    changeBg();
  }
});
// 更新用户信息
export function updateUserInfo(cb) {
  reqUserInfo()
    .then((result) => {
      if (parseInt(result.code) === 0) {
        userInfo = result.data;
        onceInit();
        let { logo, username, account, bg, bgxs, bgObj, email } = userInfo;
        const uname = _getData('username'); // 用户名
        const loginName = _getData('loginName'); // 登录名
        // 用户名不同更新token
        if (uname !== username) {
          reqUserUpdateToken()
            .then((res) => {
              if (res.code == 0) {
                _setData('username', username);
              }
            })
            .catch(() => {});
          if (loginName !== account && loginName !== email) {
            _setData('loginName', username);
          }
        }
        // 标题
        _d.title = `Hello ${username}`;
        if (songIspaused()) {
          document.title = _d.title;
        }
        // 更新右边设置用户名
        updateRightBoxUsername(username);
        // 更新头像
        logo = logo
          ? hdPath(`/api/logo/${account}/${logo}`)
          : getTextImg(username);
        imgjz(
          logo,
          () => {
            $userLogoBtn.css('background-image', `url(${logo})`);
          },
          () => {
            $userLogoBtn.css(
              'background-image',
              `url(${getTextImg(username)})`
            );
          }
        );
        // 没有壁纸使用默认
        const isBig = isBigScreen();
        if ((isBig && !bg) || (!isBig && !bgxs)) {
          $pageBg.css('background-image', `url(${imgBgSvg})`);
          cb && cb();
          return;
        }
        // 更新壁纸
        let bgUrl = '';
        if (isBig) {
          bgUrl = getFilePath(`/bg/${getIn(bgObj, [bg, 'url']) || ''}`);
        } else {
          bgUrl = getFilePath(`/bg/${getIn(bgObj, [bgxs, 'url']) || ''}`);
        }
        imgjz(
          bgUrl,
          () => {
            $pageBg.css('background-image', `url(${bgUrl})`);
            cb && cb();
          },
          () => {
            $pageBg.css('background-image', `url(${imgBgSvg})`);
            cb && cb();
          }
        );
        // 更新个人信息
        renderUserinfo();
      }
    })
    .catch(() => {});
}
updateUserInfo(closeLoading);
// 右侧菜单
$userLogoBtn.on('click', showRightMenu);
// 右键设置
$document.on('contextmenu', function (e) {
  if (_getTarget(this, e, '#main', 1)) {
    e.preventDefault();
    if (isMobile()) return;
    settingMenu(e, 1);
  }
});
// 长按设置
longPress(document, '#main', function (e) {
  const ev = e.changedTouches[0];
  if (_getTarget(this, ev, '#main', 1)) {
    settingMenu(ev, 1);
  }
});
// 主页手势
_mySlide({
  el: '#main',
  up(e) {
    if (!_getTarget(this, e, '#main', 1)) return;
    // 打开播放器
    showMusicPlayerBox();
  },
  down(e) {
    if (!_getTarget(this, e, '#main', 1)) return;
    // 打开壁纸库
    showBgBox();
  },
  right(e) {
    if (!_getTarget(this, e, '#main', 1)) return;
    // 左侧书签
    showAside();
  },
  left(e) {
    if (!_getTarget(this, e, '#main', 1)) return;
    // 右侧设置
    showRightMenu();
  },
});
// 关闭所有窗口
export function closeAllwindow(all) {
  closeAllIframe();
  if (all) {
    closeMusicPlayer();
    closeChatRoom();
    closeTodoBox();
    closeCountBox();
    hideUserInfo();
  }
}
// 隐藏所有窗口
export function hideAllwindow(all) {
  hideAllIframe();
  if (all) {
    hideMusicPlayBox();
    closeChatRoom();
    closeTodoBox();
    closeCountBox();
    closeEditLrcBox();
    closeMvBox();
    hideUserInfo();
  }
}
$randomChangeBgBtn
  .on(
    'click',
    throttle(function () {
      changeBg();
    }, 2000)
  )
  .on('contextmenu', function (e) {
    e.preventDefault();
    if (!userInfo.account) return;
    const { bg, bgxs, bgObj } = userInfo;
    const obj = isBigScreen() ? getIn(bgObj, [bg]) : getIn(bgObj, [bgxs]);
    if (!obj || isMobile()) return;
    hdHomeBgBtn(e, obj);
  });
longPress($randomChangeBgBtn[0], function (e) {
  if (!userInfo) return;
  const { bg, bgxs, bgObj } = userInfo;
  let obj = isBigScreen() ? getIn(bgObj, [bg]) : getIn(bgObj, [bgxs]);
  if (!obj) return;
  let ev = e.changedTouches[0];
  hdHomeBgBtn(ev, obj);
});
// 壁纸菜单
function hdHomeBgBtn(e, obj) {
  let data = [
    {
      id: '2',
      text: '查看',
      beforeIcon: 'iconfont icon-yanjing_xianshi_o',
    },
    {
      id: '3',
      text: '下载壁纸',
      beforeIcon: 'iconfont icon-xiazai1',
    },
  ];
  if (isRoot()) {
    data.push({
      id: '1',
      text: '删除壁纸',
      beforeIcon: 'iconfont icon-shanchu',
    });
  }
  rMenu.selectMenu(
    e,
    data,
    ({ e, close, id }) => {
      if (id == '1') {
        delBg(e, [obj.id], () => {
          close();
          changeBg();
        });
      } else if (id == '2') {
        close();
        imgPreview([
          {
            u1: getFilePath(`/bg/${obj.url}`),
            u2: getFilePath(`/bg/${obj.url}`, 1),
          },
        ]);
      } else if (id == '3') {
        close();
        downloadFile(
          getFilePath(`/bg/${obj.url}`),
          getPathFilename(obj.url)[0]
        );
      }
    },
    '壁纸选项'
  );
}
// 快捷键
function keyboard(e) {
  const key = e.key,
    ctrl = e.ctrlKey || e.metaKey;
  const isFocus = $('input').is(':focus') || $('textarea').is(':focus');
  if (!isFocus) {
    if (ctrl && key === 'ArrowLeft') playPrevSong();
    if (ctrl && key === 'ArrowRight') playNextSong();
    //音量+
    if (ctrl && key === 'ArrowUp') {
      e.preventDefault();
      let vol = setMediaVolume();
      vol += 0.1;
      if (vol >= 1) {
        vol = 1;
      }
      setMediaVolume(vol);
      setPlayVolume();
      if (setRemotePlayState()) {
        remoteVol();
      }
      _msg.msg({
        message: parseInt(vol * 100) + '%',
        icon: `iconfont ${
          vol <= 0 ? 'icon-24gl-volumeCross' : 'icon-24gl-volumeHigh'
        }`,
      });
    }
    //音量-
    if (ctrl && key === 'ArrowDown') {
      e.preventDefault();
      let vol = setMediaVolume();
      vol -= 0.1;
      if (vol <= 0) {
        vol = 0;
      }
      setMediaVolume(vol);
      setPlayVolume();
      if (setRemotePlayState()) {
        remoteVol();
      }
      _msg.msg({
        message: parseInt(vol * 100) + '%',
        icon: `iconfont ${
          vol <= 0 ? 'icon-24gl-volumeCross' : 'icon-24gl-volumeHigh'
        }`,
      });
    }
    //暂停/播放
    if (key === ' ') {
      if (musicMvIsHide()) {
        changePlayState();
      } else {
        if (mvIspaused()) {
          playVideo();
        } else {
          pauseVideo();
        }
      }
    }
    // 迷你切换
    if (key === 'm') {
      if (musicPlayerIsHide()) {
        showMusicPlayerBox();
      } else {
        hideMusicPlayBox();
      }
    }
    // 歌词
    if (key === 'l') {
      toggleMiniLrc();
    }
    // 书签
    if (key === 's' && !ctrl) {
      if (searchBoxIsHide()) {
        showSearchBox();
      }
    }
    // 跳到历史记录
    if (key === 'h') {
      showHistory();
    }
    // 书签管理
    if (key === 'b') {
      showBmk();
    }
    // 文件管理
    if (key === 'f') {
      showFileManage();
    }
    // 回收站
    if (key === 't') {
      showTrash();
    }
    // 跳到笔记
    if (key === 'n') {
      showNote();
    }
    // 打开便条
    if (key === 'e') {
      showNotepad();
    }
    // 打开图床
    if (key === 'p') {
      showPicture();
    }
    // 侧边栏
    if (key === 'a' && !ctrl) {
      toggleAside();
    }
    // 播放模式
    if (key === 'r') {
      switchPlayMode();
    }
    // 停止歌曲并关闭所有音乐窗口
    if (key === 'c' && !ctrl) {
      closeMusicPlayer();
    }
  }
}
document.addEventListener('keydown', keyboard);
window.addEventListener(
  'resize',
  debounce(() => {
    updateUserInfo();
  }, 500)
);
// 处理聊天数据
function hdChatType(resData) {
  const { flag, from, to, tt, msgData } = resData;
  const chatAccount = setCurChatAccount(); //当前聊天框
  // 新消息处理
  if (flag === 'addmsg') {
    if (from.account === userInfo.account && from.account == to) {
      // 忽略自己给自己的消息通知
    } else if (from.account !== userInfo.account) {
      chatMessageNotification(
        from.des || from.username,
        msgData.data,
        from.account,
        to,
        from.logo
      );
    }
    // 聊天框是隐藏
    if (chatRoomWrapIsHide()) {
      if (from.account !== userInfo.account) {
        // 忽略自己发送的
        $showChatRoomBtn.attr(
          'class',
          'show_chat_room_btn run iconfont icon-xiaoxi'
        );
      }
      // 聊天框显示
    } else {
      if (
        (chatAccount === from.account && to !== 'chang') ||
        (chatAccount === 'chang' && to === 'chang') ||
        (from.account === userInfo.account && chatAccount === to)
      ) {
        // 消息是当前聊天框
        const acc =
          to === 'chang'
            ? 'chang'
            : from.account === userInfo.account && chatAccount === to
            ? to
            : from.account;
        const flag = $chatListBox.find('.chat_item').last().attr('data-id');
        const word = $chatHeadBtns.find('.search_msg_inp input').val().trim();
        if (word.length > 100) {
          _msg.error('搜索内容过长');
          return;
        }
        reqChatReadMsg({
          type: 2,
          acc,
          flag,
          word,
        })
          .then((result) => {
            if (parseInt(result.code) === 0) {
              if (chatRoomWrapIsHide()) return;
              const data = result.data;
              const str = renderMsgList(data, 1);
              const cH = $chatListBox[0].clientHeight;
              const toBottom =
                $chatListBox[0].scrollHeight - $chatListBox[0].scrollTop - cH <
                cH;
              // 新增内容
              $chatListBox.find('.chat_list').append(str);
              if (toBottom) {
                $chatListBox.stop().animate(
                  {
                    scrollTop: $chatListBox[0].scrollHeight,
                  },
                  1000
                );
              }
              chatimgLoad();
            }
          })
          .catch(() => {});
      } else {
        //新消息不是是当前聊天框
        if (from.account !== userInfo.account) {
          if (chatAccount === 'chang') {
            $chatHeadBtns.find('.c_msg_alert').stop().fadeIn(_d.speed);
          } else {
            if (to === 'chang') {
              $chatHeadBtns.find('.c_home_msg_alert').stop().fadeIn(_d.speed);
            } else {
              $chatHeadBtns.find('.c_msg_alert').stop().fadeIn(_d.speed);
            }
          }
        }
      }
    }
    // 撤回消息
  } else if (flag === 'del') {
    if (from.account === userInfo.account && from.account == to) {
    } else if (from.account !== userInfo.account) {
      chatMessageNotification(
        from.des || from.username,
        '撤回消息',
        from.account,
        to,
        from.logo
      );
    }
    if (!chatRoomWrapIsHide()) {
      if (
        (chatAccount === from.account && to !== 'chang') ||
        (chatAccount === 'chang' && to === 'chang') ||
        (from.account === userInfo.account && chatAccount === to)
      ) {
        const $chatItem = $chatListBox.find(`[data-id=${tt}]`);
        if ($chatItem.length > 0) {
          $chatItem.stop().slideUp(_d.speed, () => {
            const $prev = $chatItem.prev();
            if ($prev.hasClass('chat_time')) {
              $prev.remove();
            }
            $chatItem.remove();
          });
        }
      }
    }
    //清空聊天框
  } else if (flag === 'clear') {
    if (from.account === userInfo.account && from.account == to) {
    } else if (from.account !== userInfo.account) {
      chatMessageNotification(
        from.des || from.username,
        '清空聊天记录',
        from.account,
        to,
        from.logo
      );
    }
    if (!chatRoomWrapIsHide()) {
      if (
        (chatAccount === from.account && to !== 'chang') ||
        (chatAccount === 'chang' && to === 'chang') ||
        (from.account === userInfo.account && chatAccount === to)
      ) {
        $chatListBox.find('.chat_list').html('');
      }
    }
  }
}
// 处理远程播放
function hdRemotePlayType(resData) {
  const { state, obj } = resData;
  setRemotePlayState(false);
  playerRemoteBtnState();
  if (state == 'y') {
    showMusicPlayerBox();
    if (setSongPlayMode() === 'random') {
      setCurPlayingList(myShuffle(deepClone(setPlayingList())));
    }
    musicPlay(obj);
  } else if (state == 'n') {
    initMusicLrc();
    pauseSong();
  }
}
// 数据同步更新
function hdUpdatedataType(resData) {
  const { flag } = resData;
  //数据同步更新
  if (flag === 'music') {
    getSongList();
  } else if (flag === 'bookmark') {
    getBookMarkList();
    getHomeBmList();
  } else if (flag === 'userinfo') {
    updateUserInfo();
  } else if (flag === 'playinglist') {
    reqPlayerGetPlayList()
      .then((result) => {
        if (parseInt(result.code) === 0) {
          setPlayingList(result.data);
          setCurPlayingList(
            setSongPlayMode() === 'random'
              ? myShuffle(deepClone(setPlayingList()))
              : deepClone(setPlayingList())
          );
          renderPlayingList();
          playingListHighlight();
        }
      }, true)
      .catch(() => {});
  } else if (flag === 'musicinfo') {
    if (!musicPlayerIsHide()) {
      if (songIspaused()) {
        reqPlayerGetLastPlay()
          .then((result) => {
            if (parseInt(result.code) === 0) {
              const _musicinfo = result.data;
              const { currentTime = 0, duration = 0, lastplay } = _musicinfo;
              if (!lastplay || (setRemotePlayState() && getPlaytimer())) return;
              setPlayingSongInfo(hdSongInfo(lastplay));
              updateSongInfo();
              setSongCurrentTime(parseFloat(currentTime) || 0);
              updateSongProgress();
              updatePlayingSongTotalTime(parseFloat(duration) || 0);
            }
          })
          .catch(() => {});
      }
    }
  } else if (flag === 'todolist') {
    getTodoList();
  } else if (flag === 'countlist') {
    getCountList();
  } else if (flag === 'bg') {
    renderBgList();
  } else if (flag === 'tips') {
    updateTipsFlag();
  }
}
//同步数据
realtime.read((res) => {
  const { type, data } = res;
  //处理聊天指令
  if (type === 'chat') {
    hdChatType(data);
  } else if (type === 'updatedata') {
    hdUpdatedataType(data);
  } else if (type == 'play') {
    hdRemotePlayType(data);
  } else if (type == 'vol') {
    const { value } = data;
    setMediaVolume(value);
    setPlayVolume();
    _msg.msg({
      message: parseInt(value * 100) + '%',
      icon: `iconfont ${
        value <= 0 ? 'icon-24gl-volumeCross' : 'icon-24gl-volumeHigh'
      }`,
    });
  } else if (type == 'progress') {
    const { value } = data;
    setSongCurrentTime(setPlayingSongInfo().duration * value);
  } else if (type == 'playmode') {
    const { state } = data;
    setSongPlayMode(state);
    switchPlayMode();
  }
});
