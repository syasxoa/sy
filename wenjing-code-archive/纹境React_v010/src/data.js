export const pages={home:'首页',explore:'纹样图录',detail:'纹样详情',interact:'趣味互动',gesture:'纹样互动空间',gestureActive:'摄像头预留状态',recognize:'看图辨认',match:'纹样配对',create:'纹样创作',aiUpload:'提取与补齐',aiResult:'结果对照',workbench:'自由创作工作台',pottery:'陶罐装饰',photo:'拍照与取景',account:'我的收藏',works:'我的作品',drafts:'我的草稿'};
export const modals={login:'登录账号',sms:'短信登录',register:'创建账号',recover:'找回密码',phone:'绑定手机',export:'保存创作图片',exportAI:'保存处理图片',exportPhoto:'保存陶罐照片',vip:'高清导出权益',exportHD:'高清导出体验',onboarding:'工作台工具入门',camera:'摄像头体验',gestureHelp:'鼠标操作说明',answer:'答案与图形观察',matchAnswer:'配对结果',aiError:'处理未完成'};
export const patterns=[
  ['莲花纹','花卉植物','从中心向外，观察花瓣的重复。'],['回纹','几何构成','沿折线观察连续回转的路径。'],
  ['云纹','自然景物','比较卷曲线条的方向与疏密。'],['宝相花纹','花卉植物','比较内外两圈的层次与瓣形。'],
  ['鱼纹','动物瑞兽','从轮廓与朝向辨认形态。'],['凤纹','动物瑞兽','观察弧线、展开与呼应关系。'],
  ['卷草纹','花卉植物','沿主线寻找枝叶的连续变化。'],['如意纹','吉祥器物','观察对称轮廓与转折。']
].map(([name,category,clue],id)=>({id,name,category,clue}));
