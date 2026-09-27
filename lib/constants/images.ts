/**
 * FoodConnect — Visual Assets System Registry
 *
 * Central source of truth for all local prototype and demo imagery across
 * Visakhapatnam pilots. All images are locally hosted in /public/images/
 * and clearly marked as demonstration imagery.
 */

export interface FoodConnectImage {
  src: string
  alt: string
  caption: string
  width: number
  height: number
  isPrototypeDemo: true
}

export const FOODCONNECT_IMAGES = {
  // 1. HERO VISUALS
  hero: {
    foodRescue: {
      src: "/images/hero/hero-food-rescue.jpg",
      alt: "FoodConnect volunteers transferring fresh prepared meals from a delivery van in Visakhapatnam",
      caption: "Volunteer coordinators transferring temperature-controlled surplus meals for immediate community distribution.",
      width: 503,
      height: 176,
      isPrototypeDemo: true,
    },
  },

  // 2. VIZAG CITY & COASTAL IDENTITY
  vizag: {
    coastalCity: {
      src: "/images/vizag/vizag-coastal-city.jpg",
      alt: "Panoramic dusk view of RK Beach Road and coastline in Visakhapatnam",
      caption: "Visakhapatnam coastal corridor — connecting surplus kitchens in Siripuram and Beach Road to community centers.",
      width: 519,
      height: 176,
      isPrototypeDemo: true,
    },
  },

  // 3. FOOD CATEGORIES & SURPLUS LOTS
  food: {
    cookedBuffet: {
      src: "/images/food/cooked-buffet.jpg",
      alt: "Stainless steel buffet chafing trays filled with warm rice, dal, and vegetable curry",
      caption: "Catering and banquet surplus prepared under hygienic conditions, ready for rapid pickup.",
      width: 209,
      height: 127,
      isPrototypeDemo: true,
    },
    bakerySurplus: {
      src: "/images/food/bakery-surplus.jpg",
      alt: "Wicker baskets filled with freshly baked bread loaves, buns, and croissants",
      caption: "Daily surplus from bakery guilds and cafes across Siripuram and Waltair Uplands.",
      width: 202,
      height: 127,
      isPrototypeDemo: true,
    },
    freshProduce: {
      src: "/images/food/fresh-produce.jpg",
      alt: "Fresh farm produce including ripe tomatoes, carrots, greens, and bell peppers",
      caption: "Wholesale market surplus and fresh farm staples diverted before spoilage.",
      width: 194,
      height: 127,
      isPrototypeDemo: true,
    },
    packedMeals: {
      src: "/images/food/packed-meals.jpg",
      alt: "Food-grade transparent meal boxes packed with nutritious rice and curries",
      caption: "Portion-controlled hygienic meal boxes ready for immediate delivery to shelters.",
      width: 207,
      height: 127,
      isPrototypeDemo: true,
    },
    cateringBanquet: {
      src: "/images/food/catering-banquet.jpg",
      alt: "Commercial banquet catering trays in a professional kitchen environment",
      caption: "Hotel banquet buffet surplus prepared for timely handover to accredited NGOs.",
      width: 204,
      height: 127,
      isPrototypeDemo: true,
    },
  },

  // 4. NGO PREPARATION & ACCREDITED KITCHENS
  ngos: {
    kitchenPrep: {
      src: "/images/ngos/kitchen-prep.jpg",
      alt: "NGO kitchen staff wearing caps and face masks portioning warm food onto stainless steel counters",
      caption: "Accredited NGO teams adhering to strict hygiene and temperature preservation standards.",
      width: 291,
      height: 126,
      isPrototypeDemo: true,
    },
  },

  // 5. WORKFLOW & AUDIT TRAIL
  workflow: {
    collectionTransit: {
      src: "/images/workflow/collection-transit.jpg",
      alt: "Volunteers loading relief food boxes into the rear of a dedicated distribution van",
      caption: "Insulated transport ensuring temperature-controlled custody during transit.",
      width: 241,
      height: 126,
      isPrototypeDemo: true,
    },
    surplusDispatch: {
      src: "/images/workflow/surplus-dispatch.jpg",
      alt: "Stacked clear food boxes in dispatch depot labeled for delivery",
      caption: "Verified food lots staged and categorized for immediate volunteer pickup.",
      width: 258,
      height: 141,
      isPrototypeDemo: true,
    },
    verificationPhoto: {
      src: "/images/workflow/verification-photo.jpg",
      alt: "Smartphone camera recording proof-of-delivery photo during a community meal distribution",
      caption: "Digital verification proof recorded at the moment of beneficiary handover.",
      width: 242,
      height: 141,
      isPrototypeDemo: true,
    },
  },

  // 6. COMMUNITY RECIPIENTS & DIGNIFIED CARE
  community: {
    elderlyDistribution: {
      src: "/images/community/elderly-distribution.jpg",
      alt: "Volunteer handing a fresh warm meal tray to an elderly community resident with dignity",
      caption: "Dignified food access delivered to vulnerable seniors and destitute elders in Vizag.",
      width: 235,
      height: 126,
      isPrototypeDemo: true,
    },
    childrenMeal: {
      src: "/images/community/children-meal.jpg",
      alt: "Young children smiling together while enjoying a nutritious hot community lunch",
      caption: "Nutritional support reaching children in day centers and community shelters.",
      width: 251,
      height: 126,
      isPrototypeDemo: true,
    },
    elderlyCare: {
      src: "/images/community/elderly-care.jpg",
      alt: "Elderly resident in care center smiling with a warm food plate",
      caption: "Partner care homes ensuring nutritious, soft-cooked meals for senior citizens.",
      width: 237,
      height: 141,
      isPrototypeDemo: true,
    },
    familyDistribution: {
      src: "/images/community/family-distribution.jpg",
      alt: "Volunteer gently handing food package to a young girl supported by her mother and family",
      caption: "Wholesome surplus reaching working families and underserved coastal hamlets.",
      width: 280,
      height: 141,
      isPrototypeDemo: true,
    },
  },
} as const
