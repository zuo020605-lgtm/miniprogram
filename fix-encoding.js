/**
 * 校园跑腿项目 - 批量乱码修复脚本
 */
const fs = require('fs');
const path = require('path');

const PROJECT_PATH = 'C:\\\\Users\\\\ROG\\\\Documents\\\\HBuilderProjects\\\\校园跑腿';

// 乱码映射表
const CHAR_MAP = {
  '寰呮帴鍗�': '待接取',
  '杩涜涓�': '进行中', 
  '宸插畬鎴�': '已完成',
  '鏍″洯璺戣吙': '校园跑腿',
  '蹇€掍唬鍙�': '快递代取',
  '鑷畾涔�': '自定义',
  '瀵艰埅': '导航',
  '璁㈠崟': '订单',
  '鐘舵€�': '状态',
  '閫夐」鍗�': '选项卡',
  '楠ㄦ灦灞�': '骨架屏',
  '鍙栬揣': '取货',
  '閫佽揪': '送达',
  '鍦扮偣': '地点',
  '鎺ュ崟': '接单',
  '鍔犺浇': '加载',
  '绌虹姸鎬�': '空状态',
  '鍙戝竷': '发布',
  '寰呭鐞�': '待处理',
  '寰呮湇鍔�': '待服务',
  '宸插彇娑�': '已取消',
  '鏈煡鐘舵€�': '未知状态',
  '纭畾': '确定',
  '鍙栨秷': '取消',
  '鎴愬姛': '成功',
  '澶辫触': '失败',
  '鎻愮ず': '提示',
  '纭': '确认',
  '杩斿洖': '返回',
  '鏇村': '更多',
  '鏆傛棤': '暂无',
  '鏁版嵁': '数据',
  '浠诲姟': '任务',
  '浠峰挙': '价格',
  '鏃堕棿': '时间',
  '鍏ㄩ儴': '全部',
  '鎴戠殑': '我的',
  '璁剧疆': '设置',
  '涓汉': '个人',
  '涓績': '中心',
  '娑堟伅': '消息',
  '閫氱煡': '通知',
  '璐︽埛': '账户',
  '浣欓': '余额',
  '鎻愮幇': '提现',
  '璁㈠崟鍙�': '订单号',
  '鏀粯': '支付',
  '閫�娆�': '退款',
  '鍞悗': '售后',
  '瀹㈡湇': '客服',
  '甯姪': '帮助',
  '鍏充簬': '关于',
  '鐗堟湰': '版本',
  '鏇存柊': '更新',
  '娓呴櫎': '清除',
  '缂撳瓨': '缓存',
  '閫€鍑�': '退出',
  '鐧诲綍': '登录',
  '娉ㄥ唽': '注册',
  '鎵嬫満鍙�': '手机号',
  '楠岃瘉鐮�': '验证码',
  '瀵嗙爜': '密码',
  '蹇樿': '忘记',
  '淇敼': '修改',
  '閲嶇疆': '重置',
  '鎻愪氦': '提交',
  '淇濆瓨': '保存',
  '鍒犻櫎': '删除',
  '缂栬緫': '编辑',
  '鏌ョ湅': '查看',
  '璇︽儏': '详情',
  '鍒楄〃': '列表',
  '鏇村': '更多',
  '鏆傛棤': '暂无',
  '鏁版嵁': '数据',
  '鍔犺浇': '加载',
  '涓�': '中',
  '寮�': '开',
  '鏉�': '来',
  '濂�': '好',
  '鏄�': '是',
  '鍚�': '否',
  '澶�': '大',
  '瀛�': '学',
  '鐗�': '物',
  '鐞�': '理',
  '鍖�': '区',
  '甯�': '市',
  '鐪�': '省',
  '鍥�': '国',
  '鍘�': '县',
  '涔�': '乡',
  '闀�': '镇',
  '鏉�': '村',
  '鍙�': '号',
  '妤�': '楼',
  '闂�': '门',
  '鎴�': '户',
  '闄�': '院',
  '鍦�': '场',
  '棣�': '馆',
  '鎵�': '所',
  '閮�': '部',
  '灞�': '局',
  '鍘�': '处',
  '绉�': '科',
  '瀹�': '室',
  '缁�': '组',
  '閮�': '队',
  '鐝�': '班',
  '鎺�': '排',
  '杩�': '连',
  '钀�': '营',
  '鍥�': '团',
  '鏃�': '师',
  '鍐�': '军',
  '鍖�': '区'
};

function findVueFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'unpackage') {
      findVueFiles(fullPath, files);
    } else if (stat.isFile() && item.endsWith('.vue')) {
      files.push(fullPath);
    }
  }
  return files;
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let fixed = false;
    
    for (const [garbled, correct] of Object.entries(CHAR_MAP)) {
      if (content.includes(garbled)) {
        content = content.split(garbled).join(correct);
        fixed = true;
      }
    }
    
    if (fixed) {
      // 备份原文件
      const backupPath = filePath + '.backup';
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(filePath, backupPath);
      }
      // 写入修复后的内容
      fs.writeFileSync(filePath, content, 'utf-8');
      return { fixed: true, path: filePath };
    }
    return { fixed: false };
  } catch (err) {
    return { fixed: false, error: err.message };
  }
}

console.log('🔧 开始批量修复乱码...\n');
const vueFiles = findVueFiles(PROJECT_PATH);
console.log(`📁 找到 ${vueFiles.length} 个 Vue 文件\n`);

let fixedCount = 0;
let errorCount = 0;

for (const file of vueFiles) {
  const result = fixFile(file);
  if (result.fixed) {
    console.log(`✅ 已修复: ${path.relative(PROJECT_PATH, result.path)}`);
    fixedCount++;
  } else if (result.error) {
    console.log(`❌ 错误: ${path.relative(PROJECT_PATH, file)} - ${result.error}`);
    errorCount++;
  }
}

console.log(`\n📊 修复完成: ${fixedCount} 个文件已修复, ${errorCount} 个错误`);
console.log('💡 原文件已备份为 .backup 后缀');
