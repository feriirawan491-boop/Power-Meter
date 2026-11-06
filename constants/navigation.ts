export const navigation=['Ringkasan Pabrik','Panel & Meter','Alarm & Gangguan','Energi & Biaya','Laporan','Pengaturan'] as const;
export type View=typeof navigation[number];

export const routes:Record<View,string>={'Ringkasan Pabrik':'/','Panel & Meter':'/meters','Alarm & Gangguan':'/alarms','Energi & Biaya':'/energy/accounting','Laporan':'/reports','Pengaturan':'/settings'};
