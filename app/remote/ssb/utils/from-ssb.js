import Ref from 'ssb-ref';
import blobIdToUrl from 'ssb-serve-blobs/id-to-url';

export function displayName(name, id) {
  if (!name) {
    return shortFeedId(id);
  } else {
    return name;
  }
}

function shortFeedId(feedId) {
  if (!feedId) {
    return '?';
  }
  return feedId.slice(0, 11) + '\u2026';
}

export function imageToImageUrl(image) {
  if (!image) {
    return undefined;
  } else {
    return blobIdToUrl(image);
  }
}

export function getPostText(msg) {
  let text = msg.value.content.text || '';
  if (msg.value.content.channel) {
    text = `#${msg.value.content.channel}` + '\n\n' + text;
  }
  return text;
}

const THUMBS_UP_UNICODE = '\ud83d\udc4d';
const DIG_UNICODE = '\u270c\ufe0f';
const HEART_UNICODE = '\u2764\ufe0f';

export function voteExpressionToReaction(expression) {
  const lowCase = expression.toLowerCase();
  if (lowCase === 'like') {
    return THUMBS_UP_UNICODE;
  }
  if (lowCase === 'yup') {
    return THUMBS_UP_UNICODE;
  }
  if (lowCase === 'heart') {
    return HEART_UNICODE;
  }
  if (lowCase === 'dig') {
    return DIG_UNICODE;
  }
  if (expression.codePointAt(0) === 0x270c) {
    return DIG_UNICODE;
  }
  if (expression) {
    return expression;
  }
  return THUMBS_UP_UNICODE;
}

export function inferContactEvent(msg) {
  const content = msg.value.content;
  // we're not sure what .flagged means
  const msgBlocking = content.flagged || content.blocking;
  const msgFollowing = content.following;

  // The contact msg is nonstandard or invalid
  if (
    (msgBlocking === undefined && msgFollowing === undefined) ||
    (msgBlocking === true && msgFollowing === true) ||
    !Ref.isFeedId(content.contact)
  ) {
    return null;
  }

  return msgFollowing === true
    ? 'followed'
    : msgBlocking === undefined && msgFollowing === false
    ? 'unfollowed'
    : msgBlocking === true
    ? 'blocked'
    : 'unblocked';
}
