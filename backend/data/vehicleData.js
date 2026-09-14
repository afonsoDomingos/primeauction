// Vehicle data for automotive niche
const vehicleMakes = [
  { name: 'Toyota', popularModels: ['Corolla', 'Hilux', 'RAV4', 'Camry', 'Yaris', 'Land Cruiser', 'Prado', 'Prius', 'Etios', 'Vitz', 'Avanza', 'Fortuner', 'Hiace', 'Coaster'] },
  { name: 'Volkswagen', popularModels: ['Golf', 'Polo', 'Tiguan', 'Passat', 'Amarok', 'Touareg', 'Jetta', 'Vento', 'Fox', 'Saveiro', 'T-Cross', 'Nivus', 'T-Roc'] },
  { name: 'Honda', popularModels: ['Civic', 'CR-V', 'Accord', 'HR-V', 'Jazz', 'Fit', 'City', 'BR-V', 'Odyssey', 'Pilot', 'Ridgeline', 'NSX'] },
  { name: 'Ford', popularModels: ['Fiesta', 'Focus', 'Ranger', 'Mustang', 'Explorer', 'Transit', 'EcoSport', 'Edge', 'Fusion', 'Mondeo', 'Territory', 'F-150'] },
  { name: 'BMW', popularModels: ['Série 3', 'Série 5', 'X3', 'X5', 'Série 1', 'X1', 'Série 7', 'X6', 'X7', 'Z4', 'M3', 'M5', 'i3', 'i8'] },
  { name: 'Mercedes-Benz', popularModels: ['Classe A', 'Classe C', 'Classe E', 'GLC', 'GLE', 'GLB', 'Sprinter', 'Classe B', 'CLA', 'CLS', 'SLK', 'SL', 'G-Class', 'SLS'] },
  { name: 'Audi', popularModels: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'Q2', 'Q8', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'RS3', 'RS5', 'RS6', 'RS7', 'R8', 'e-tron', 'TT', 'R8'] },
  { name: 'Nissan', popularModels: ['Qashqai', 'Juke', 'X-Trail', 'Navara', '370Z', 'Note', 'Micra', 'Leaf', 'Patrol', 'GT-R', 'Sentra', 'Altima', 'Versa', 'Frontier'] },
  { name: 'Hyundai', popularModels: ['i20', 'i30', 'Tucson', 'Santa Fe', 'ix35', 'Creta', 'Elantra', 'Sonata', 'Accent', 'Veloster', 'Genesis', 'Kona', 'Ioniq', 'Ioniq 5', 'Venue'] },
  { name: 'Kia', popularModels: ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento', 'Stonic', 'Seltos', 'Carnival', 'Soul', 'Optima', 'Sedona', 'Telluride', 'EV6', 'Stinger'] },
  { name: 'Renault', popularModels: ['Clio', 'Megane', 'Captur', 'Duster', 'Kangoo', 'Sandero', 'Laguna', 'Fluence', 'Twingo', 'Zoe', 'Kadjar', 'Arkana', 'Austral'] },
  { name: 'Peugeot', popularModels: ['208', '308', '3008', '2008', '5008', 'Partner', 'Bipper', 'Rifter', '2008', '508', '108', 'e-208', 'e-2008', 'e-308'] },
  { name: 'Fiat', popularModels: ['Uno', 'Punto', '500', 'Tipo', 'Doblo', 'Fiorino', 'Panda', '500X', '500L', '124 Spider', 'Ducato', 'Scudo', 'Talento'] },
  { name: 'Suzuki', popularModels: ['Swift', 'Vitara', 'Jimny', 'SX4', 'Baleno', 'Ignis', 'Celerio', 'Alto', 'Wagon R', 'S-Cross', 'Across', 'Grand Vitara', 'XL7'] },
  { name: 'Mazda', popularModels: ['Mazda2', 'Mazda3', 'CX-5', 'CX-3', 'MX-5', 'MX-30', 'CX-30', 'CX-9', 'CX-8', 'CX-60', '6', 'BT-50', 'Miata'] },
  { name: 'Mitsubishi', popularModels: ['Lancer', 'ASX', 'Outlander', 'Pajero', 'L200', 'Space Star', 'Eclipse Cross', 'Xpander', 'Attrage', 'Mirage', 'Montero', 'Triton'] },
  { name: 'Chevrolet', popularModels: ['Onix', 'Cruze', 'Tracker', 'Sonic', 'Cobalt', 'Aveo', 'Spark', 'Malibu', 'Camaro', 'Corvette', 'Silverado', 'Suburban', 'Tahoe', 'Equinox', 'Traverse', 'Blazer'] },
  { name: 'Land Rover', popularModels: ['Range Rover', 'Discovery', 'Defender', 'Evoque', 'Sport', 'Freelander', 'LR4', 'Velar', 'Range Rover Sport', 'Range Rover Evoque'] },
  { name: 'Volvo', popularModels: ['XC40', 'XC60', 'XC90', 'V40', 'V60', 'S60', 'S90', 'V90', 'XC90', 'XC70', 'C30', 'S40', 'V70', 'XC90 T8', 'Polestar'] },
  { name: 'Subaru', popularModels: ['Impreza', 'Forester', 'Outback', 'XV', 'Legacy', 'WRX', 'WRX STI', 'BRZ', 'Ascent', 'Tribeca', 'Levorg', 'Crosstrek', 'Baja'] },
  { name: 'Jeep', popularModels: ['Wrangler', 'Cherokee', 'Grand Cherokee', 'Renegade', 'Compass', 'Patriot', 'Gladiator', 'Commander', 'Grand Wagoneer', 'Liberty', 'Cherokee'] },
  { name: 'Dacia', popularModels: ['Sandero', 'Duster', 'Logan', 'Lodgy', 'Dokker', 'Sandero Stepway', 'Lodgy Stepway', 'Jogger', 'Spring'] },
  { name: 'Lexus', popularModels: ['IS', 'ES', 'GS', 'LS', 'NX', 'UX', 'RX', 'GX', 'LX', 'LC', 'RC', 'LM', 'LF-Ch', 'LC 500h', 'LS 500h'] },
  { name: 'Infiniti', popularModels: ['Q50', 'Q60', 'Q70', 'QX50', 'QX55', 'QX60', 'QX70', 'QX80', 'FX35', 'FX50', 'G35', 'G37', 'M35', 'M37', 'EX35', 'EX37'] },
  { name: 'Acura', popularModels: ['ILX', 'TLX', 'RLX', 'RDX', 'MDX', 'NSX', 'ZDX', 'Integra', 'Legend', 'Vigor', 'RSX', 'TSX', 'CL', 'RL'] },
  { name: 'Seat', popularModels: ['Ibiza', 'Leon', 'Toledo', 'Arona', 'Altea', 'Alhambra', 'Tarraco', 'Ateca', 'Mii', 'Exeo', 'Altea Freetrack'] },
  { name: 'Skoda', popularModels: ['Fabia', 'Rapid', 'Octavia', 'Superb', 'Yeti', 'Kodiaq', 'Karoq', 'Scala', 'Kamiq', 'Enyaq iV', 'Citigo', 'Roomster'] },
  { name: 'Mini', popularModels: ['Cooper', 'Cooper S', 'Countryman', 'Clubman', 'Paceman', 'Cabrio', 'Coupe', 'John Cooper Works', 'Rocketman', 'Aceman'] },
  { name: 'Smart', popularModels: ['Fortwo', 'Forfour', 'Roadster', 'Cabrio', 'eq fortwo', 'eq forfour', 'smart #1', 'smart #3'] }
];

