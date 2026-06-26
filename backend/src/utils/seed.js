/**
 * Database Seed Script
 * Run: npm run seed
 *
 * Creates:
 * - 1 Admin user
 * - 1 Regular user
 * - 6 Categories
 * - 20 Products
 * - 3 Banners
 * - 3 Coupons
 */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');

// Models
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUrl);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Banner.deleteMany({}),
      Coupon.deleteMany({}),
    ]);

    // Drop old email-only unique index if it exists (replaced by email+role compound index)
    try {
      await mongoose.connection.collection('users').dropIndex('email_1');
      console.log('   🔄 Dropped old email_1 index');
    } catch (e) {
      // Index doesn't exist — that's fine
    }

    // ─── Create Users ─────────────────────────────────
    console.log('👤 Creating users...');
    const users = await User.create([
      {
        name: 'Prasad',
        email: 'prasad8790237@gmail.com',
        phone: '8790237325',
        role: 'admin',
        addresses: [
          {
            fullName: 'Prasad',
            phone: '8790237325',
            addressLine1: '123 Admin Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Prasad',
        email: 'prasad8790237@gmail.com',
        phone: '8790237325',
        role: 'user',
        addresses: [
          {
            fullName: 'Prasad',
            phone: '8790237325',
            addressLine1: '456 User Lane',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110001',
            isDefault: true,
          },
        ],
      },
    ]);

    console.log(`   ✅ Created ${users.length} users`);
    console.log('   📧 Admin: admin@sdclothing.com (OTP login)');
    console.log('   📧 User:  user@sdclothing.com (OTP login)');

    // ─── Create Categories ────────────────────────────
    console.log('📂 Creating categories...');
    const categories = await Category.create([
      { name: 'T-Shirts', description: 'Casual and stylish t-shirts for every occasion' },
      { name: 'Shirts', description: 'Formal and casual shirts for men and women' },
      { name: 'Jeans', description: 'Premium denim jeans in various fits and styles' },
      { name: 'Dresses', description: 'Elegant dresses for all occasions' },
      { name: 'Jackets', description: 'Trendy jackets and outerwear for all seasons' },
      { name: 'Accessories', description: 'Belts, caps, bags, and more' },
    ]);

    console.log(`   ✅ Created ${categories.length} categories`);

    // ─── Create Products ──────────────────────────────
    console.log('🛍️  Creating products...');
    const products = await Product.create([
      // T-Shirts
      {
        name: 'Classic Cotton Crew Neck T-Shirt',
        description: 'Ultra-soft 100% cotton crew neck t-shirt. Perfect for everyday wear. Available in multiple colors.',
        price: 799,
        discountPrice: 599,
        category: categories[0]._id,
        stock: 150,
        specifications: { Material: 'Cotton', Fit: 'Regular', Sleeve: 'Half Sleeve', Wash: 'Machine Washable' },
        isFeatured: true,
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Graphic Print Oversized T-Shirt',
        description: 'Trendy oversized t-shirt with eye-catching graphic print. Made from premium cotton blend.',
        price: 999,
        discountPrice: 749,
        category: categories[0]._id,
        stock: 100,
        specifications: { Material: 'Cotton Blend', Fit: 'Oversized', Sleeve: 'Half Sleeve' },
        isFeatured: true,
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Polo Collar T-Shirt',
        description: 'Smart polo collar t-shirt in premium pique cotton. Ideal for casual and semi-formal wear.',
        price: 1299,
        discountPrice: 999,
        category: categories[0]._id,
        stock: 80,
        specifications: { Material: 'Pique Cotton', Fit: 'Slim', Sleeve: 'Half Sleeve' },
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      // Shirts
      {
        name: 'Oxford Button-Down Shirt',
        description: 'Classic Oxford button-down shirt. Perfect for office and formal occasions. Wrinkle-resistant.',
        price: 1999,
        discountPrice: 1499,
        category: categories[1]._id,
        stock: 60,
        specifications: { Material: 'Oxford Cotton', Fit: 'Regular', Sleeve: 'Full Sleeve', Collar: 'Button-Down' },
        isFeatured: true,
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Slim Fit Checked Shirt',
        description: 'Modern slim fit checked shirt. Versatile design suitable for work and weekends.',
        price: 1799,
        discountPrice: 1299,
        category: categories[1]._id,
        stock: 45,
        specifications: { Material: 'Cotton', Fit: 'Slim', Pattern: 'Checked' },
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Linen Casual Shirt',
        description: 'Breathable linen shirt perfect for summer. Light and comfortable with a relaxed fit.',
        price: 2499,
        discountPrice: 1999,
        category: categories[1]._id,
        stock: 35,
        specifications: { Material: 'Linen', Fit: 'Relaxed', Sleeve: 'Full Sleeve' },
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      // Jeans
      {
        name: 'Slim Fit Dark Wash Jeans',
        description: 'Premium slim fit jeans in a classic dark wash. Stretchable denim for maximum comfort.',
        price: 2499,
        discountPrice: 1799,
        category: categories[2]._id,
        stock: 70,
        specifications: { Material: 'Stretch Denim', Fit: 'Slim', Wash: 'Dark' },
        isFeatured: true,
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Relaxed Fit Light Wash Jeans',
        description: 'Comfortable relaxed fit jeans with a light wash finish. Great for casual outings.',
        price: 2299,
        discountPrice: 1699,
        category: categories[2]._id,
        stock: 55,
        specifications: { Material: 'Denim', Fit: 'Relaxed', Wash: 'Light' },
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Skinny Black Jeans',
        description: 'Sleek skinny black jeans. A wardrobe essential that goes with everything.',
        price: 1999,
        discountPrice: 1499,
        category: categories[2]._id,
        stock: 90,
        specifications: { Material: 'Stretch Denim', Fit: 'Skinny', Color: 'Black' },
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      // Dresses
      {
        name: 'Floral Print Midi Dress',
        description: 'Beautiful floral print midi dress. Elegant and comfortable for any occasion.',
        price: 2999,
        discountPrice: 2299,
        category: categories[3]._id,
        stock: 40,
        specifications: { Material: 'Rayon', Fit: 'A-Line', Length: 'Midi', Pattern: 'Floral' },
        isFeatured: true,
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Black Bodycon Dress',
        description: 'Classic black bodycon dress. Perfect for parties and evening events.',
        price: 2499,
        discountPrice: 1899,
        category: categories[3]._id,
        stock: 30,
        specifications: { Material: 'Polyester Blend', Fit: 'Bodycon', Length: 'Knee Length', Color: 'Black' },
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Cotton Maxi Dress',
        description: 'Flowing cotton maxi dress with boho vibes. Perfect for summer days.',
        price: 3499,
        discountPrice: 2799,
        category: categories[3]._id,
        stock: 25,
        specifications: { Material: 'Cotton', Fit: 'Flared', Length: 'Maxi' },
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      // Jackets
      {
        name: 'Classic Denim Jacket',
        description: 'Timeless denim jacket with a modern fit. A must-have layering piece.',
        price: 3999,
        discountPrice: 2999,
        category: categories[4]._id,
        stock: 50,
        specifications: { Material: 'Denim', Fit: 'Regular', Closure: 'Button' },
        isFeatured: true,
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Bomber Jacket',
        description: 'Stylish bomber jacket with ribbed cuffs. Perfect for transitional weather.',
        price: 4499,
        discountPrice: 3499,
        category: categories[4]._id,
        stock: 35,
        specifications: { Material: 'Polyester', Fit: 'Regular', Closure: 'Zip' },
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Leather Biker Jacket',
        description: 'Premium faux leather biker jacket. Edgy style with a comfortable fit.',
        price: 5999,
        discountPrice: 4499,
        category: categories[4]._id,
        stock: 20,
        specifications: { Material: 'Faux Leather', Fit: 'Slim', Closure: 'Zip' },
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      // Accessories
      {
        name: 'Leather Belt',
        description: 'Genuine leather belt with a polished buckle. Available in brown and black.',
        price: 999,
        discountPrice: 749,
        category: categories[5]._id,
        stock: 200,
        specifications: { Material: 'Genuine Leather', Width: '35mm' },
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Canvas Tote Bag',
        description: 'Spacious canvas tote bag. Durable and eco-friendly with multiple pockets.',
        price: 1499,
        discountPrice: 1099,
        category: categories[5]._id,
        stock: 75,
        specifications: { Material: 'Canvas', Size: 'Large' },
        isFeatured: true,
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Baseball Cap',
        description: 'Classic baseball cap with adjustable strap. One size fits all.',
        price: 699,
        discountPrice: 499,
        category: categories[5]._id,
        stock: 120,
        specifications: { Material: 'Cotton Twill', Size: 'Adjustable' },
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Woolen Scarf',
        description: 'Soft woolen scarf for winter. Keeps you warm in style.',
        price: 1299,
        discountPrice: 899,
        category: categories[5]._id,
        stock: 60,
        specifications: { Material: 'Wool Blend', Length: '180cm' },
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
      {
        name: 'Aviator Sunglasses',
        description: 'Classic aviator sunglasses with UV400 protection. Timeless style.',
        price: 1999,
        discountPrice: 1499,
        category: categories[5]._id,
        stock: 85,
        specifications: { Frame: 'Metal', Lens: 'UV400', Style: 'Aviator' },
        images: [{ url: 'https://placehold.co/400x600/png', publicId: '' }],
      },
    ]);

    console.log(`   ✅ Created ${products.length} products`);

    // ─── Summary ──────────────────────────────────────
    console.log('\n═══════════════════════════════════════════');
    console.log('🎉 Database seeded successfully!');
    console.log('═══════════════════════════════════════════');
    console.log(`   Users:      ${users.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products:   ${products.length}`);
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
