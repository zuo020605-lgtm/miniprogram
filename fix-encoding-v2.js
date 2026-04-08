const fs = require('fs');
const path = require('path');

const PROJECT_PATH = 'C:\\\\Users\\\\ROG\\\\Documents\\\\HBuilderProjects\\\\校园跑腿';

// 根据实际观察到的乱码模式
const CHAR_MAP = {
  '椤堕儴': '顶部',
  '瀵艰埅': '导航',
  '鎼滅储': '搜索',
  '妗�': '框',
  '褰撳墠': '当前',
  '鏍″尯': '校区',
  '鍔熻兘': '功能',
  '鎸夐挳': '按钮',
  '鍖哄煙': '区域',
  '鏈�': '最',
  '鏂�': '新',
  '鍙�': '发',
  '甯�': '布',
  '璁㈠崟': '订单',
  '鍒楄〃': '列表',
  '绌虹姸': '空状',
  '鎬�': '态',
  '楠ㄦ灦': '骨架',
  '灞�': '屏',
  '涓嬫媺': '下拉',
  '鍒锋柊': '刷新',
  '鍔犺浇': '加载',
  '鏇村': '更多',
  '鏆傛棤': '暂无',
  '鏁版嵁': '数据',
  '鍘�': '去',
  '鍙戝竷': '发布',
  '鎴戠殑': '我的',
  '璁㈠崟': '订单',
  '娑堟伅': '消息',
  '涓汉': '个人',
  '涓績': '中心',
  '璁剧疆': '设置',
  '閫�鍑�': '退出',
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
  '鍙栨秷': '取消',
  '纭畾': '确定',
  '鎴愬姛': '成功',
  '澶辫触': '失败',
  '鎻愮ず': '提示',
  '纭': '确认',
  '杩斿洖': '返回',
  '鏇村': '更多',
  '鏆傛棤': '暂无',
  '鏁版嵁': '数据',
  '鍔犺浇': '加载',
  '涓�': '中',
  '寮�': '开',
  '鏉�': '来',
  '鐜�': '现',
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
  '鍖�': '区',
  '鎴�': '我',
  '浣�': '你',
  '浠�': '他',
  '濂�': '她',
  '瀹�': '它',
  '鎴�': '或'
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
    let fixCount = 0;
    
    for (const [garbled, correct] of Object.entries(CHAR_MAP)) {
      if (content.includes(garbled)) {
        const count = (content.match(new RegExp(garbled.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        content = content.split(garbled).join(correct);
        fixed = true;
        fixCount += count;
      }
    }
    
    if (fixed) {
      const backupPath = filePath + '.backup';
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(filePath, backupPath);
      }
      fs.writeFileSync(filePath, content, 'utf-8');
      return { fixed: true, path: filePath, count: fixCount };
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
let totalFixes = 0;

for (const file of vueFiles) {
  const result = fixFile(file);
  if (result.fixed) {
    console.log(`✅ 已修复: ${path.relative(PROJECT_PATH, result.path)} (${result.count} 处)`);
    fixedCount++;
    totalFixes += result.count;
  } else if (result.error) {
    console.log(`❌ 错误: ${path.relative(PROJECT_PATH, file)} - ${result.error}`);
    errorCount++;
  }
}

console.log(`\n📊 修复完成: ${fixedCount} 个文件已修复, ${totalFixes} 处乱码, ${errorCount} 个错误`);
if (fixedCount > 0) {
  console.log('💡 原文件已备份为 .backup 后缀');
}
