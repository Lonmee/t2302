export const findRootKey = (feedId, msgs) => {
  for (const key in msgs) {
    if (
      msgs[key].messages.length &&
      msgs[key].messages[0].value.content.recps.includes(feedId)
    ) {
      return msgs[key].messages[0].key;
    }
  }
  return '';
};

export const timeForwardSorter = (a, b) =>
  a.value.timestamp - b.value.timestamp;

export const timeBackwardSorter = (a, b) =>
  b.value.timestamp - a.value.timestamp;

export const regExp = {
  imageLink: RegExp(/\!\[[\s\S]*?\]\([\s\S]*?\)/g),
  peerLink: RegExp(/@[a-zA-Z0-9_\-/+]{43}=.ed25519/g),
  feedLink: RegExp(/%[a-zA-Z0-9_\-/+]{43}=.sha256/g),
  peerAndaFeed: RegExp(
    /(@[a-zA-Z0-9_\-/+]{43}=.ed25519)|(%[a-zA-Z0-9_\-/+]{43}=.sha256)/g,
  ),
  urlLink: RegExp(
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g,
  ),
  content: RegExp(/^[\s\S]*.*[^\s][\s\S]*$/),
};

// .replace(/(\*\*|__)(.*?)(\*\*|__)/g,'')                     //全局匹配内粗体
// .replace(/\!\[[\s\S]*?\]\([\s\S]*?\)/g,'')                  //全局匹配图片
// .replace(/\[[\s\S]*?\]\([\s\S]*?\)/g,'')                    //全局匹配连接
// .replace(/<\/?.+?\/?>/g,'')                                 //全局匹配内html标签
// .replace(/(\*)(.*?)(\*)/g,'')                               //全局匹配内联代码块
// .replace(/`{1,2}[^`](.*?)`{1,2}/g,'')                       //全局匹配内联代码块
// .replace(/```([\s\S]*?)```[\s]*/g,'')                       //全局匹配代码块
// .replace(/\~\~(.*?)\~\~/g,'')                               //全局匹配删除线
// .replace(/[\s]*[-\*\+]+(.*)/g,'')                           //全局匹配无序列表
// .replace(/[\s]*[0-9]+\.(.*)/g,'')                           //全局匹配有序列表
// .replace(/(#+)(.*)/g,'')                                    //全局匹配标题
// .replace(/(>+)(.*)/g,'')                                    //全局匹配摘要
// .replace(/\r\n/g,"")                                        //全局匹配换行
// .replace(/\n/g,"")                                          //全局匹配换行
// .replace(/\s/g,"")                                          //全局匹配空字符;

export function searchPublicMsgByPostId(msg, kw) {
  return msg.filter(({key}) => key.includes(kw));
}

export function searchPrivateMsgByContentAndRecp(msg, kw) {
  return Object.keys(msg).filter(key =>
    msg[key].some(
      v =>
        v.value.content.text.includes(kw) ||
        v.value.content.recps.some(r => r.includes(kw)),
    ),
  );
}

export function applyFilters(str) {
  str = str.toString().replace(regExp.imageLink, '').trim();
  return str.toString().split(regExp.peerAndaFeed);
}

export function findFromComment(cDic, key) {
  const rArr = Object.values(cDic);
  for (const rArrElement of rArr) {
    for (const rArrElementElement of rArrElement) {
      if (rArrElementElement.key === key) {
        return rArrElementElement;
      }
    }
  }
}
