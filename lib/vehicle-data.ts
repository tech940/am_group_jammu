// Mock vehicle database - in real app, this would come from an API/database
export interface VehicleSpecs {
  range?: string
  acceleration?: string
  topSpeed?: string
  engine?: string
  power?: string
  transmission?: string
  drive?: string
  fuel?: string
  mileage?: string
  seats?: string
  year?: string
}

export interface Vehicle {
  id: string
  name: string
  brand: string
  type: string
  year?: string
  specs: VehicleSpecs
  price: string
  image: string
  images?: string[]
  description?: string
  features?: string[]
  colors?: string[]
}

export const vehicles: Vehicle[] = [
  {
    id: "hyundai-ioniq-5",
    name: "IONIQ 5",
    brand: "Hyundai",
    type: "Electric SUV",
    year: "2025",
    specs: {
      range: "480 km",
      acceleration: "5.2s",
      topSpeed: "185 km/h",
      engine: "Electric",
      power: "225 PS",
      transmission: "Automatic",
      drive: "AWD",
      fuel: "Electric",
      mileage: "480 km/charge",
      seats: "5"
    },
    price: "₹ 46.05 Lakh*",
    image: "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800"
    ],
    description: "The Hyundai IONIQ 5 represents the future of electric mobility with striking design, advanced technology, and impressive performance. This all-electric SUV combines retro-futuristic aesthetics with cutting-edge features.",
    features: [
      "Ultra-fast charging (10-80% in 18 min)",
      "Vehicle-to-Load (V2L) functionality",
      "Augmented reality head-up display",
      "Digital center console",
      "Smart parking assist",
      "Highway Driving Assist 2"
    ],
    colors: ["Phantom Black", "Atlas White", "Gravity Gold", "Digital Teal"]
  },
  {
    id: "kia-ev6",
    name: "EV6",
    brand: "Kia",
    type: "Electric SUV",
    year: "2025",
    specs: {
      range: "528 km",
      acceleration: "5.2s",
      topSpeed: "185 km/h",
      engine: "Electric",
      power: "239 PS",
      transmission: "Automatic",
      drive: "RWD",
      fuel: "Electric",
      mileage: "528 km/charge",
      seats: "5"
    },
    price: "₹ 60.95 Lakh*",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800"
    ],
    description: "The Kia EV6 is a groundbreaking all-electric crossover that combines bold design with exceptional performance and ultra-fast charging capabilities.",
    features: [
      "800V ultra-fast charging",
      "E-GMP (Electric Global Modular Platform)",
      "Dual-motor AWD option",
      "Augmented reality navigation",
      "Smart highway driving assist",
      "Vehicle-to-load functionality"
    ],
    colors: ["Snow White Pearl", "Aurora Black", "Gravity Blue", "Yacht Blue"]
  },
  {
    id: "mg-zs-ev",
    name: "ZS EV",
    brand: "MG",
    type: "Electric SUV",
    year: "2025",
    specs: {
      range: "461 km",
      acceleration: "8.5s",
      topSpeed: "140 km/h",
      engine: "Electric",
      power: "176 PS",
      transmission: "Automatic",
      drive: "FWD",
      fuel: "Electric",
      mileage: "461 km/charge",
      seats: "5"
    },
    price: "₹ 27.58 Lakh*",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
    ],
    description: "The MG ZS EV offers practical electric mobility with impressive range, advanced safety features, and affordable pricing.",
    features: [
      "Fast charging (0-80% in 42 min)",
      "Connected car technology",
      "PHEV and EV options",
      "Advanced driver assistance",
      "Spacious interior",
      "5-star safety rating"
    ],
    colors: ["Cosmic Silver", "Stark White", "Copenhagen Blue", "Black Pearl"]
  },
  {
    id: "mahindra-xuv400",
    name: "XUV400",
    brand: "Mahindra",
    type: "Electric SUV",
    year: "2025",
    specs: {
      range: "456 km",
      acceleration: "8.3s",
      topSpeed: "160 km/h",
      engine: "Electric",
      power: "150 PS",
      transmission: "Automatic",
      drive: "FWD",
      fuel: "Electric",
      mileage: "456 km/charge",
      seats: "5"
    },
    price: "₹ 15.49 Lakh*",
    image: "https://images.unsplash.com/photo-1549398252-7512a0c4e6d4?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1549398252-7512a0c4e6d4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
    ],
    description: "The Mahindra XUV400 is India's first all-electric SUV, offering cutting-edge technology, impressive performance, and great value.",
    features: [
      "Fast charging support",
      "Connected car features",
      "Multiple drive modes",
      "Regenerative braking",
      "Spacious cabin",
      "Advanced safety suite"
    ],
    colors: ["Arctic Blue", "Napoli Black", "Electric Blue", "Galaxy Grey"]
  },
  {
    id: "tata-nexon-ev",
    name: "Nexon EV",
    brand: "Tata",
    type: "Electric SUV",
    year: "2025",
    specs: {
      range: "465 km",
      acceleration: "9.0s",
      topSpeed: "140 km/h",
      engine: "Electric",
      power: "143 PS",
      transmission: "Automatic",
      drive: "FWD",
      fuel: "Electric",
      mileage: "465 km/charge",
      seats: "5"
    },
    price: "₹ 14.49 Lakh*",
    image: "https://images.unsplash.com/photo-1551836022-deb716c12ce9?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1551836022-deb716c12ce9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1549398252-7512a0c4e6d4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800"
    ],
    description: "The Tata Nexon EV is India's best-selling electric SUV, combining practicality, performance, and affordability.",
    features: [
      "Fast charging (0-80% in 60 min)",
      "Connected car technology",
      "Multiple drive modes",
      "IP67 rated battery",
      "Spacious interior",
      "5-star safety rating"
    ],
    colors: ["Tecno Blue", "Daytona Grey", "Flame Red", "Ocean Blue"]
  },
  {
    id: "toyota-hilux",
    name: "Hilux",
    brand: "Toyota",
    type: "Pickup Truck",
    year: "2025",
    specs: {
      range: "800 km",
      acceleration: "11.0s",
      topSpeed: "170 km/h",
      engine: "2.8L Diesel",
      power: "204 PS",
      transmission: "Manual/Auto",
      drive: "4WD",
      fuel: "Diesel",
      mileage: "12 km/l",
      seats: "5"
    },
    price: "₹ 35.00 Lakh*",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1551836022-deb716c12ce9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1549398252-7512a0c4e6d4?auto=format&fit=crop&q=80&w=800"
    ],
    description: "The Toyota Hilux is legendary for its toughness, reliability, and off-road capability, making it the perfect workhorse.",
    features: [
      "Legendary Toyota reliability",
      "Excellent off-road capability",
      "Strong towing capacity",
      "Comfortable cabin",
      "Advanced safety features",
      "Multiple trim options"
    ],
    colors: ["White", "Silver", "Black", "Grey"]
  },
  {
    id: "hyundai-venue",
    name: "Venue",
    brand: "Hyundai",
    type: "Compact SUV",
    year: "2025",
    specs: {
      range: "500 km",
      acceleration: "11.5s",
      topSpeed: "165 km/h",
      engine: "1.0L Turbo Petrol",
      power: "120 PS",
      transmission: "Manual/DCT",
      drive: "FWD",
      fuel: "Petrol",
      mileage: "18 km/l",
      seats: "5"
    },
    price: "₹ 7.53 Lakh*",
    image: "https://images.unsplash.com/photo-1542362567-b07e5e58a1ea?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1542362567-b07e5e58a1ea?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1551836022-deb716c12ce9?auto=format&fit=crop&q=80&w=800"
    ],
    description: "The Hyundai Venue is a feature-packed compact SUV that offers premium features and technology at an affordable price point.",
    features: [
      "BlueLink connected car",
      "Wireless charging",
      "Digital instrument cluster",
      "Sunroof option",
      "Advanced safety features",
      "Multiple engine options"
    ],
    colors: ["Polar White", "Titan Grey", "Fiery Red", "Phantom Black"]
  },
  {
    id: "kia-sonet",
    name: "Sonet",
    brand: "Kia",
    type: "Compact SUV",
    year: "2025",
    specs: {
      range: "550 km",
      acceleration: "12.0s",
      topSpeed: "160 km/h",
      engine: "1.0L Turbo Petrol",
      power: "120 PS",
      transmission: "Manual/iMT",
      drive: "FWD",
      fuel: "Petrol",
      mileage: "19 km/l",
      seats: "5"
    },
    price: "₹ 7.99 Lakh*",
    image: "https://images.unsplash.com/photo-1553412264-f56e5d994d33?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1553412264-f56e5d994d33?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1542362567-b07e5e58a1ea?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800"
    ],
    description: "The Kia Sonet is a stylish and feature-rich compact SUV that offers premium features in a compact package.",
    features: [
      "UVO connected car",
      "Ventilated front seats",
      "Air purifier",
      "Smart sunroof",
      "Wireless charging",
      "Multiple drive modes"
    ],
    colors: ["Glacier White", "Aurora Black", "Intense Red", "Steel Silver"]
  },
  {
    id: "mg-astor",
    name: "Astor",
    brand: "MG",
    type: "Compact SUV",
    year: "2025",
    specs: {
      range: "600 km",
      acceleration: "10.5s",
      topSpeed: "180 km/h",
      engine: "1.3L Turbo Petrol",
      power: "163 PS",
      transmission: "Manual/CVT",
      drive: "FWD",
      fuel: "Petrol",
      mileage: "15 km/l",
      seats: "5"
    },
    price: "₹ 10.52 Lakh*",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1553412264-f56e5d994d33?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1542362567-b07e5e58a1ea?auto=format&fit=crop&q=80&w=800"
    ],
    description: "The MG Astor is India's first SUV with personal AI assistant and autonomous level 2 technology, offering advanced features.",
    features: [
      "Personal AI assistant",
      "Autonomous level 2 features",
      "360-degree camera",
      "Large panoramic sunroof",
      "Premium audio system",
      "Wireless charging"
    ],
    colors: ["Glacial Silver", "Spice Orange", "Stardust Black", "Candy Red"]
  }
]

// Helper functions for vehicle data
export const getVehicleById = (id: string): Vehicle | undefined => {
  return vehicles.find(vehicle => vehicle.id === id)
}

export const getVehiclesByBrand = (brand: string): Vehicle[] => {
  return vehicles.filter(vehicle => vehicle.brand.toLowerCase() === brand.toLowerCase())
}

export const getVehiclesByType = (type: string): Vehicle[] => {
  return vehicles.filter(vehicle => vehicle.type.toLowerCase().includes(type.toLowerCase()))
}

export const searchVehicles = (query: string): Vehicle[] => {
  const searchQuery = query.toLowerCase()
  return vehicles.filter(vehicle => 
    vehicle.name.toLowerCase().includes(searchQuery) ||
    vehicle.brand.toLowerCase().includes(searchQuery) ||
    vehicle.type.toLowerCase().includes(searchQuery)
  )
}
