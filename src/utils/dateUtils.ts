import { QuarterOption } from '../types/supplier';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// ฟังก์ชันสำหรับเรียงลำดับประเทศตามตัวอักษรภาษาไทย
export const sortCountriesByThai = <T extends { name_th: string }>(countries: T[]): T[] => {
  return [...countries].sort((a, b) => {
    return a.name_th.localeCompare(b.name_th, 'th-TH', { 
      numeric: true, 
      sensitivity: 'base' 
    });
  });
};

// ฟังก์ชันสำหรับกรองและแสดงผลตำแหน่งงาน
export const filterAndDisplayJobPositions = <T extends { job_position: string }>(jobPositions: T[]): Array<T & { display_name: string }> => {
  return jobPositions
    .filter(position => {
      const jobPos = position.job_position.toLowerCase();
      return jobPos === 'ts' || jobPos === 'crm';
    })
    .map(position => ({
      ...position,
      display_name: position.job_position.toLowerCase() === 'ts' ? 'เซลล์' : 'CRM'
    }));
};

export const getCurrentQuarter = (): number => {
  const month = new Date().getMonth() + 1; // 0-based to 1-based
  return Math.ceil(month / 3);
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const getQuarterOptions = (): QuarterOption[] => {
  const currentYear = getCurrentYear();
  const currentQuarter = getCurrentQuarter();
  const options: QuarterOption[] = [];

  // Generate 4 quarters backwards from current
  for (let i = 0; i < 4; i++) {
    let quarter = currentQuarter - i;
    let year = currentYear;

    if (quarter <= 0) {
      quarter += 4;
      year -= 1;
    }

    const label = i === 0 ? `Q${quarter}/${year} (Current)` : `Q${quarter}/${year}`;
    
    options.push({
      label,
      year,
      quarter
    });
  }

  return options;
};

export const getYearOptions = (): number[] => {
  const currentYear = getCurrentYear();
  const years: number[] = [];
  
  // Generate 5 years: current + 4 previous
  for (let i = 0; i < 5; i++) {
    years.push(currentYear - i);
  }
  
  return years;
};

export const getMonthOptions = () => [
  { value: 1, label: 'มกราคม' },
  { value: 2, label: 'กุมภาพันธ์' },
  { value: 3, label: 'มีนาคม' },
  { value: 4, label: 'เมษายน' },
  { value: 5, label: 'พฤษภาคม' },
  { value: 6, label: 'มิถุนายน' },
  { value: 7, label: 'กรกฎาคม' },
  { value: 8, label: 'สิงหาคม' },
  { value: 9, label: 'กันยายน' },
  { value: 10, label: 'ตุลาคม' },
  { value: 11, label: 'พฤศจิกายน' },
  { value: 12, label: 'ธันวาคม' }
];