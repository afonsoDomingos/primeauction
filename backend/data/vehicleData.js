// Vehicle data for automotive niche
const vehicleMakes = [
  { name: 'Toyota', popularModels: ['Corolla', 'Hilux', 'RAV4', 'Camry', 'Yaris', 'Land Cruiser', 'Prado'] },
  { name: 'Volkswagen', popularModels: ['Golf', 'Polo', 'Tiguan', 'Passat', 'Amarok', 'Touareg'] },
  { name: 'Honda', popularModels: ['Civic', 'CR-V', 'Accord', 'HR-V', 'Jazz', 'Fit'] },
  { name: 'Ford', popularModels: ['Fiesta', 'Focus', 'Ranger', 'Mustang', 'Explorer', 'Transit'] },
  { name: 'BMW', popularModels: ['Série 3', 'Série 5', 'X3', 'X5', 'Série 1', 'X1'] },
  { name: 'Mercedes-Benz', popularModels: ['Classe A', 'Classe C', 'Classe E', 'GLC', 'GLE', 'Sprinter'] },
  { name: 'Audi', popularModels: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'] },
  { name: 'Nissan', popularModels: ['Qashqai', 'Juke', 'X-Trail', 'Navara', '370Z', 'Note'] },
  { name: 'Hyundai', popularModels: ['i20', 'i30', 'Tucson', 'Santa Fe', 'ix35', 'Creta'] },
  { name: 'Kia', popularModels: ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento', 'Stonic'] },
  { name: 'Renault', popularModels: ['Clio', 'Megane', 'Captur', 'Duster', 'Kangoo', 'Sandero'] },
  { name: 'Peugeot', popularModels: ['208', '308', '3008', '2008', '5008', 'Partner'] },
  { name: 'Fiat', popularModels: ['Uno', 'Punto', '500', 'Tipo', 'Doblo', 'Fiorino'] },
  { name: 'Suzuki', popularModels: ['Swift', 'Vitara', 'Jimny', 'SX4', 'Baleno', 'Ignis'] },
  { name: 'Mazda', popularModels: ['Mazda2', 'Mazda3', 'CX-5', 'CX-3', 'MX-5', '6'] },
  { name: 'Mitsubishi', popularModels: ['Lancer', 'ASX', 'Outlander', 'Pajero', 'L200', 'Space Star'] },
  { name: 'Chevrolet', popularModels: ['Onix', 'Cruze', 'Tracker', 'Sonic', 'Cobalt', 'Aveo'] },
  { name: 'Land Rover', popularModels: ['Range Rover', 'Discovery', 'Defender', 'Evoque', 'Sport'] },
  { name: 'Volvo', popularModels: ['XC40', 'XC60', 'XC90', 'V40', 'V60', 'S60'] },
  { name: 'Subaru', popularModels: ['Impreza', 'Forester', 'Outback', 'XV', 'Legacy', 'WRX'] },
  { name: 'Jeep', popularModels: ['Wrangler', 'Cherokee', 'Grand Cherokee', 'Renegade', 'Compass'] },
  { name: 'Dacia', popularModels: ['Sandero', 'Duster', 'Logan', 'Lodgy', 'Dokker'] }
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

module.exports = {
  vehicleMakes,
  vehicleColors,
  vehicleFeatures,
  vehicleYears
};