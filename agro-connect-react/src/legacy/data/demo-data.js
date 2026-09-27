/**
 * ============================================================================
 * DEMO DATA — REPLACE WITH API
 * ----------------------------------------------------------------------------
 * DEVELOPMENT ONLY. Nothing here is real. Every array below mirrors the shape a
 * FastAPI endpoint is expected to return, so swapping a demo import for a
 * service call (cropAPI.search(), orderAPI.list(), ...) is a one-line change.
 *
 * No AI prediction, price forecast, payment result or weather reading in this
 * file is used to fake a backend response on an AI/payment screen — those
 * screens show an explicit "service unavailable" state instead.
 * ============================================================================
 */

import { APP_CONFIG } from "../js/config.js";

const IMG = `${APP_CONFIG.BASE_PATH}/assets/images`;

export const CROP_CATEGORIES = [
  "Vegetables", "Fruits", "Grains & Cereals", "Pulses", "Oilseeds", "Spices", "Cash Crops",
];

export const CROP_TYPES = [
  "Potato", "Tomato", "Onion", "Wheat", "Rice", "Maize", "Cotton", "Sugarcane",
  "Soybean", "Chickpea", "Groundnut", "Turmeric", "Mango", "Banana",
];

export const STATES = ["Uttar Pradesh", "Maharashtra", "Punjab", "Karnataka", "Gujarat", "Bihar", "Madhya Pradesh", "Tamil Nadu"];

export const QUALITY_GRADES = ["Grade A", "Grade B", "Grade C", "Export Quality"];

export const UNITS = ["kg", "quintal", "tonne", "crate", "bag"];

