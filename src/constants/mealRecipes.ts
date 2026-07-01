/** Canonical step-by-step recipes keyed by meal_id. */
export const MEAL_RECIPES: Record<string, string[]> = {
  protein_oat_bowl: [
    'Bring 160 ml water to a simmer and stir in 80 g oats. Cook 4–5 minutes until creamy.',
    'Transfer oats to a bowl and let cool for 2 minutes so the yogurt does not split.',
    'Fold in 150 g Greek yogurt until smooth.',
    'Slice 100 g banana and layer on top. Serve immediately.',
  ],
  yogurt_power_bowl: [
    'Add 250 g Greek yogurt to a bowl and stir until creamy.',
    'Sprinkle 40 g oats evenly over the yogurt for crunch.',
    'Top with 100 g mixed berries (fresh or thawed).',
    'Eat right away so the oats stay crisp.',
  ],
  chicken_rice_bowl: [
    'Rinse 80 g rice, then cook in 160 ml water for 12–15 minutes until fluffy. Keep covered off heat.',
    'Season 150 g chicken breast with salt and pepper. Heat 10 g olive oil in a pan over medium-high heat.',
    'Pan-sear chicken 5–6 minutes per side until internal temperature reaches 74°C (165°F). Rest 3 minutes, then slice.',
    'Fluff rice, add chicken on top, and serve warm.',
  ],
  salmon_rice_bowl: [
    'Cook 70 g rice in 140 ml water for 12–15 minutes until tender.',
    'Season 140 g salmon with salt and pepper. Bake at 200°C (400°F) for 12–14 minutes until opaque and flaky.',
    'Steam or sauté 150 g mixed vegetables until tender-crisp, about 5 minutes.',
    'Plate rice, top with vegetables and salmon. Break salmon into large flakes before serving.',
  ],
  salmon_veg_plate: [
    'Preheat oven to 200°C (400°F). Toss 200 g vegetables with 10 g olive oil, salt, and pepper.',
    'Roast vegetables on a sheet pan for 15 minutes.',
    'Place 140 g salmon on the same pan, season, and roast 12–14 minutes more until salmon flakes easily.',
    'Serve salmon over the roasted vegetables with pan juices spooned on top.',
  ],
  chicken_veg_bowl: [
    'Cook 50 g rice in 100 ml water for 12 minutes until fluffy.',
    'Dice 160 g chicken breast and stir-fry over medium-high heat for 6–8 minutes until cooked through.',
    'Add 200 g chopped vegetables and cook 4–5 minutes until tender.',
    'Season with salt, pepper, and a splash of water to deglaze. Serve over rice.',
  ],
  yogurt_snack_bowl: [
    'Spoon 250 g Greek yogurt into a small bowl.',
    'Slice 100 g banana and arrange on top.',
    'Sprinkle 30 g oats over the banana for texture.',
    'Serve immediately or chill up to 30 minutes.',
  ],
  protein_shake: [
    'Pour 250 ml cold milk into a shaker bottle or blender.',
    'Add 30 g whey protein powder.',
    'Shake vigorously for 20 seconds (or blend 10 seconds) until completely smooth.',
    'Drink immediately for best texture.',
  ],
  salmon_rice_plate: [
    'Cook 75 g rice in 150 ml water for 12–15 minutes. Fluff with a fork.',
    'Pan-sear 140 g salmon skin-side down in a hot non-stick pan for 4 minutes, then flip and cook 3–4 minutes more.',
    'Lightly steam 120 g vegetables for 4–5 minutes until bright and tender.',
    'Plate rice, add vegetables, and top with salmon. Season with lemon if desired.',
  ],
  italian_chicken_pasta: [
    'Boil salted water and cook 90 g pasta according to package directions until al dente. Reserve 60 ml pasta water, then drain.',
    'Dice 150 g chicken breast and sauté in a pan over medium-high heat for 6–8 minutes until golden and cooked through.',
    'Add 120 g tomato sauce and 2–3 tbsp reserved pasta water. Simmer 2 minutes.',
    'Toss pasta in the sauce, coat evenly, and serve hot.',
  ],
  chicken_teriyaki_bowl: [
    'Cook 80 g rice in 160 ml water for 12–15 minutes until fluffy.',
    'Slice 150 g chicken breast into strips. Stir-fry over high heat for 5–6 minutes until cooked through.',
    'Reduce heat, add 30 g teriyaki sauce, and toss for 1–2 minutes until glossy and coated.',
    'Serve chicken and sauce over warm rice.',
  ],
  turkey_quinoa_bowl: [
    'Rinse 80 g quinoa and simmer in 160 ml water for 14–16 minutes until tails appear. Fluff and rest covered.',
    'Heat 10 g olive oil in a pan. Cook 150 g ground or diced turkey over medium heat for 7–8 minutes, breaking it up as it browns.',
    'Season turkey with salt, pepper, and optional garlic powder.',
    'Spoon quinoa into a bowl and top with seasoned turkey.',
  ],
  egg_breakfast_plate: [
    'Toast 80 g whole-grain bread until golden.',
    'Whisk 180 g eggs (about 3 large) with a pinch of salt and pepper.',
    'Scramble eggs in a non-stick pan over medium-low heat, stirring gently until softly set, about 4–5 minutes.',
    'Plate eggs alongside toast. Serve immediately.',
  ],
};

export function getMealInstructions(mealId: string): string[] {
  return MEAL_RECIPES[mealId] ?? [];
}

export function attachMealInstructions<T extends { meal_id: string; instructions?: string[] }>(
  meal: T,
): T & { instructions: string[] } {
  const instructions =
    meal.instructions && meal.instructions.length > 0
      ? meal.instructions
      : getMealInstructions(meal.meal_id);

  return { ...meal, instructions };
}
