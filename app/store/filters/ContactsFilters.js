/**
 * parser for graph
 * @param graph
 * @param id
 * @returns {[][]} friends, following, follower, blocking, blocker, other
 */
export const friendsGraphParser = (graph, id, includeFriend = true) => {
  let following = [],
    follower = [],
    blocking = [],
    blocker = [],
    other = [],
    friends = [];
  Object.keys(graph).forEach(key => {
    if (key === id) {
      Object.keys(graph[key]).forEach(subKey => {
        if (subKey !== id) {
          const value = graph[key][subKey];
          value > 0
            ? following.push(subKey)
            : value === -1
            ? blocking.push(subKey)
            : other.push(subKey);
        }
      });
    } else {
      const value = graph[key][id];
      if (value) {
        value > 0
          ? follower.push(key)
          : value === -1
          ? blocker.push(key)
          : other.push(key);
      }
    }
  });
  friends = following.filter(v => follower.includes(v));
  // kick out friend element(s)
  if (!includeFriend) {
    following = following.filter(v => !friends.includes(v));
    follower = follower.filter(v => !friends.includes(v));
  }
  return [friends, following, follower, blocking, blocker, other];
};

export const mutualFriend = (fA, fB) => fA.filter(v => fB.includes(v));

export function searchGraphById(graph, kw) {
  return Object.keys(graph).filter(key => key.includes(kw));
}

export function searchInfoByNick(info, kw) {
  return Object.keys(info).filter(
    key => info[key].name && info[key].name.includes(kw),
  );
}
