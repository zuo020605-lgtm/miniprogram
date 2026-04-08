/**
 * 登录系统单元测试
 */

const { login, getUserByOpenid, getUserById } = require('./utils/login');

// 模拟uniCloud对象
const mockUniCloud = {
  database: () => ({
    collection: (name) => ({
      where: (condition) => ({
        get: async () => {
          // 模拟数据库查询结果
          if (condition.openid === 'test-openid') {
            return {
              data: [{
                _id: 'test-user-id',
                openid: 'test-openid',
                nickName: '测试用户',
                avatarUrl: 'https://example.com/avatar.jpg',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                loginCount: 1
              }]
            };
          } else {
            return { data: [] };
          }
        }
      }),
      add: async (data) => {
        return {
          id: 'new-user-id'
        };
      },
      doc: (id) => ({
        update: async (data) => {
          return { success: true };
        },
        get: async () => {
          if (id === 'test-user-id') {
            return {
              data: {
                _id: 'test-user-id',
                openid: 'test-openid',
                nickName: '测试用户',
                avatarUrl: 'https://example.com/avatar.jpg',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                loginCount: 1
              }
            };
          } else {
            return { data: null };
          }
        }
      })
    })
  }),
  callFunction: async (options) => {
    if (options.name === 'login') {
      return {
        result: {
          openid: 'test-openid',
          unionid: 'test-unionid'
        }
      };
    }
  }
};

// 替换全局uniCloud对象
global.uniCloud = mockUniCloud;

// 测试用例
async function runTests() {
  console.log('开始测试登录系统...');

  try {
    // 测试1: 正常登录（新用户）
    console.log('\n测试1: 正常登录（新用户）');
    const loginResult1 = await login({
      code: 'test-code',
      nickName: '新用户',
      avatarUrl: 'https://example.com/new-avatar.jpg'
    });
    console.log('登录结果:', loginResult1);
    console.log('测试1结果:', loginResult1.success ? '通过' : '失败');

    // 测试2: 正常登录（已存在用户）
    console.log('\n测试2: 正常登录（已存在用户）');
    const loginResult2 = await login({
      code: 'test-code',
      nickName: '更新的昵称',
      avatarUrl: 'https://example.com/updated-avatar.jpg'
    });
    console.log('登录结果:', loginResult2);
    console.log('测试2结果:', loginResult2.success ? '通过' : '失败');

    // 测试3: 缺少登录凭证
    console.log('\n测试3: 缺少登录凭证');
    const loginResult3 = await login({});
    console.log('登录结果:', loginResult3);
    console.log('测试3结果:', !loginResult3.success ? '通过' : '失败');

    // 测试4: 根据openid获取用户信息
    console.log('\n测试4: 根据openid获取用户信息');
    const userByOpenid = await getUserByOpenid('test-openid');
    console.log('用户信息:', userByOpenid);
    console.log('测试4结果:', userByOpenid ? '通过' : '失败');

    // 测试5: 根据ID获取用户信息
    console.log('\n测试5: 根据ID获取用户信息');
    const userById = await getUserById('test-user-id');
    console.log('用户信息:', userById);
    console.log('测试5结果:', userById ? '通过' : '失败');

    console.log('\n所有测试完成！');
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
runTests();