/** DEMO DATA — REPLACE WITH API :: GET /crops */
export const DEMO_CROPS = [
  {
    id: "crp_1001", name: "Potato", variety: "Kufri Jyoti", category: "Vegetables", grade: "Grade A",
    price: 18, unit: "kg", previous_price: 16, quantity: 12000, min_order: 500, organic: false,
    harvest_date: "2026-08-22", available_from: "2026-08-25", updated_at: "2026-09-03T09:20:00Z",
    image: `${IMG}/crop-potato.jpg`, images: [`${IMG}/crop-potato.jpg`, `${IMG}/farm-field.jpg`, `${IMG}/harvest.jpg`],
    delivery: ["Farm pickup", "Local transport"], status: "active", orders: 6, views: 412,
    farmer: { id: "frm_21", name: "Ramesh Yadav", verified: true, rating: 4.7, village: "Bhogaon", district: "Mainpuri", state: "Uttar Pradesh" },
    description: "Freshly harvested table potatoes, hand-graded and stored in a ventilated shed. Uniform size, low moisture, suitable for retail and cold storage.",
  },
  {
    id: "crp_1002", name: "Tomato", variety: "Abhinav Hybrid", category: "Vegetables", grade: "Export Quality",
    price: 26, unit: "kg", previous_price: 29, quantity: 4200, min_order: 200, organic: true,
    harvest_date: "2026-09-01", available_from: "2026-09-02", updated_at: "2026-09-04T05:10:00Z",
    image: `${IMG}/crop-tomato.jpg`, images: [`${IMG}/crop-tomato.jpg`, `${IMG}/farm-field.jpg`],
    delivery: ["Farm pickup", "Cold-chain delivery"], status: "active", orders: 11, views: 908,
    farmer: { id: "frm_08", name: "Sunita Patil", verified: true, rating: 4.9, village: "Kalamb", district: "Pune", state: "Maharashtra" },
    description: "Organically grown hybrid tomatoes, picked at breaker stage for a longer shelf life during transit.",
  },
  {
    id: "crp_1003", name: "Wheat", variety: "HD-2967", category: "Grains & Cereals", grade: "Grade A",
    price: 2450, unit: "quintal", previous_price: 2380, quantity: 320, min_order: 10, organic: false,
    harvest_date: "2026-04-12", available_from: "2026-04-20", updated_at: "2026-09-02T11:45:00Z",
    image: `${IMG}/crop-wheat.jpg`, images: [`${IMG}/crop-wheat.jpg`, `${IMG}/harvest.jpg`],
    delivery: ["Farm pickup", "Mandi delivery"], status: "active", orders: 4, views: 233,
    farmer: { id: "frm_44", name: "Gurpreet Singh", verified: true, rating: 4.6, village: "Dhuri", district: "Sangrur", state: "Punjab" },
    description: "Cleaned and sun-dried wheat with moisture under 11%. Stored in jute bags on wooden pallets.",
  },
  {
    id: "crp_1004", name: "Onion", variety: "Nashik Red", category: "Vegetables", grade: "Grade B",
    price: 21, unit: "kg", previous_price: 21, quantity: 18000, min_order: 1000, organic: false,
    harvest_date: "2026-07-30", available_from: "2026-08-05", updated_at: "2026-09-01T14:00:00Z",
    image: `${IMG}/crop-onion.jpg`, images: [`${IMG}/crop-onion.jpg`, `${IMG}/farm-field.jpg`],
    delivery: ["Farm pickup", "Local transport", "Rail freight"], status: "active", orders: 9, views: 654,
    farmer: { id: "frm_08", name: "Sunita Patil", verified: true, rating: 4.9, village: "Kalamb", district: "Pune", state: "Maharashtra" },
    description: "Well-cured red onions with tight skin, suitable for long-distance movement and storage.",
  },
  {
    id: "crp_1005", name: "Rice", variety: "Sona Masoori", category: "Grains & Cereals", grade: "Grade A",
    price: 3150, unit: "quintal", previous_price: 3050, quantity: 210, min_order: 5, organic: true,
    harvest_date: "2026-06-18", available_from: "2026-06-25", updated_at: "2026-08-30T08:15:00Z",
    image: `${IMG}/crop-rice.jpg`, images: [`${IMG}/crop-rice.jpg`, `${IMG}/harvest.jpg`],
    delivery: ["Farm pickup", "Mandi delivery"], status: "paused", orders: 2, views: 189,
    farmer: { id: "frm_63", name: "Lakshmi Reddy", verified: false, rating: 4.3, village: "Gangavathi", district: "Koppal", state: "Karnataka" },
    description: "Single-polished Sona Masoori from a chemical-free block, milled locally on order.",
  },
  {
    id: "crp_1006", name: "Cotton", variety: "Bt Shankar-6", category: "Cash Crops", grade: "Grade A",
    price: 7300, unit: "quintal", previous_price: 7050, quantity: 95, min_order: 5, organic: false,
    harvest_date: "2026-02-10", available_from: "2026-02-18", updated_at: "2026-08-28T10:05:00Z",
    image: `${IMG}/crop-cotton.jpg`, images: [`${IMG}/crop-cotton.jpg`],
    delivery: ["Farm pickup", "Ginning mill delivery"], status: "active", orders: 3, views: 141,
    farmer: { id: "frm_77", name: "Bhavesh Chaudhary", verified: true, rating: 4.4, village: "Deesa", district: "Banaskantha", state: "Gujarat" },
    description: "Hand-picked cotton with staple length 29 mm, trash content under 3%.",
  },
  {
    id: "crp_1007", name: "Maize", variety: "Pioneer 3396", category: "Grains & Cereals", grade: "Grade B",
    price: 2080, unit: "quintal", previous_price: 2150, quantity: 400, min_order: 20, organic: false,
    harvest_date: "2026-07-05", available_from: "2026-07-12", updated_at: "2026-09-04T07:30:00Z",
    image: `${IMG}/crop-maize.jpg`, images: [`${IMG}/crop-maize.jpg`, `${IMG}/farm-field.jpg`],
    delivery: ["Farm pickup", "Local transport"], status: "active", orders: 7, views: 320,
    farmer: { id: "frm_44", name: "Gurpreet Singh", verified: true, rating: 4.6, village: "Dhuri", district: "Sangrur", state: "Punjab" },
    description: "Feed-grade maize, machine cleaned, moisture 12.5%.",
  },
  {
    id: "crp_1008", name: "Sugarcane", variety: "Co-0238", category: "Cash Crops", grade: "Grade A",
    price: 340, unit: "quintal", previous_price: 330, quantity: 1500, min_order: 50, organic: false,
    harvest_date: "2026-03-02", available_from: "2026-03-04", updated_at: "2026-08-25T06:00:00Z",
    image: `${IMG}/crop-sugarcane.jpg`, images: [`${IMG}/crop-sugarcane.jpg`],
    delivery: ["Farm pickup", "Mill delivery"], status: "active", orders: 5, views: 210,
    farmer: { id: "frm_21", name: "Ramesh Yadav", verified: true, rating: 4.7, village: "Bhogaon", district: "Mainpuri", state: "Uttar Pradesh" },
    description: "High-recovery cane variety, cut to order and dispatched within 24 hours.",
  },
  {
    id: "crp_1009", name: "Chickpea", variety: "JG-11", category: "Pulses", grade: "Grade A",
    price: 5900, unit: "quintal", previous_price: 5750, quantity: 120, min_order: 5, organic: true,
    harvest_date: "2026-03-28", available_from: "2026-04-04", updated_at: "2026-09-03T15:40:00Z",
    image: `${IMG}/crop-chickpea.jpg`, images: [`${IMG}/crop-chickpea.jpg`, `${IMG}/harvest.jpg`],
    delivery: ["Farm pickup", "Local transport"], status: "active", orders: 8, views: 288,
    farmer: { id: "frm_63", name: "Lakshmi Reddy", verified: false, rating: 4.3, village: "Gangavathi", district: "Koppal", state: "Karnataka" },
    description: "Bold-grain desi chickpea, hand sorted, free of split and shrivelled grain.",
  },
];

