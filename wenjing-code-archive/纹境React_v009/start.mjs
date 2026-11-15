import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=fileURLToPath(new URL('./',import.meta.url));
const temp=fileURLToPath(new URL('../../03_工作文件/临时/react-v009/',import.meta.url));
fs.mkdirSync(temp,{recursive:true});
const child=spawn(process.execPath,[fileURLToPath(new URL('../ReactBits试验区/node_modules/vite/bin/vite.js',import.meta.url)),'--host','127.0.0.1','--port','5179','--strictPort','--open'],{cwd:root,env:{...process.env,TEMP:temp,TMP:temp,TMPDIR:temp},stdio:'inherit'});
child.on('error',error=>{console.error('预览启动失败：'+error.message);process.exitCode=1});
child.on('exit',code=>{process.exitCode=code??1});
