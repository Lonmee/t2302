## For REPL running:
1. `node`
2. `require('./test/index')`

then you can use 'ssb(global.ssb)' to test operations;

### rpc call:  
> **follow:**  
>> `ssb.friends.follow('@pj9nDZy0IGPXMvEAwrmb0caM5aV4NWSu1rOU4dIRrMk=.ed25519', {state:true}, console.log)`  
> 
> **post:**  
>> ***post:***
>>> `ssb.publish({type: 'post', text:'content'}, console.log)`  
>>
>> ***about:***  
>>> `ssb.publish({type: 'about', about: ssb.id, name:'backend-standalone', description:'dev\'s', image:'', avatar:''}, console.log)`
> 
> **invite:**
>> ***pub:***
>>> `ssb.invite.accept('110.41.135.27:8008:@8p3pnr4zESotFXWFjLPFb8Lc18DJ4NOlUoJ4iREZjag=.ed25519~zWpvm/Psj4set31BdThEMZQINHgIOp5NFmLi4bLR+0c=', console.log)`
>>
>> ***room:***
>>> `ssb.conn.remember('net:110.41.150.47:8008~shs:txCEJ1+BWW37gZKX7b2B8GcbrZm9bwDbeRV/VkZNVwg=', {type: 'room'}, console.log)`
> 
> **read:**
>> ***graph:***  
>>> `ssb.friends.graph(console.log)`  
>>
>> ***peers:***  
>>> `ssb.conn.peers()(null,console.log)`  
>>
>> ***stagedPeers:***  
>>> `ssb.conn.stagedPeers()(null,console.log)`
