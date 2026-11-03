const mongoose = require('mongoose');

const CategoryAttributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên thuộc tính không được để trống'],
    trim: true
  },
  key: {
    type: String,
    trim: true,
    lowercase: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  options: [{
    type: String
  }],
  isRequired: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: false });

const CategorySpecificationSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  categorySlug: {
    type: String,
    required: [true, 'Slug danh mục không được để trống'],
    unique: true,
    lowercase: true,
    trim: true
  },
  categoryName: {
    type: String,
    trim: true
  },
  attributes: [CategoryAttributeSchema]
}, { timestamps: true });

module.exports = mongoose.model('CategorySpecification', CategorySpecificationSchema);

