import {PostContent, Privatable} from 'ssb-typescript';
import Mentions from 'remark-ssb-mentions';

export function toVoteContent(ev) {
  return {
    type: 'vote',
    vote: {
      link: ev.msgKey,
      value: ev.value,
      expression: ev.reaction ?? 'Unlike',
    },
  };
}

export function toPostContent(text, contentWarning) {
  const content = {
    text,
    type: 'post',
    mentions: Mentions(text),
  };

  if (contentWarning) {
    content.contentWarning = contentWarning;
  }

  return content;
}

export function toReplyPostContent({text, root, fork, branch, contentWarning}) {
  const content = {
    text,
    type: 'post',
    root,
    mentions: Mentions(text),
  };
  if (branch) {
    content.branch = branch;
  }
  if (fork) {
    content.fork = fork;
  }
  if (contentWarning) {
    content.contentWarning = contentWarning;
  }
  return content;
}

export function toContactContent(
  contact,
  {following, blocking, name, blurhash},
) {
  const output = {
    type: 'contact',
    contact,
  };

  if (typeof following === 'boolean' && typeof blocking === 'boolean') {
    throw new Error('Cannot have both following and blocking');
  }

  if (typeof following === 'boolean') {
    output.following = following;
  } else if (typeof blocking === 'boolean') {
    output.blocking = blocking;
    if (name || blurhash) {
      output.about = {};
      if (name) {
        output.about.name = name;
      }
      if (blurhash) {
        output.about.blurhash = blurhash;
      }
    }
  } else {
    throw new Error('Invalid contact options');
  }

  return output;
}

export function toGatheringAttendContent(gatheringId, attendeeId, isAttending) {
  const attendee = isAttending
    ? {link: attendeeId}
    : {link: attendeeId, remove: true};
  return {
    type: 'about',
    about: gatheringId,
    attendee,
  };
}

export function toAboutContent(id, name, description, image) {
  const content = {
    type: 'about',
    about: id,
  };
  if (name) {
    content.name = name;
  }
  if (description) {
    content.description = description;
  }
  if (image) {
    content.image = image;
  }
  return content;
}
