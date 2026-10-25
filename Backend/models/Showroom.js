const mongoose = require('mongoose');

const ShowroomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, uppercase: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  hours: { type: String, required: true }, // Giờ mở cửa (VD: '08:00 - 22:00')
  features: [{ type: String }], // Tiện ích độc quyền tại showroom
  lat: { type: Number, required: true }, // Tọa độ vĩ độ (Latitude)
  lng: { type: Number, required: true }, // Tọa độ kinh độ (Longitude)
  city: { type: String, enum: ['hcm', 'hanoi', 'danang'], required: true },
  mapUrl: { type: String, required: true }, // Iframe Embed Url từ Google Map
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null }
}, { timestamps: true });

ShowroomSchema.pre('validate', function() {
  if (this.shopId && !this.shop_id) this.shop_id = this.shopId;
  if (this.shop_id && !this.shopId) this.shopId = this.shop_id;
});

module.exports = mongoose.model('Showroom', ShowroomSchema);
