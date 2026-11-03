const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const Voucher = require('../models/Voucher');
const Shop = require('../models/Shop');

const vouchersToSeed = [
  {
    code: 'GEARTECH50K',
    name: 'Ưu đãi chào bạn mới GearTech',
    description: 'Giảm 50.000đ trực tiếp cho đơn hàng từ 500.000đ trên toàn sàn',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderValue: 500000,
    maxDiscount: 50000,
    maxUses: 500,
    usesCount: 12,
    startDate: new Date('2026-01-01'),
    expiryDate: new Date('2026-12-31T23:59:59'),
    status: 'active',
    emoji: '🎁',
    shopId: null,
    shop_id: null
  },
  {
    code: 'TECHPRO100K',
    name: 'Mã VIP Công nghệ Pro',
    description: 'Giảm 100.000đ cho đơn hàng linh kiện và thiết bị từ 1.500.000đ',
    discountType: 'fixed',
    discountValue: 100000,
    minOrderValue: 1500000,
    maxDiscount: 100000,
    maxUses: 200,
    usesCount: 45,
    startDate: new Date('2026-01-01'),
    expiryDate: new Date('2026-12-31T23:59:59'),
    status: 'active',
    emoji: '⚡',
    shopId: null,
    shop_id: null
  },
  {
    code: 'GAMING10',
    name: 'Đại tiệc Gaming Gear',
    description: 'Giảm 10% tối đa 300.000đ cho mọi đơn hàng Gaming từ 1.000.000đ',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 1000000,
    maxDiscount: 300000,
    maxUses: 300,
    usesCount: 88,
    startDate: new Date('2026-01-01'),
    expiryDate: new Date('2026-12-31T23:59:59'),
    status: 'active',
    emoji: '🎮',
    shopId: null,
    shop_id: null
  },
  {
    code: 'FREESHIP30K',
    name: 'Miễn phí vận chuyển toàn quốc',
    description: 'Hỗ trợ 30.000đ phí giao hàng nhanh GHN cho đơn từ 300.000đ',
    discountType: 'fixed',
    discountValue: 30000,
    minOrderValue: 300000,
    maxDiscount: 30000,
    maxUses: 1000,
    usesCount: 142,
    startDate: new Date('2026-01-01'),
    expiryDate: new Date('2026-12-31T23:59:59'),
    status: 'active',
    emoji: '🚚',
    shopId: null,
    shop_id: null
  },
  {
    code: 'VIPLAPTOP',
    name: 'Siêu sale Laptop đỉnh cao',
    description: 'Giảm 500.000đ trực tiếp khi mua Laptop gaming hoặc văn phòng từ 10.000.000đ',
    discountType: 'fixed',
    discountValue: 500000,
    minOrderValue: 10000000,
    maxDiscount: 500000,
    maxUses: 100,
    usesCount: 23,
    startDate: new Date('2026-01-01'),
    expiryDate: new Date('2026-12-31T23:59:59'),
    status: 'active',
    emoji: '💻',
    shopId: null,
    shop_id: null
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gear_tech';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for voucher seeding');

    // Find sample shops to attach shop-specific vouchers
    const gearTechShop = await Shop.findOne({ name: /Gear Tech Store/i }) || await Shop.findOne({});
    const asusShop = await Shop.findOne({ name: /ASUS/i });

    if (gearTechShop) {
      vouchersToSeed.push({
        code: 'GEARSTORE20K',
        name: `Độc quyền ${gearTechShop.name}`,
        description: `Giảm 20.000đ cho đơn từ 200.000đ khi mua hàng tại ${gearTechShop.name}`,
        discountType: 'fixed',
        discountValue: 20000,
        minOrderValue: 200000,
        maxDiscount: 20000,
        maxUses: 200,
        usesCount: 15,
        startDate: new Date('2026-01-01'),
        expiryDate: new Date('2026-12-31T23:59:59'),
        status: 'active',
        emoji: '🏬',
        shopId: gearTechShop._id,
        shop_id: gearTechShop._id
      });
    }

    if (asusShop) {
      vouchersToSeed.push({
        code: 'ASUSROG50K',
        name: `Độc quyền ${asusShop.name}`,
        description: `Giảm 50.000đ cho đơn từ 800.000đ tại ${asusShop.name}`,
        discountType: 'fixed',
        discountValue: 50000,
        minOrderValue: 800000,
        maxDiscount: 50000,
        maxUses: 150,
        usesCount: 9,
        startDate: new Date('2026-01-01'),
        expiryDate: new Date('2026-12-31T23:59:59'),
        status: 'active',
        emoji: '🔥',
        shopId: asusShop._id,
        shop_id: asusShop._id
      });
    }

    for (const v of vouchersToSeed) {
      await Voucher.findOneAndUpdate(
        { code: v.code },
        { $set: v },
        { upsert: true, new: true, runValidators: true }
      );
      console.log(`Upserted voucher: ${v.code}`);
    }

    console.log('Seeding vouchers completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding vouchers:', err);
    process.exit(1);
  }
}

seed();

