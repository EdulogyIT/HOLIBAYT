// Algerian cities and famous locations
export const algerianLocations = [
  // Major Cities
  { name: "Alger", type: "city", region: "Alger" },
  { name: "Algiers Centre", type: "district", region: "Alger" },
  { name: "Ain Benian", type: "district", region: "Alger" },
  { name: "Bab El Oued", type: "district", region: "Alger" },
  { name: "Birtouta", type: "district", region: "Alger" },
  { name: "Oran", type: "city", region: "Oran" },
  { name: "Constantine", type: "city", region: "Constantine" },
  { name: "Annaba", type: "city", region: "Annaba" },
  { name: "Tlemcen", type: "city", region: "Tlemcen" },
  { name: "Béjaïa", type: "city", region: "Béjaïa" },
  { name: "Sétif", type: "city", region: "Sétif" },
  { name: "Blida", type: "city", region: "Blida" },
  { name: "Batna", type: "city", region: "Batna" },
  { name: "Djelfa", type: "city", region: "Djelfa" },
  { name: "Sidi Bel Abbès", type: "city", region: "Sidi Bel Abbès" },
  { name: "Biskra", type: "city", region: "Biskra" },
  { name: "Tébessa", type: "city", region: "Tébessa" },
  { name: "Tiaret", type: "city", region: "Tiaret" },
  { name: "Béchar", type: "city", region: "Béchar" },
  { name: "Skikda", type: "city", region: "Skikda" },
  { name: "Chlef", type: "city", region: "Chlef" },
  { name: "Mostaganem", type: "city", region: "Mostaganem" },
  { name: "Médéa", type: "city", region: "Médéa" },
  { name: "El Oued", type: "city", region: "El Oued" },
  { name: "Ouargla", type: "city", region: "Ouargla" },
  { name: "Bordj Bou Arréridj", type: "city", region: "Bordj Bou Arréridj" },
  { name: "Bouira", type: "city", region: "Bouira" },
  { name: "Tizi Ouzou", type: "city", region: "Tizi Ouzou" },
  { name: "Boumerdès", type: "city", region: "Boumerdès" },
  { name: "Relizane", type: "city", region: "Relizane" },
  { name: "Tindouf", type: "city", region: "Tindouf" },
  { name: "Tissemsilt", type: "city", region: "Tissemsilt" },
  { name: "El Bayadh", type: "city", region: "El Bayadh" },
  { name: "Khenchela", type: "city", region: "Khenchela" },
  { name: "Souk Ahras", type: "city", region: "Souk Ahras" },
  { name: "Tipaza", type: "city", region: "Tipaza" },
  { name: "Mila", type: "city", region: "Mila" },
  { name: "Aïn Defla", type: "city", region: "Aïn Defla" },
  { name: "Naâma", type: "city", region: "Naâma" },
  { name: "Aïn Témouchent", type: "city", region: "Aïn Témouchent" },
  { name: "Ghardaïa", type: "city", region: "Ghardaïa" },
  { name: "Tamanrasset", type: "city", region: "Tamanrasset" },
  { name: "Illizi", type: "city", region: "Illizi" },
  { name: "Adrar", type: "city", region: "Adrar" },
  
  // Famous Places & Tourist Destinations
  { name: "Algiers Casbah", type: "landmark", region: "Alger" },
  { name: "Notre Dame d'Afrique", type: "landmark", region: "Alger" },
  { name: "Jardin d'Essai", type: "landmark", region: "Alger" },
  { name: "Martyrs' Memorial", type: "landmark", region: "Alger" },
  { name: "Tipaza Ruins", type: "landmark", region: "Tipaza" },
  { name: "Djémila Roman Ruins", type: "landmark", region: "Sétif" },
  { name: "Timgad", type: "landmark", region: "Batna" },
  { name: "Tassili n'Ajjer", type: "landmark", region: "Illizi" },
  { name: "Hoggar Mountains", type: "landmark", region: "Tamanrasset" },
  { name: "M'Zab Valley", type: "landmark", region: "Ghardaïa" },
  { name: "Cherchell", type: "landmark", region: "Tipaza" },
  { name: "Beni Hammad Fort", type: "landmark", region: "M'Sila" },
  { name: "Gouraya National Park", type: "landmark", region: "Béjaïa" },
  { name: "Chréa National Park", type: "landmark", region: "Blida" },
  { name: "Tlemcen Grand Mosque", type: "landmark", region: "Tlemcen" },
  { name: "Constantine Bridges", type: "landmark", region: "Constantine" },
  { name: "Annaba Beaches", type: "landmark", region: "Annaba" },
  { name: "Sahara Desert", type: "landmark", region: "Multiple" },
  
  // Beach destinations
  { name: "Sidi Fredj", type: "beach", region: "Alger" },
  { name: "Zeralda Beach", type: "beach", region: "Alger" },
  { name: "Ain Turk", type: "beach", region: "Oran" },
  { name: "Les Andalouses", type: "beach", region: "Oran" },
  { name: "Madagh Beach", type: "beach", region: "Oran" },
  { name: "Tigzirt", type: "beach", region: "Tizi Ouzou" },
  { name: "Cap Djinet", type: "beach", region: "Boumerdès" },
  { name: "Azeffoun", type: "beach", region: "Tizi Ouzou" },
];

export function searchLocations(query: string): typeof algerianLocations {
  if (!query || query.trim().length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return algerianLocations
    .filter(location => 
      location.name.toLowerCase().includes(normalizedQuery) ||
      location.region.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, 8); // Limit to 8 suggestions
}