/** DEMO DATA — REPLACE WITH API :: GET /farmers */
export const DEMO_FARMERS = [
  {
    id: "frm_21", name: "Ramesh Yadav", phone: "+91 98xxx 21045", email: "ramesh.y@example.in",
    village: "Bhogaon", district: "Mainpuri", state: "Uttar Pradesh", pincode: "205262",
    farm_size: "6.5 acres", farming_type: "Conventional", main_crops: ["Potato", "Sugarcane", "Wheat"],
    verification: "Verified", rating: 4.7, reviews: 64, listings: 4, since: "2024-06-11", avatar: null,
  },
  {
    id: "frm_08", name: "Sunita Patil", phone: "+91 90xxx 88110", email: "sunita.p@example.in",
    village: "Kalamb", district: "Pune", state: "Maharashtra", pincode: "412211",
    farm_size: "11 acres", farming_type: "Organic", main_crops: ["Tomato", "Onion", "Grapes"],
    verification: "Verified", rating: 4.9, reviews: 132, listings: 6, since: "2023-11-02", avatar: null,
  },
  {
    id: "frm_44", name: "Gurpreet Singh", phone: "+91 99xxx 30012", email: "gurpreet.s@example.in",
    village: "Dhuri", district: "Sangrur", state: "Punjab", pincode: "148024",
    farm_size: "24 acres", farming_type: "Mixed", main_crops: ["Wheat", "Maize", "Paddy"],
    verification: "Verified", rating: 4.6, reviews: 88, listings: 5, since: "2024-01-19", avatar: null,
  },
  {
    id: "frm_63", name: "Lakshmi Reddy", phone: "+91 97xxx 71203", email: "lakshmi.r@example.in",
    village: "Gangavathi", district: "Koppal", state: "Karnataka", pincode: "583227",
    farm_size: "8 acres", farming_type: "Natural farming", main_crops: ["Rice", "Chickpea"],
    verification: "Pending", rating: 4.3, reviews: 21, listings: 3, since: "2025-07-30", avatar: null,
  },
  {
    id: "frm_77", name: "Bhavesh Chaudhary", phone: "+91 94xxx 55182", email: "bhavesh.c@example.in",
    village: "Deesa", district: "Banaskantha", state: "Gujarat", pincode: "385535",
    farm_size: "18 acres", farming_type: "Conventional", main_crops: ["Cotton", "Groundnut", "Castor"],
    verification: "Not Verified", rating: 4.4, reviews: 37, listings: 2, since: "2025-02-14", avatar: null,
  },
];

