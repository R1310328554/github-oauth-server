const User = require('../model/user');
const constants = require('../utils/constants');
const { decodeToken } = require('../utils/token');
const { CustomError } = require('../utils/customError');

class UserController {
  static async list(ctx) {
    const session = decodeToken(ctx);
    if (!session || ![1, 2].includes(Number(session.status))) {
      // soft-admin fallback: allow first superuser bootstrap by empty DB later
      const user = session?._id ? await User.findById(session._id) : null;
      if (!user || ![1, 2].includes(Number(user.status))) {
        throw new CustomError(constants.HTTP_CODE.FORBIDDEN, '需要管理员权限');
      }
    }

    const page = Math.max(1, Number(ctx.query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(ctx.query.pageSize || 20)));
    const q = String(ctx.query.q || '').trim();
    const filter = q
      ? {
        $or: [
          { username: new RegExp(q, 'i') },
          { nickname: new RegExp(q, 'i') },
          { email: new RegExp(q, 'i') },
          { userId: new RegExp(q, 'i') }
        ]
      }
      : {};

    const [total, rows] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ lastLoginDate: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
    ]);

    ctx.data({
      data: {
        total,
        page,
        pageSize,
        list: rows.map((item) => item.toSafeJSON())
      }
    });
  }

  static async stats(ctx) {
    const session = decodeToken(ctx);
    const user = session?._id ? await User.findById(session._id) : null;
    if (!user || ![1, 2].includes(Number(user.status))) {
      throw new CustomError(constants.HTTP_CODE.FORBIDDEN, '需要管理员权限');
    }

    const totalUsers = await User.countDocuments();
    const providerAgg = await User.aggregate([
      { $unwind: '$providers' },
      { $group: { _id: '$providers.provider', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    ctx.data({
      data: {
        totalUsers,
        providers: providerAgg.map((item) => ({ provider: item._id, count: item.count }))
      }
    });
  }

  static async setStatus(ctx) {
    const session = decodeToken(ctx);
    const admin = session?._id ? await User.findById(session._id) : null;
    if (!admin || Number(admin.status) !== 1) {
      throw new CustomError(constants.HTTP_CODE.FORBIDDEN, '需要超级管理员权限');
    }
    const { userId } = ctx.params;
    const { status } = ctx.request.body || {};
    if (![1, 2, 3, 9].includes(Number(status))) {
      throw new CustomError(constants.CUSTOM_CODE.INVALID_PARAM, '非法状态值');
    }
    const user = await User.findOneAndUpdate({ userId }, { status: Number(status), lastModifiedDate: new Date() }, { new: true });
    if (!user) {
      throw new CustomError(constants.HTTP_CODE.NOT_FOUND, '用户不存在');
    }
    ctx.data({ data: user.toSafeJSON(), msg: '状态已更新' });
  }
}

module.exports = UserController;
