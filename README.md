> ### install RN dev env
>> brew install nvm  
>> nvm install 16.17.1  
>> _[config Android only]_  
>> nvm use 16.17.1  
>> nvm alias default 16.17.1  
>> _or_  
>>  ln -s ~/.nvm/versions/node/v16.17.1/bin/node /usr/local/bin/node   
>>  ln -s ~/.nvm/versions/node/v16.17.1/bin/npm /usr/local/bin/npm   
> 
>> brew install watchman  
>> brew tap homebrew/cask-versions  
>> brew install --cask zulu11 flipper

> ### install android sdk
> #### add export to zshrc
>> export ANDROID_HOME=$HOME/Library/Android/sdk  
>> export PATH=$PATH:$ANDROID_HOME/emulator   
>> export PATH=$PATH:$ANDROID_HOME/tools  
>> export PATH=$PATH:$ANDROID_HOME/tools/bin  
>> export PATH=$PATH:$ANDROID_HOME/platform-tools  
>> export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
> #### install `command-line tools` first
>> sdkmanager 'build-tools;28.0.3' 'cmake;3.6.4111459' 'ndk;21.4.7075529' 'platforms;android-29' 'tools'

> ### Nodejs-mobile compile Env
> #### _ios:_ install compile tools
>> brew install coreutils libtool autoconf automake
>
> #### _android:_ add Env variable
>> `# nodejs-mobile-react-native for android`  
>> _[intel chips]_   
>> export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/21.4.7075529  
>> _[silicon chips]_   
>> export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/24.0.8215888
> 
> #### install python 2.7
>> brew install pyenv
>> pyenv install 2.7.18  
>> pyenv global 2.7.18  
>> _or_  
>> ln -s ~/.pyenv/versions/2.7.18/bin/python2.7  /usr/local/bin/python  
>> ln -s ~/.pyenv/versions/2.7.18/bin/python2.7  /usr/local/bin/python2

> ### (patched) ~~resolve port conflict~~
> #### change port on serve-blob
>> - add `serveBlobs: {
     port: 26834
     }`, to [`ssb.ts:46`](backend/ssb.ts)
>
>> - fix
     `26835 to 26834` at [`port.js:1`](node_modules/ssb-serve-blobs/port.js)
> ### keep 8081 debug port on android
> `adb reverse tcp:8081 tcp:8081`
 
> ### pod repos 
>> https://mirrors.tuna.tsinghua.edu.cn/help/CocoaPods/
> ### private registry localized 
>> git clone git@github.com:MetaLife-Protocol/react-native-metalife-storage.git  
>> npm i react-native-metalife-storage --registry=https://github.com/MetaLife-Protocol/react-native-metalife-storage.git  
>> cd packages && git clone git@github.com:MetaLife-Protocol/react-native-photon.git && cd ..  
>> npm i react-native-photon --registry=https://github.com/MetaLife-Protocol/react-native-photon.git