/** DEMO DATA — REPLACE WITH API :: GET /orders */
export const DEMO_ORDERS = [
  {
    id: "ORD-24817", crop: "Potato", variety: "Kufri Jyoti", crop_id: "crp_1001", quantity: 2000, unit: "kg",
    price: 18, delivery_fee: 2400, status: "Preparing", placed_at: "2026-09-02T10:12:00Z",
    buyer: { id: "byr_11", name: "Anand Traders", city: "Agra" }, farmer: { id: "frm_21", name: "Ramesh Yadav" },
    delivery_mode: "Local transport", expected: "2026-09-08",
  },
  {
    id: "ORD-24802", crop: "Tomato", variety: "Abhinav Hybrid", crop_id: "crp_1002", quantity: 600, unit: "kg",
    price: 26, delivery_fee: 1500, status: "Out for Delivery", placed_at: "2026-09-01T06:45:00Z",
    buyer: { id: "byr_04", name: "FreshKart Retail", city: "Mumbai" }, farmer: { id: "frm_08", name: "Sunita Patil" },
    delivery_mode: "Cold-chain delivery", expected: "2026-09-05",
  },
  {
    id: "ORD-24788", crop: "Wheat", variety: "HD-2967", crop_id: "crp_1003", quantity: 40, unit: "quintal",
    price: 2450, delivery_fee: 3800, status: "Completed", placed_at: "2026-08-24T09:00:00Z",
    buyer: { id: "byr_19", name: "Sangrur Flour Mill", city: "Sangrur" }, farmer: { id: "frm_44", name: "Gurpreet Singh" },
    delivery_mode: "Mandi delivery", expected: "2026-08-28",
  },
  {
    id: "ORD-24771", crop: "Onion", variety: "Nashik Red", crop_id: "crp_1004", quantity: 5000, unit: "kg",
    price: 21, delivery_fee: 6200, status: "Pending", placed_at: "2026-09-04T04:20:00Z",
    buyer: { id: "byr_07", name: "Deccan Exports", city: "Hyderabad" }, farmer: { id: "frm_08", name: "Sunita Patil" },
    delivery_mode: "Rail freight", expected: "2026-09-12",
  },
  {
    id: "ORD-24750", crop: "Chickpea", variety: "JG-11", crop_id: "crp_1009", quantity: 15, unit: "quintal",
    price: 5900, delivery_fee: 1900, status: "Cancelled", placed_at: "2026-08-18T12:30:00Z",
    buyer: { id: "byr_11", name: "Anand Traders", city: "Agra" }, farmer: { id: "frm_63", name: "Lakshmi Reddy" },
    delivery_mode: "Farm pickup", expected: "2026-08-22",
  },
];

export const ORDER_STAGES = ["Order Placed", "Farmer Accepted", "Preparing", "Ready", "Out for Delivery", "Completed"];

/** DEMO DATA — REPLACE WITH API :: GET /messages/conversations */
export const DEMO_CONVERSATIONS = [
  {
    id: "cnv_1", name: "Anand Traders", role: "Buyer", unread: 2, last_at: "2026-09-04T07:40:00Z",
    preview: "Can you hold 500 kg until Friday?",
    messages: [
      { id: 1, from: "them", text: "Namaste. Is the Kufri Jyoti lot still available?", at: "2026-09-04T06:55:00Z" },
      { id: 2, from: "me", text: "Yes, about 12 tonnes are in the shed right now.", at: "2026-09-04T07:02:00Z" },
      { id: 3, from: "them", text: "Can you hold 500 kg until Friday?", at: "2026-09-04T07:40:00Z" },
    ],
  },
  {
    id: "cnv_2", name: "FreshKart Retail", role: "Buyer", unread: 0, last_at: "2026-09-03T15:10:00Z",
    preview: "Delivery vehicle reaches by 6 am.",
    messages: [
      { id: 1, from: "them", text: "Our cold van is scheduled for tomorrow.", at: "2026-09-03T14:52:00Z" },
      { id: 2, from: "me", text: "Crates will be ready at the gate.", at: "2026-09-03T15:04:00Z" },
      { id: 3, from: "them", text: "Delivery vehicle reaches by 6 am.", at: "2026-09-03T15:10:00Z" },
    ],
  },
  {
    id: "cnv_3", name: "Deccan Exports", role: "Buyer", unread: 1, last_at: "2026-09-02T11:22:00Z",
    preview: "Sharing our quality checklist.",
    messages: [
      { id: 1, from: "them", text: "Sharing our quality checklist.", at: "2026-09-02T11:22:00Z" },
    ],
  },
];