const vehicleColors = [
  'Branco', 'Preto', 'Cinza', 'Prata', 'Azul', 'Vermelho', 'Verde', 
  'Amarelo', 'Laranja', 'Bege', 'Marrom', 'Bronze', 'Dourado', 'Roxo'
];

const vehicleFeatures = [
  'Ar Condicionado',
  'Direção Assistida',
  'Vidros Elétricos',
  'Bancos em Couro',
  'Teto Solar',
  'Retrovisores Elétricos',
  'Sensor de Estacionamento',
  'Câmera de Ré',
  'Controle de Velocidade',
  'Bancos Aquecidos',
  'Sistema de Som Premium',
  'Navegação GPS',
  'Bluetooth',
  'USB',
  'Apple CarPlay',
  'Android Auto',
  'Faróis LED',
  'Faróis Automáticos',
  'Bancos Rebatíveis',
  'Keyless Entry',
  'Start-Stop',
  'Alerta de Ponto Cego',
  'Controle de Tração',
  'Airbags Frontais',
  'Airbags Laterais',
  'Airbags de Cortina',
  'Isofix',
  'ABS',
  'ESP',
  'Imobilizador',
  'Alarme',
  'Rodas de Liga Leve',
  'Pneus Run-Flat',
  'Barra de Reboque',
  'Hitch'
];

