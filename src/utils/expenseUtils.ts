export const formatCategory = (category: string) => {
  switch (category) {
    case 'lakban':
      return 'Lakban';
    case 'plastik_packing':
      return 'Plastik Packing';
    case 'operasional':
      return 'Operasional';
    case 'gaji':
      return 'Gaji';
    case 'transportasi':
      return 'Transportasi';
    case 'dll':
      return 'Lainnya';
    default:
      return category;
  }
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'lakban':
      return 'bg-blue-100 text-blue-800';
    case 'plastik_packing':
      return 'bg-green-100 text-green-800';
    case 'operasional':
      return 'bg-orange-100 text-orange-800';
    case 'gaji':
      return 'bg-purple-100 text-purple-800';
    case 'transportasi':
      return 'bg-yellow-100 text-yellow-800';
    case 'dll':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};