/** DEMO DATA — REPLACE WITH API :: GET /notifications */
export const DEMO_NOTIFICATIONS = [
  { id: "ntf_1", type: "Orders", title: "New order received", body: "Deccan Exports placed ORD-24771 for 5,000 kg onion.", at: "2026-09-04T04:22:00Z", read: false },
  { id: "ntf_2", type: "Messages", title: "New message", body: "Anand Traders asked about holding 500 kg.", at: "2026-09-04T07:41:00Z", read: false },
  { id: "ntf_3", type: "Weather", title: "Rainfall advisory", body: "Heavy showers expected in Mainpuri over the next 48 hours.", at: "2026-09-03T18:00:00Z", read: false },
  { id: "ntf_4", type: "AI", title: "Expert review completed", body: "Your submitted potato leaf case was reviewed by an agronomist.", at: "2026-09-02T09:15:00Z", read: true },
  { id: "ntf_5", type: "Marketplace", title: "Listing performing well", body: "Your tomato listing crossed 900 views this week.", at: "2026-09-01T08:00:00Z", read: true },
  { id: "ntf_6", type: "System", title: "Profile verification approved", body: "Your farm documents were verified successfully.", at: "2026-08-29T13:30:00Z", read: true },
];

/** DEMO DATA — REPLACE WITH API :: GET /prices/history */
export const DEMO_PRICE_HISTORY = [
  { label: "Mar", value: 14 }, { label: "Apr", value: 15 }, { label: "May", value: 13 },
  { label: "Jun", value: 16 }, { label: "Jul", value: 17 }, { label: "Aug", value: 16 },
  { label: "Sep", value: 18 },
];

export const DEMO_REGIONAL_PRICES = [
  { region: "Mainpuri, UP", price: 18, change: 2.4 },
  { region: "Agra, UP", price: 19, change: 1.1 },
  { region: "Kanpur, UP", price: 17, change: -0.8 },
  { region: "Delhi Azadpur", price: 22, change: 3.6 },
  { region: "Lucknow, UP", price: 20, change: 0.4 },
];

export const DEMO_SALES_SERIES = [
  { label: "Mar", value: 62000 }, { label: "Apr", value: 74000 }, { label: "May", value: 58000 },
  { label: "Jun", value: 91000 }, { label: "Jul", value: 104000 }, { label: "Aug", value: 96000 },
  { label: "Sep", value: 118000 },
];

export const DEMO_ORDER_SERIES = [
  { label: "Mar", value: 8 }, { label: "Apr", value: 11 }, { label: "May", value: 7 },
  { label: "Jun", value: 14 }, { label: "Jul", value: 18 }, { label: "Aug", value: 15 }, { label: "Sep", value: 21 },
];

export const DEMO_INVENTORY = [
  { crop: "Potato", available: 12000, unit: "kg", reserved: 2000 },
  { crop: "Sugarcane", available: 1500, unit: "quintal", reserved: 150 },
  { crop: "Wheat", available: 320, unit: "quintal", reserved: 40 },
];

/** DEMO DATA — REPLACE WITH API :: GET /ai/crop-health (illustrative UI values only) */
export const DEMO_HEALTH = {
  score: 78,
  metrics: [
    { label: "Disease Risk", value: 34, tone: "warn", note: "Late blight pressure rising with humidity" },
    { label: "Pest Risk", value: 18, tone: "ok", note: "No pest reports in your block this week" },
    { label: "Water Stress", value: 52, tone: "warn", note: "Soil moisture below target in plot B" },
    { label: "Weather Risk", value: 61, tone: "danger", note: "Heavy rain forecast within 48 hours" },
  ],
  timeline: [
    { label: "W22", value: 71 }, { label: "W23", value: 74 }, { label: "W24", value: 69 },
    { label: "W25", value: 76 }, { label: "W26", value: 81 }, { label: "W27", value: 78 },
  ],
};

