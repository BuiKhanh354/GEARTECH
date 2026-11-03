const mongoose = require('mongoose');

const ShipmentTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  description: { type: String, default: '' },
  updated_at: { type: Date, default: Date.now },
  location: { type: String, default: '' }
}, { _id: false });

const ShipmentSchema = new mongoose.Schema({
  // Liên kết đơn hàng và shop
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },

  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },

  // Thông tin vận đơn GHN
  carrier: { type: String, default: 'GHN' },
  tracking_code: { type: String, trim: true, index: true }, // Mã vận đơn GHN (e.g. GY4W3K)
  trackingCode: { type: String, trim: true },

  service_id: { type: Number, default: 0 },
  service_type_id: { type: Number, default: 2 }, // 2: Chuẩn, 1: Nhanh, 3: Tiết kiệm
  service_name: { type: String, default: 'Giao hàng tiêu chuẩn GHN' },

  // Cước phí & Tiền thu hộ
  shipping_fee: { type: Number, default: 0, min: 0 },
  shippingFee: { type: Number, default: 0, min: 0 },
  insurance_value: { type: Number, default: 0, min: 0 },
  cod_amount: { type: Number, default: 0, min: 0 },

  // Kích thước kiện hàng
  weight: { type: Number, default: 500, min: 1 }, // gram
  length: { type: Number, default: 20, min: 1 },  // cm
  width: { type: Number, default: 15, min: 1 },   // cm
  height: { type: Number, default: 10, min: 1 },  // cm

  // Địa chỉ người gửi (Shop)
  sender_info: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    province_id: { type: Number },
    district_id: { type: Number },
    ward_code: { type: String }
  },

  // Địa chỉ người nhận (Khách hàng)
  receiver_info: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    province_id: { type: Number },
    district_id: { type: Number },
    ward_code: { type: String }
  },

  // Trạng thái vận chuyển
  shipping_status: {
    type: String,
    enum: [
      'draft',               // Mới lập
      'ready_to_pick',       // Chờ tài xế GHN đến lấy
      'picking',             // Tài xế đang lấy hàng
      'picked',              // Đã lấy hàng thành công
      'storing',             // Hàng nhập kho trung chuyển
      'transporting',        // Đang luân chuyển liên kho
      'delivering',          // Đang giao tới người nhận
      'delivered',           // Giao hàng thành công
      'delivery_fail',       // Giao không thành công
      'waiting_to_return',   // Chờ xác nhận chuyển hoàn
      'return',              // Đang chuyển hoàn cho shop
      'returned',            // Đã trả lại shop thành công
      'cancelled',           // Đã hủy vận đơn
      'exception'            // Sự cố hàng hóa / đền bù
    ],
    default: 'ready_to_pick',
    index: true
  },
  shippingStatus: { type: String },

  expected_delivery_date: { type: Date },
  expectedDeliveryDate: { type: Date },

  // Lịch sử hành trình đơn
  timeline: [ShipmentTimelineSchema],

  // Lưu thông tin phản hồi từ GHN API
  ghn_order_data: { type: mongoose.Schema.Types.Mixed },

  // Ghi nhật ký webhook
  webhook_events: [{
    event: { type: String },
    received_at: { type: Date, default: Date.now },
    payload: { type: mongoose.Schema.Types.Mixed }
  }],

  notes: { type: String, default: '' },
  cancel_reason: { type: String, default: '' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Đồng bộ alias trước khi lưu
ShipmentSchema.pre('validate', function() {
  if (this.orderId && !this.order_id) this.order_id = this.orderId;
  if (this.order_id && !this.orderId) this.orderId = this.order_id;

  if (this.shopId && !this.shop_id) this.shop_id = this.shopId;
  if (this.shop_id && !this.shopId) this.shopId = this.shop_id;

  if (this.userId && !this.user_id) this.user_id = this.userId;
  if (this.user_id && !this.userId) this.userId = this.user_id;

  if (this.customerId && !this.customer_id) this.customer_id = this.customerId;
  if (this.customer_id && !this.customerId) this.customerId = this.customer_id;

  if (this.trackingCode && !this.tracking_code) this.tracking_code = this.trackingCode;
  if (this.tracking_code && !this.trackingCode) this.trackingCode = this.tracking_code;

  if (this.shippingFee !== undefined && this.shipping_fee === undefined) this.shipping_fee = this.shippingFee;
  if (this.shipping_fee !== undefined && this.shippingFee === undefined) this.shippingFee = this.shipping_fee;

  if (this.shippingStatus && !this.shipping_status) this.shipping_status = this.shippingStatus;
  if (this.shipping_status && !this.shippingStatus) this.shippingStatus = this.shipping_status;

  if (this.expectedDeliveryDate && !this.expected_delivery_date) this.expected_delivery_date = this.expectedDeliveryDate;
  if (this.expected_delivery_date && !this.expectedDeliveryDate) this.expectedDeliveryDate = this.expected_delivery_date;
});

module.exports = mongoose.model('Shipment', ShipmentSchema);
