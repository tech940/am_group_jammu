/**
 * The makes and models offered as one-tap choices in the valuation form.
 *
 * This is a convenience list, not a rule: "Other brand" and "Other model"
 * accept anything typed in, because the dealership values any car. Models are
 * ordered roughly by how common they are on the road in Jammu & Kashmir, so
 * the ones most sellers own are on the first screen; the form shows the first
 * twelve and puts the rest behind "more models".
 */
export interface Make {
  name: string
  models: string[]
}

export const MAKES: Make[] = [
  {
    name: "Hyundai",
    models: [
      "Creta", "i20", "Grand i10 Nios", "Venue", "Verna", "Grand i10", "Exter", "Aura",
      "Alcazar", "Xcent", "i10", "Santro", "Eon", "Elite i20", "i20 Active", "Tucson",
      "Elantra", "Accent", "Kona Electric", "Ioniq 5",
    ],
  },
  {
    name: "Maruti Suzuki",
    models: [
      "Swift", "Baleno", "Wagon R", "Alto", "Dzire", "Brezza", "Ertiga", "Celerio",
      "Alto K10", "S-Presso", "Ignis", "Ciaz", "Fronx", "Grand Vitara", "XL6", "Eeco",
      "Omni", "Ritz", "Zen Estilo", "A-Star", "SX4", "S-Cross", "Jimny", "Invicto", "800",
    ],
  },
  {
    name: "Tata",
    models: [
      "Nexon", "Punch", "Tiago", "Altroz", "Harrier", "Safari", "Tigor", "Curvv",
      "Nexon EV", "Tiago EV", "Hexa", "Zest", "Bolt", "Indica", "Indigo", "Nano", "Sumo",
    ],
  },
  {
    name: "Mahindra",
    models: [
      "Scorpio", "Bolero", "XUV700", "Thar", "XUV300", "Scorpio-N", "XUV500", "XUV 3XO",
      "Bolero Neo", "TUV300", "KUV100", "Marazzo", "Xylo", "Verito", "XUV400",
    ],
  },
  {
    name: "Kia",
    models: ["Seltos", "Sonet", "Carens", "Syros", "Carnival", "EV6"],
  },
  {
    name: "Toyota",
    models: [
      "Innova Crysta", "Fortuner", "Glanza", "Urban Cruiser Hyryder", "Innova", "Etios",
      "Etios Liva", "Innova Hycross", "Urban Cruiser", "Corolla Altis", "Yaris", "Camry", "Rumion",
    ],
  },
  {
    name: "Honda",
    models: [
      "City", "Amaze", "Jazz", "WR-V", "Elevate", "Brio", "Civic", "BR-V", "Mobilio", "CR-V", "Accord",
    ],
  },
  {
    name: "MG",
    models: ["Hector", "Astor", "ZS EV", "Hector Plus", "Comet EV", "Gloster", "Windsor EV"],
  },
]

/** Shown on the first model screen; the rest sit behind "more models". */
export const MODELS_SHOWN_FIRST = 12

/** The year grid runs from this year back to here, then "Older than …". */
export const OLDEST_YEAR_OFFERED = 2012
