// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
module.exports = {
	_before: function () { // 通用预处理器

	},
	/**
	 * 新增订单
	 * @param {object} orderData 订单数据
	 * @returns {object} 返回结果
	 */
	async addOrder(orderData) {
		// 参数校验
		if (!orderData) {
			return {
				errCode: 'PARAM_IS_NULL',
				errMsg: '订单数据不能为空'
			}
		}

		if (!orderData.uid) {
			return {
				errCode: 'UID_IS_NULL',
				errMsg: '用户ID不能为空'
			}
		}

		// 验证服务类型
		const validServiceTypes = ['campusErrand', 'packageDelivery', 'examTaking'];
		if (!validServiceTypes.includes(orderData.serviceType)) {
			return {
				errCode: 'INVALID_SERVICE_TYPE',
				errMsg: '无效的服务类型'
			}
		}

		// 验证通用字段
		if (!orderData.title || !orderData.price || !orderData.contact) {
			return {
				errCode: 'MISSING_REQUIRED_FIELDS',
				errMsg: '缺少必填字段'
			}
		}

		// 验证服务类型特定字段
		if (orderData.serviceType === 'campusErrand' || orderData.serviceType === 'packageDelivery') {
			if (!orderData.startTime || !orderData.endTime || !orderData.pickupLocation || !orderData.deliveryLocation) {
				return {
					errCode: 'MISSING_SERVICE_FIELDS',
					errMsg: '缺少服务类型特定字段'
				}
			}

			if (orderData.serviceType === 'packageDelivery' && !orderData.itemWeight) {
				return {
					errCode: 'MISSING_WEIGHT',
					errMsg: '快递代取必须填写物品重量'
				}
			}
		} else if (orderData.serviceType === 'examTaking') {
			if (!orderData.teachingBuilding || !orderData.examClassroom || !orderData.examStartTime || !orderData.examEndTime || !orderData.examSubject) {
				return {
					errCode: 'MISSING_EXAM_FIELDS',
					errMsg: '缺少考试代替特定字段'
				}
			}
		}

		// 验证手机号格式
		const phoneRegex = /^1[3-9]\d{9}$/;
		if (!phoneRegex.test(orderData.contact)) {
			return {
				errCode: 'INVALID_PHONE',
				errMsg: '手机号格式不正确'
			}
		}

		// 验证订单金额
		if (isNaN(orderData.price) || orderData.price <= 0) {
			return {
				errCode: 'INVALID_PRICE',
				errMsg: '订单金额必须大于0'
			}
		}

		// 验证任务描述长度
		if (orderData.description && orderData.description.length > 500) {
			return {
				errCode: 'DESCRIPTION_TOO_LONG',
				errMsg: '任务描述不能超过500字'
			}
		}

		// 生成订单号
		const orderNo = 'ORD' + Date.now() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
		
		// 构建订单数据
		const order = {
			...orderData,
			orderNo: orderNo,
			status: 'unaccepted',
			orderStatus: 'waitingAccept', // 默认状态为等待接单
			createdAt: new Date().toISOString(),
			assignee: null
		};

		// 将订单数据写入数据库
		try {
			const db = uniCloud.database();
			const result = await db.collection('order').add(order);
			
			// 返回成功结果
			return {
				errCode: 0,
				errMsg: '订单发布成功',
				data: {
					orderId: result.id,
					...order
				}
			};
		} catch (error) {
			console.error('写入数据库失败:', error);
			return {
				errCode: 'DB_ERROR',
				errMsg: '写入数据库失败: ' + (error.message || '未知错误')
			};
		}
	},
	/**
	 * 查询订单列表
	 * @param {object} params 查询参数
	 * @returns {object} 返回订单列表
	 */
	async getOrderList(params = {}) {
		try {
			// 记录开始时间
			const startTime = Date.now();
			
			const db = uniCloud.database();
			const collection = db.collection('order');
			
			// 构建查询
			let query = collection;
			
			// 按创建时间倒序排序
			query = query.orderBy('createdAt', 'desc');
			
			// 限制返回数量，默认最多返回20条
			const limit = Math.min(params.limit || 20, 100);
			query = query.limit(limit);
			
			// 执行查询
			const result = await query.get();
			
			// 确保price字段是数字类型和新字段存在
			const formattedData = result.data.map(order => ({
				...order,
				price: typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0,
				orderNo: order.orderNo || '',
				userNickname: order.userNickname || '',
				courierNickname: order.courierNickname || '',
				orderStatus: order.orderStatus || 'waitingAccept'
			}));
			
			// 记录查询时间
			const queryTime = Date.now() - startTime;
			console.log(`查询订单列表耗时: ${queryTime}ms`);
			
			return {
				errCode: 0,
				errMsg: '查询成功',
				data: formattedData,
				queryTime: queryTime
			};
		} catch (error) {
			console.error('查询订单失败:', error);
			return {
				errCode: 'DB_ERROR',
				errMsg: '查询订单失败: ' + (error.message || '未知错误')
			};
		}
	},
	/**
	 * 获取订单详情
	 * @param {string} orderId 订单ID
	 * @returns {object} 返回订单详情
	 */
	async getOrderDetail(orderId) {
		try {
			const db = uniCloud.database();
			const result = await db.collection('order').doc(orderId).get();
			
			if (result.data && result.data.length > 0) {
				// 确保price字段是数字类型
				const order = result.data[0];
				order.price = typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0;
				// 确保新字段存在
				order.orderNo = order.orderNo || '';
				order.userNickname = order.userNickname || '';
				order.courierNickname = order.courierNickname || '';
				order.orderStatus = order.orderStatus || 'waitingAccept';
				return {
					errCode: 0,
					errMsg: '查询成功',
					data: order
				};
			} else {
				return {
					errCode: 'ORDER_NOT_FOUND',
					errMsg: '订单不存在'
				};
			}
		} catch (error) {
			console.error('获取订单详情失败:', error);
			return {
				errCode: 'DB_ERROR',
				errMsg: '获取订单详情失败: ' + (error.message || '未知错误')
			};
		}
	},
	/**
	 * 获取用户自己的订单列表
	 * @param {string} uid 用户ID
	 * @param {object} params 查询参数
	 * @returns {object} 返回订单列表
	 */
	async getMyOrders(uid, params = {}) {
		try {
			if (!uid) {
				return {
					errCode: 'UID_REQUIRED',
					errMsg: '用户ID不能为空'
				};
			}
			
			const db = uniCloud.database();
			const collection = db.collection('order');
			
			// 构建查询 - 根据uid筛选用户自己的订单
			let query = collection.where({ uid: uid });
			
			// 按创建时间倒序排序
			query = query.orderBy('createdAt', 'desc');
			
			// 限制返回数量
			const limit = Math.min(params.limit || 50, 100);
			query = query.limit(limit);
			
			// 执行查询
			const result = await query.get();
			
			// 格式化数据
			const formattedData = result.data.map(order => ({
				...order,
				price: typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0,
				orderNo: order.orderNo || '',
				status: order.status || 'unaccepted'
			}));
			
			return {
				errCode: 0,
				errMsg: '查询成功',
				data: formattedData
			};
		} catch (error) {
			console.error('获取用户订单失败:', error);
			return {
				errCode: 'DB_ERROR',
				errMsg: '获取订单失败: ' + (error.message || '未知错误')
			};
		}
	},
	
	/**
	 * 更新订单状态
	 * @param {string} orderId 订单ID
	 * @param {string} status 订单状态
	 * @param {object} assignee 接取人信息
	 * @returns {object} 返回结果
	 */
	async updateOrderStatus(orderId, status, assignee = null) {
		try {
			const db = uniCloud.database();
			const collection = db.collection('order');
			
			// 构建更新数据
		const updateData = {
			status: status
		};
		
		// 如果有接取人信息，更新接取人
		if (assignee) {
			// 确保assignee是一个有效的对象
			if (typeof assignee === 'object' && assignee !== null) {
				// 使用$set操作符来确保即使assignee为null也能正确更新
				updateData['assignee'] = assignee;
				updateData.courierNickname = assignee.name || '';
			} else {
				// 如果assignee不是有效的对象，设置为空对象
				updateData['assignee'] = {};
				updateData.courierNickname = '';
			}
		} else {
			// 当assignee为null时，只更新courierNickname
			updateData.courierNickname = '';
			// 不设置assignee为null，避免数据库操作错误
		}
		
		// 确保updateData是一个有效的对象
		if (typeof updateData !== 'object' || updateData === null) {
			return {
				errCode: 'INVALID_UPDATE_DATA',
				errMsg: '更新数据格式错误'
			};
		}
			
			// 根据状态更新orderStatus
			if (status === 'unaccepted') {
				updateData.orderStatus = 'waitingAccept';
			} else if (status === 'pending') {
				updateData.orderStatus = 'picking';
			} else if (status === 'processing') {
				updateData.orderStatus = 'delivering';
			} else if (status === 'completed') {
				updateData.orderStatus = 'delivered';
			} else if (status === 'cancelled') {
				updateData.orderStatus = 'canceled';
			}
			
			// 执行更新
		// 使用$set操作符来确保即使assignee为null也能正确更新
		const setUpdateData = {};
		for (const key in updateData) {
			setUpdateData[key] = updateData[key];
		}
		const result = await collection.doc(orderId).update({ $set: setUpdateData });
			
			if (result.updated > 0) {
				return {
					errCode: 0,
					errMsg: '订单状态更新成功',
					data: {
						orderId: orderId,
						status: status,
						orderStatus: updateData.orderStatus
					}
				};
			} else {
				return {
					errCode: 'UPDATE_FAILED',
					errMsg: '订单状态更新失败'
				};
			}
		} catch (error) {
			console.error('更新订单状态失败:', error);
			return {
				errCode: 'DB_ERROR',
				errMsg: '更新订单状态失败: ' + (error.message || '未知错误')
			};
		}
	}
}
