// Vehicle condition levels with detailed descriptions
const conditionLevels = {
  1: {
    name: 'Excelente',
    emoji: '⭐⭐⭐⭐',
    color: '#10b981',
    bgColor: '#d1fae5',
    shortDescription: 'Veículo em estado impecável',
    detailedDescription: 'Veículo novo ou seminovo em condições perfeitas. Sem danos visíveis, com pintura original, interior intacto e histórico de manutenção completo. Funcionamento mecânico impecável.',
    typicalCharacteristics: [
      'Quilometragem baixa (menos de 30.000 km)',
      'Sem histórico de acidentes',
      'Pintura original e sem danos',
      'Interior como novo',
      'Manutenção em concessionária',
      'Funcionamento perfeito de todos os sistemas'
    ],
    suitableFor: 'Clientes que exigem a máxima qualidade e estão dispostos a pagar por um veículo impecável.'
  },
  2: {
    name: 'Bom',
    emoji: '⭐⭐⭐',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    shortDescription: 'Veículo bem conservado',
    detailedDescription: 'Veículo usado em bom estado geral. Pode ter pequenos sinais de uso normais, mas sem problemas mecânicos significativos. Pintura e interior bem conservados.',
    typicalCharacteristics: [
      'Quilometragem moderada (30.000 - 80.000 km)',
      'Pequenos arranhões ou desgaste normal',
      'Funcionamento mecânico bom',
      'Manutenção regular',
      'Pode ter tido um ou dois proprietários'
    ],
    suitableFor: 'Clientes que buscam um veículo confiável com boa relação custo-benefício.'
  },
  3: {
    name: 'Regular',
    emoji: '⭐⭐',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    shortDescription: 'Veículo com desgaste visível',
    detailedDescription: 'Veículo com sinais visíveis de uso e desgaste. Pode necessitar de pequenas reparações ou manutenção. Funcional, mas com problemas estéticos ou mecânicos menores.',
    typicalCharacteristics: [
      'Quilometragem alta (80.000 - 150.000 km)',
      'Sinais visíveis de desgaste',
      'Pode necessitar de reparos menores',
      'Funcionamento mecânico aceitável',
      'Pintura ou interior desgastados'
    ],
    suitableFor: 'Clientes com orçamento limitado ou que pretendem fazer reparos.'
  },
  4: {
    name: 'Para Peças',
    emoji: '⭐',
    color: '#ef4444',
    bgColor: '#fee2e2',
    shortDescription: 'Veículo para desmantelamento',
    detailedDescription: 'Veículo não adequado para uso regular devido a problemas mecânicos severos ou danos extensivos. Ideal para recuperação de peças ou para quem tem conhecimentos de mecânica.',
    typicalCharacteristics: [
      'Problemas mecânicos severos',
      'Danos extensivos na carroçaria',
      'Quilometragem muito alta (acima de 150.000 km)',
      'Pode não estar em condições de circular',
      'Valor principalmente nas peças'
    ],
    suitableFor: 'Mecânicos, oficinas ou compradores que pretendem desmantelar o veículo para peças.'
  }
};

const conditionLevelColors = {
  1: '#10b981',  // Green
  2: '#3b82f6',  // Blue
  3: '#f59e0b',  // Orange
  4: '#ef4444'   // Red
};

const conditionLevelLabels = {
  1: 'Nível 1 - Excelente',
  2: 'Nível 2 - Bom',
  3: 'Nível 3 - Regular',
  4: 'Nível 4 - Para Peças'
};

module.exports = {
  conditionLevels,
  conditionLevelColors,
  conditionLevelLabels
};