/** DEMO DATA — REPLACE WITH API :: GET /weather (never used as a real reading) */
export const DEMO_WEATHER = {
  location: "Bhogaon, Mainpuri, Uttar Pradesh",
  current: { temp: 31, humidity: 74, rain_probability: 65, wind: 14, condition: "Humid, cloudy" },
  forecast: [
    { day: "Sat", temp: 31, rain: 65, condition: "Showers" },
    { day: "Sun", temp: 29, rain: 80, condition: "Heavy rain" },
    { day: "Mon", temp: 30, rain: 45, condition: "Cloudy" },
    { day: "Tue", temp: 32, rain: 20, condition: "Partly sunny" },
    { day: "Wed", temp: 33, rain: 10, condition: "Sunny" },
    { day: "Thu", temp: 33, rain: 15, condition: "Sunny" },
    { day: "Fri", temp: 32, rain: 35, condition: "Cloudy" },
  ],
  alerts: [{ level: "warning", title: "Heavy rainfall advisory", body: "50–80 mm expected over 48 hours. Delay spraying and secure harvested produce." }],
};

/** DEMO DATA — REPLACE WITH API :: GET /expert/reviews/pending */
export const DEMO_EXPERT_CASES = [
  { id: "case_5521", crop: "Potato", farmer: "Ramesh Yadav", submitted_at: "2026-09-03T12:00:00Z", ai_condition: "Late blight (suspected)", confidence: 0.58, severity: "Moderate", status: "Pending", image: `${IMG}/crop-potato.jpg`, symptoms: ["Dark water-soaked lesions", "White growth on leaf underside"] },
  { id: "case_5518", crop: "Tomato", farmer: "Sunita Patil", submitted_at: "2026-09-03T08:30:00Z", ai_condition: "Early blight (suspected)", confidence: 0.83, severity: "Low", status: "Pending", image: `${IMG}/crop-tomato.jpg`, symptoms: ["Concentric ring spots on lower leaves"] },
  { id: "case_5502", crop: "Wheat", farmer: "Gurpreet Singh", submitted_at: "2026-09-02T15:10:00Z", ai_condition: "Yellow rust (suspected)", confidence: 0.44, severity: "Unclear", status: "Pending", image: `${IMG}/crop-wheat.jpg`, symptoms: ["Yellow stripes along leaf veins"] },
  { id: "case_5490", crop: "Onion", farmer: "Sunita Patil", submitted_at: "2026-09-01T10:05:00Z", ai_condition: "Purple blotch (suspected)", confidence: 0.91, severity: "Moderate", status: "Confirmed", image: `${IMG}/crop-onion.jpg`, symptoms: ["Purple centred lesions"] },
];

/** DEMO DATA — REPLACE WITH API :: GET /admin/stats */
export const DEMO_ADMIN_STATS = {
  users: 8642, farmers: 5219, buyers: 3186, experts: 74, listings: 4128,
  orders: 12734, ai_analyses: 21890, reviews: 6104, gmv: 48260000,
  signups: [
    { label: "Mar", value: 320 }, { label: "Apr", value: 410 }, { label: "May", value: 388 },
    { label: "Jun", value: 512 }, { label: "Jul", value: 640 }, { label: "Aug", value: 705 }, { label: "Sep", value: 812 },
  ],
  role_split: [
    { label: "Farmers", value: 5219 }, { label: "Buyers", value: 3186 }, { label: "Experts", value: 74 }, { label: "Admins", value: 163 },
  ],
};

