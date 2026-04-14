// Mock 数据工具
import request from './request.js';

// Mock 用户数据
export const mockUsers = [
    {
        id: '1001',
        openid: 'mock_openid_user1',
        nickname: '张三',
        avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3Rq2KzDgN2FgL0w5Z8al9g/0',
        phone: '13800138001',
        balance: 50.00,
        createdAt: '2024-01-01T10:00:00.000Z',
        lastLoginAt: '2024-01-01T10:00:00.000Z'
    },
    {
        id: '1002',
        openid: 'mock_openid_runner1',
        nickname: '跑腿小王',
        avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3Rq2KzDgN2FgL0w5Z8al9g/0',
        phone: '13800138002',
        balance: 100.00,
        createdAt: '2024-01-01T10:00:00.000Z',
        lastLoginAt: '2024-01-01T10:00:00.000Z'
    }
];

// Mock 订单数据
export const mockOrders = [
    {
        id: 'order_1234567890_abcde',
        openid: 'mock_openid_user1',
        title: '代取快递',
        description: '帮我取一个快递，地址在东门快递柜，取件码是1234',
        price: 5.00,
        address: '东门快递柜',
        contact: '13800138001',
        status: 'pending',
        type: 'running',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
        accepterId: null,
        finisherId: null,
        deliveryInfo: {}
    },
    {
        id: 'order_1234567890_fghij',
        openid: 'mock_openid_user1',
        title: '代买午餐',
        description: '帮我一份黄焖鸡米饭，不要香菜，送到3号楼楼下',
        price: 12.00,
        address: '3号楼楼下',
        contact: '13800138001',
        status: 'accepted',
        type: 'delivering',
        createdAt: '2024-01-01T09:30:00.000Z',
        updatedAt: '2024-01-01T10:15:00.000Z',
        accepterId: '1002',
        finisherId: null,
        deliveryInfo: {
            acceptedAt: '2024-01-01T10:15:00.000Z'
        }
    }
];

// Mock 消息数据
export const mockMessages = [
    {
        id: 'msg_1234567890_abcde',
        fromOpenid: 'mock_openid_user1',
        toOpenid: 'mock_openid_runner1',
        content: '我的快递在哪个快递柜？',
        orderId: 'order_1234567890_abcde',
        messageType: 'text',
        isRead: true,
        createdAt: '2024-01-01T10:15:00.000Z',
        updatedAt: '2024-01-01T10:15:00.000Z'
    },
    {
        id: 'msg_1234567890_fghij',
        fromOpenid: 'mock_openid_runner1',
        toOpenid: 'mock_openid_user1',
        content: '在东门快递柜，取件码是1234',
        orderId: 'order_1234567890_abcde',
        messageType: 'text',
        isRead: true,
        createdAt: '2024-01-01T10:20:00.000Z',
        updatedAt: '2024-01-01T10:20:00.000Z'
    }
];

// 模拟延迟
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 模拟随机数生成
export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 模拟随机字符串生成
export function randomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}