const vehicleYears = (() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear + 1; year >= 1990; year--) {
    years.push(year);
  }
  return years;
})();

// Suggested prices by model (average market prices in MZN)
const modelPriceSuggestions = {
  'Toyota': {
    'Corolla': { min: 350000, max: 800000 },
    'Hilux': { min: 800000, max: 2500000 },
    'RAV4': { min: 600000, max: 1500000 },
    'Camry': { min: 500000, max: 1200000 },
    'Yaris': { min: 250000, max: 500000 },
    'Land Cruiser': { min: 2000000, max: 5000000 },
    'Prado': { min: 1500000, max: 4000000 },
    'Fortuner': { min: 900000, max: 2000000 }
  },
  'Volkswagen': {
    'Golf': { min: 300000, max: 700000 },
    'Polo': { min: 250000, max: 600000 },
    'Tiguan': { min: 500000, max: 1200000 },
    'Passat': { min: 400000, max: 900000 },
    'Amarok': { min: 700000, max: 1800000 },
    'Touareg': { min: 1200000, max: 3000000 }
  },
  'Honda': {
    'Civic': { min: 300000, max: 700000 },
    'CR-V': { min: 500000, max: 1200000 },
    'Accord': { min: 400000, max: 900000 },
    'HR-V': { min: 450000, max: 1000000 },
    'Jazz': { min: 200000, max: 450000 },
    'Fit': { min: 180000, max: 400000 }
  },
  'Ford': {
    'Fiesta': { min: 200000, max: 500000 },
    'Focus': { min: 250000, max: 600000 },
    'Ranger': { min: 800000, max: 2000000 },
    'Mustang': { min: 1500000, max: 5000000 },
    'Explorer': { min: 900000, max: 2500000 },
    'EcoSport': { min: 350000, max: 800000 }
  },
  'BMW': {
    'Série 3': { min: 800000, max: 2500000 },
    'Série 5': { min: 1200000, max: 4000000 },
    'X3': { min: 1000000, max: 2500000 },
    'X5': { min: 1500000, max: 4000000 },
    'X1': { min: 400000, max: 900000 },
    'X7': { min: 2000000, max: 6000000 }
  },
  'Mercedes-Benz': {
    'Classe A': { min: 600000, max: 1500000 },
    'Classe C': { min: 800000, max: 2000000 },
    'Classe E': { min: 1200000, max: 3500000 },
    'GLC': { min: 1500000, max: 4000000 },
    'GLE': { min: 2000000, max: 5000000 },
    'G-Class': { min: 3000000, max: 8000000 }
  },
  'Nissan': {
    'Qashqai': { min: 350000, max: 800000 },
    'Juke': { min: 250000, max: 600000 },
    'X-Trail': { min: 400000, max: 900000 },
    'Navara': { min: 700000, max: 1800000 },
    '370Z': { min: 500000, max: 3000000 },
    'GT-R': { min: 5000000, max: 20000000 }
  },
  'Hyundai': {
    'i20': { min: 180000, max: 400000 },
    'i30': { min: 200000, max: 500000 },
    'Tucson': { min: 400000, max: 900000 },
    'Santa Fe': { min: 600000, max: 1500000 },
    'Creta': { min: 250000, max: 550000 },
    'Venue': { min: 200000, max: 450000 }
  },
  'Kia': {
    'Picanto': { min: 150000, max: 350000 },
    'Rio': { min: 180000, max: 400000 },
    'Ceed': { min: 200000, max: 500000 },
    'Sportage': { min: 400000, max: 900000 },
    'Sorento': { min: 600000, max: 1500000 },
    'Seltos': { min: 300000, max: 700000 }
  },
  'Renault': {
    'Clio': { min: 150000, max: 400000 },
    'Megane': { min: 200000, max: 500000 },
    'Captur': { min: 200000, max: 450000 },
    'Duster': { min: 300000, max: 700000 },
    'Sandero': { min: 150000, max: 400000 }
  },
  'Peugeot': {
    '208': { min: 180000, max: 400000 },
    '308': { min: 250000, max: 550000 },
    '3008': { min: 350000, max: 800000 },
    '2008': { min: 200000, max: 450000 },
    '5008': { min: 400000, max: 900000 }
  },
  'Fiat': {
    'Uno': { min: 100000, max: 250000 },
    'Punto': { min: 150000, max: 350000 },
    '500': { min: 200000, max: 400000 },
    'Tipo': { min: 180000, max: 400000 },
    'Doblo': { min: 300000, max: 700000 },
    'Panda': { min: 120000, max: 300000 }
  },
  'Suzuki': {
    'Swift': { min: 180000, max: 400000 },
    'Vitara': { min: 250000, max: 600000 },
    'Jimny': { min: 400000, max: 800000 },
    'SX4': { min: 200000, max: 500000 },
    'Baleno': { min: 180000, max: 400000 }
  },
  'Mazda': {
    'Mazda2': { min: 200000, max: 450000 },
    'Mazda3': { min: 300000, max: 700000 },
    'CX-5': { min: 400000, max: 1000000 },
    'CX-3': { min: 250000, max: 600000 },
    'MX-5': { min: 500000, max: 2000000 }
  },
  'Mitsubishi': {
    'Lancer': { min: 250000, max: 600000 },
    'ASX': { min: 300000, max: 700000 },
    'Outlander': { min: 400000, max: 900000 },
    'Pajero': { min: 800000, max: 3000000 },
    'L200': { min: 700000, max: 1500000 }
  },
  'Chevrolet': {
    'Onix': { min: 200000, max: 500000 },
    'Cruze': { min: 250000, max: 600000 },
    'Tracker': { min: 350000, max: 800000 },
    'Sonic': { min: 180000, max: 400000 },
    'Camaro': { min: 2000000, max: 8000000 },
    'Corvette': { min: 5000000, max: 20000000 }
  },
  'Land Rover': {
    'Range Rover': { min: 3000000, max: 10000000 },
    'Discovery': { min: 2000000, max: 6000000 },
    'Defender': { min: 1500000, max: 5000000 },
    'Evoque': { min: 1200000, max: 3500000 },
    'Freelander': { min: 500000, max: 1200000 }
  },
  'Volvo': {
    'XC40': { min: 600000, max: 1500000 },
    'XC60': { min: 800000, max: 2000000 },
    'XC90': { min: 1200000, max: 4000000 },
    'V40': { min: 400000, max: 900000 },
    'S60': { min: 500000, max: 1200000 },
    'S90': { min: 1000000, max: 3000000 }
  },
  'Subaru': {
    'Impreza': { min: 300000, max: 700000 },
    'Forester': { min: 400000, max: 900000 },
    'Outback': { min: 500000, max: 1200000 },
    'XV': { min: 350000, max: 800000 },
    'WRX': { min: 600000, max: 2000000 },
    'BRZ': { min: 500000, max: 1500000 }
  },
  'Jeep': {
    'Wrangler': { min: 600000, max: 2000000 },
    'Cherokee': { min: 500000, max: 1500000 },
    'Grand Cherokee': { min: 700000, max: 2000000 },
    'Renegade': { min: 350000, max: 800000 },
    'Compass': { min: 400000, max: 900000 },
    'Gladiator': { min: 900000, max: 2500000 }
  },
  'Dacia': {
    'Sandero': { min: 150000, max: 400000 },
    'Duster': { min: 300000, max: 700000 },
    'Logan': { min: 120000, max: 300000 },
    'Lodgy': { min: 130000, max: 350000 }
  },
  'Lexus': {
    'IS': { min: 600000, max: 1500000 },
    'ES': { min: 500000, max: 1200000 },
    'GS': { min: 700000, max: 1800000 },
    'LS': { min: 1500000, max: 5000000 },
    'NX': { min: 500000, max: 1200000 },
    'RX': { min: 600000, max: 1500000 },
    'GX': { min: 1000000, max: 3000000 }
  },
  'Infiniti': {
    'Q50': { min: 500000, max: 1200000 },
    'Q60': { min: 600000, max: 1500000 },
    'Q70': { min: 700000, max: 1800000 },
    'QX50': { min: 400000, max: 1000000 },
    'QX55': { min: 500000, max: 1200000 },
    'QX60': { min: 600000, max: 1500000 },
    'QX70': { min: 800000, max: 2000000 }
  },
  'Acura': {
    'ILX': { min: 400000, max: 900000 },
    'TLX': { min: 500000, max: 1200000 },
    'RLX': { min: 800000, max: 2000000 },
    'RDX': { min: 400000, max: 900000 },
    'MDX': { min: 600000, max: 1500000 },
    'NSX': { min: 5000000, max: 20000000 }
  },
  'Seat': {
    'Ibiza': { min: 150000, max: 400000 },
    'Leon': { min: 200000, max: 500000 },
    'Toledo': { min: 200000, max: 500000 },
    'Arona': { min: 250000, max: 600000 },
    'Altea': { min: 300000, max: 700000 },
    'Tarraco': { min: 250000, max: 600000 },
    'Ateca': { min: 400000, max: 900000 }
  },
  'Skoda': {
    'Fabia': { min: 150000, max: 350000 },
    'Rapid': { min: 200000, max: 500000 },
    'Octavia': { min: 250000, max: 600000 },
    'Superb': { min: 300000, max: 800000 },
    'Yeti': { min: 350000, max: 900000 },
    'Kodiaq': { min: 500000, max: 1200000 },
    'Karoq': { min: 350000, max: 800000 }
  },
  'Mini': {
    'Cooper': { min: 250000, max: 600000 },
    'Cooper S': { min: 350000, max: 800000 },
    'Countryman': { min: 400000, max: 900000 },
    'Clubman': { min: 450000, max: 1000000 },
    'Paceman': { min: 450000, max: 1000000 },
    'Cabrio': { min: 500000, max: 1200000 },
    'Coupe': { min: 450000, max: 1000000 }
  },
  'Smart': {
    'Fortwo': { min: 150000, max: 400000 },
    'Forfour': { min: 180000, max: 450000 },
    'Roadster': { min: 200000, max: 500000 },
    'Cabrio': { min: 250000, max: 600000 }
  }
};

module.exports = {
  vehicleMakes,
  vehicleColors,
  vehicleFeatures,
  vehicleYears,
  modelPriceSuggestions
};