/** DEMO DATA — REPLACE WITH API :: GET /users */
export const DEMO_USERS = [
  { id: "usr_9001", name: "Ramesh Yadav", role: "Farmer", email: "ramesh.y@example.in", phone: "+91 98xxx 21045", state: "Uttar Pradesh", status: "Active", joined: "2024-06-11" },
  { id: "usr_9002", name: "Sunita Patil", role: "Farmer", email: "sunita.p@example.in", phone: "+91 90xxx 88110", state: "Maharashtra", status: "Active", joined: "2023-11-02" },
  { id: "usr_9003", name: "Anand Traders", role: "Buyer", email: "buy@anandtraders.example", phone: "+91 93xxx 44551", state: "Uttar Pradesh", status: "Active", joined: "2024-08-21" },
  { id: "usr_9004", name: "FreshKart Retail", role: "Buyer", email: "procure@freshkart.example", phone: "+91 91xxx 20390", state: "Maharashtra", status: "Active", joined: "2025-01-05" },
  { id: "usr_9005", name: "Dr. Meera Nair", role: "Expert", email: "m.nair@example.ac.in", phone: "+91 99xxx 10228", state: "Kerala", status: "Active", joined: "2025-03-17" },
  { id: "usr_9006", name: "Lakshmi Reddy", role: "Farmer", email: "lakshmi.r@example.in", phone: "+91 97xxx 71203", state: "Karnataka", status: "Pending", joined: "2025-07-30" },
  { id: "usr_9007", name: "Deccan Exports", role: "Buyer", email: "ops@deccanexports.example", phone: "+91 96xxx 33871", state: "Telangana", status: "Suspended", joined: "2024-12-09" },
  { id: "usr_9008", name: "Dr. Arvind Kale", role: "Expert", email: "a.kale@example.ac.in", phone: "+91 95xxx 66004", state: "Maharashtra", status: "Active", joined: "2025-05-24" },
];

/** DEMO DATA — REPLACE WITH API :: GET /ai/models (display metadata only) */
export const DEMO_MODELS = [
  { name: "Disease Classifier", key: "disease_detection", version: "v3.2.1", status: "Active", updated: "2026-08-19", metrics: { Accuracy: "92.4%", "F1": "0.91", Classes: "38" } },
  { name: "Pest Detector", key: "pest_detection", version: "v1.8.0", status: "Active", updated: "2026-07-28", metrics: { mAP: "0.78", Recall: "0.81", Classes: "17" } },
  { name: "Severity Model", key: "severity", version: "v2.0.3", status: "Active", updated: "2026-08-02", metrics: { MAE: "0.34", Levels: "4" } },
  { name: "Yield Prediction", key: "yield_prediction", version: "v0.9.4", status: "Staging", updated: "2026-08-30", metrics: { RMSE: "0.62 t/ha", "R²": "0.74" } },
  { name: "Price Prediction", key: "price_prediction", version: "v1.4.2", status: "Active", updated: "2026-09-01", metrics: { MAPE: "7.9%", Horizon: "14 days" } },
  { name: "Disease Risk", key: "disease_risk", version: "v1.1.0", status: "Active", updated: "2026-08-11", metrics: { AUC: "0.86", Regions: "112" } },
];

/** DEMO DATA — REPLACE WITH API :: GET /ai/analytics */
export const DEMO_AI_ANALYTICS = {
  total: 21890, high_confidence: 15422, low_confidence: 3164, expert_verified: 2911,
  by_disease: [
    { label: "Late blight", value: 4210 }, { label: "Early blight", value: 3180 },
    { label: "Leaf spot", value: 2640 }, { label: "Rust", value: 2210 },
    { label: "Nutrient deficiency", value: 1880 }, { label: "Other", value: 7770 },
  ],
  by_crop: [
    { label: "Potato", value: 6120 }, { label: "Tomato", value: 5480 }, { label: "Wheat", value: 3390 },
    { label: "Rice", value: 2710 }, { label: "Onion", value: 2210 }, { label: "Others", value: 1980 },
  ],
  volume: [
    { label: "Mar", value: 1980 }, { label: "Apr", value: 2240 }, { label: "May", value: 2610 },
    { label: "Jun", value: 3120 }, { label: "Jul", value: 3480 }, { label: "Aug", value: 3990 }, { label: "Sep", value: 4470 },
  ],
};

/** DEMO DATA — REPLACE WITH API :: GET /knowledge */
export const DEMO_KNOWLEDGE = [
  { id: "kb_01", crop: "Potato", disease: "Late blight", symptoms: "Dark water-soaked lesions on leaves; white mould under humid conditions.", causes: "Phytophthora infestans, favoured by cool wet weather.", management: "Improve drainage, avoid overhead irrigation, remove infected debris.", treatment: "Follow the state agriculture department's approved fungicide schedule.", safety: "Observe the pre-harvest interval printed on the product label.", source: "ICAR advisory", reviewed: "2026-06-14" },
  { id: "kb_02", crop: "Tomato", disease: "Early blight", symptoms: "Concentric ring spots on older leaves; yellow halo.", causes: "Alternaria solani, warm humid spells.", management: "Crop rotation, staking, balanced nitrogen.", treatment: "Consult local KVK for the current recommendation.", safety: "Wear protective equipment during any spray operation.", source: "State agriculture university", reviewed: "2026-05-30" },
  { id: "kb_03", crop: "Wheat", disease: "Yellow rust", symptoms: "Yellow stripes of powdery pustules along leaf veins.", causes: "Puccinia striiformis, cool humid conditions.", management: "Sow resistant varieties, monitor from tillering.", treatment: "Refer to the approved district advisory.", safety: "Do not graze treated fields.", source: "IIWBR advisory", reviewed: "2026-04-21" },
  { id: "kb_04", crop: "Onion", disease: "Purple blotch", symptoms: "Small white sunken lesions turning purple.", causes: "Alternaria porri, high humidity.", management: "Wider spacing, drip irrigation, field sanitation.", treatment: "Consult the local extension officer.", safety: "Maintain re-entry intervals.", source: "NHRDF bulletin", reviewed: "2026-07-08" },
];

/** DEMO DATA — REPLACE WITH API :: GET /admin/audit-logs */
export const DEMO_AUDIT_LOGS = [
  { id: "log_88213", at: "2026-09-04T07:02:11Z", actor: "admin@agroconnect.example", action: "user.suspend", target: "usr_9007", ip: "10.4.2.19", result: "Success" },
  { id: "log_88212", at: "2026-09-04T06:48:03Z", actor: "system", action: "model.promote", target: "price_prediction v1.4.2", ip: "—", result: "Success" },
  { id: "log_88211", at: "2026-09-03T19:20:55Z", actor: "m.nair@example.ac.in", action: "expert.review.submit", target: "case_5490", ip: "10.4.7.66", result: "Success" },
  { id: "log_88210", at: "2026-09-03T14:11:37Z", actor: "admin@agroconnect.example", action: "farmer.verify", target: "frm_44", ip: "10.4.2.19", result: "Success" },
  { id: "log_88209", at: "2026-09-03T09:03:12Z", actor: "ops@deccanexports.example", action: "auth.login", target: "—", ip: "103.21.8.4", result: "Failed" },
];

/** DEMO DATA — REPLACE WITH API :: GET /reviews */
export const DEMO_REVIEWS = [
  { id: "rev_1", farmer: "Ramesh Yadav", buyer: "Anand Traders", rating: 5, at: "2026-08-29", text: "Grading matched the listing exactly and loading was quick." },
  { id: "rev_2", farmer: "Sunita Patil", buyer: "FreshKart Retail", rating: 5, at: "2026-08-22", text: "Consistent quality across three consecutive consignments." },
  { id: "rev_3", farmer: "Gurpreet Singh", buyer: "Sangrur Flour Mill", rating: 4, at: "2026-08-14", text: "Good moisture control, delivery was a day late." },
];

/** DEMO DATA — REPLACE WITH API :: GET /orders/{id}/offers */
export const DEMO_OFFERS = [
  { id: "of_1", from: "buyer", actor: "Anand Traders", amount: 16.5, quantity: 2000, unit: "kg", note: "Regular monthly pickup, can lift in one trip.", at: "2026-09-02T10:20:00Z", status: "countered" },
  { id: "of_2", from: "farmer", actor: "Ramesh Yadav", amount: 17.5, quantity: 2000, unit: "kg", note: "Grading and loading included at this rate.", at: "2026-09-02T11:05:00Z", status: "countered" },
  { id: "of_3", from: "buyer", actor: "Anand Traders", amount: 17.0, quantity: 2000, unit: "kg", note: "Final offer from our side.", at: "2026-09-02T12:40:00Z", status: "pending" },
];
